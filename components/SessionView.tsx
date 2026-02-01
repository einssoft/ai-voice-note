"use client";

import { Copy, FileText, FolderOpen, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppStore } from "@/lib/store";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { useI18n, toIntlLocale } from "@/lib/i18n";
import { saveTextFile, openAppFolder } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RecorderPanel } from "@/components/RecorderPanel";
import { AudioPreview } from "@/components/AudioPreview";
import { DateTimeText } from "@/components/DateTimeText";

function Stepper({
  status,
  stage,
  labels,
}: {
  status: string;
  stage?: string;
  labels: { recording: string; transcribing: string; enriching: string };
}) {
  const steps = [
    { id: "recording", label: labels.recording },
    { id: "transcribing", label: labels.transcribing },
    { id: "enriching", label: labels.enriching },
  ];

  const resolveState = (stepId: string) => {
    if (status === "recording") {
      return stepId === "recording" ? "active" : "pending";
    }
    if (status === "processing") {
      if (stage === "transcribing") {
        return stepId === "recording" ? "done" : stepId === "transcribing" ? "active" : "pending";
      }
      if (stage === "enriching") {
        return stepId === "enriching" ? "active" : "done";
      }
    }
    if (status === "done") {
      return "done";
    }
    return "pending";
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((step, index) => {
        const state = resolveState(step.id);
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                state === "done"
                  ? "bg-primary text-primary-foreground"
                  : state === "active"
                  ? "border border-primary text-primary"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className={state === "pending" ? "text-xs text-muted-foreground" : "text-xs"}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SessionView() {
  const {
    state: { sessions, activeSessionId, mode, settings, recordingLevel },
    actions,
  } = useAppStore();

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? null;
  const [titleValue, setTitleValue] = useState(activeSession?.title ?? "");
  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("enriched");
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );
  const [lastSavePath, setLastSavePath] = useState<string | null>(null);
  const { t } = useI18n(settings.general.language);
  const locale = toIntlLocale(settings.general.language);
  const templates = settings.enrichments;

  useEffect(() => {
    setTitleValue(activeSession?.title ?? "");
  }, [activeSession?.id, activeSession?.title]);

  useEffect(() => {
    setActiveTab("enriched");
  }, [activeSession?.id]);

  useEffect(() => {
    if (activeSession?.status !== "recording") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeSession?.status]);

  const elapsedSeconds = useMemo(() => {
    if (!activeSession?.recordingStartedAt) return 0;
    return Math.max(0, Math.floor((now - activeSession.recordingStartedAt) / 1000));
  }, [activeSession?.recordingStartedAt, now]);

  if (!activeSession || activeSession.status === "idle") {
    return (
      <RecorderPanel
        status="idle"
        mode={mode}
        hotkey={settings.general.hotkey}
        templates={templates}
        language={settings.general.language}
        elapsedSeconds={0}
        level={0}
        onModeChange={actions.setMode}
        onStart={actions.startRecording}
        onStop={actions.stopRecording}
        onUpload={actions.uploadAudio}
      />
    );
  }

  if (activeSession.status === "recording") {
    return (
      <RecorderPanel
        status="recording"
        mode={mode}
        hotkey={settings.general.hotkey}
        templates={templates}
        language={settings.general.language}
        elapsedSeconds={elapsedSeconds}
        level={recordingLevel}
        onModeChange={actions.setMode}
        onStart={actions.startRecording}
        onStop={actions.stopRecording}
        onUpload={actions.uploadAudio}
      />
    );
  }

  const modeLabel = templates.find((option) => option.id === activeSession.mode)?.name ?? activeSession.mode;

  const showFeedback = (message: string, tone: "success" | "error" = "success") => {
    setFeedback({ message, tone });
    window.setTimeout(() => setFeedback(null), 2000);
  };

  const getTabContent = (tab: string) => {
    if (tab === "transcript") return activeSession.transcript;
    if (tab === "metadata") {
      const metadata = activeSession.metadata;
      return [
        `${t("metadata.created")}: ${formatDateTime(activeSession.createdAt, locale)}`,
        `${t("metadata.duration")}: ${formatDuration(metadata.durationSec)}`,
        `${t("metadata.mode")}: ${modeLabel}`,
        `${t("metadata.whisper")}: ${metadata.whisperProvider}`,
        `${t("metadata.llm")}: ${metadata.llmProvider}`,
        `${t("metadata.keywords")}: ${metadata.keywords.join(", ") || "-"}`,
      ].join("\n");
    }
    return activeSession.enriched;
  };

  const getTabMarkdown = (tab: string) => {
    if (tab === "metadata") {
      const metadata = activeSession.metadata;
      return [
        `# ${titleValue || t("common.untitled")}`,
        "",
        `- ${t("metadata.created")}: ${formatDateTime(activeSession.createdAt, locale)}`,
        `- ${t("metadata.duration")}: ${formatDuration(metadata.durationSec)}`,
        `- ${t("metadata.mode")}: ${modeLabel}`,
        `- ${t("metadata.whisper")}: ${metadata.whisperProvider}`,
        `- ${t("metadata.llm")}: ${metadata.llmProvider}`,
        `- ${t("metadata.keywords")}: ${metadata.keywords.join(", ") || "-"}`,
      ].join("\n");
    }
    if (tab === "transcript") {
      return `# ${t("tabs.transcript")}\n\n${activeSession.transcript}`;
    }
    return activeSession.enriched;
  };

  if (activeSession.status === "processing") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{t("processing.title")}</div>
            <div className="text-xs text-muted-foreground">{t("processing.subtitle")}</div>
          </div>
          <Badge variant="outline">{modeLabel}</Badge>
        </div>
        <Stepper
          status={activeSession.status}
          stage={activeSession.stage}
          labels={{
            recording: t("steps.recording"),
            transcribing: t("steps.transcribing"),
            enriching: t("steps.enriching"),
          }}
        />
        <div className="grid gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-28" />
          <Skeleton className="h-16" />
        </div>
        {activeSession.audioUrl && (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
            <div className="text-xs font-medium text-muted-foreground">
              {t("processing.audioPreview")}
            </div>
            <div className="mt-2">
              <AudioPreview
                src={activeSession.audioUrl}
                mime={activeSession.audioMime}
                fallbackDurationSec={activeSession.metadata.durationSec}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSession.status === "error") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-8 py-10">
        <Alert>
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription>
            {activeSession.errorMessage ??
              t("error.fallback")}
          </AlertDescription>
          {activeSession.errorDetails && (
            <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">{t("error.details")}</div>
              <div className="mt-1 whitespace-pre-wrap">{activeSession.errorDetails}</div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={actions.retryProcessing}>
              <RefreshCcw className="h-4 w-4" />
              {t("error.retry")}
            </Button>
            <Button variant="ghost">{t("error.report")}</Button>
          </div>
        </Alert>
      </div>
    );
  }

  const metadata = activeSession.metadata;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-10 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Input
            value={titleValue}
            onChange={(event) => setTitleValue(event.target.value)}
            onBlur={() => actions.updateSessionTitle(activeSession.id, titleValue)}
            className="h-12 text-lg font-semibold"
            placeholder={t("common.untitled")}
            aria-label={t("aria.sessionTitle")}
          />
          <div className="mt-2 text-xs text-muted-foreground">
            <DateTimeText value={activeSession.createdAt} locale={locale} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{modeLabel}</Badge>
          <Badge variant="secondary">{metadata.llmProvider}</Badge>
        </div>
      </div>
      <Stepper
        status={activeSession.status}
        stage={activeSession.stage}
        labels={{
          recording: t("steps.recording"),
          transcribing: t("steps.transcribing"),
          enriching: t("steps.enriching"),
        }}
      />
      <Separator />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="enriched">{t("tabs.enriched")}</TabsTrigger>
            <TabsTrigger value="transcript">{t("tabs.transcript")}</TabsTrigger>
            <TabsTrigger value="metadata">{t("tabs.metadata")}</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(getTabContent(activeTab));
                  showFeedback(t("feedback.copied"), "success");
                } catch {
                  showFeedback(t("feedback.copyFailed"), "error");
                }
              }}
            >
              <Copy className="h-4 w-4" />
              {t("buttons.copy")}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(getTabMarkdown(activeTab));
                  showFeedback(t("feedback.copiedMarkdown"), "success");
                } catch {
                  showFeedback(t("feedback.copyFailed"), "error");
                }
              }}
            >
              <FileText className="h-4 w-4" />
              {t("buttons.copyMarkdown")}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const name = `${titleValue || t("file.defaultName")}-${activeTab}.md`;
                const result = await saveTextFile(getTabMarkdown(activeTab), name);
                if (result.ok) {
                  if (result.path) setLastSavePath(result.path);
                  showFeedback(t("feedback.saved"), "success");
                } else if (!result.canceled) {
                  showFeedback(t("feedback.saveFailed"), "error");
                }
              }}
            >
              {t("buttons.save")}
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                const result = await openAppFolder(lastSavePath ?? undefined);
                if (!result.ok) {
                  showFeedback(t("feedback.openFolderFailed"), "error");
                }
              }}
            >
              <FolderOpen className="h-4 w-4" />
              {t("buttons.openFolder")}
            </Button>
            {feedback && (
              <span
                className={`text-xs ${
                  feedback.tone === "success" ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>
        </div>
        <TabsContent value="enriched">
          <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed shadow-soft">
            <div className="whitespace-pre-wrap">{activeSession.enriched}</div>
          </div>
        </TabsContent>
        <TabsContent value="transcript">
          <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground shadow-soft">
            <div className="whitespace-pre-wrap">{activeSession.transcript}</div>
          </div>
        </TabsContent>
        <TabsContent value="metadata">
          <div className="rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("metadata.created")}</span>
                <span>
                  <DateTimeText value={activeSession.createdAt} locale={locale} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("metadata.duration")}</span>
                <span>{formatDuration(metadata.durationSec)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("metadata.mode")}</span>
                <span>{modeLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("metadata.whisper")}</span>
                <span>{metadata.whisperProvider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("metadata.llm")}</span>
                <span>{metadata.llmProvider}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">{t("metadata.keywords")}</span>
                <div className="flex flex-wrap justify-end gap-1">
                  {metadata.keywords.length ? (
                    metadata.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">{t("metadata.audio")}</span>
                {activeSession.audioUrl ? (
                  <AudioPreview
                    src={activeSession.audioUrl}
                    mime={activeSession.audioMime}
                    fallbackDurationSec={metadata.durationSec}
                  />
                ) : (
                  <span className="text-muted-foreground">{t("metadata.noAudio")}</span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
