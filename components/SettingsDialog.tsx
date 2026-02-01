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
  OpenRouter: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash"],
  Custom: [],
};

const whisperProviders = ["Local", "OpenAI Whisper API", "Custom"] as const;
const llmProviders = ["Local", "OpenAI", "Gemini", "Claude", "Grok", "OpenRouter", "Custom"] as const;
const languages = ["Auto", "de", "en", "fr", "it"] as const;

const whisperEndpoints: Record<string, string> = {
  "OpenAI Whisper API": "https://api.openai.com/v1/audio/transcriptions",
  "Custom": "",
};

const llmBaseUrls: Record<string, string> = {
  OpenAI: "https://api.openai.com/v1",
  Gemini: "https://generativelanguage.googleapis.com/v1beta",
  Claude: "https://api.anthropic.com/v1",
  Grok: "https://api.x.ai/v1",
  OpenRouter: "https://openrouter.ai/api/v1",
  Custom: "",
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tmpl-${Math.random().toString(36).slice(2, 10)}`;
};

type SettingsDialogProps = {
  children?: ReactNode;
  onOpenSetupWizard?: () => void;
  initialTab?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function SettingsDialog({
  children,
  onOpenSetupWizard,
  initialTab = "general",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SettingsDialogProps) {
  const {
    state: { settings, settingsSource },
    actions: { updateSettings },
  } = useAppStore();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [draft, setDraft] = useState(settings);
  const [focusEnrichmentId, setFocusEnrichmentId] = useState<string | null>(null);
  const enrichmentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(initialTab);
  const { t } = useI18n(draft.general.language);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setUncontrolledOpen;

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setExpandedIds(new Set(settings.enrichments.map((item) => item.id)));
      setActiveTab(initialTab);
    }
  }, [open, settings, initialTab]);

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
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <Separator />
              <Section
                title={t("settings.setupWizard.title")}
                description={t("settings.setupWizard.description")}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setOpen(false);
                      onOpenSetupWizard?.();
                    }}
                  >
                    {t("settings.setupWizard.open")}
                  </Button>
                  <Badge variant="secondary">
                    {draft.general.setupCompleted
                      ? t("settings.setupWizard.status.complete")
                      : t("settings.setupWizard.status.pending")}
                  </Badge>
                </div>
              </Section>
            </TabsContent>
            <TabsContent value="api" className="mt-6 space-y-6">
              <Section title={t("settings.api.whisperTitle")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("settings.api.configuredProviders")}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const newId = createId();
                      setDraft((prev) => ({
                        ...prev,
                        api: {
                          ...prev.api,
                          whisper: {
                            ...prev.api.whisper,
                            keys: [
                              ...(prev.api.whisper.keys || []),
                              {
                                id: newId,
                                provider: "OpenAI Whisper API",
                                apiKey: "",
                                endpoint: whisperEndpoints["OpenAI Whisper API"],
                              },
                            ],
                            activeKeyId: newId,
                            provider: "OpenAI Whisper API",
                          },
                        },
                      }));
                    }}
                    disabled={draft.privacy.offline}
                  >
                    <Plus className="h-4 w-4" />
                    {t("settings.api.addEndpoint")}
                  </Button>
                </div>
                {(draft.api.whisper.keys || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                    {t("settings.api.noEndpoints")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(draft.api.whisper.keys || []).map((key, index) => {
                      const isActive = draft.api.whisper.activeKeyId === key.id;
                      return (
                        <div
                          key={key.id}
                          className={`rounded-2xl border p-4 ${
                            isActive ? "border-primary bg-primary/5" : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => {
                                setDraft((prev) => ({
                                  ...prev,
                                  api: {
                                    ...prev.api,
                                    whisper: {
                                      ...prev.api.whisper,
                                      activeKeyId: key.id,
                                      provider: key.provider as any,
                                    },
                                  },
                                }));
                              }}
                              className="text-xs font-medium text-muted-foreground hover:text-primary"
                            >
                              {isActive ? "✓ " : ""}{t("settings.api.endpointEntry")} {index + 1}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const keys = draft.api.whisper.keys || [];
                                const nextKeys = keys.filter((k) => k.id !== key.id);
                                const nextActiveId =
                                  isActive && nextKeys.length > 0
                                    ? nextKeys[0].id
                                    : draft.api.whisper.activeKeyId;
                                const nextProvider =
                                  isActive && nextKeys.length > 0
                                    ? (nextKeys[0].provider as any)
                                    : draft.api.whisper.provider;
                                setDraft((prev) => ({
                                  ...prev,
                                  api: {
                                    ...prev.api,
                                    whisper: {
                                      ...prev.api.whisper,
                                      keys: nextKeys,
                                      activeKeyId: nextActiveId,
                                      provider: nextProvider,
                                    },
                                  },
                                }));
                              }}
                              disabled={(draft.api.whisper.keys || []).length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <Field label={t("settings.api.provider")}>
                              <select
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={key.provider}
                                onChange={(event) => {
                                  const newProvider = event.target.value;
                                  const keys = [...(draft.api.whisper.keys || [])];
                                  keys[index] = {
                                    ...key,
                                    provider: newProvider,
                                    endpoint: whisperEndpoints[newProvider] || "",
                                    apiKey: newProvider === "Local" ? "" : key.apiKey,
                                  };
                                  setDraft((prev) => ({
                                    ...prev,
                                    api: {
                                      ...prev.api,
                                      whisper: {
                                        ...prev.api.whisper,
                                        keys,
                                        provider: isActive ? (newProvider as any) : prev.api.whisper.provider,
                                      },
                                    },
                                  }));
                                }}
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
                            {key.provider !== "Local" && (
                              <>
                                <Field label={t("settings.api.apiKey")}>
                                  <Input
                                    type="password"
                                    placeholder={t("placeholder.apiKey")}
                                    value={key.apiKey}
                                    onChange={(event) => {
                                      const keys = [...(draft.api.whisper.keys || [])];
                                      keys[index] = { ...key, apiKey: event.target.value };
                                      setDraft((prev) => ({
                                        ...prev,
                                        api: { ...prev.api, whisper: { ...prev.api.whisper, keys } },
                                      }));
                                    }}
                                    disabled={draft.privacy.offline}
                                  />
                                </Field>
                                <Field label={t("settings.api.endpoint")}>
                                  <Input
                                    placeholder={t("placeholder.endpoint")}
                                    value={key.endpoint || ""}
                                    onChange={(event) => {
                                      const keys = [...(draft.api.whisper.keys || [])];
                                      keys[index] = { ...key, endpoint: event.target.value };
                                      setDraft((prev) => ({
                                        ...prev,
                                        api: { ...prev.api, whisper: { ...prev.api.whisper, keys } },
                                      }));
                                    }}
                                    disabled={draft.privacy.offline}
                                  />
                                </Field>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                {draft.api.whisper.provider === "Local" && (
                  <>
                    <Separator />
                    <div className="text-xs font-semibold text-muted-foreground">
                      {t("provider.local")} Whisper
                    </div>
                    <Field label={t("setup.localWhisper.modelLabel")}>
                      <Input
                        placeholder={t("setup.localWhisper.modelPlaceholder")}
                        value={draft.local.whisper.model}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            local: {
                              ...prev.local,
                              whisper: { ...prev.local.whisper, model: event.target.value },
                            },
                          }))
                        }
                      />
                    </Field>
                    <Field label={t("setup.localWhisper.binaryLabel")}>
                      <Input
                        placeholder="/opt/homebrew/bin/whisper"
                        value={draft.local.whisper.binaryPath}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            local: {
                              ...prev.local,
                              whisper: { ...prev.local.whisper, binaryPath: event.target.value },
                            },
                          }))
                        }
                      />
                    </Field>
                  </>
                )}
              </Section>
              <Separator />
              <Section title={t("settings.api.llmTitle")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("settings.api.configuredProviders")}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const newId = createId();
                      const defaultModel = llmModels["OpenAI"][0];
                      setDraft((prev) => ({
                        ...prev,
                        api: {
                          ...prev.api,
                          llm: {
                            ...prev.api.llm,
                            keys: [
                              ...(prev.api.llm.keys || []),
                              {
                                id: newId,
                                provider: "OpenAI",
                                apiKey: "",
                                baseUrl: llmBaseUrls["OpenAI"],
                                model: defaultModel,
                              },
                            ],
                            activeKeyId: newId,
                            provider: "OpenAI",
                            model: defaultModel,
                          },
                        },
                      }));
                    }}
                    disabled={draft.privacy.offline}
                  >
                    <Plus className="h-4 w-4" />
                    {t("settings.api.addEndpoint")}
                  </Button>
                </div>
                {(draft.api.llm.keys || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                    {t("settings.api.noEndpoints")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(draft.api.llm.keys || []).map((key, index) => {
                      const isActive = draft.api.llm.activeKeyId === key.id;
                      const currentModels = llmModels[key.provider] || llmModels.Local;
                      return (
                        <div
                          key={key.id}
                          className={`rounded-2xl border p-4 ${
                            isActive ? "border-primary bg-primary/5" : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => {
                                setDraft((prev) => ({
                                  ...prev,
                                  api: {
                                    ...prev.api,
                                    llm: {
                                      ...prev.api.llm,
                                      activeKeyId: key.id,
                                      provider: key.provider as any,
                                      model: key.model || "",
                                    },
                                  },
                                }));
                              }}
                              className="text-xs font-medium text-muted-foreground hover:text-primary"
                            >
                              {isActive ? "✓ " : ""}{t("settings.api.endpointEntry")} {index + 1}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const keys = draft.api.llm.keys || [];
                                const nextKeys = keys.filter((k) => k.id !== key.id);
                                const nextActiveId =
                                  isActive && nextKeys.length > 0
                                    ? nextKeys[0].id
                                    : draft.api.llm.activeKeyId;
                                const nextProvider =
                                  isActive && nextKeys.length > 0
                                    ? (nextKeys[0].provider as any)
                                    : draft.api.llm.provider;
                                const nextModel =
                                  isActive && nextKeys.length > 0
                                    ? nextKeys[0].model || ""
                                    : draft.api.llm.model;
                                setDraft((prev) => ({
                                  ...prev,
                                  api: {
                                    ...prev.api,
                                    llm: {
                                      ...prev.api.llm,
                                      keys: nextKeys,
                                      activeKeyId: nextActiveId,
                                      provider: nextProvider,
                                      model: nextModel,
                                    },
                                  },
                                }));
                              }}
                              disabled={(draft.api.llm.keys || []).length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <Field label={t("settings.api.provider")}>
                              <select
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={key.provider}
                                onChange={(event) => {
                                  const newProvider = event.target.value;
                                  const newModels = llmModels[newProvider] || llmModels.Local;
                                  const keys = [...(draft.api.llm.keys || [])];
                                  keys[index] = {
                                    ...key,
                                    provider: newProvider,
                                    baseUrl: llmBaseUrls[newProvider] || "",
                                    model: newModels[0] || "",
                                    apiKey: newProvider === "Local" ? "" : key.apiKey,
                                  };
                                  setDraft((prev) => ({
                                    ...prev,
                                    api: {
                                      ...prev.api,
                                      llm: {
                                        ...prev.api.llm,
                                        keys,
                                        provider: isActive ? (newProvider as any) : prev.api.llm.provider,
                                        model: isActive ? (newModels[0] || "") : prev.api.llm.model,
                                      },
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
                                      : provider === "Grok"
                                      ? t("provider.grok")
                                      : provider === "OpenRouter"
                                      ? t("provider.openrouter")
                                      : t("provider.custom")}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label={t("settings.api.model")}>
                              <select
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={key.model || currentModels[0]}
                                onChange={(event) => {
                                  const keys = [...(draft.api.llm.keys || [])];
                                  keys[index] = { ...key, model: event.target.value };
                                  setDraft((prev) => ({
                                    ...prev,
                                    api: {
                                      ...prev.api,
                                      llm: {
                                        ...prev.api.llm,
                                        keys,
                                        model: isActive ? event.target.value : prev.api.llm.model,
                                      },
                                    },
                                  }));
                                }}
                                disabled={draft.privacy.offline}
                              >
                                {currentModels.map((model) => (
                                  <option key={model} value={model}>
                                    {model}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            {key.provider !== "Local" && (
                              <>
                                <Field label={t("settings.api.apiKey")}>
                                  <Input
                                    type="password"
                                    placeholder={t("placeholder.apiKey")}
                                    value={key.apiKey}
                                    onChange={(event) => {
                                      const keys = [...(draft.api.llm.keys || [])];
                                      keys[index] = { ...key, apiKey: event.target.value };
                                      setDraft((prev) => ({
                                        ...prev,
                                        api: { ...prev.api, llm: { ...prev.api.llm, keys } },
                                      }));
                                    }}
                                    disabled={draft.privacy.offline}
                                  />
                                </Field>
                                <Field label={t("settings.api.baseUrl")}>
                                  <Input
                                    placeholder={t("placeholder.baseUrl")}
                                    value={key.baseUrl || ""}
                                    onChange={(event) => {
                                      const keys = [...(draft.api.llm.keys || [])];
                                      keys[index] = { ...key, baseUrl: event.target.value };
                                      setDraft((prev) => ({
                                        ...prev,
                                        api: { ...prev.api, llm: { ...prev.api.llm, keys } },
                                      }));
                                    }}
                                    disabled={draft.privacy.offline}
                                  />
                                </Field>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {draft.api.llm.provider === "Local" && (
                  <>
                    <Separator />
                    <div className="text-xs font-semibold text-muted-foreground">
                      Ollama
                    </div>
                    <Field label={t("setup.ollama.baseUrl")}>
                      <Input
                        placeholder="http://127.0.0.1:11434"
                        value={draft.local.llm.ollamaBaseUrl}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            local: {
                              ...prev.local,
                              llm: { ...prev.local.llm, ollamaBaseUrl: event.target.value },
                            },
                          }))
                        }
                      />
                    </Field>
                    <Field label={t("setup.ollama.model")}>
                      <Input
                        placeholder="llama3.2"
                        value={draft.local.llm.ollamaModel}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            local: {
                              ...prev.local,
                              llm: { ...prev.local.llm, ollamaModel: event.target.value },
                            },
                          }))
                        }
                      />
                    </Field>
                  </>
                )}
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
