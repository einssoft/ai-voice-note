"use client";

import { Copy, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppStore } from "@/lib/store";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { useI18n, toIntlLocale } from "@/lib/i18n";
import { saveTextFile } from "@/lib/export";
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
  const { t } = useI18n(settings.general.language);
  const locale = toIntlLocale(settings.general.language);
  const templates = settings.enrichments;

  const whisperProviderOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const addOption = (value: string, label: string) => {
      if (!options.find((item) => item.value === value)) {
        options.push({ value, label });
      }
    };
    if (settings.local.whisper.installed || settings.api.whisper.provider === "Local") {
      addOption("Local", t("provider.local"));
    }
    (settings.api.whisper.keys ?? []).forEach((entry) => {
      if (entry.provider === "OpenAI Whisper API") {
        addOption(entry.provider, t("provider.whisperOpenAI"));
      } else if (entry.provider === "Other" || entry.provider === "Custom") {
        addOption(entry.provider, t("provider.whisperOther"));
      } else if (entry.provider) {
        addOption(entry.provider, entry.provider);
      }
    });
    if (!options.length) {
      addOption(settings.api.whisper.provider, settings.api.whisper.provider);
    }
    return options;
  }, [settings.api.whisper.keys, settings.api.whisper.provider, settings.local.whisper.installed, t]);

  const llmProviderOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const addOption = (value: string, label: string) => {
      if (!options.find((item) => item.value === value)) {
        options.push({ value, label });
      }
    };
    if (settings.local.llm.available || settings.api.llm.provider === "Local") {
      addOption("Local", t("provider.local"));
    }
    (settings.api.llm.keys ?? []).forEach((entry) => {
      if (entry.provider === "OpenAI") {
        addOption(entry.provider, t("provider.openai"));
      } else if (entry.provider === "Gemini") {
        addOption(entry.provider, t("provider.gemini"));
      } else if (entry.provider === "Claude") {
        addOption(entry.provider, t("provider.claude"));
      } else if (entry.provider === "Grok") {
        addOption(entry.provider, t("provider.grok"));
      } else if (entry.provider === "OpenRouter") {
        addOption(entry.provider, t("provider.openrouter"));
      } else if (entry.provider === "Custom") {
        addOption(entry.provider, t("provider.custom"));
      } else if (entry.provider) {
        addOption(entry.provider, entry.provider);
      }
    });
    if (!options.length) {
      addOption(settings.api.llm.provider, settings.api.llm.provider);
    }
    return options;
  }, [settings.api.llm.keys, settings.api.llm.provider, settings.local.llm.available, t]);

  const handleWhisperProviderChange = (provider: string) => {
    const keys = settings.api.whisper.keys ?? [];
    const nextKey = keys.find((entry) => entry.provider === provider);
    void actions.updateSettings({
      ...settings,
      api: {
        ...settings.api,
        whisper: {
          ...settings.api.whisper,
          provider: provider as any,
          activeKeyId: nextKey?.id,
          apiKey: nextKey?.apiKey ?? settings.api.whisper.apiKey,
          endpoint: nextKey?.endpoint ?? settings.api.whisper.endpoint,
        },
      },
    });
  };

  const handleLlmProviderChange = (provider: string) => {
    const keys = settings.api.llm.keys ?? [];
    const nextKey = keys.find((entry) => entry.provider === provider);
    void actions.updateSettings({
      ...settings,
      api: {
        ...settings.api,
        llm: {
          ...settings.api.llm,
          provider: provider as any,
          activeKeyId: nextKey?.id,
          apiKey: nextKey?.apiKey ?? settings.api.llm.apiKey,
          baseUrl: nextKey?.baseUrl ?? settings.api.llm.baseUrl,
          model: nextKey?.model ?? settings.api.llm.model,
        },
      },
    });
  };

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
        whisperProviders={whisperProviderOptions}
        llmProviders={llmProviderOptions}
        selectedWhisperProvider={settings.api.whisper.provider}
        selectedLlmProvider={settings.api.llm.provider}
        onWhisperProviderChange={handleWhisperProviderChange}
        onLlmProviderChange={handleLlmProviderChange}
        onModeChange={actions.setMode}
        onStart={actions.startRecording}
        onStop={actions.stopRecording}
        onUpload={actions.uploadAudio}
        onUploadTranscript={actions.uploadTranscript}
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
        whisperProviders={whisperProviderOptions}
        llmProviders={llmProviderOptions}
        selectedWhisperProvider={settings.api.whisper.provider}
        selectedLlmProvider={settings.api.llm.provider}
        onWhisperProviderChange={handleWhisperProviderChange}
        onLlmProviderChange={handleLlmProviderChange}
        onModeChange={actions.setMode}
        onStart={actions.startRecording}
        onStop={actions.stopRecording}
        onUpload={actions.uploadAudio}
        onUploadTranscript={actions.uploadTranscript}
      />
    );
  }

  const modeLabel = templates.find((option) => option.id === activeSession.mode)?.name ?? activeSession.mode;

  const modeLabelForFile = (modeLabel || "enrichment").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_$/, "");

  const getFullContent = () => {
    const metadata = activeSession.metadata;
    const sections = [
      `# ${titleValue || t("common.untitled")}`,
      "",
      `**${t("metadata.created")}:** ${formatDateTime(activeSession.createdAt, locale)}  `,
      `**${t("metadata.duration")}:** ${formatDuration(metadata.durationSec)}  `,
      `**${t("metadata.mode")}:** ${modeLabel}  `,
      `**${t("metadata.whisper")}:** ${metadata.whisperProvider}  `,
      `**${t("metadata.llm")}:** ${metadata.llmProvider}  `,
      `**${t("metadata.keywords")}:** ${metadata.keywords.join(", ") || "-"}  `,
      "",
      "---",
      "",
    ];

    if (activeSession.enriched) {
      sections.push(`## ${t("tabs.enriched")}`, "", activeSession.enriched, "", "---", "");
    }

    if (activeSession.transcript) {
      sections.push(`## ${t("tabs.transcript")}`, "", activeSession.transcript);
    }

    return sections.join("\n");
  };

  const getActiveTabContent = () => {
    if (activeTab === "metadata") {
      return getFullContent();
    }
    if (activeTab === "transcript") {
      return activeSession.transcript;
    }
    // enriched tab
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
                const tabLabel = activeTab === "enriched" ? t("tabs.enriched") : activeTab === "transcript" ? t("tabs.transcript") : t("tabs.metadata");
                try {
                  await navigator.clipboard.writeText(getActiveTabContent());
                  actions.showStatus(t("feedback.copiedWhat", { what: tabLabel }));
                } catch {
                  actions.showStatus(t("feedback.copyFailed"), "error");
                }
              }}
            >
              <Copy className="h-4 w-4" />
              {t("buttons.copy")}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const baseName = titleValue || t("file.defaultName");
                const prefix = activeTab === "enriched" ? `${modeLabelForFile}_` : activeTab === "transcript" ? "transkript_" : "";
                const name = `${prefix}${baseName}.md`;
                const tabLabel = activeTab === "enriched" ? t("tabs.enriched") : activeTab === "transcript" ? t("tabs.transcript") : t("tabs.metadata");
                const result = await saveTextFile(getActiveTabContent(), name);
                if (result.ok) {
                  actions.showStatus(t("feedback.savedWhat", { what: tabLabel }));
                } else if (!result.canceled) {
                  actions.showStatus(t("feedback.saveFailed"), "error");
                }
              }}
            >
              {t("buttons.save")}
            </Button>
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
