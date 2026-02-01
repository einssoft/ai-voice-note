"use client";

import { Plus, Search, Trash2 } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { useI18n, toIntlLocale } from "@/lib/i18n";
import { getIconById } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DateTimeText } from "@/components/DateTimeText";

export function Sidebar() {
  const {
    state: { sessions, activeSessionId, searchQuery, settings },
    actions: { selectSession, createEmptySession, setSearchQuery, deleteSession },
  } = useAppStore();
  const { t } = useI18n(settings.general.language);
  const locale = toIntlLocale(settings.general.language);
  const templates = settings.enrichments;
  const isProcessing = sessions.some((session) => session.status === "processing");

  const filtered = sessions.filter((session) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      session.title.toLowerCase().includes(query) ||
      session.transcript.toLowerCase().includes(query) ||
      session.enriched.toLowerCase().includes(query)
    );
  });

  return (
    <aside className="flex h-full min-w-0 flex-col bg-card">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="text-sm font-semibold">{t("sidebar.title")}</div>
        <Button variant="ghost" size="sm" onClick={createEmptySession} disabled={isProcessing}>
          <Plus className="h-4 w-4" />
          {t("sidebar.new")}
        </Button>
      </div>
      <div className="px-5 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("sidebar.search")}
            className="pl-9"
            aria-label={t("aria.searchSessions")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            disabled={isProcessing}
          />
        </div>
      </div>
      <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-2">
          {filtered.map((session) => {
            const template = templates.find((mode) => mode.id === session.mode);
            const modeLabel = template?.name ?? session.mode;
            const Icon = getIconById(template?.icon);
            const preview = (session.enriched || session.transcript || t("sidebar.previewEmpty")).slice(
              0,
              80
            );
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => selectSession(session.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectSession(session.id);
                  }
                }}
                className={cn(
                  "w-full rounded-2xl border border-transparent px-3 py-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "border-border bg-muted"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{session.title.trim() ? session.title : t("common.untitled")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{modeLabel}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteSession(session.id);
                      }}
                      aria-label={t("aria.deleteNote")}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <DateTimeText value={session.createdAt} locale={locale} />
                </div>
                <div className="mt-2 truncate text-xs text-muted-foreground">{preview}</div>
              </div>
            );
          })}
          {!filtered.length && (
            <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
              {t("sidebar.empty")}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
