"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedSessions, getDefaultEnrichments, getDefaultKeywordsPrompt } from "@/lib/mock";
import { AudioRecorder } from "@/lib/audioRecorder";
import { enrichTranscript, transcribeAudio, extractKeywords } from "@/lib/processing";
import { getMessages, t as translate, type Locale } from "@/lib/i18n";
import {
  fetchAudioBlob as fetchApiAudioBlob,
  fetchSessions as fetchApiSessions,
  fetchSettings as fetchApiSettings,
  getAudioUrl as getApiAudioUrl,
  isLocalApiAvailable,
  saveSession as saveApiSession,
  saveSettings as saveApiSettings,
  uploadAudio as uploadApiAudio,
  deleteSession as deleteApiSession,
} from "@/lib/localApi";

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
  audioPath?: string;
  audioMime?: string;
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
    cancelHotkey: string;
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
  keywordsPrompt: string;
};

const defaultSettings: Settings = {
  general: {
    language: "de",
    theme: "system",
    hotkey: "Ctrl+Shift+R",
    cancelHotkey: "Esc",
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
  keywordsPrompt: getDefaultKeywordsPrompt("de"),
};

const SETTINGS_KEY = "vi-settings";
const SESSIONS_KEY = "vi-sessions";
const SETTINGS_FILE = "ai-voice-note-settings.json";
const SESSIONS_FILE = "ai-voice-note-sessions.json";
const LEGACY_SETTINGS_FILE = "voice-intelligence-settings.json";
const LEGACY_SESSIONS_FILE = "voice-intelligence-sessions.json";

const LEGACY_KEYWORD_PROMPTS: Partial<Record<Locale, string>> = {
  de: "Extrahiere 4-6 praegnante Keywords oder kurze Schluesselphrasen aus dem Transkript. Gib ausschliesslich ein JSON-Array von Strings zurueck.",
  en: "Extract 4-6 concise keywords or short key phrases from the transcript. Return only a JSON array of strings.",
  fr: "Extrait 4 à 6 mots-clés concis ou courtes expressions du transcript. Renvoyer uniquement un tableau JSON de chaînes.",
  it: "Estrai 4-6 parole chiave concise o brevi frasi dal transcript. Restituisci solo un array JSON di stringhe.",
};

const LEGACY_ENRICHMENT_PROMPTS: Partial<Record<Locale, Record<string, string>>> = {
  de: {
    smart: "Erstelle Smart Notes mit:\n- Kurze Zusammenfassung\n- Entscheidungen\n- Naechste Schritte",
    tasks: "Extrahiere alle Aufgaben und To-dos als kurze Liste. Halte jeden Punkt knapp.",
    meeting: "Erstelle strukturierte Meeting-Notizen:\n- Zusammenfassung\n- Kernthemen\n- Entscheidungen\n- Action Items",
    email: "Erstelle eine kurze, professionelle E-Mail basierend auf dem Transkript. Fuege eine Betreffzeile hinzu.",
  },
  en: {
    smart: "Create smart notes with:\n- Short summary\n- Decisions\n- Next steps",
    tasks: "Extract all action items and tasks as a short bullet list. Keep each item concise.",
    meeting: "Create well-structured meeting notes:\n- Summary\n- Key points\n- Decisions\n- Action items",
    email: "Draft a concise professional email based on the transcript. Include a subject line.",
  },
  fr: {
    smart: "Crée des notes intelligentes avec :\n- Résumé court\n- Décisions\n- Prochaines étapes",
    tasks: "Extrait toutes les actions et tâches sous forme de liste concise.",
    meeting: "Crée des notes de réunion structurées :\n- Résumé\n- Points clés\n- Décisions\n- Actions",
    email: "Rédige un e‑mail professionnel concis basé sur la transcription. Inclure un objet.",
  },
  it: {
    smart: "Crea note intelligenti con:\n- Breve sintesi\n- Decisioni\n- Prossimi passi",
    tasks: "Estrai tutte le attività e i to‑do come elenco conciso.",
    meeting: "Crea note di riunione strutturate:\n- Sintesi\n- Punti chiave\n- Decisioni\n- Azioni",
    email: "Redigi un’e‑mail professionale concisa basata sulla trascrizione. Includi un oggetto.",
  },
};

const isTauri = () =>
  typeof window !== "undefined" &&
  ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);

