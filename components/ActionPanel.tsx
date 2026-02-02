"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Network,
  GitBranch,
  Loader2,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActions } from "@/lib/actions";
import type { ActionDefinition, ActionResult, Artifact } from "@/lib/actions";
import type { Session } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { saveTextFile } from "@/lib/export";

const iconMap: Record<string, LucideIcon> = {
  Send,
  Network,
  GitBranch,
};

const MERMAID_THEME_CONFIG = {
  theme: "base" as const,
  themeVariables: {
    primaryColor: "#3b82f6",
    primaryTextColor: "#1e293b",
    primaryBorderColor: "#2563eb",
    lineColor: "#64748b",
    secondaryColor: "#e0f2fe",
    secondaryTextColor: "#1e293b",
    secondaryBorderColor: "#93c5fd",
    tertiaryColor: "#f0fdf4",
    tertiaryTextColor: "#1e293b",
    tertiaryBorderColor: "#86efac",
    noteBkgColor: "#fef3c7",
    noteTextColor: "#92400e",
    noteBorderColor: "#fbbf24",
    fontSize: "14px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
};

function MermaidPreview({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          ...MERMAID_THEME_CONFIG,
        });
        if (cancelled || !containerRef.current) return;
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
      </div>
      <div className="overflow-auto rounded-lg border border-border bg-white p-4">
        <div
          ref={containerRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          className="[&_svg]:max-w-none"
        />
      </div>
    </div>
  );
}

function ArtifactView({
  artifact,
  t,
  sessionTitle,
}: {
  artifact: Artifact;
  t: (key: string, vars?: Record<string, string | number>) => string;
  sessionTitle: string;
}) {
  const [showRaw, setShowRaw] = useState(false);

  const handleSave = async () => {
    const ext = artifact.type === "mermaid" ? "mmd" : "txt";
    const name = `${(artifact.label || "artifact").toLowerCase().replace(/\s+/g, "_")}_${sessionTitle || "note"}.${ext}`;
    await saveTextFile(artifact.content, name);
  };

  if (artifact.type === "mermaid") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {artifact.label && (
            <span className="text-xs font-medium text-muted-foreground">{artifact.label}</span>
          )}
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-muted-foreground underline"
          >
            {showRaw ? "Preview" : "Code"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 text-xs text-muted-foreground underline"
          >
            <Download className="h-3 w-3" />
            {t("actions.save")}
          </button>
        </div>
        {showRaw ? (
          <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-auto">
            {artifact.content}
          </pre>
        ) : (
          <MermaidPreview code={artifact.content} />
        )}
      </div>
    );
  }

  if (artifact.type === "url") {
    return (
      <div className="text-xs text-muted-foreground">
        {artifact.label}: <span className="font-mono">{artifact.content}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1 text-xs text-muted-foreground underline"
        >
          <Download className="h-3 w-3" />
          {t("actions.save")}
        </button>
      </div>
      <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs overflow-auto whitespace-pre-wrap">
        {artifact.content}
      </pre>
    </div>
  );
}

function ActionButton({
  action,
  session,
  t,
  onResult,
}: {
  action: ActionDefinition;
  session: Session;
  t: (key: string, vars?: Record<string, string | number>) => string;
  onResult: (actionId: string, result: ActionResult) => void;
}) {
  const [running, setRunning] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string | boolean>>(() => {
    const defaults: Record<string, string | boolean> = {};
    action.params?.forEach((p) => {
      defaults[p.key] = p.defaultValue ?? (p.type === "boolean" ? false : "");
    });
    return defaults;
  });
  const [expanded, setExpanded] = useState(false);

  const hasParams = action.params && action.params.length > 0;
  const Icon = iconMap[action.icon];

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      const result = await action.run(session, paramValues);
      onResult(action.id, result);
    } catch (err) {
      onResult(action.id, {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRunning(false);
    }
  }, [action, session, paramValues, onResult]);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm font-medium">{t(action.description)}</span>
        <div className="ml-auto flex items-center gap-1">
          {hasParams && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={hasParams && !expanded ? () => setExpanded(true) : handleRun}
            disabled={running || (hasParams && !expanded)}
          >
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : t("actions.run")}
          </Button>
        </div>
      </div>
      {expanded && hasParams && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {action.params!.map((param) => (
            <div key={param.key} className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-24 shrink-0">
                {param.label.startsWith("actions.") ? t(param.label) : param.label}
              </label>
              {param.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={paramValues[param.key] as boolean}
                  onChange={(e) =>
                    setParamValues((prev) => ({ ...prev, [param.key]: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
              ) : (
                <Input
                  value={paramValues[param.key] as string}
                  onChange={(e) =>
                    setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))
                  }
                  placeholder={param.placeholder}
                  className="h-8 text-xs"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleRun} disabled={running}>
              {running ? <Loader2 className="h-3 w-3 animate-spin" /> : t("actions.run")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActionPanel({ session, language }: { session: Session; language: Locale }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Record<string, ActionResult>>({});
  const [collapsedResults, setCollapsedResults] = useState<Record<string, boolean>>({});
  const { t } = useI18n(language);
  const actions = getActions();

  const handleResult = useCallback((actionId: string, result: ActionResult) => {
    setResults((prev) => ({ ...prev, [actionId]: result }));
    setCollapsedResults((prev) => ({ ...prev, [actionId]: false }));
  }, []);

  const toggleResultCollapsed = useCallback((actionId: string) => {
    setCollapsedResults((prev) => ({ ...prev, [actionId]: !prev[actionId] }));
  }, []);

  if (!actions.length) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {t("actions.title")}
        <span className="ml-auto text-xs">{actions.length}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {actions.map((action) => (
            <div key={action.id}>
              <ActionButton
                action={action}
                session={session}
                t={t}
                onResult={handleResult}
              />
              {results[action.id] && (
                <div className="mt-1 ml-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xs ${
                        results[action.id].ok ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {results[action.id].message
                        ? results[action.id].message!.startsWith("actions.")
                          ? t(results[action.id].message!)
                          : results[action.id].message
                        : results[action.id].ok
                        ? t("actions.success")
                        : t("actions.failed")}
                    </div>
                    {results[action.id].artifacts && results[action.id].artifacts!.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleResultCollapsed(action.id)}
                        className="text-xs text-muted-foreground"
                      >
                        {collapsedResults[action.id] ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {!collapsedResults[action.id] &&
                    results[action.id].artifacts?.map((artifact, i) => (
                      <div key={i} className="mt-2">
                        <ArtifactView
                          artifact={artifact}
                          t={t}
                          sessionTitle={session.title}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
