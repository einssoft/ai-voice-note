"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Mic, Moon, Settings, Sun } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

import { useAppStore } from "@/lib/store";
import { cn, isEditableTarget, matchesHotkey } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { SessionView } from "@/components/SessionView";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SetupWizard } from "@/components/SetupWizard";

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

function getBinaryName(value?: string) {
  if (!value) return "";
  const segments = value.split(/[/\\]/);
  return segments[segments.length - 1]?.toLowerCase() ?? "";
}

function isWhisperCli(value?: string) {
  return getBinaryName(value) === "whisper";
}

function pickKeyByProvider<T extends { id: string; provider: string }>(
  keys: T[] | undefined,
  provider: string,
  activeId?: string
) {
  if (!keys || keys.length === 0) return null;
  if (activeId) {
    const selected = keys.find((entry) => entry.id === activeId);
    if (selected && selected.provider === provider) return selected;
  }
  const byProvider = keys.find((entry) => entry.provider === provider);
  return byProvider ?? keys[0] ?? null;
}

export function AppShell() {
  const {
    state: { settings, sessions, activeSessionId, settingsSource },
    actions: { toggleTheme, startRecording, stopRecording, cancelProcessing, updateSettings },
  } = useAppStore();

  const SIDEBAR_MIN = 240;
  const SIDEBAR_MAX = 420;
  const SIDEBAR_DEFAULT = 300;
  const SIDEBAR_STORAGE_KEY = "ai-voice-note:sidebar-width";

  const clampWidth = useCallback(
    (value: number) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, value)),
    [SIDEBAR_MAX, SIDEBAR_MIN]
  );

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isResizing, setIsResizing] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");
  const widthRef = useRef(sidebarWidth);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const bodyCursorRef = useRef<string>("");
  const bodySelectRef = useRef<string>("");
  const setupAutoOpened = useRef(false);
  const startupChecksDone = useRef(false);
  const isTauriApp =
    typeof window !== "undefined" &&
    ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);

  const isDark = settings.general.theme === "dark";
  const { t } = useI18n(settings.general.language);
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const isRecording = activeSession?.status === "recording";
  const isProcessing = sessions.some((session) => session.status === "processing");

  const whisperKey = useMemo(
    () =>
      pickKeyByProvider(
        settings.api.whisper.keys,
        settings.api.whisper.provider,
        settings.api.whisper.activeKeyId
      ),
    [settings.api.whisper.activeKeyId, settings.api.whisper.keys, settings.api.whisper.provider]
  );
  const llmKey = useMemo(
    () =>
      pickKeyByProvider(
        settings.api.llm.keys,
        settings.api.llm.provider,
        settings.api.llm.activeKeyId
      ),
    [settings.api.llm.activeKeyId, settings.api.llm.keys, settings.api.llm.provider]
  );

  const localWhisperOk = settings.local.whisper.installed;
  const localLlmOk = settings.local.llm.available;
  const defaultWhisperOk = settings.api.whisper.provider === "Local"
    ? localWhisperOk
    : Boolean((whisperKey?.apiKey ?? settings.api.whisper.apiKey ?? "").trim()) &&
      (settings.api.whisper.provider !== "Other" ||
        Boolean((whisperKey?.endpoint ?? settings.api.whisper.endpoint ?? "").trim()));
  const defaultLlmOk = settings.api.llm.provider === "Local"
    ? localLlmOk
    : Boolean((llmKey?.apiKey ?? settings.api.llm.apiKey ?? "").trim()) &&
      (settings.api.llm.provider === "OpenAI" ||
        Boolean((llmKey?.baseUrl ?? settings.api.llm.baseUrl ?? "").trim()));

  const updateSidebarWidth = useCallback(
    (value: number) => {
      const next = clampWidth(value);
      widthRef.current = next;
      setSidebarWidth(next);
      return next;
    },
    [clampWidth]
  );

  const persistSidebarWidth = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(widthRef.current));
  }, [SIDEBAR_STORAGE_KEY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!stored) return;
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      updateSidebarWidth(parsed);
    }
  }, [SIDEBAR_STORAGE_KEY, updateSidebarWidth]);

  useEffect(() => {
    if (setupAutoOpened.current) return;
    if (!isTauriApp) return;
    if (settingsSource === "default") return;
    if (settings.general.setupCompleted) return;
    setupAutoOpened.current = true;
    setSetupOpen(true);
  }, [isTauriApp, settings.general.setupCompleted, settingsSource]);

  useEffect(() => {
    if (startupChecksDone.current) return;
    if (!isTauriApp) return;
    if (settingsSource === "default") return;
    startupChecksDone.current = true;

    const runChecks = async () => {
      let whisperInstalled = false;
      let localLlmAvailable = settings.local.llm.available;
      let whisperBinaryPath: string | undefined;

      try {
        if (settings.local.whisper.binaryPath?.trim()) {
          const result = await invoke<CommandDetection>("detect_command", {
            name: settings.local.whisper.binaryPath.trim(),
          });
          if (result.found) {
            whisperInstalled = true;
            whisperBinaryPath = result.path ?? settings.local.whisper.binaryPath.trim();
          }
        }
        if (!whisperInstalled) {
          const candidates = ["whisper", "whisper.cpp", "whisper-cpp", "whisper-cli"];
          for (const name of candidates) {
            const result = await invoke<CommandDetection>("detect_command", { name });
            if (result.found) {
              whisperInstalled = true;
              whisperBinaryPath = result.path ?? name;
              break;
            }
          }
        }
      } catch {
        whisperInstalled = false;
      }

      if (whisperInstalled && !isWhisperCli(whisperBinaryPath)) {
        const modelPath = settings.local.whisper.model?.trim();
        if (!modelPath) {
          whisperInstalled = false;
        } else {
          try {
            const { exists } = await import("@tauri-apps/plugin-fs");
            const modelExists = await exists(modelPath);
            whisperInstalled = modelExists;
          } catch {
            whisperInstalled = false;
          }
        }
      }

      localLlmAvailable = false;
      try {
        const status = await invoke<OllamaStatus>("detect_ollama", {
          baseUrl: settings.local.llm.ollamaBaseUrl,
          model: settings.local.llm.ollamaModel,
        });
        localLlmAvailable = status.serverAvailable && status.modelAvailable;
      } catch {
        localLlmAvailable = false;
      }

      if (
        whisperInstalled !== settings.local.whisper.installed ||
        localLlmAvailable !== settings.local.llm.available
      ) {
        await updateSettings({
          ...settings,
          local: {
            ...settings.local,
            whisper: { ...settings.local.whisper, installed: whisperInstalled },
            llm: { ...settings.local.llm, available: localLlmAvailable },
          },
        });
      }
    };

    void runChecks();
  }, [isTauriApp, settings, settingsSource, updateSettings]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      dragState.current = { startX: event.clientX, startWidth: widthRef.current };
      setIsResizing(true);
      bodyCursorRef.current = document.body.style.cursor;
      bodySelectRef.current = document.body.style.userSelect;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!dragState.current) return;
        const delta = moveEvent.clientX - dragState.current.startX;
        updateSidebarWidth(dragState.current.startWidth + delta);
      };

      const finishResize = () => {
        dragState.current = null;
        setIsResizing(false);
        document.body.style.cursor = bodyCursorRef.current;
        document.body.style.userSelect = bodySelectRef.current;
        persistSidebarWidth();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", finishResize);
        window.removeEventListener("pointercancel", finishResize);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", finishResize);
      window.addEventListener("pointercancel", finishResize);
    },
    [persistSidebarWidth, updateSidebarWidth]
  );

  const handleKeyResize = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        updateSidebarWidth(widthRef.current - 12);
        persistSidebarWidth();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        updateSidebarWidth(widthRef.current + 12);
        persistSidebarWidth();
      }
      if (event.key === "Home") {
        event.preventDefault();
        updateSidebarWidth(SIDEBAR_MIN);
        persistSidebarWidth();
      }
      if (event.key === "End") {
        event.preventDefault();
        updateSidebarWidth(SIDEBAR_MAX);
        persistSidebarWidth();
      }
    },
    [SIDEBAR_MAX, SIDEBAR_MIN, persistSidebarWidth, updateSidebarWidth]
  );

  const handleResetSidebar = useCallback(() => {
    updateSidebarWidth(SIDEBAR_DEFAULT);
    persistSidebarWidth();
  }, [SIDEBAR_DEFAULT, persistSidebarWidth, updateSidebarWidth]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (isProcessing) return;
      if (!matchesHotkey(event, settings.general.hotkey)) return;
      event.preventDefault();
      if (isRecording) {
        stopRecording();
      } else {
        void startRecording();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isProcessing, isRecording, settings.general.hotkey, startRecording, stopRecording]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!isProcessing) return;
      if (isEditableTarget(event.target)) return;
      if (!matchesHotkey(event, settings.general.cancelHotkey)) return;
      event.preventDefault();
      cancelProcessing();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cancelProcessing, isProcessing, settings.general.cancelHotkey]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isProcessing) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = "wait";
    return () => {
      document.body.style.cursor = prev;
    };
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing || typeof document === "undefined") return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  }, [isProcessing]);

  const statusItems = useMemo(
    () => [
      { key: "localWhisper", label: t("statusbar.localWhisper"), ok: localWhisperOk },
      { key: "localLlm", label: t("statusbar.localLlm"), ok: localLlmOk },
      { key: "defaultWhisper", label: t("statusbar.defaultWhisper"), ok: defaultWhisperOk },
      { key: "defaultLlm", label: t("statusbar.defaultLlm"), ok: defaultLlmOk },
    ],
    [defaultLlmOk, defaultWhisperOk, localLlmOk, localWhisperOk, t]
  );

  const handleStatusClick = (key: string) => {
    if (key === "localWhisper" || key === "defaultWhisper") {
      setSettingsTab("api");
      setSettingsOpen(true);
    } else if (key === "localLlm" || key === "defaultLlm") {
      setSettingsTab("api");
      setSettingsOpen(true);
    }
  };

  const StatusBadge = ({ ok, label, statusKey }: { ok: boolean; label: string; statusKey: string }) => (
    <button
      type="button"
      onClick={() => handleStatusClick(statusKey)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition-colors hover:bg-muted",
        ok ? "border-emerald-200 bg-emerald-500/15 text-emerald-700" : "border-border text-muted-foreground"
      )}
    >
      {ok && <CheckCircle2 className="h-3 w-3" />}
      <span>
        {label}: {ok ? t("setup.status.ok") : t("setup.status.missing")}
      </span>
    </button>
  );

  return (
    <TooltipProvider>
      <div className="relative h-screen bg-background text-foreground">
        <div
          className={cn(
            "flex h-screen flex-col",
            isProcessing && "pointer-events-none select-none"
          )}
        >
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mic className="h-4 w-4" />
            </span>
            <span>{t("app.title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  disabled={isProcessing}
                  aria-label={t("aria.toggleTheme")}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("app.theme")}</TooltipContent>
            </Tooltip>
            <SettingsDialog
              onOpenSetupWizard={() => setSetupOpen(true)}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              initialTab={settingsTab}
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("app.settings")}
                disabled={isProcessing}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </SettingsDialog>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div
            className="relative flex h-full flex-none overflow-hidden border-r border-border"
            style={{ width: sidebarWidth }}
          >
            <Sidebar />
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={t("aria.resizeSidebar")}
            aria-valuemin={SIDEBAR_MIN}
            aria-valuemax={SIDEBAR_MAX}
            aria-valuenow={Math.round(sidebarWidth)}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onDoubleClick={handleResetSidebar}
            onKeyDown={handleKeyResize}
            className={cn(
              "group relative z-10 flex w-2 cursor-col-resize items-center justify-center bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isResizing && "bg-accent/20"
            )}
          >
            <div className="h-full w-px bg-border transition-colors group-hover:bg-foreground/30" />
          </div>
          <main className="flex-1 overflow-y-auto bg-background">
            <SessionView />
          </main>
        </div>
        <div className="border-t border-border bg-muted/20 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {statusItems.map((item) => (
              <StatusBadge key={item.key} ok={item.ok} label={item.label} statusKey={item.key} />
            ))}
          </div>
        </div>
      </div>
        {isProcessing && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
              <div>
                <div className="text-sm font-semibold">{t("processing.overlayTitle")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("processing.overlayHint", { hotkey: settings.general.cancelHotkey })}
                </div>
              </div>
            </div>
          </div>
        )}
        <SetupWizard open={setupOpen} onOpenChange={setSetupOpen} />
      </div>
    </TooltipProvider>
  );
}