const AUDIO_DIR = "audio";
const AUDIO_EXTENSION_BY_MIME: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};
const AUDIO_MIME_BY_EXTENSION: Record<string, string> = {
  webm: "audio/webm",
  ogg: "audio/ogg",
  mp4: "audio/mp4",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};
const BASE64_SUFFIX = ".b64";
const BASE64_CHUNK_SIZE = 0x8000;

function resolveAudioExtension(mime: string) {
  const normalized = (mime || "").split(";")[0].trim().toLowerCase();
  if (AUDIO_EXTENSION_BY_MIME[normalized]) return AUDIO_EXTENSION_BY_MIME[normalized];
  if (normalized.startsWith("audio/")) {
    const suffix = normalized.replace("audio/", "");
    if (suffix) return suffix;
  }
  return "webm";
}

function resolveAudioMime(path: string, fallback?: string) {
  const parts = path.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  const fallbackType = fallback?.split(";")[0].trim();
  return AUDIO_MIME_BY_EXTENSION[ext] ?? fallbackType ?? "audio/webm";
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + BASE64_CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function decodeBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function resolveLocale(value: unknown): Locale {
  if (value === "de" || value === "en" || value === "fr" || value === "it") return value;
  return defaultSettings.general.language;
}

function normalizePromptText(value: string) {
  return value.trim().replaceAll("\r\n", "\n").replaceAll("\u00df", "ss");
}

function migrateKeywordsPrompt(prompt: string, locale: Locale, fallback: string) {
  if (!prompt.trim()) return fallback;
  const legacy = LEGACY_KEYWORD_PROMPTS[locale];
  if (legacy && normalizePromptText(prompt) === normalizePromptText(legacy)) {
    return fallback;
  }
  return prompt;
}

function migrateEnrichments(
  enrichments: EnrichmentTemplate[],
  locale: Locale,
  defaults: EnrichmentTemplate[]
) {
  if (!enrichments.length) return defaults;
  const defaultsById = new Map(defaults.map((item) => [item.id, item.prompt]));
  const legacyById = LEGACY_ENRICHMENT_PROMPTS[locale] ?? {};
  return enrichments.map((item) => {
    const nextPrompt = defaultsById.get(item.id);
    if (!nextPrompt) return item;
    const currentPrompt = (item.prompt ?? "").trim();
    if (!currentPrompt) return { ...item, prompt: nextPrompt };
    const legacyPrompt = legacyById[item.id];
    if (legacyPrompt && normalizePromptText(currentPrompt) === normalizePromptText(legacyPrompt)) {
      return { ...item, prompt: nextPrompt };
    }
    return item;
  });
}

function shouldConvertForCompatibility(blob: Blob) {
  const type = (blob.type || "").toLowerCase();
  if (type.includes("webm") || type.includes("ogg")) return true;
  if ("name" in blob && typeof blob.name === "string") {
    const lower = blob.name.toLowerCase();
    if (lower.endsWith(".webm") || lower.endsWith(".ogg")) return true;
  }
  return false;
}

function audioBufferToWav(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const totalSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  let offset = 0;
  const writeString = (value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset, value.charCodeAt(i));
      offset += 1;
    }
  };
  const writeUint16 = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };
  const writeUint32 = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };

  writeString("RIFF");
  writeUint32(36 + dataSize);
  writeString("WAVE");
  writeString("fmt ");
  writeUint32(16);
  writeUint16(1);
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(sampleRate * blockAlign);
  writeUint16(blockAlign);
  writeUint16(16);
  writeString("data");
  writeUint32(dataSize);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i += 1) {
    channels.push(buffer.getChannelData(i));
  }
  for (let i = 0; i < numFrames; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      let sample = channels[channel][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

async function convertBlobToWav(blob: Blob) {
  if (typeof AudioContext === "undefined") return null;
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  const context = new AudioContextCtor();
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    const wavBuffer = audioBufferToWav(buffer);
    return new Blob([wavBuffer], { type: "audio/wav" });
  } catch {
    return null;
  } finally {
    try {
      await context.close();
    } catch {
      // ignore
    }
  }
}

async function normalizeAudioForApi(blob: Blob) {
  if (isTauri()) return blob;
  if (!shouldConvertForCompatibility(blob)) return blob;
  const converted = await convertBlobToWav(blob);
  return converted ?? blob;
}

async function ensureAudioDir(dir: "AppData" | "AppConfig") {
  if (!isTauri()) return;
  try {
    const { mkdir, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    const base = dir === "AppConfig" ? BaseDirectory.AppConfig : BaseDirectory.AppData;
    await mkdir(AUDIO_DIR, { baseDir: base, recursive: true });
  } catch {
    // ignore
  }
}

async function writeBinaryAudio(
  filename: string,
  buffer: Uint8Array,
  dir: "AppData" | "AppConfig"
) {
  const { writeFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  await ensureAudioDir(dir);
  const base = dir === "AppConfig" ? BaseDirectory.AppConfig : BaseDirectory.AppData;
  await writeFile(filename, buffer, { baseDir: base });
}

async function writeBase64Audio(filename: string, buffer: Uint8Array) {
  const { writeTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  await ensureAudioDir("AppConfig");
  const base64 = encodeBase64(buffer);
  await writeTextFile(filename + BASE64_SUFFIX, base64, { baseDir: BaseDirectory.AppConfig });
  return filename + BASE64_SUFFIX;
}

async function persistAudioBlob(sessionId: string, blob: Blob) {
  if (!isTauri()) return null;
  try {
    let extension = resolveAudioExtension(blob.type);
    if (!blob.type && "name" in blob && typeof blob.name === "string") {
      const nameParts = blob.name.split(".");
      const nameExt = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";
      if (nameExt) extension = nameExt;
    }
    const filename = `${AUDIO_DIR}/${sessionId}.${extension}`;
    const buffer = new Uint8Array(await blob.arrayBuffer());
    const mime = blob.type || AUDIO_MIME_BY_EXTENSION[extension] || "audio/webm";
    let lastError: unknown;
    for (const dir of ["AppData", "AppConfig"] as const) {
      try {
        await writeBinaryAudio(filename, buffer, dir);
        try {
          const { readFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
          const base = dir === "AppConfig" ? BaseDirectory.AppConfig : BaseDirectory.AppData;
          await readFile(filename, { baseDir: base });
          return { path: filename, mime };
        } catch {
          const base64Path = await writeBase64Audio(filename, buffer);
          return { path: base64Path, mime };
        }
      } catch (error) {
        lastError = error;
      }
    }
    try {
      const base64Path = await writeBase64Audio(filename, buffer);
      return { path: base64Path, mime };
    } catch (error) {
      lastError = error;
    }
    void lastError;
    return null;
  } catch {
    return null;
  }
}

async function readAudioBlob(path: string, mime?: string) {
  if (!isTauri()) return null;
  try {
    const { readFile, readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    if (path.endsWith(BASE64_SUFFIX)) {
      const base64 = await readTextFile(path, { baseDir: BaseDirectory.AppConfig });
      const bytes = decodeBase64(base64);
      return new Blob([bytes], { type: resolveAudioMime(path.replace(BASE64_SUFFIX, ""), mime) });
    }
    try {
      const data = await readFile(path, { baseDir: BaseDirectory.AppData });
      return new Blob([data], { type: resolveAudioMime(path, mime) });
    } catch {
      try {
        const data = await readFile(path, { baseDir: BaseDirectory.AppConfig });
        return new Blob([data], { type: resolveAudioMime(path, mime) });
      } catch {
        const base64 = await readTextFile(path + BASE64_SUFFIX, { baseDir: BaseDirectory.AppConfig });
        const bytes = decodeBase64(base64);
        return new Blob([bytes], { type: resolveAudioMime(path, mime) });
      }
    }
  } catch {
    return null;
  }
}

async function removeAudioFile(path: string) {
  if (!isTauri()) return;
  try {
    const { remove, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    const paths = path.endsWith(BASE64_SUFFIX)
      ? [path, path.replace(BASE64_SUFFIX, "")]
      : [path, path + BASE64_SUFFIX];
    for (const target of paths) {
      try {
        await remove(target, { baseDir: BaseDirectory.AppData });
      } catch {
        try {
          await remove(target, { baseDir: BaseDirectory.AppConfig });
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }
}

async function getAudioDuration(blob: Blob) {
  if (typeof Audio === "undefined") return 0;
  return new Promise<number>((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    let settled = false;
    let timeoutId = 0;
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("error", handleError);
      URL.revokeObjectURL(url);
    };
    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };
    timeoutId = window.setTimeout(() => finish(0), 4000);
    const handleTimeUpdate = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        finish(audio.duration);
      }
    };
    const handleLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        finish(audio.duration);
        return;
      }
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.currentTime = 1e101;
    };
    const handleError = () => finish(0);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("error", handleError);
    audio.preload = "metadata";
    audio.src = url;
  });
}

async function resolveAudioDurationSec(blob: Blob, fallback = 0) {
  const duration = await getAudioDuration(blob);
  const rounded = Number.isFinite(duration) ? Math.round(duration) : 0;
  return Math.max(fallback, rounded);
}

async function readFromTauri(filename: string) {
  if (!isTauri()) return null;
  try {
    const { readTextFile, exists, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    const fileExists = await exists(filename, { baseDir: BaseDirectory.AppConfig });
    if (!fileExists) return null;
    return await readTextFile(filename, { baseDir: BaseDirectory.AppConfig });
  } catch {
    return null;
  }
}

async function writeToTauri(filename: string, contents: string) {
  if (!isTauri()) return;
  try {
    const { writeTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    await writeTextFile(filename, contents, { baseDir: BaseDirectory.AppConfig });
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
  const language = resolveLocale(
    general.language ?? legacy.language ?? defaultSettings.general.language
  );
  const localeDefaults = {
    enrichments: getDefaultEnrichments(language),
    keywordsPrompt: getDefaultKeywordsPrompt(language),
  };
  const keywordsPrompt = migrateKeywordsPrompt(
    legacy.keywordsPrompt ?? legacy.keywords?.prompt ?? localeDefaults.keywordsPrompt,
    language,
    localeDefaults.keywordsPrompt
  );
  const enrichments = Array.isArray(legacy.enrichments) && legacy.enrichments.length
    ? legacy.enrichments
    : localeDefaults.enrichments;

  return {
    general: {
      language,
      theme: general.theme ?? legacy.theme ?? defaultSettings.general.theme,
      hotkey: general.hotkey ?? legacy.hotkey ?? defaultSettings.general.hotkey,
      cancelHotkey:
        general.cancelHotkey ?? legacy.cancelHotkey ?? defaultSettings.general.cancelHotkey,
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
    enrichments: migrateEnrichments(enrichments, language, localeDefaults.enrichments),
    keywordsPrompt,
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
  settingsSource: "api" | "tauri" | "local" | "default";
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
  uploadAudio: (file: File) => Promise<void>;
  retryProcessing: () => Promise<void>;
  cancelProcessing: () => void;
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
  const [settingsSource, setSettingsSource] = useState<
    "api" | "tauri" | "local" | "default"
  >("default");
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
  const settingsSourceRef = useRef(settingsSource);
  const apiConversionRef = useRef<Set<string>>(new Set());
  const processingControllersRef = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      const localSettingsKey =
        typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
      const localSessionsKey =
        typeof window !== "undefined" ? localStorage.getItem(SESSIONS_KEY) : null;
      const localSettingsRaw = safeParseJson<Settings>(localSettingsKey, defaultSettings);
      const localSessions = safeParseJson<Session[]>(localSessionsKey, seedSessions);

      const tauriSettingsRaw =
        (await readFromTauri(SETTINGS_FILE)) ?? (await readFromTauri(LEGACY_SETTINGS_FILE));
      const tauriSessionsRaw =
        (await readFromTauri(SESSIONS_FILE)) ?? (await readFromTauri(LEGACY_SESSIONS_FILE));
      const tauriSettings = safeParseJson<Settings>(tauriSettingsRaw, localSettingsRaw);
      const tauriSessions = safeParseJson<Session[]>(tauriSessionsRaw, localSessions);
      const fallbackSettings = tauriSettingsRaw ? tauriSettings : localSettingsRaw;
      const fallbackSessions = tauriSessionsRaw ? tauriSessions : localSessions;
      const hasStoredSessions = Boolean(tauriSessionsRaw || localSessionsKey);

      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let apiAvailable = false;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        apiAvailable = await isLocalApiAvailable(true);
        if (apiAvailable) break;
        await wait(250);
      }

      if (apiAvailable) {
        const [settingsResult, sessionsResult] = await Promise.allSettled([
          fetchApiSettings(),
          fetchApiSessions(),
        ]);
        const apiSettings =
          settingsResult.status === "fulfilled" ? settingsResult.value : null;
        const apiSessionsRaw =
          sessionsResult.status === "fulfilled" ? sessionsResult.value : [];
        const apiSessions = apiSessionsRaw.map((session) => ({
          ...session,
          audioUrl: session.audioUrl || undefined,
        }));
        const loadedSettings = normalizeSettings(apiSettings ?? fallbackSettings);
        const loadedSessions = apiSessions.length ? apiSessions : fallbackSessions;
        const shouldSeedApiSettings =
          settingsResult.status !== "fulfilled" ||
          !apiSettings ||
          (typeof apiSettings === "object" && Object.keys(apiSettings).length === 0);
        if (!active) return;
        if (!hasUserUpdatedSettings.current) {
          setSettings(loadedSettings);
        }
        if (!hasUserModifiedSessions.current) {
          setSessions(loadedSessions.length ? loadedSessions : seedSessions);
        }
        setSettingsSource("api");
        hasLoadedSessions.current = true;
        setIsHydrated(true);
        if (shouldSeedApiSettings) {
          void saveApiSettings(loadedSettings);
        }
        if (!apiSessions.length && hasStoredSessions && loadedSessions.length) {
          void (async () => {
            await Promise.all(loadedSessions.map((session) => saveApiSession(session)));
            if (!isTauri()) return;
            const updates: Record<string, Partial<Session>> = {};
            for (const session of loadedSessions) {
              if (!session.audioPath || session.audioUrl) continue;
              const blob = await readAudioBlob(session.audioPath, session.audioMime);
              if (!blob) continue;
              await uploadApiAudio(session.id, blob);
              updates[session.id] = {
                audioUrl: getApiAudioUrl(session.id),
                audioPath: undefined,
                audioMime: blob.type || session.audioMime,
              };
            }
            if (Object.keys(updates).length) {
              setSessions((prev) =>
                prev.map((session) =>
                  updates[session.id] ? { ...session, ...updates[session.id] } : session
                )
              );
            }
          })();
        }
        if (!isTauri() && apiSessions.length) {
          void (async () => {
            for (const session of apiSessions) {
              if (!session.audioUrl) continue;
              const mime = (session.audioMime || "").toLowerCase();
              if (!mime.includes("webm") && !mime.includes("ogg")) continue;
              if (apiConversionRef.current.has(session.id)) continue;
              apiConversionRef.current.add(session.id);
              const blob = await fetchApiAudioBlob(session.id);
              if (!blob) continue;
              const converted = await normalizeAudioForApi(blob);
              if (converted === blob) continue;
              await uploadApiAudio(session.id, converted);
              const updated: Partial<Session> = {
                audioMime: converted.type || session.audioMime,
                audioUrl: getApiAudioUrl(session.id),
              };
              setSessions((prev) =>
                prev.map((item) => (item.id === session.id ? { ...item, ...updated } : item))
              );
              void saveApiSession({ ...session, ...updated });
            }
          })();
        }
        return;
      }

      const loadedSettings = normalizeSettings(fallbackSettings);
      const resolvedSource = tauriSettingsRaw
        ? "tauri"
        : localSettingsKey
        ? "local"
        : "default";
      const loadedSessions = fallbackSessions;

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
    settingsSourceRef.current = settingsSource;
  }, [settingsSource]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!activeSessionId) return;
    if (settingsSourceRef.current === "api") return;
    const session = getSessionById(activeSessionId);
    if (!session?.audioPath || session.audioUrl) return;
    let active = true;
    void (async () => {
      const blob = await readAudioBlob(session.audioPath, session.audioMime);
      if (!active) return;
      if (!blob) {
        updateSession(session.id, { audioPath: undefined, audioMime: undefined });
        return;
      }
      setAudioBlob(session.id, blob);
      const url = URL.createObjectURL(blob);
      const updates: Partial<Session> = {
        audioUrl: url,
        audioMime: session.audioMime ?? blob.type,
      };
      if (session.metadata.durationSec <= 0) {
        const durationSec = await resolveAudioDurationSec(blob, 0);
        if (durationSec > 0) {
          updates.metadata = { ...session.metadata, durationSec };
        }
      }
      updateSession(session.id, updates);
    })();
    return () => {
      active = false;
    };
  }, [activeSessionId]);

  useEffect(() => {
    if (!settings.enrichments.length) return;
    if (!settings.enrichments.some((item) => item.id === mode)) {
      setMode(settings.enrichments[0].id);
    }
  }, [settings.enrichments, mode]);

  useEffect(() => {
    if (!isHydrated && !hasUserUpdatedSettings.current) return;
    if (settingsSourceRef.current === "api") {
      void saveApiSettings(settings);
    } else {
      const payload = JSON.stringify(settings);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SETTINGS_KEY, payload);
        }
      } catch {
        // ignore
      }
      void writeToTauri(SETTINGS_FILE, payload);
    }
    applyTheme(settings.general.theme);
  }, [settings, isHydrated]);

  const saveSessionTimeouts = useRef<Record<string, number>>({});

  const queueSessionSave = (session: Session) => {
    if (settingsSourceRef.current !== "api") return;
    const existing = saveSessionTimeouts.current[session.id];
    if (existing) {
      window.clearTimeout(existing);
    }
    saveSessionTimeouts.current[session.id] = window.setTimeout(() => {
      void saveApiSession(session);
    }, 200);
  };

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
      if (settingsSourceRef.current !== "api") {
        const serializable = next.map(({ audioUrl, ...rest }) => rest);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
          }
        } catch {
          // ignore
        }
        void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
      }
      return next;
    });
    queueSessionSave(newSession);
    setActiveSessionId(newSession.id);
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    hasUserModifiedSessions.current = true;
    setSessions((prev) => {
      let updatedSession: Session | null = null;
      const next = prev.map((session) => {
        if (session.id !== id) return session;
        if ("audioUrl" in updates && session.audioUrl && session.audioUrl !== updates.audioUrl) {
          try {
            URL.revokeObjectURL(session.audioUrl);
          } catch {
            // ignore
          }
        }
        const merged = { ...session, ...updates };
        updatedSession = merged;
        return merged;
      });
      if (settingsSourceRef.current !== "api") {
        const serializable = next.map(({ audioUrl, ...rest }) => rest);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
          }
        } catch {
          // ignore
        }
        void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
      }
      if (updatedSession) {
        queueSessionSave(updatedSession);
      }
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

  const isAbortError = (error: unknown) =>
    error instanceof DOMException
      ? error.name === "AbortError"
      : Boolean((error as any)?.name === "AbortError");

  const startProcessingController = (sessionId: string) => {
    const existing = processingControllersRef.current[sessionId];
    if (existing) {
      existing.abort();
    }
    const controller = new AbortController();
    processingControllersRef.current[sessionId] = controller;
    return controller;
  };

  const clearProcessingController = (sessionId: string) => {
    delete processingControllersRef.current[sessionId];
  };

  const getProcessingSession = () =>
    sessionsRef.current.find((session) => session.status === "processing");

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
    const controller = startProcessingController(sessionId);
    const signal = controller.signal;
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
      transcript = await transcribeAudio(blob, settingsSnapshot, signal);
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      updateSession(sessionId, {
        transcript,
        stage: "enriching",
        errorMessage: undefined,
        errorDetails: undefined,
      });
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        const locale = settingsSnapshot.general.language;
        const message = translate(getMessages(locale), "errors.processingCancelled");
        const current = getSessionById(sessionId);
        if (current?.status === "error" && current.errorMessage === message) {
          clearProcessingController(sessionId);
          return;
        }
        updateSession(sessionId, {
          status: "error",
          stage: undefined,
          errorMessage: message,
          errorDetails: buildErrorDetails("transcribing", settingsSnapshot, message),
        });
        if (!settingsSnapshot.privacy.storeAudio) {
          clearAudioBlob(sessionId);
        }
        clearProcessingController(sessionId);
        return;
      }
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
      clearProcessingController(sessionId);
      return;
    }

    try {
      const { enriched, keywords } = await enrichTranscript(
        transcript,
        template?.prompt || "",
        settingsSnapshot,
        signal
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
          keywords: keywords.length ? keywords : extractKeywords(transcript, 6),
          whisperProvider: settingsSnapshot.api.whisper.provider,
          llmProvider: settingsSnapshot.api.llm.provider,
        },
      });
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        const locale = settingsSnapshot.general.language;
        const message = translate(getMessages(locale), "errors.processingCancelled");
        const current = getSessionById(sessionId);
        if (current?.status === "error" && current.errorMessage === message) {
          return;
        }
        updateSession(sessionId, {
          status: "error",
          stage: undefined,
          errorMessage: message,
          errorDetails: buildErrorDetails("enriching", settingsSnapshot, message),
        });
        return;
      }
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
      clearProcessingController(sessionId);
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
      if (getProcessingSession()) return;
      createSession({ status: "idle" });
    },
    deleteSession: (id) => {
      if (getProcessingSession()) return;
      hasUserModifiedSessions.current = true;
      const existing = getSessionById(id);
      if (existing?.audioUrl) {
        try {
          URL.revokeObjectURL(existing.audioUrl);
        } catch {
          // ignore
        }
      }
      if (settingsSourceRef.current === "api") {
        void deleteApiSession(id);
      } else if (existing?.audioPath) {
        void removeAudioFile(existing.audioPath);
      }
      clearAudioBlob(id);
      setSessions((prev) => {
        const next = prev.filter((session) => session.id !== id);
        if (settingsSourceRef.current !== "api") {
          const serializable = next.map(({ audioUrl, ...rest }) => rest);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
            }
          } catch {
            // ignore
          }
          void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
        }
        if (activeSessionId === id) {
          setActiveSessionId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    startRecording: async () => {
      if (getProcessingSession()) return;
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
          let workingBlob = blob;
          if (settingsSourceRef.current === "api") {
            if (settingsRef.current.privacy.storeAudio) {
              workingBlob = await normalizeAudioForApi(blob);
              await uploadApiAudio(targetId, workingBlob);
              updateSession(targetId, {
                audioUrl: getApiAudioUrl(targetId),
                audioPath: undefined,
                audioMime: workingBlob.type || blob.type || "audio/webm",
                errorMessage: undefined,
                errorDetails: undefined,
              });
            } else {
              updateSession(targetId, {
                audioUrl: undefined,
                audioPath: undefined,
                audioMime: undefined,
                errorMessage: undefined,
                errorDetails: undefined,
              });
            }
          } else if (settingsRef.current.privacy.storeAudio) {
            const persisted = await persistAudioBlob(targetId, blob);
            const url = URL.createObjectURL(blob);
            updateSession(targetId, {
              audioUrl: url,
              audioPath: persisted?.path,
              audioMime: persisted?.mime ?? blob.type,
              errorMessage: undefined,
              errorDetails: undefined,
            });
          } else {
            updateSession(targetId, {
              audioUrl: undefined,
              audioPath: undefined,
              audioMime: undefined,
              errorMessage: undefined,
              errorDetails: undefined,
            });
          }
          setAudioBlob(targetId, workingBlob);

          const currentSession = getSessionById(targetId);
          const elapsed = currentSession?.recordingStartedAt
            ? Math.max(0, Math.floor((Date.now() - currentSession.recordingStartedAt) / 1000))
            : 0;
          const durationSec = await resolveAudioDurationSec(workingBlob, elapsed);
          await processAudio(targetId, workingBlob, durationSec);
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
    uploadAudio: async (file: File) => {
      if (!file) return;
      if (getProcessingSession()) return;
      const active = getActiveSession();
      const canReuse =
        active && active.status === "idle" && !active.transcript && !active.enriched;
      const session = canReuse
        ? active
        : createSession({
            status: "processing",
            stage: "transcribing",
            title: file.name || "Audio Upload",
          });
      if (canReuse && session) {
        updateSession(session.id, {
          status: "processing",
          stage: "transcribing",
          title: file.name || "Audio Upload",
          mode,
          transcript: "",
          enriched: "",
          recordingStartedAt: undefined,
          errorMessage: undefined,
          errorDetails: undefined,
          audioUrl: undefined,
          audioPath: undefined,
          audioMime: undefined,
          metadata: {
            durationSec: 0,
            keywords: [],
            whisperProvider: settings.api.whisper.provider,
            llmProvider: settings.api.llm.provider,
          },
        });
      }
      let workingBlob: Blob = file;
      if (settingsSourceRef.current === "api") {
        if (settingsRef.current.privacy.storeAudio) {
          workingBlob = await normalizeAudioForApi(file);
          await uploadApiAudio(session.id, workingBlob);
          updateSession(session.id, {
            audioUrl: getApiAudioUrl(session.id),
            audioPath: undefined,
            audioMime: workingBlob.type || file.type || "audio/webm",
          });
        }
      } else if (settingsRef.current.privacy.storeAudio) {
        const persisted = await persistAudioBlob(session.id, file);
        const url = URL.createObjectURL(file);
        updateSession(session.id, {
          audioUrl: url,
          audioPath: persisted?.path,
          audioMime: persisted?.mime ?? file.type,
        });
      }
      setAudioBlob(session.id, workingBlob);
      const durationSec = await resolveAudioDurationSec(workingBlob, 0);
      void processAudio(session.id, workingBlob, durationSec);
    },
    retryProcessing: async () => {
      const active = getActiveSession();
      if (!active) return;
      if (getProcessingSession()) return;
      let blob = audioBlobsRef.current[active.id];
      if (!blob) {
        if (settingsSourceRef.current === "api") {
          blob = (await fetchApiAudioBlob(active.id)) ?? undefined;
          if (blob) {
            setAudioBlob(active.id, blob);
            if (!active.audioUrl) {
              updateSession(active.id, { audioUrl: getApiAudioUrl(active.id) });
            }
          }
        } else if (active.audioPath) {
          blob = await readAudioBlob(active.audioPath, active.audioMime) ?? undefined;
          if (blob) {
            setAudioBlob(active.id, blob);
            if (!active.audioUrl) {
              const url = URL.createObjectURL(blob);
              updateSession(active.id, { audioUrl: url, audioMime: active.audioMime ?? blob.type });
            }
          }
        }
      }
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
      const durationSec =
        active.metadata.durationSec || (await resolveAudioDurationSec(blob, 0));
      void processAudio(active.id, blob, durationSec);
    },
    cancelProcessing: () => {
      const target = getProcessingSession();
      if (!target) return;
      const controller = processingControllersRef.current[target.id];
      if (controller) controller.abort();
      clearProcessingController(target.id);
      const locale = settingsRef.current.general.language;
      const message = translate(getMessages(locale), "errors.processingCancelled");
      updateSession(target.id, {
        status: "error",
        stage: undefined,
        errorMessage: message,
        errorDetails: buildErrorDetails(target.stage ?? "transcribing", settingsRef.current, message),
      });
    },
    updateSessionTitle: (id, title) =>
      updateSession(id, { title: title.trim() ? title : "" }),
    updateSettings: async (nextSettings) => {
      hasUserUpdatedSettings.current = true;
      const normalized = normalizeSettings(nextSettings);
      setSettings(normalized);
      if (settingsSourceRef.current === "api") {
        setSettingsSource("api");
        void saveApiSettings(normalized);
      } else {
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
      }
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
