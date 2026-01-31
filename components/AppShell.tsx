"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Moon, Settings, Sun } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { cn, isEditableTarget, matchesHotkey } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { SessionView } from "@/components/SessionView";
import { SettingsDialog } from "@/components/SettingsDialog";

export function AppShell() {
  const {
    state: { settings, sessions, activeSessionId },
    actions: { toggleTheme, startRecording, stopRecording },
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
  const widthRef = useRef(sidebarWidth);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const bodyCursorRef = useRef<string>("");
  const bodySelectRef = useRef<string>("");

  const isDark = settings.general.theme === "dark";
  const { t } = useI18n(settings.general.language);
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const isRecording = activeSession?.status === "recording";

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
  }, [isRecording, settings.general.hotkey, startRecording, stopRecording]);

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
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
                  aria-label={t("aria.toggleTheme")}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("app.theme")}</TooltipContent>
            </Tooltip>
            <SettingsDialog>
              <Button variant="ghost" size="icon" aria-label={t("app.settings")}>
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
      </div>
    </TooltipProvider>
  );
}
