"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";

import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const STEP_IDS = [
  "ffmpeg",
  "remoteWhisper",
  "remoteLlm",
  "localWhisper",
  "localLlm",
  "summary",
] as const;

const WHISPER_MODEL_OPTIONS = [
  {
    id: "tiny",
    label: "tiny (75 MB)",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
    filename: "ggml-tiny.bin",
  },
  {
    id: "base",
    label: "base (142 MB)",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
    filename: "ggml-base.bin",
  },
  {
    id: "small",
    label: "small (466 MB)",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
    filename: "ggml-small.bin",
  },
  {
    id: "medium",
    label: "medium (1.5 GB)",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin",
    filename: "ggml-medium.bin",
  },
  {
    id: "large-v3",
    label: "large-v3 (2.9 GB)",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin",
    filename: "ggml-large-v3.bin",
  },
] as const;

type StepId = (typeof STEP_IDS)[number];

type CommandDetection = {
  found: boolean;
  path?: string;
  version?: string;
  error?: string;
};

type OllamaStatus = {
  binaryFound: boolean;
  binaryPath?: string;
  serverAvailable: boolean;
  modelAvailable: boolean;
  models: string[];
  error?: string;
};

type CommandLogEvent = {
  id: string;
  stream: "stdout" | "stderr" | "error" | "terminated";
  message: string;
  code?: number;
};

type SetupWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const defaultPrompt = "Hello from ai voice note.";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

function createKeyId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function getBinaryName(value?: string) {
  if (!value) return "";
  const segments = value.split(/[/\\]/);
  return segments[segments.length - 1]?.toLowerCase() ?? "";
}

function isWhisperCli(value?: string) {
  return getBinaryName(value) === "whisper";
}

