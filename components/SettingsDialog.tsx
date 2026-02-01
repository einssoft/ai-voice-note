"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, RotateCcw, ChevronDown } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { supportedLocales, useI18n } from "@/lib/i18n";
import { iconOptions, getIconById } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getDefaultEnrichments, getDefaultKeywordsPrompt } from "@/lib/mock";

const llmModels: Record<string, string[]> = {
  Local: ["Local Default", "Local Small", "Local Large"],
  OpenAI: ["gpt-4o-mini", "gpt-4o", "gpt-4.1"],
  Gemini: ["gemini-1.5-flash", "gemini-1.5-pro"],
  Claude: ["claude-3.5-sonnet", "claude-3-opus"],
  Grok: ["grok-2-mini", "grok-2"],
};

const whisperProviders = ["Local", "OpenAI Whisper API", "Other"] as const;
const llmProviders = ["Local", "OpenAI", "Gemini", "Claude", "Grok"] as const;
const languages = ["Auto", "de", "en", "fr", "it"] as const;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tmpl-${Math.random().toString(36).slice(2, 10)}`;
};

type SettingsDialogProps = {
  children: ReactNode;
};

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const {
    state: { settings, settingsSource },
    actions: { updateSettings },
  } = useAppStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(settings);
  const [focusEnrichmentId, setFocusEnrichmentId] = useState<string | null>(null);
  const enrichmentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { t } = useI18n(draft.general.language);

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setExpandedIds(new Set(settings.enrichments.map((item) => item.id)));
    }
  }, [open, settings]);

  const modelOptions = useMemo(
    () => llmModels[draft.api.llm.provider] ?? llmModels.Local,
    [draft.api.llm.provider]
  );

  const handleOfflineToggle = (value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, offline: value },
      api: {
        ...prev.api,
        whisper: { ...prev.api.whisper, provider: value ? "Local" : prev.api.whisper.provider },
        llm: { ...prev.api.llm, provider: value ? "Local" : prev.api.llm.provider },
      },
    }));
  };

  const handleAddEnrichment = () => {
    const id = createId();
    setDraft((prev) => ({
      ...prev,
      enrichments: [
        ...prev.enrichments,
        {
          id,
          name: t("settings.enrichments.newName"),
          icon: "Sparkles",
          prompt: "",
        },
      ],
    }));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setFocusEnrichmentId(id);
  };

  const handleDeleteEnrichment = (id: string) => {
    setDraft((prev) => {
      const next = prev.enrichments.filter((item) => item.id !== id);
      if (!next.length) return prev;
      return { ...prev, enrichments: next };
    });
  };

  const handleResetEnrichments = () => {
    setDraft((prev) => ({
      ...prev,
      enrichments: getDefaultEnrichments(prev.general.language),
    }));
  };

  useEffect(() => {
    if (!focusEnrichmentId) return;
    const input = enrichmentInputRefs.current[focusEnrichmentId];
    if (input) {
      input.focus();
      input.scrollIntoView({ block: "center", behavior: "smooth" });
      setFocusEnrichmentId(null);
    }
  }, [focusEnrichmentId, draft.enrichments]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby="settings-description" className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle>{t("settings.title")}</DialogTitle>
            <Badge variant="outline">
              {t("settings.source.label")}:{" "}
              {settingsSource === "tauri"
                ? t("settings.source.tauri")
                : settingsSource === "api"
                ? t("settings.source.api")
                : settingsSource === "local"
                ? t("settings.source.local")
                : t("settings.source.default")}
            </Badge>
          </div>
          <DialogDescription id="settings-description">
            {t("settings.description")}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="general">{t("settings.tabs.general")}</TabsTrigger>
            <TabsTrigger value="api">{t("settings.tabs.api")}</TabsTrigger>
            <TabsTrigger value="enrichments">{t("settings.tabs.enrichments")}</TabsTrigger>
          </TabsList>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <TabsContent value="general" className="mt-6 space-y-6">
              <Section title={t("settings.general.appearance")}>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label={t("settings.general.theme")}
                  >
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.general.theme}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          general: { ...prev.general, theme: event.target.value as any },
                        }))
                      }
                    >
                      <option value="system">{t("theme.system")}</option>
                      <option value="light">{t("theme.light")}</option>
                      <option value="dark">{t("theme.dark")}</option>
                    </select>
                  </Field>
                  <Field label={t("settings.general.language")}>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.general.language}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          general: { ...prev.general, language: event.target.value as any },
                        }))
                      }
                    >
                      {supportedLocales.map((locale) => (
                        <option key={locale} value={locale}>
                          {t(`language.${locale}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Section>
              <Separator />
              <Section title={t("settings.general.hotkey")}>
                <Field label={t("settings.general.hotkeyLabel")}>
                  <Input
                    value={draft.general.hotkey}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        general: { ...prev.general, hotkey: event.target.value },
                      }))
                    }
                  />
                </Field>
                <Field label={t("settings.general.cancelHotkeyLabel")}>
                  <Input
                    value={draft.general.cancelHotkey}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        general: { ...prev.general, cancelHotkey: event.target.value },
                      }))
                    }
                  />
                </Field>
              </Section>
            </TabsContent>
            <TabsContent value="api" className="mt-6 space-y-6">
              <Section title={t("settings.api.whisperTitle")}>
                <Field label={t("settings.api.provider")}>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.api.whisper.provider}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        api: {
                          ...prev.api,
                          whisper: { ...prev.api.whisper, provider: event.target.value as any },
                        },
                      }))
                    }
                    disabled={draft.privacy.offline}
                  >
                    {whisperProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider === "Local"
                          ? t("provider.local")
                          : provider === "OpenAI Whisper API"
                          ? t("provider.whisperOpenAI")
                          : t("provider.whisperOther")}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label={t("settings.api.apiKey")}>
                    <Input
                      type="password"
                      placeholder={t("placeholder.apiKey")}
                      value={draft.api.whisper.apiKey}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          api: {
                            ...prev.api,
                            whisper: { ...prev.api.whisper, apiKey: event.target.value },
                          },
                        }))
                      }
                      disabled={draft.api.whisper.provider === "Local" || draft.privacy.offline}
                    />
                  </Field>
                  <Field label={t("settings.api.endpoint")}>
                    <Input
                      placeholder={t("placeholder.endpoint")}
                      value={draft.api.whisper.endpoint}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          api: {
                            ...prev.api,
                            whisper: { ...prev.api.whisper, endpoint: event.target.value },
                          },
                        }))
                      }
                      disabled={draft.api.whisper.provider === "Local" || draft.privacy.offline}
                    />
                  </Field>
                </div>
                <Field label={t("settings.api.language")}>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.api.whisper.language}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        api: {
                          ...prev.api,
                          whisper: { ...prev.api.whisper, language: event.target.value as any },
                        },
                      }))
                    }
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language === "Auto" ? t("language.auto") : t(`language.${language}`)}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>
              <Separator />
              <Section title={t("settings.api.llmTitle")}>
                <Field label={t("settings.api.provider")}>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.api.llm.provider}
                    onChange={(event) => {
                      const provider = event.target.value as (typeof llmProviders)[number];
                      const nextModels = llmModels[provider] ?? llmModels.Local;
                      setDraft((prev) => ({
                        ...prev,
                        api: {
                          ...prev.api,
                          llm: { ...prev.api.llm, provider, model: nextModels[0] ?? "" },
                        },
                      }));
                    }}
                    disabled={draft.privacy.offline}
                  >
                    {llmProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider === "Local"
                          ? t("provider.local")
                          : provider === "OpenAI"
                          ? t("provider.openai")
                          : provider === "Gemini"
                          ? t("provider.gemini")
                          : provider === "Claude"
                          ? t("provider.claude")
                          : t("provider.grok")}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label={t("settings.api.model")}>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={draft.api.llm.model || modelOptions[0]}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          api: {
                            ...prev.api,
                            llm: { ...prev.api.llm, model: event.target.value },
                          },
                        }))
                      }
                      disabled={draft.privacy.offline}
                    >
                      {modelOptions.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t("settings.api.apiKey")}>
                    <Input
                      type="password"
                      placeholder={t("placeholder.apiKey")}
                      value={draft.api.llm.apiKey}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          api: {
                            ...prev.api,
                            llm: { ...prev.api.llm, apiKey: event.target.value },
                          },
                        }))
                      }
                      disabled={draft.api.llm.provider === "Local" || draft.privacy.offline}
                    />
                  </Field>
                </div>
                <Field label={t("settings.api.baseUrl")}
                >
                  <Input
                    placeholder={t("placeholder.baseUrl")}
                    value={draft.api.llm.baseUrl}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        api: {
                          ...prev.api,
                          llm: { ...prev.api.llm, baseUrl: event.target.value },
                        },
                      }))
                    }
                    disabled={draft.api.llm.provider === "Local" || draft.privacy.offline}
                  />
                </Field>
              </Section>
              <Separator />
              <Section title={t("settings.privacy.title")}
              >
                <label className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  <span>{t("settings.privacy.offline")}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={draft.privacy.offline}
                    onChange={(event) => handleOfflineToggle(event.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  <span>{t("settings.privacy.storeAudio")}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={draft.privacy.storeAudio}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, storeAudio: event.target.checked },
                      }))
                    }
                  />
                </label>
              </Section>
            </TabsContent>
            <TabsContent value="enrichments" className="mt-6 space-y-6">
              <Section title={t("settings.enrichments.title")} description={t("settings.enrichments.description")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button variant="ghost" onClick={handleResetEnrichments}>
                    <RotateCcw className="h-4 w-4" />
                    {t("settings.enrichments.reset")}
                  </Button>
                  <Button variant="secondary" onClick={handleAddEnrichment}>
                    <Plus className="h-4 w-4" />
                    {t("settings.enrichments.add")}
                  </Button>
                </div>
                <div className="space-y-3">
                  {draft.enrichments.map((item, index) => {
                    const Icon = getIconById(item.icon);
                    return (
                      <div key={item.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-1 items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                              <Icon className="h-4 w-4" />
                            </span>
                            <Input
                              value={item.name}
                              ref={(node) => {
                                enrichmentInputRefs.current[item.id] = node;
                              }}
                              onChange={(event) =>
                                setDraft((prev) => {
                                  const next = [...prev.enrichments];
                                  next[index] = { ...item, name: event.target.value };
                                  return { ...prev, enrichments: next };
                                })
                              }
                              className="h-10"
                              placeholder={t("settings.enrichments.name")}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(item.id)) {
                                    next.delete(item.id);
                                  } else {
                                    next.add(item.id);
                                  }
                                  return next;
                                })
                              }
                              className={`flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted ${
                                expandedIds.has(item.id) ? "rotate-180" : ""
                              }`}
                              aria-label="Toggle enrichment"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEnrichment(item.id)}
                              disabled={draft.enrichments.length <= 1}
                              aria-label={t("settings.enrichments.delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {expandedIds.has(item.id) && (
                          <>
                            <div className="mt-4">
                              <Field label={t("settings.enrichments.icon")}>
                                <div className="grid grid-cols-4 gap-2">
                                  {iconOptions.map((option) => {
                                    const SelectedIcon = option.icon;
                                    const isActive = option.id === item.icon;
                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={() =>
                                          setDraft((prev) => {
                                            const next = [...prev.enrichments];
                                            next[index] = { ...item, icon: option.id };
                                            return { ...prev, enrichments: next };
                                          })
                                        }
                                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition ${
                                          isActive
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:bg-muted"
                                        }`}
                                        aria-label={option.label}
                                      >
                                        <SelectedIcon className="h-4 w-4" />
                                        <span>{option.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </Field>
                            </div>
                            <Field label={t("settings.enrichments.prompt")}>
                              <textarea
                                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={item.prompt}
                                onChange={(event) =>
                                  setDraft((prev) => {
                                    const next = [...prev.enrichments];
                                    next[index] = { ...item, prompt: event.target.value };
                                    return { ...prev, enrichments: next };
                                  })
                                }
                              />
                            </Field>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {!draft.enrichments.length && (
                    <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                      {t("settings.enrichments.empty")}
                    </div>
                  )}
                </div>
              </Section>
              <Separator />
              <Section
                title={t("settings.keywords.title")}
                description={t("settings.keywords.description")}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        keywordsPrompt: getDefaultKeywordsPrompt(prev.general.language),
                      }))
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("settings.keywords.reset")}
                  </Button>
                </div>
                <Field label={t("settings.keywords.prompt")}>
                  <textarea
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={draft.keywordsPrompt}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        keywordsPrompt: event.target.value,
                      }))
                    }
                  />
                </Field>
              </Section>
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={async () => {
              const next = {
                ...draft,
                api: {
                  ...draft.api,
                  llm: { ...draft.api.llm, model: draft.api.llm.model || modelOptions[0] || "" },
                },
              };
              await updateSettings(next);
              setOpen(false);
            }}
          >
            {t("buttons.saveSettings")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
