"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedSessions, getDefaultEnrichments } from "@/lib/mock";
import { AudioRecorder } from "@/lib/audioRecorder";
import { enrichTranscript, transcribeAudio, extractKeywords } from "@/lib/processing";
import { getMessages, t as translate, type Locale } from "@/lib/i18n";

export type Mode = string;
export type SessionStatus = "idle" | "recording" | "processing" | "done" | "error";
export type ProcessingStage = "transcribing" | "enriching";

export type EnrichmentTemplate = {
  id: string;
  name: string;
  icon: string;
  prompt: string;
};

export type Session = {
  id: string;
  title: string;
  createdAt: string;
  mode: Mode;
  status: SessionStatus;
  stage?: ProcessingStage;
  transcript: string;
  enriched: string;
  audioUrl?: string;
  recordingStartedAt?: number;
  errorMessage?: string;
  errorDetails?: string;
  metadata: {
    durationSec: number;
    keywords: string[];
    whisperProvider: string;
    llmProvider: string;
  };
};

export type Settings = {
  general: {
    language: Locale;
    theme: "system" | "light" | "dark";
    hotkey: string;
  };
  api: {
    whisper: {
      provider: "Local" | "OpenAI Whisper API" | "Other";
      apiKey: string;
      endpoint: string;
      language: "Auto" | "de" | "en" | "fr" | "it";
    };
    llm: {
      provider: "Local" | "OpenAI" | "Gemini" | "Claude" | "Grok";
      model: string;
      apiKey: string;
      baseUrl: string;
    };
  };
  privacy: {
    offline: boolean;
    storeAudio: boolean;
  };
  enrichments: EnrichmentTemplate[];
};

const defaultSettings: Settings = {
  general: {
    language: "de",
    theme: "system",
    hotkey: "Ctrl+Shift+R",
  },
  api: {
    whisper: {
      provider: "Local",
      apiKey: "",
      endpoint: "",
      language: "Auto",
    },
    llm: {
      provider: "Local",
      model: "gpt-4o-mini",
      apiKey: "",
      baseUrl: "",
    },
  },
  privacy: {
    offline: false,
    storeAudio: true,
  },
  enrichments: getDefaultEnrichments("de"),
};

const SETTINGS_KEY = "vi-settings";
const SESSIONS_KEY = "vi-sessions";
const SETTINGS_FILE = "ai-voice-note-settings.json";
const SESSIONS_FILE = "ai-voice-note-sessions.json";
const LEGACY_SETTINGS_FILE = "voice-intelligence-settings.json";
const LEGACY_SESSIONS_FILE = "voice-intelligence-sessions.json";

const isTauri = () =>
  typeof window !== "undefined" &&
  ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);