export function SetupWizard({ open, onOpenChange }: SetupWizardProps) {
  const {
    state: { settings },
    actions: { updateSettings },
  } = useAppStore();
  const { t } = useI18n(settings.general.language);

  const [draft, setDraft] = useState(settings);
  const [stepIndex, setStepIndex] = useState(0);
  const [ffmpegStatus, setFfmpegStatus] = useState<CommandDetection | null>(null);
  const [ffmpegChecking, setFfmpegChecking] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [localWhisperStatus, setLocalWhisperStatus] = useState<CommandDetection | null>(null);
  const [localWhisperModelOk, setLocalWhisperModelOk] = useState<boolean | null>(null);
  const [localWhisperModelError, setLocalWhisperModelError] = useState<string | null>(null);
  const [localWhisperChecking, setLocalWhisperChecking] = useState(false);
  const [whisperModelChoice, setWhisperModelChoice] = useState<string>(
    WHISPER_MODEL_OPTIONS[1]?.id ?? WHISPER_MODEL_OPTIONS[0]?.id ?? "base"
  );
  const [customWhisperUrl, setCustomWhisperUrl] = useState("");
  const [whisperDownloadBusy, setWhisperDownloadBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const ffmpegAutoChecked = useRef(false);
  const wasOpenRef = useRef(open);
  const draftRef = useRef(settings);

  const isTauriApp = useMemo(() => (typeof window !== "undefined" ? isTauri() : false), []);

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
    draftRef.current = settings;
  }, [open, settings]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setStepIndex(0);
      setFfmpegStatus(null);
      setOllamaStatus(null);
      setLocalWhisperStatus(null);
      setLocalWhisperModelOk(null);
      setLocalWhisperModelError(null);
      setLogs([]);
      setActiveLogId(null);
      ffmpegAutoChecked.current = false;
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const steps = useMemo(
    () => [
      { id: "ffmpeg", title: t("setup.steps.ffmpeg"), optional: false },
      { id: "remoteWhisper", title: t("setup.steps.remoteWhisper"), optional: false },
      { id: "remoteLlm", title: t("setup.steps.remoteLlm"), optional: false },
      { id: "localWhisper", title: t("setup.steps.localWhisper"), optional: true },
      { id: "localLlm", title: t("setup.steps.localLlm"), optional: true },
      { id: "summary", title: t("setup.steps.summary"), optional: false },
    ],
    [t]
  );

  const step = steps[stepIndex] ?? steps[0];

  const applyDraft = useCallback(
    (updater: (prev: typeof draft) => typeof draft) => {
      const next = updater(draftRef.current);
      draftRef.current = next;
      setDraft(next);
      void updateSettings(next);
    },
    [updateSettings]
  );

  const appendLog = useCallback((line: string) => {
    setLogs((prev) => {
      const next = [...prev, line];
      return next.length > 400 ? next.slice(next.length - 400) : next;
    });
  }, []);

  const startLogSession = useCallback((label: string) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setActiveLogId(id);
    setLogs([`$ ${label}`]);
    return id;
  }, []);

  useEffect(() => {
    if (!isTauriApp) return;
    let unlisten: (() => void) | null = null;
    listen<CommandLogEvent>("setup-wizard:log", (event) => {
      if (!activeLogId || event.payload.id !== activeLogId) return;
      const { stream, message, code } = event.payload;
      if (stream === "terminated") {
        appendLog(`[exit ${code ?? 0}]`);
        return;
      }
      const prefix = stream === "stderr" ? "[stderr] " : stream === "error" ? "[error] " : "";
      appendLog(`${prefix}${message}`);
    }).then((stop) => {
      unlisten = stop;
    });
    return () => {
      if (unlisten) unlisten();
    };
  }, [activeLogId, appendLog, isTauriApp]);

  const handleClose = () => onOpenChange(false);

  const handleNext = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const handleFinish = async () => {
    await updateSettings({
      ...draft,
      general: { ...draft.general, setupCompleted: true },
    });
    onOpenChange(false);
  };

  const handleDetectFfmpeg = async () => {
    if (!isTauriApp) return;
    setFfmpegChecking(true);
    try {
      const result = await invoke<CommandDetection>("detect_ffmpeg", {
        ffmpegPath: draft.ffmpegPath || null,
      });
      setFfmpegStatus(result);
    } catch (error) {
      setFfmpegStatus({ found: false, error: getErrorMessage(error) });
    } finally {
      setFfmpegChecking(false);
    }
  };

  useEffect(() => {
    if (!open || !isTauriApp) return;
    if (step.id !== "ffmpeg") return;
    if (ffmpegAutoChecked.current) return;
    ffmpegAutoChecked.current = true;
    void handleDetectFfmpeg();
  }, [open, isTauriApp, step.id]);

  const handleTestFfmpeg = async () => {
    if (!isTauriApp) return;
    const requestId = startLogSession("ffmpeg test");
    try {
      await invoke("test_ffmpeg", {
        requestId,
        ffmpegPath: draft.ffmpegPath || null,
      });
    } catch (error) {
      appendLog(`[error] ${getErrorMessage(error)}`);
    }
  };

  const handleBrowseFile = async (setter: (value: string) => void) => {
    if (!isTauriApp) return;
    const { open } = await import("@tauri-apps/plugin-dialog");
    const file = await open({ multiple: false, directory: false });
    if (typeof file === "string") setter(file);
  };

  const handleDetectOllama = async () => {
    if (!isTauriApp) return;
    try {
      const result = await invoke<OllamaStatus>("detect_ollama", {
        baseUrl: draft.local.llm.ollamaBaseUrl,
        model: draft.local.llm.ollamaModel,
      });
      setOllamaStatus(result);
      applyDraft((prev) => ({
        ...prev,
        local: {
          ...prev.local,
          llm: {
            ...prev.local.llm,
            available: result.serverAvailable && result.modelAvailable,
          },
        },
      }));
    } catch (error) {
      setOllamaStatus({
        binaryFound: false,
        serverAvailable: false,
        modelAvailable: false,
        models: [],
        error: getErrorMessage(error),
      });
      applyDraft((prev) => ({
        ...prev,
        local: {
          ...prev.local,
          llm: { ...prev.local.llm, available: false },
        },
      }));
    }
  };

  const handleDetectLocalWhisper = async () => {
    if (!isTauriApp) return;
    setLocalWhisperChecking(true);
    setLocalWhisperModelOk(null);
    setLocalWhisperModelError(null);
    try {
      let detectedPath: string | undefined;
      if (draft.local.whisper.binaryPath.trim()) {
        const result = await invoke<CommandDetection>("detect_command", {
          name: draft.local.whisper.binaryPath.trim(),
        });
        if (result.found) {
          detectedPath = result.path ?? draft.local.whisper.binaryPath.trim();
          setLocalWhisperStatus(result);
          let modelOk = true;
          if (!isWhisperCli(detectedPath)) {
            const modelPath = draft.local.whisper.model.trim();
            if (!modelPath) {
              modelOk = false;
              setLocalWhisperModelError(t("setup.localWhisper.modelMissing"));
            } else {
              try {
                const { exists } = await import("@tauri-apps/plugin-fs");
                const modelExists = await exists(modelPath);
                if (!modelExists) {
                  modelOk = false;
                  setLocalWhisperModelError(t("setup.localWhisper.modelNotFound"));
                }
              } catch {
                modelOk = false;
                setLocalWhisperModelError(t("setup.localWhisper.modelNotFound"));
              }
            }
          }
          setLocalWhisperModelOk(modelOk);
          applyDraft((prev) => ({
            ...prev,
            local: {
              ...prev.local,
              whisper: { ...prev.local.whisper, installed: modelOk },
            },
          }));
          setLocalWhisperChecking(false);
          return;
        }
      }
      const candidates = ["whisper", "whisper.cpp", "whisper-cpp", "whisper-cli"];
      let found: CommandDetection | null = null;
      for (const name of candidates) {
        const result = await invoke<CommandDetection>("detect_command", { name });
        if (result.found) {
          found = result;
          detectedPath = result.path ?? name;
          break;
        }
      }
      const finalStatus = found ?? { found: false };
      setLocalWhisperStatus(finalStatus);
      let modelOk = true;
      if (finalStatus.found) {
        if (!isWhisperCli(detectedPath)) {
          const modelPath = draft.local.whisper.model.trim();
          if (!modelPath) {
            modelOk = false;
            setLocalWhisperModelError(t("setup.localWhisper.modelMissing"));
          } else {
            try {
              const { exists } = await import("@tauri-apps/plugin-fs");
              const modelExists = await exists(modelPath);
              if (!modelExists) {
                modelOk = false;
                setLocalWhisperModelError(t("setup.localWhisper.modelNotFound"));
              }
            } catch {
              modelOk = false;
              setLocalWhisperModelError(t("setup.localWhisper.modelNotFound"));
            }
          }
        }
        setLocalWhisperModelOk(modelOk);
      } else {
        setLocalWhisperModelOk(null);
      }
      applyDraft((prev) => ({
        ...prev,
        local: {
          ...prev.local,
          whisper: { ...prev.local.whisper, installed: Boolean(finalStatus.found && modelOk) },
        },
      }));
    } catch (error) {
      setLocalWhisperStatus({ found: false, error: getErrorMessage(error) });
      setLocalWhisperModelOk(null);
      setLocalWhisperModelError(null);
      applyDraft((prev) => ({
        ...prev,
        local: { ...prev.local, whisper: { ...prev.local.whisper, installed: false } },
      }));
    } finally {
      setLocalWhisperChecking(false);
    }
  };

  const handleDownloadWhisperModel = async () => {
    if (!isTauriApp) return;
    const selected =
      WHISPER_MODEL_OPTIONS.find((option) => option.id === whisperModelChoice) ?? null;
    const url = selected?.url ?? customWhisperUrl.trim();
    if (!url) {
      appendLog(`[error] ${t("setup.localWhisper.downloadMissingUrl")}`);
      return;
    }
    setWhisperDownloadBusy(true);
    const requestId = startLogSession("whisper model download");
    try {
      const path = await invoke<string>("download_whisper_model", {
        requestId,
        url,
        filename: selected?.filename ?? null,
      });
      applyDraft((prev) => ({
        ...prev,
        local: {
          ...prev.local,
          whisper: { ...prev.local.whisper, model: path },
        },
      }));
      appendLog(`${t("setup.localWhisper.downloaded")}: ${path}`);
    } catch (error) {
      appendLog(`[error] ${getErrorMessage(error)}`);
    } finally {
      setWhisperDownloadBusy(false);
    }
  };

  const handleOllamaServe = async () => {
    if (!isTauriApp) return;
    const requestId = startLogSession("ollama serve");
    try {
      await invoke("start_ollama_serve", { requestId });
    } catch (error) {
      appendLog(`[error] ${getErrorMessage(error)}`);
    }
  };

  const handleOllamaPull = async () => {
    if (!isTauriApp) return;
    const requestId = startLogSession(`ollama pull ${draft.local.llm.ollamaModel}`);
    try {
      await invoke("pull_ollama_model", {
        requestId,
        model: draft.local.llm.ollamaModel,
      });
      await handleDetectOllama();
    } catch (error) {
      appendLog(`[error] ${getErrorMessage(error)}`);
    }
  };

  const handleOllamaTest = async () => {
    if (!isTauriApp) return;
    setActiveLogId(null);
    setLogs([]);
    try {
      const response = await invoke<string>("test_ollama_generate", {
        baseUrl: draft.local.llm.ollamaBaseUrl,
        model: draft.local.llm.ollamaModel,
        prompt: defaultPrompt,
      });
      appendLog(response);
      applyDraft((prev) => ({
        ...prev,
        local: {
          ...prev.local,
          llm: { ...prev.local.llm, available: true },
        },
      }));
      await handleDetectOllama();
    } catch (error) {
      appendLog(`[error] ${getErrorMessage(error)}`);
    }
  };

  const updateWhisperKeys = (keys: typeof draft.api.whisper.keys) => {
    const normalized = keys ?? [];
    const nextActive = normalized[0]?.id;
    applyDraft((prev) => {
      const keepLocal = prev.api.whisper.provider === "Local";
      const nextProvider = keepLocal
        ? prev.api.whisper.provider
        : (normalized[0]?.provider as any ?? prev.api.whisper.provider);
      return {
        ...prev,
        api: {
          ...prev.api,
          whisper: {
            ...prev.api.whisper,
            keys: normalized,
            activeKeyId: keepLocal ? prev.api.whisper.activeKeyId : nextActive,
            provider: nextProvider,
            apiKey: keepLocal
              ? prev.api.whisper.apiKey
              : normalized[0]?.apiKey ?? prev.api.whisper.apiKey,
            endpoint: keepLocal
              ? prev.api.whisper.endpoint
              : normalized[0]?.endpoint ?? prev.api.whisper.endpoint,
          },
        },
      };
    });
  };

  const updateLlmKeys = (keys: typeof draft.api.llm.keys) => {
    const normalized = keys ?? [];
    const nextActive = normalized[0]?.id;
    applyDraft((prev) => {
      const keepLocal = prev.api.llm.provider === "Local";
      const nextProvider = keepLocal
        ? prev.api.llm.provider
        : (normalized[0]?.provider as any ?? prev.api.llm.provider);
      return {
        ...prev,
        api: {
          ...prev.api,
          llm: {
            ...prev.api.llm,
            keys: normalized,
            activeKeyId: keepLocal ? prev.api.llm.activeKeyId : nextActive,
            provider: nextProvider,
            apiKey: keepLocal
              ? prev.api.llm.apiKey
              : normalized[0]?.apiKey ?? prev.api.llm.apiKey,
            baseUrl: keepLocal
              ? prev.api.llm.baseUrl
              : normalized[0]?.baseUrl ?? prev.api.llm.baseUrl,
            model: keepLocal
              ? prev.api.llm.model
              : normalized[0]?.model ?? prev.api.llm.model,
          },
        },
      };
    });
  };

  const whisperKeys = draft.api.whisper.keys ?? [];
  const llmKeys = draft.api.llm.keys ?? [];

  const handleAddWhisperKey = () => {
    updateWhisperKeys([
      ...whisperKeys,
      {
        id: createKeyId(),
        provider: "OpenAI Whisper API",
        apiKey: "",
        endpoint: "",
      },
    ]);
  };

  const handleUpdateWhisperKey = (index: number, patch: Partial<(typeof whisperKeys)[number]>) => {
    const next = whisperKeys.map((entry, idx) =>
      idx === index ? { ...entry, ...patch } : entry
    );
    updateWhisperKeys(next);
  };

  const handleRemoveWhisperKey = (index: number) => {
    const next = whisperKeys.filter((_, idx) => idx !== index);
    updateWhisperKeys(next);
  };

  const handleMoveWhisperKey = (from: number, to: number) => {
    if (to < 0 || to >= whisperKeys.length) return;
    updateWhisperKeys(moveItem(whisperKeys, from, to));
  };

  const handleAddLlmKey = () => {
    updateLlmKeys([
      ...llmKeys,
      {
        id: createKeyId(),
        provider: "OpenAI",
        apiKey: "",
        baseUrl: "",
        model: "",
      },
    ]);
  };

  const handleUpdateLlmKey = (index: number, patch: Partial<(typeof llmKeys)[number]>) => {
    const next = llmKeys.map((entry, idx) => (idx === index ? { ...entry, ...patch } : entry));
    updateLlmKeys(next);
  };

  const handleRemoveLlmKey = (index: number) => {
    const next = llmKeys.filter((_, idx) => idx !== index);
    updateLlmKeys(next);
  };

  const handleMoveLlmKey = (from: number, to: number) => {
    if (to < 0 || to >= llmKeys.length) return;
    updateLlmKeys(moveItem(llmKeys, from, to));
  };

  useEffect(() => {
    if (!open || !isTauriApp) return;
    if (step.id !== "summary") return;
    if (ffmpegStatus) return;
    void handleDetectFfmpeg();
  }, [ffmpegStatus, handleDetectFfmpeg, isTauriApp, open, step.id]);

  const renderStep = () => {
    const StatusBadge = ({ ok, labelOk, labelBad }: { ok: boolean; labelOk: string; labelBad: string }) => (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center gap-1",
          ok
            ? "border-emerald-200 bg-emerald-500/15 text-emerald-700"
            : "border-border text-muted-foreground"
        )}
      >
        {ok && <CheckCircle2 className="h-3 w-3" />}
        <span>{ok ? labelOk : labelBad}</span>
      </Badge>
    );

    switch (step.id) {
      case "ffmpeg":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t("setup.ffmpeg.description")}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                <span>{t("setup.ffmpeg.pathLabel")}</span>
                <div className="flex gap-2">
                  <Input
                    value={draft.ffmpegPath}
                    onChange={(event) =>
                      applyDraft((prev) => ({ ...prev, ffmpegPath: event.target.value }))
                    }
                    placeholder="/usr/local/bin/ffmpeg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleBrowseFile((value) =>
                      applyDraft((prev) => ({ ...prev, ffmpegPath: value }))
                    )}
                    disabled={!isTauriApp}
                  >
                    {t("setup.ffmpeg.browse")}
                  </Button>
                </div>
              </label>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {t("setup.ffmpeg.status")}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    ok={Boolean(ffmpegStatus?.found)}
                    labelOk={t("setup.ffmpeg.statusFound")}
                    labelBad={t("setup.ffmpeg.statusMissing")}
                  />
                  {ffmpegStatus?.path && (
                    <span className="text-xs text-muted-foreground">{ffmpegStatus.path}</span>
                  )}
                </div>
                {ffmpegStatus?.version && (
                  <div className="text-xs text-muted-foreground">
                    {t("setup.ffmpeg.version")}: {ffmpegStatus.version}
                  </div>
                )}
                {ffmpegStatus?.error && (
                  <div className="text-xs text-destructive">{ffmpegStatus.error}</div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDetectFfmpeg}
                disabled={!isTauriApp || ffmpegChecking}
              >
                {ffmpegChecking ? t("setup.ffmpeg.checking") : t("setup.ffmpeg.check")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestFfmpeg}
                disabled={!isTauriApp}
              >
                {t("setup.ffmpeg.test")}
              </Button>
            </div>
            <Separator />
            <div className="grid gap-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">{t("setup.ffmpeg.installTitle")}</div>
              <div>{t("setup.ffmpeg.installMac")}</div>
              <div>{t("setup.ffmpeg.installWin")}</div>
              <div>{t("setup.ffmpeg.installLinux")}</div>
            </div>
          </div>
        );
      case "remoteWhisper":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t("setup.remoteWhisper.placeholder")}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">{t("setup.apiKeys.description")}</div>
              <Button type="button" variant="secondary" onClick={handleAddWhisperKey}>
                <Plus className="h-4 w-4" />
                {t("setup.apiKeys.add")}
              </Button>
            </div>
            {whisperKeys.length === 0 && (
              <div className="text-xs text-muted-foreground">{t("setup.apiKeys.empty")}</div>
            )}
            <div className="grid gap-3">
              {whisperKeys.map((entry, index) => {
                const endpointNeeded = entry.provider === "Other";
                const apiKeyPresent = entry.apiKey.trim().length > 0;
                const endpointPresent = (entry.endpoint ?? "").trim().length > 0;
                return (
                  <div key={entry.id} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {t("setup.apiKeys.entry")} {index + 1}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="secondary">{t("setup.apiKeys.default")}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveWhisperKey(index, index - 1)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveWhisperKey(index, index + 1)}
                          disabled={index === whisperKeys.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveWhisperKey(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.remoteWhisper.provider")}</span>
                        <select
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={entry.provider}
                          onChange={(event) =>
                            handleUpdateWhisperKey(index, { provider: event.target.value })
                          }
                        >
                          <option value="OpenAI Whisper API">OpenAI Whisper API</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.remoteWhisper.apiKey")}</span>
                        <Input
                          type="password"
                          value={entry.apiKey}
                          placeholder={t("setup.apiKeys.apiKeyPlaceholder")}
                          onChange={(event) =>
                            handleUpdateWhisperKey(index, { apiKey: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    {endpointNeeded && (
                      <label className="mt-3 grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.remoteWhisper.endpoint")}</span>
                        <Input
                          value={entry.endpoint ?? ""}
                          placeholder={t("setup.apiKeys.endpointPlaceholder")}
                          onChange={(event) =>
                            handleUpdateWhisperKey(index, { endpoint: event.target.value })
                          }
                        />
                      </label>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t("setup.remoteWhisper.apiKey")}:
                      </span>
                      <StatusBadge
                        ok={apiKeyPresent}
                        labelOk={t("setup.status.configured")}
                        labelBad={t("setup.status.missing")}
                      />
                      {endpointNeeded && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            {t("setup.remoteWhisper.endpoint")}:
                          </span>
                          <StatusBadge
                            ok={endpointPresent}
                            labelOk={t("setup.status.configured")}
                            labelBad={t("setup.status.missing")}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "remoteLlm":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t("setup.remoteLlm.placeholder")}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">{t("setup.apiKeys.description")}</div>
              <Button type="button" variant="secondary" onClick={handleAddLlmKey}>
                <Plus className="h-4 w-4" />
                {t("setup.apiKeys.add")}
              </Button>
            </div>
            {llmKeys.length === 0 && (
              <div className="text-xs text-muted-foreground">{t("setup.apiKeys.empty")}</div>
            )}
            <div className="grid gap-3">
              {llmKeys.map((entry, index) => {
                const endpointNeeded = entry.provider !== "OpenAI";
                const apiKeyPresent = entry.apiKey.trim().length > 0;
                const endpointPresent = (entry.baseUrl ?? "").trim().length > 0;
                return (
                  <div key={entry.id} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {t("setup.apiKeys.entry")} {index + 1}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="secondary">{t("setup.apiKeys.default")}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveLlmKey(index, index - 1)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveLlmKey(index, index + 1)}
                          disabled={index === llmKeys.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLlmKey(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.remoteLlm.provider")}</span>
                        <select
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={entry.provider}
                          onChange={(event) =>
                            handleUpdateLlmKey(index, { provider: event.target.value })
                          }
                        >
                          <option value="OpenAI">OpenAI</option>
                          <option value="Gemini">Gemini</option>
                          <option value="Claude">Claude</option>
                          <option value="Grok">Grok</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.remoteLlm.apiKey")}</span>
                        <Input
                          type="password"
                          value={entry.apiKey}
                          placeholder={t("setup.apiKeys.apiKeyPlaceholder")}
                          onChange={(event) =>
                            handleUpdateLlmKey(index, { apiKey: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.remoteLlm.endpoint")}</span>
                        <Input
                          value={entry.baseUrl ?? ""}
                          placeholder={t("setup.apiKeys.baseUrlPlaceholder")}
                          onChange={(event) =>
                            handleUpdateLlmKey(index, { baseUrl: event.target.value })
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                        <span>{t("setup.apiKeys.model")}</span>
                        <Input
                          value={entry.model ?? ""}
                          placeholder={t("setup.apiKeys.modelPlaceholder")}
                          onChange={(event) =>
                            handleUpdateLlmKey(index, { model: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t("setup.remoteLlm.apiKey")}:
                      </span>
                      <StatusBadge
                        ok={apiKeyPresent}
                        labelOk={t("setup.status.configured")}
                        labelBad={t("setup.status.missing")}
                      />
                      {endpointNeeded && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            {t("setup.remoteLlm.endpoint")}:
                          </span>
                          <StatusBadge
                            ok={endpointPresent}
                            labelOk={t("setup.status.configured")}
                            labelBad={t("setup.status.missing")}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "localWhisper":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t("setup.localWhisper.placeholder")}</p>
            </div>
            <label className="grid gap-2 text-xs font-medium text-muted-foreground">
              <span>{t("setup.localWhisper.modelLabel")}</span>
              <div className="flex gap-2">
                <Input
                  value={draft.local.whisper.model}
                  onChange={(event) =>
                    applyDraft((prev) => ({
                      ...prev,
                      local: {
                        ...prev.local,
                        whisper: { ...prev.local.whisper, model: event.target.value },
                      },
                    }))
                  }
                  placeholder={t("setup.localWhisper.modelPlaceholder")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    handleBrowseFile((value) =>
                      applyDraft((prev) => ({
                        ...prev,
                        local: {
                          ...prev.local,
                          whisper: { ...prev.local.whisper, model: value },
                        },
                      }))
                    )
                  }
                  disabled={!isTauriApp}
                >
                  {t("setup.localWhisper.browse")}
                </Button>
              </div>
            </label>
            <label className="grid gap-2 text-xs font-medium text-muted-foreground">
              <span>{t("setup.localWhisper.binaryLabel")}</span>
              <div className="flex gap-2">
                <Input
                  value={draft.local.whisper.binaryPath}
                  onChange={(event) =>
                    applyDraft((prev) => ({
                      ...prev,
                      local: {
                        ...prev.local,
                        whisper: { ...prev.local.whisper, binaryPath: event.target.value },
                      },
                    }))
                  }
                  placeholder="/opt/homebrew/bin/whisper"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    handleBrowseFile((value) =>
                      applyDraft((prev) => ({
                        ...prev,
                        local: {
                          ...prev.local,
                          whisper: { ...prev.local.whisper, binaryPath: value },
                        },
                      }))
                    )
                  }
                  disabled={!isTauriApp}
                >
                  {t("setup.localWhisper.browse")}
                </Button>
              </div>
            </label>
            <div className="grid gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">
                {t("setup.localWhisper.downloadTitle")}
              </div>
              <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                <span>{t("setup.localWhisper.downloadModelLabel")}</span>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={whisperModelChoice}
                  onChange={(event) => setWhisperModelChoice(event.target.value)}
                >
                  {WHISPER_MODEL_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                  <option value="custom">{t("setup.localWhisper.customUrl")}</option>
                </select>
              </label>
              {whisperModelChoice === "custom" && (
                <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                  <span>{t("setup.localWhisper.customUrlLabel")}</span>
                  <Input
                    value={customWhisperUrl}
                    onChange={(event) => setCustomWhisperUrl(event.target.value)}
                    placeholder={t("setup.localWhisper.customUrlPlaceholder")}
                  />
                </label>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDownloadWhisperModel}
                  disabled={!isTauriApp || whisperDownloadBusy}
                >
                  {whisperDownloadBusy
                    ? t("setup.localWhisper.downloading")
                    : t("setup.localWhisper.download")}
                </Button>
                <span>{t("setup.localWhisper.downloadHint")}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDetectLocalWhisper}
                disabled={!isTauriApp || localWhisperChecking}
              >
                {localWhisperChecking ? t("setup.localWhisper.checking") : t("setup.localWhisper.check")}
              </Button>
              <StatusBadge
                ok={Boolean(localWhisperStatus?.found)}
                labelOk={t("setup.localWhisper.statusFound")}
                labelBad={t("setup.localWhisper.statusMissing")}
              />
              {localWhisperStatus?.path && (
                <span className="text-xs text-muted-foreground">{localWhisperStatus.path}</span>
              )}
              {localWhisperModelOk !== null && (
                <>
                  <span className="text-xs text-muted-foreground">
                    {t("setup.localWhisper.modelStatus")}
                  </span>
                  <StatusBadge
                    ok={localWhisperModelOk}
                    labelOk={t("setup.status.ok")}
                    labelBad={t("setup.status.missing")}
                  />
                </>
              )}
            </div>
            {localWhisperStatus?.error && (
              <div className="text-xs text-destructive">{localWhisperStatus.error}</div>
            )}
            {localWhisperModelError && (
              <div className="text-xs text-destructive">{localWhisperModelError}</div>
            )}
            <Separator />
            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">{t("setup.localWhisper.installTitle")}</div>
              <div>{t("setup.localWhisper.installMac")}</div>
              <div>{t("setup.localWhisper.installWin")}</div>
              <div>{t("setup.localWhisper.installLinux")}</div>
              <div>{t("setup.localWhisper.modelHint")}</div>
            </div>
          </div>
        );
      case "localLlm":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t("setup.localLlm.description")}</p>
            </div>
            <div className="rounded-lg border px-3 py-3 text-left text-sm">
              <div className="font-semibold">Ollama</div>
              <div className="text-xs text-muted-foreground">
                {t("setup.localLlm.ollamaHint")}
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                  <span>{t("setup.ollama.baseUrl")}</span>
                  <Input
                    value={draft.local.llm.ollamaBaseUrl}
                    onChange={(event) =>
                      applyDraft((prev) => ({
                        ...prev,
                        local: {
                          ...prev.local,
                          llm: { ...prev.local.llm, ollamaBaseUrl: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                  <span>{t("setup.ollama.model")}</span>
                  <Input
                    value={draft.local.llm.ollamaModel}
                    onChange={(event) =>
                      applyDraft((prev) => ({
                        ...prev,
                        local: {
                          ...prev.local,
                          llm: { ...prev.local.llm, ollamaModel: event.target.value },
                        },
                      }))
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDetectOllama}
                  disabled={!isTauriApp}
                >
                  {t("setup.ollama.detect")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOllamaServe}
                  disabled={!isTauriApp}
                >
                  {t("setup.ollama.serve")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOllamaPull}
                  disabled={!isTauriApp}
                >
                  {t("setup.ollama.pull")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOllamaTest}
                  disabled={!isTauriApp}
                >
                  {t("setup.ollama.test")}
                </Button>
              </div>
              {ollamaStatus && (
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div>
                    {t("setup.ollama.status.binary")}{" "}
                    <StatusBadge
                      ok={ollamaStatus.binaryFound}
                      labelOk={t("setup.status.ok")}
                      labelBad={t("setup.status.missing")}
                    />
                  </div>
                  <div>
                    {t("setup.ollama.status.server")}{" "}
                    <StatusBadge
                      ok={ollamaStatus.serverAvailable}
                      labelOk={t("setup.status.ok")}
                      labelBad={t("setup.status.missing")}
                    />
                  </div>
                  <div>
                    {t("setup.ollama.status.model")}{" "}
                    <StatusBadge
                      ok={ollamaStatus.modelAvailable}
                      labelOk={t("setup.status.ok")}
                      labelBad={t("setup.status.missing")}
                    />
                  </div>
                  {ollamaStatus.error && (
                    <div className="text-destructive">{ollamaStatus.error}</div>
                  )}
                </div>
              )}
              <Separator />
              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">{t("setup.ollama.installTitle")}</div>
                <div>{t("setup.ollama.installLink")}</div>
                <div>{t("setup.ollama.installMac")}</div>
                <div>{t("setup.ollama.installWin")}</div>
                <div>{t("setup.ollama.installLinux")}</div>
              </div>
            </div>
          </div>
        );
      case "summary":
        const ffmpegReady = Boolean(ffmpegStatus?.found || draft.ffmpegPath.trim());
        const localLlmReady = Boolean(draft.local.llm.available);
        const remoteWhisperReady =
          (draft.api.whisper.keys ?? []).some((entry) => entry.apiKey?.trim()) ||
          draft.api.whisper.apiKey.trim().length > 0;
        const remoteLlmReady =
          (draft.api.llm.keys ?? []).some((entry) => entry.apiKey?.trim()) ||
          draft.api.llm.apiKey.trim().length > 0;
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="text-base font-semibold text-foreground">
              {t("setup.summary.title")}
            </div>
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span>{t("setup.summary.ffmpeg")}:</span>
                <StatusBadge
                  ok={ffmpegReady}
                  labelOk={t("setup.status.configured")}
                  labelBad={t("setup.status.pending")}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>{t("setup.summary.localLlm")}:</span>
                <Badge variant="outline">Ollama</Badge>
                <StatusBadge
                  ok={localLlmReady}
                  labelOk={t("setup.status.configured")}
                  labelBad={t("setup.status.optional")}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>{t("setup.summary.remoteWhisper")}:</span>
                <StatusBadge
                  ok={remoteWhisperReady}
                  labelOk={t("setup.status.configured")}
                  labelBad={t("setup.status.pending")}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>{t("setup.summary.remoteLlm")}:</span>
                <StatusBadge
                  ok={remoteLlmReady}
                  labelOk={t("setup.status.configured")}
                  labelBad={t("setup.status.pending")}
                />
              </div>
            </div>
            <p>{t("setup.summary.note")}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("setup.title")}</DialogTitle>
          <DialogDescription>{t("setup.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="space-y-2">
            {steps.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
                  index === stepIndex
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                <span>{item.title}</span>
                {item.optional && (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {t("setup.optional")}
                  </Badge>
                )}
              </button>
            ))}
            {!isTauriApp && (
              <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                {t("setup.tauriOnly")}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-lg font-semibold">{step.title}</div>
              {step.optional && (
                <div className="text-xs text-muted-foreground">{t("setup.optional")}</div>
              )}
            </div>
            {renderStep()}
            <Separator />
            <div className="grid gap-4 md:grid-cols-[1fr_280px]">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  {t("setup.logs.title")}
                </div>
                <div className="h-44 overflow-y-auto rounded-md border border-border bg-muted/40 p-2 text-xs font-mono">
                  {logs.length ? (
                    logs.map((line, index) => (
                      <div key={`${line}-${index}`} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">{t("setup.logs.empty")}</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end justify-between gap-3">
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    {t("setup.close")}
                  </Button>
                  {stepIndex > 0 && (
                    <Button type="button" variant="secondary" onClick={handleBack}>
                      {t("setup.back")}
                    </Button>
                  )}
                  {!isLastStep && (
                    <Button type="button" onClick={handleNext}>
                      {t("setup.next")}
                    </Button>
                  )}
                  {isLastStep && (
                    <Button type="button" onClick={handleFinish}>
                      {t("setup.finish")}
                    </Button>
                  )}
                </div>
                {step.optional && !isLastStep && (
                  <Button type="button" variant="ghost" onClick={handleNext}>
                    {t("setup.skip")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
