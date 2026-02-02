"use client";

import { FileAudio, FileText, Mic, StopCircle } from "lucide-react";
import { useRef } from "react";

import { Mode, EnrichmentTemplate } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { useI18n, type Locale } from "@/lib/i18n";
import { getIconById } from "@/lib/icons";
import { Button } from "@/components/ui/button";

type RecorderPanelProps = {
  status: "idle" | "recording";
  mode: Mode;
  hotkey: string;
  templates: EnrichmentTemplate[];
  language: Locale;
  elapsedSeconds: number;
  level?: number;
  whisperProviders: { value: string; label: string }[];
  llmProviders: { value: string; label: string }[];
  selectedWhisperProvider: string;
  selectedLlmProvider: string;
  onWhisperProviderChange: (value: string) => void;
  onLlmProviderChange: (value: string) => void;
  onModeChange: (mode: Mode) => void;
  onStart: () => void | Promise<void>;
  onStop: () => void;
  onUpload: (file: File) => void | Promise<void>;
  onUploadTranscript: (file: File) => void | Promise<void>;
};

export function RecorderPanel({
  status,
  mode,
  hotkey,
  templates,
  language,
  elapsedSeconds,
  level = 0,
  whisperProviders,
  llmProviders,
  selectedWhisperProvider,
  selectedLlmProvider,
  onWhisperProviderChange,
  onLlmProviderChange,
  onModeChange,
  onStart,
  onStop,
  onUpload,
  onUploadTranscript,
}: RecorderPanelProps) {
  const isRecording = status === "recording";
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const transcriptInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useI18n(language);

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      <Button
        size="icon"
        className="h-24 w-24 rounded-full text-lg"
        onClick={() => (isRecording ? onStop() : void onStart())}
        aria-label={isRecording ? t("aria.stopRecording") : t("aria.startRecording")}
      >
        {isRecording ? <StopCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
      </Button>
      <div className="mt-6 text-lg font-semibold">
        {isRecording ? t("recorder.recording") : t("recorder.ready")}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        {isRecording
          ? t("recorder.live", { duration: formatDuration(elapsedSeconds) })
          : t("recorder.pressHotkey", { hotkey })}
      </div>
      {isRecording && (
        <div className="mt-6 flex w-full max-w-md items-end justify-center gap-2">
          {Array.from({ length: 12 }).map((_, index) => {
            const base = 8 + level * 40;
            const variance = 0.6 + ((index % 5) / 10);
            const height = Math.max(6, Math.min(48, base * variance));
            return (
              <div
                key={index}
                className="w-2 rounded-full bg-primary/70 transition-all duration-75"
                style={{ height }}
              />
            );
          })}
        </div>
      )}
      <div className="mt-8 w-full max-w-xl">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            <span>{t("recorder.whisperProvider")}</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedWhisperProvider}
              onChange={(event) => onWhisperProviderChange(event.target.value)}
              disabled={isRecording}
            >
              {whisperProviders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            <span>{t("recorder.llmProvider")}</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedLlmProvider}
              onChange={(event) => onLlmProviderChange(event.target.value)}
              disabled={isRecording}
            >
              {llmProviders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {templates.map((option) => {
          const Icon = getIconById(option.icon);
          return (
            <button
              key={option.id}
              onClick={() => onModeChange(option.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
                mode === option.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
              aria-pressed={mode === option.id}
              disabled={isRecording}
            >
              <Icon className="h-4 w-4" />
              {option.name}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
            event.currentTarget.value = "";
          }}
        />
        <input
          ref={transcriptInputRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUploadTranscript(file);
            }
            event.currentTarget.value = "";
          }}
        />
        <Button
          variant="secondary"
          onClick={() => audioInputRef.current?.click()}
          disabled={isRecording}
        >
          <FileAudio className="h-4 w-4" />
          {t("recorder.upload")}
        </Button>
        <Button
          variant="outline"
          onClick={() => transcriptInputRef.current?.click()}
          disabled={isRecording}
        >
          <FileText className="h-4 w-4" />
          {t("recorder.uploadTranscript")}
        </Button>
      </div>
    </div>
  );
}