async function readFromTauri(filename: string) {
  if (!isTauri()) return null;
  try {
    const { readTextFile, exists, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    const fileExists = await exists(filename, { dir: BaseDirectory.AppConfig });
    if (!fileExists) return null;
    return await readTextFile(filename, { dir: BaseDirectory.AppConfig });
  } catch {
    return null;
  }
}

async function writeToTauri(filename: string, contents: string) {
  if (!isTauri()) return;
  try {
    const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    await writeFile({ path: filename, contents }, { dir: BaseDirectory.AppConfig });
  } catch {
    // ignore
  }
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeSettings(input: Partial<Settings> | any): Settings {
  const legacy = input ?? {};
  const general = legacy.general ?? {};
  const api = legacy.api ?? {};

  return {
    general: {
      language: general.language ?? legacy.language ?? defaultSettings.general.language,
      theme: general.theme ?? legacy.theme ?? defaultSettings.general.theme,
      hotkey: general.hotkey ?? legacy.hotkey ?? defaultSettings.general.hotkey,
    },
    api: {
      whisper: {
        provider:
          api.whisper?.provider ??
          legacy.whisper?.provider ??
          defaultSettings.api.whisper.provider,
        apiKey:
          api.whisper?.apiKey ?? legacy.whisper?.apiKey ?? defaultSettings.api.whisper.apiKey,
        endpoint:
          api.whisper?.endpoint ??
          legacy.whisper?.endpoint ??
          defaultSettings.api.whisper.endpoint,
        language:
          api.whisper?.language ??
          legacy.whisper?.language ??
          defaultSettings.api.whisper.language,
      },
      llm: {
        provider:
          api.llm?.provider ?? legacy.llm?.provider ?? defaultSettings.api.llm.provider,
        model: api.llm?.model ?? legacy.llm?.model ?? defaultSettings.api.llm.model,
        apiKey: api.llm?.apiKey ?? legacy.llm?.apiKey ?? defaultSettings.api.llm.apiKey,
        baseUrl: api.llm?.baseUrl ?? legacy.llm?.baseUrl ?? defaultSettings.api.llm.baseUrl,
      },
    },
    privacy: {
      offline:
        legacy.privacy?.offline ?? defaultSettings.privacy.offline,
      storeAudio:
        legacy.privacy?.storeAudio ?? defaultSettings.privacy.storeAudio,
    },
    enrichments: Array.isArray(legacy.enrichments) && legacy.enrichments.length
      ? legacy.enrichments
      : defaultSettings.enrichments,
  };
}

function localizeError(message: string, locale: Locale) {
  const messages = getMessages(locale);
  const map: Record<string, string> = {
    "Microphone access is not supported in this environment.": "errors.microphoneUnsupported",
    "Microphone access was denied. Please allow access and try again.": "errors.microphoneDenied",
    "Microphone access denied. Please allow microphone access to record audio.": "errors.microphoneDenied",
    "No audio captured. Please check microphone input.": "errors.noAudioCaptured",
    "Recording error occurred": "errors.recordingError",
    "Audio file not available for retry.": "errors.audioRetryUnavailable",
  };
  const key = map[message];
  return key ? translate(messages, key) : message;
}

type StoreState = {
  sessions: Session[];
  activeSessionId: string | null;
  searchQuery: string;
  mode: Mode;
  settings: Settings;
  settingsSource: "tauri" | "local" | "default";
  recordingLevel: number;
};

type StoreActions = {
  setSearchQuery: (value: string) => void;
  setMode: (mode: Mode) => void;
  selectSession: (id: string) => void;
  createEmptySession: () => void;
  deleteSession: (id: string) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  uploadAudio: (file: File) => void;
  retryProcessing: () => void;
  updateSessionTitle: (id: string, title: string) => void;
  updateSettings: (settings: Settings) => Promise<void>;
  toggleTheme: () => void;
};

const StoreContext = createContext<{ state: StoreState; actions: StoreActions } | null>(null);

function getRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess-${Math.random().toString(36).slice(2, 10)}`;
}

function applyTheme(theme: Settings["theme"]) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  root.classList.toggle("dark", resolved === "dark");
}


export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(seedSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<Mode>(defaultSettings.enrichments[0]?.id ?? "smart");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsSource, setSettingsSource] = useState<"tauri" | "local" | "default">("default");
  const [isHydrated, setIsHydrated] = useState(false);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const hasLoadedSessions = useRef(false);
  const hasUserUpdatedSettings = useRef(false);
  const hasUserModifiedSessions = useRef(false);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const recordingSessionIdRef = useRef<string | null>(null);
  const audioBlobsRef = useRef<Record<string, Blob>>({});
  const sessionsRef = useRef<Session[]>(sessions);
  const settingsRef = useRef<Settings>(settings);
  const modeRef = useRef<Mode>(mode);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const localSettingsKey =
        typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
      const localSettingsRaw = safeParseJson<Settings>(localSettingsKey, defaultSettings);
      const localSessions = safeParseJson<Session[]>(
        typeof window !== "undefined" ? localStorage.getItem(SESSIONS_KEY) : null,
        seedSessions
      );

      const tauriSettingsRaw =
        (await readFromTauri(SETTINGS_FILE)) ?? (await readFromTauri(LEGACY_SETTINGS_FILE));
      const tauriSessionsRaw =
        (await readFromTauri(SESSIONS_FILE)) ?? (await readFromTauri(LEGACY_SESSIONS_FILE));
      const tauriSettings = safeParseJson<Settings>(tauriSettingsRaw, localSettingsRaw);
      const tauriSessions = safeParseJson<Session[]>(tauriSessionsRaw, localSessions);

      const loadedSettings = normalizeSettings(tauriSettingsRaw ? tauriSettings : localSettingsRaw);
      const resolvedSource = tauriSettingsRaw
        ? "tauri"
        : localSettingsKey
        ? "local"
        : "default";
      const loadedSessions = tauriSessionsRaw ? tauriSessions : localSessions;

      if (!active) return;
      if (!hasUserUpdatedSettings.current) {
        setSettings(loadedSettings);
      }
      if (!hasUserModifiedSessions.current) {
        setSessions(loadedSessions.length ? loadedSessions : seedSessions);
      }
      setSettingsSource(resolvedSource);
      hasLoadedSessions.current = true;
      setIsHydrated(true);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!settings.enrichments.length) return;
    if (!settings.enrichments.some((item) => item.id === mode)) {
      setMode(settings.enrichments[0].id);
    }
  }, [settings.enrichments, mode]);

  useEffect(() => {
    if (!isHydrated && !hasUserUpdatedSettings.current) return;
    const payload = JSON.stringify(settings);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, payload);
      }
    } catch {
      // ignore
    }
    void writeToTauri(SETTINGS_FILE, payload);
    applyTheme(settings.general.theme);
  }, [settings, isHydrated]);

  const createSession = (partial: Partial<Session>) => {
    const newSession: Session = {
      id: getRandomId(),
      title: "",
      createdAt: new Date().toISOString(),
      mode,
      status: "idle",
      transcript: "",
      enriched: "",
      audioUrl: undefined,
      metadata: {
        durationSec: 0,
        keywords: [],
        whisperProvider: settings.api.whisper.provider,
        llmProvider: settings.api.llm.provider,
      },
      ...partial,
    };
    hasUserModifiedSessions.current = true;
    setSessions((prev) => {
      const next = [newSession, ...prev];
      const serializable = next.map(({ audioUrl, ...rest }) => rest);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
        }
      } catch {
        // ignore
      }
      void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
      return next;
    });
    setActiveSessionId(newSession.id);
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    hasUserModifiedSessions.current = true;
    setSessions((prev) => {
      const next = prev.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      );
      const serializable = next.map(({ audioUrl, ...rest }) => rest);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
        }
      } catch {
        // ignore
      }
      void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
      return next;
    });
  };

  const getSessionById = (id: string) => sessionsRef.current.find((session) => session.id === id);

  const setAudioBlob = (id: string, blob: Blob) => {
    audioBlobsRef.current[id] = blob;
  };

  const clearAudioBlob = (id: string) => {
    delete audioBlobsRef.current[id];
  };

  const buildErrorDetails = (
    stage: "transcribing" | "enriching",
    settingsSnapshot: Settings,
    message: string
  ) => {
    const messages = getMessages(settingsSnapshot.general.language);
    const stageLabel =
      stage === "transcribing"
        ? translate(messages, "steps.transcribing")
        : translate(messages, "steps.enriching");
    const lines = [
      `${translate(messages, "errorDetails.stage")}: ${stageLabel}`,
      `${translate(messages, "errorDetails.whisperProvider")}: ${
        settingsSnapshot.api.whisper.provider
      }`,
      `${translate(messages, "errorDetails.llmProvider")}: ${settingsSnapshot.api.llm.provider}`,
    ];
    if (stage === "transcribing") {
      lines.push(
        `${translate(messages, "errorDetails.whisperEndpoint")}: ${
          settingsSnapshot.api.whisper.endpoint || "default"
        }`
      );
    } else {
      lines.push(
        `${translate(messages, "errorDetails.llmBaseUrl")}: ${
          settingsSnapshot.api.llm.baseUrl || "default"
        }`
      );
    }
    lines.push(`${translate(messages, "errorDetails.message")}: ${message}`);
    return lines.join("\n");
  };

  const getActiveSession = () => sessions.find((session) => session.id === activeSessionId) ?? null;

  const processAudio = async (sessionId: string, blob: Blob, durationSec: number) => {
    const settingsSnapshot = settingsRef.current;
    const sessionSnapshot = getSessionById(sessionId);
    const sessionMode = sessionSnapshot?.mode ?? modeRef.current;
    const template =
      settingsSnapshot.enrichments.find((item) => item.id === sessionMode) ??
      settingsSnapshot.enrichments[0];
    const baseMetadata = sessionSnapshot?.metadata ?? {
      durationSec: 0,
      keywords: [],
      whisperProvider: settingsSnapshot.api.whisper.provider,
      llmProvider: settingsSnapshot.api.llm.provider,
    };

    updateSession(sessionId, {
      status: "processing",
      stage: "transcribing",
      transcript: "",
      enriched: "",
      errorMessage: undefined,
      recordingStartedAt: undefined,
      metadata: {
        ...baseMetadata,
        durationSec,
        whisperProvider: settingsSnapshot.api.whisper.provider,
        llmProvider: settingsSnapshot.api.llm.provider,
      },
    });

    let transcript = "";
    try {
      transcript = await transcribeAudio(blob, settingsSnapshot);
      updateSession(sessionId, {
        transcript,
        stage: "enriching",
        errorMessage: undefined,
        errorDetails: undefined,
      });
    } catch (error) {
      const locale = settingsSnapshot.general.language;
      const fallback = translate(getMessages(locale), "errors.transcriptionFailed");
      const message =
        error instanceof Error ? localizeError(error.message, locale) : fallback;
      updateSession(sessionId, {
        status: "error",
        stage: undefined,
        errorMessage: message,
        errorDetails: buildErrorDetails("transcribing", settingsSnapshot, message),
      });
      if (!settingsSnapshot.privacy.storeAudio) {
        clearAudioBlob(sessionId);
      }
      return;
    }

    try {
      const { enriched, keywords } = await enrichTranscript(
        transcript,
        template?.prompt || "",
        settingsSnapshot
      );
      updateSession(sessionId, {
        status: "done",
        stage: undefined,
        enriched,
        errorMessage: undefined,
        errorDetails: undefined,
        metadata: {
          ...baseMetadata,
          durationSec,
          keywords: keywords.length ? keywords : extractKeywords(transcript),
          whisperProvider: settingsSnapshot.api.whisper.provider,
          llmProvider: settingsSnapshot.api.llm.provider,
        },
      });
    } catch (error) {
      const locale = settingsSnapshot.general.language;
      const fallback = translate(getMessages(locale), "errors.enrichmentFailed");
      const message =
        error instanceof Error ? localizeError(error.message, locale) : fallback;
      updateSession(sessionId, {
        status: "error",
        stage: undefined,
        errorMessage: message,
        errorDetails: buildErrorDetails("enriching", settingsSnapshot, message),
      });
    } finally {
      if (!settingsSnapshot.privacy.storeAudio) {
        clearAudioBlob(sessionId);
      }
    }
  };

  const cleanupRecorder = () => {
    if (recorderRef.current) {
      recorderRef.current.cleanup();
    }
    recorderRef.current = null;
    recordingSessionIdRef.current = null;
  };

  const actions: StoreActions = {
    setSearchQuery,
    setMode,
    selectSession: (id) => setActiveSessionId(id),
    createEmptySession: () => {
      createSession({ status: "idle" });
    },
    deleteSession: (id) => {
      hasUserModifiedSessions.current = true;
      const existing = getSessionById(id);
      if (existing?.audioUrl) {
        try {
          URL.revokeObjectURL(existing.audioUrl);
        } catch {
          // ignore
        }
      }
      clearAudioBlob(id);
      setSessions((prev) => {
        const next = prev.filter((session) => session.id !== id);
        const serializable = next.map(({ audioUrl, ...rest }) => rest);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
          }
        } catch {
          // ignore
        }
        void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
        if (activeSessionId === id) {
          setActiveSessionId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    startRecording: async () => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        const locale = settingsRef.current.general.language;
        createSession({
          status: "error",
          title: "",
          errorMessage: localizeError(
            "Microphone access is not supported in this environment.",
            locale
          ),
        });
        return;
      }

      try {
        cleanupRecorder();
        const active = getActiveSession();
        const sessionId =
          active && active.status === "idle" && !active.transcript && !active.enriched
            ? active.id
            : createSession({
                status: "recording",
                recordingStartedAt: Date.now(),
                title: "",
              }).id;

        if (active && active.id === sessionId) {
          updateSession(active.id, {
            status: "recording",
            recordingStartedAt: Date.now(),
            mode,
            errorMessage: undefined,
            metadata: {
              ...active.metadata,
              whisperProvider: settings.api.whisper.provider,
              llmProvider: settings.api.llm.provider,
            },
          });
        }

        recordingSessionIdRef.current = sessionId;
        const recorder = new AudioRecorder();
        recorderRef.current = recorder;
        setRecordingLevel(0);

        recorder.setOnDataAvailable(async (blob) => {
          const targetId = recordingSessionIdRef.current ?? sessionId;
          if (!targetId) {
            cleanupRecorder();
            return;
          }
          setAudioBlob(targetId, blob);
          if (settingsRef.current.privacy.storeAudio) {
            const url = URL.createObjectURL(blob);
          updateSession(targetId, { audioUrl: url, errorMessage: undefined, errorDetails: undefined });
        } else {
          updateSession(targetId, { errorMessage: undefined, errorDetails: undefined });
        }

          const currentSession = getSessionById(targetId);
          const elapsed = currentSession?.recordingStartedAt
            ? Math.max(0, Math.floor((Date.now() - currentSession.recordingStartedAt) / 1000))
            : 0;
          await processAudio(targetId, blob, elapsed);
          cleanupRecorder();
        });

        recorder.setOnError((error) => {
          const targetId = recordingSessionIdRef.current ?? sessionId;
          if (targetId) {
            const locale = settingsRef.current.general.language;
            const message = localizeError(error.message, locale);
            updateSession(targetId, {
              status: "error",
              errorMessage: message,
              errorDetails: buildErrorDetails("transcribing", settingsRef.current, message),
            });
          }
          cleanupRecorder();
        });

        recorder.setOnLevel((level) => {
          setRecordingLevel((prev) => (Math.abs(prev - level) > 0.02 ? level : prev));
        });

        await recorder.startRecording();
      } catch (error) {
        const locale = settingsRef.current.general.language;
        const raw =
          error instanceof Error
            ? error.message
            : "Microphone access was denied. Please allow access and try again.";
        const message = localizeError(raw, locale);
        const targetId = recordingSessionIdRef.current;
        if (targetId) {
          updateSession(targetId, {
            status: "error",
            recordingStartedAt: undefined,
            errorMessage: message,
            errorDetails: buildErrorDetails("transcribing", settingsRef.current, message),
          });
        } else {
          createSession({
            status: "error",
            title: "",
            errorMessage: message,
            errorDetails: buildErrorDetails("transcribing", settingsRef.current, message),
          });
        }
        cleanupRecorder();
      }
    },
    stopRecording: () => {
      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
      setRecordingLevel(0);
    },
    uploadAudio: (file: File) => {
      if (!file) return;
      const session = createSession({
        status: "processing",
        stage: "transcribing",
        title: file.name || "Audio Upload",
      });
      setAudioBlob(session.id, file);
      if (settingsRef.current.privacy.storeAudio) {
        const url = URL.createObjectURL(file);
        updateSession(session.id, { audioUrl: url });
      }
      void processAudio(session.id, file, 0);
    },
    retryProcessing: () => {
      const active = getActiveSession();
      if (!active) return;
      const blob = audioBlobsRef.current[active.id];
      if (!blob) {
        const locale = settingsRef.current.general.language;
        updateSession(active.id, {
          status: "error",
          stage: undefined,
          errorMessage: localizeError("Audio file not available for retry.", locale),
          errorDetails: translate(getMessages(locale), "errors.audioBlobMissingDetails"),
        });
        return;
      }
      void processAudio(active.id, blob, active.metadata.durationSec);
    },
    updateSessionTitle: (id, title) =>
      updateSession(id, { title: title.trim() ? title : "" }),
    updateSettings: async (nextSettings) => {
      hasUserUpdatedSettings.current = true;
      const normalized = normalizeSettings(nextSettings);
      setSettings(normalized);
      setSettingsSource(isTauri() ? "tauri" : "local");
      const payload = JSON.stringify(normalized);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SETTINGS_KEY, payload);
        }
      } catch {
        // ignore
      }
      void writeToTauri(SETTINGS_FILE, payload);
    },
    toggleTheme: () => {
      setSettings((prev) => ({
        ...prev,
        general: {
          ...prev.general,
          theme: prev.general.theme === "dark" ? "light" : "dark",
        },
      }));
    },
  };

  const value = useMemo(
    () => ({
      state: {
        sessions,
        activeSessionId,
        searchQuery,
        mode,
        settings,
        settingsSource,
        recordingLevel,
      },
      actions,
    }),
    [sessions, activeSessionId, searchQuery, mode, settings, settingsSource, recordingLevel]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}
