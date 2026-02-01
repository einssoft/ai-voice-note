import type { EnrichmentTemplate, Session } from "@/lib/store";
import { getMessages, t, type Locale } from "@/lib/i18n";

export const defaultEnrichmentIds = ["smart", "tasks", "meeting", "email"] as const;

export function getDefaultEnrichments(locale: Locale = "de"): EnrichmentTemplate[] {
  const messages = getMessages(locale);
  return [
    {
      id: "smart",
      name: t(messages, "enrichment.smart"),
      icon: "Sparkles",
      prompt: t(messages, "enrichment.prompt.smart"),
    },
    {
      id: "tasks",
      name: t(messages, "enrichment.tasks"),
      icon: "ListChecks",
      prompt: t(messages, "enrichment.prompt.tasks"),
    },
    {
      id: "meeting",
      name: t(messages, "enrichment.meeting"),
      icon: "NotebookPen",
      prompt: t(messages, "enrichment.prompt.meeting"),
    },
    {
      id: "email",
      name: t(messages, "enrichment.email"),
      icon: "Mail",
      prompt: t(messages, "enrichment.prompt.email"),
    },
  ];
}

export function getDefaultKeywordsPrompt(locale: Locale = "de"): string {
  const messages = getMessages(locale);
  return t(messages, "keywords.defaultPrompt");
}

const baseTranscript =
  "Heute haben wir die wichtigsten Punkte zum Projektstatus besprochen. Offene Fragen betreffen die Timeline, das Budget und die Abhaengigkeiten im Design. Naechste Schritte sind eine Review-Runde am Mittwoch und das Sammeln der Kundenfeedbacks.";

const enrichedByMode: Record<string, string> = {
  smart: [
    "**Kurzfassung**",
    "- Projektstatus diskutiert, Fokus auf Timeline, Budget und Design-Abhaengigkeiten",
    "- Review-Runde am Mittwoch, Kundenfeedback einsammeln",
    "",
    "**Entscheidungen**",
    "- Design-Review wird als Gate fuer den naechsten Sprint genutzt",
    "",
    "**Naechste Schritte**",
    "- Review-Agenda vorbereiten",
    "- Feedback-Formular versenden",
  ].join("\n"),
  tasks: [
    "- Review-Agenda fuer Mittwoch erstellen (Owner: Alex)",
    "- Kundenfeedback einsammeln und clustern (Owner: Sam)",
    "- Budgetfreigabe mit Finance abstimmen (Owner: Mia)",
    "- Timeline-Update in den Projektplan einpflegen (Owner: Chris)",
  ].join("\n"),
  meeting: [
    "**Meeting Notes**",
    "- Thema: Projektstatus & naechste Schritte",
    "- Diskussion: Timeline, Budget, Design-Abhaengigkeiten",
    "- Beschluss: Design-Review als Gate fuer Sprintstart",
    "- Follow-ups: Review-Agenda erstellen, Kundenfeedback sammeln",
  ].join("\n"),
  email: [
    "Betreff: Projektstatus & naechste Schritte",
    "",
    "Hi Team,",
    "",
    "kurzes Update aus dem heutigen Gespraech: Wir haben Timeline, Budget und Design-Abhaengigkeiten geprueft. Als naechster Schritt planen wir die Review-Runde am Mittwoch und sammeln bis dahin das Kundenfeedback.",
    "",
    "Danke und viele Gruesse",
    "[Dein Name]",
  ].join("\n"),
};

const keywordsByMode: Record<string, string[]> = {
  smart: ["Timeline", "Budget", "Design", "Review"],
  tasks: ["To-dos", "Owner", "Follow-up"],
  meeting: ["Meeting", "Entscheidung", "Agenda"],
  email: ["Update", "Team", "Naechste Schritte"],
};

export function generateMockContent(mode: string) {
  return {
    transcript: baseTranscript,
    enriched: enrichedByMode[mode],
    keywords: keywordsByMode[mode],
  };
}

const now = Date.now();

export const seedSessions: Session[] = [
  {
    id: "sess-1",
    title: "Projektstatus Update",
    createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    mode: "meeting",
    status: "done",
    transcript: baseTranscript,
    enriched: enrichedByMode.meeting,
    metadata: {
      durationSec: 92,
      keywords: keywordsByMode.meeting,
      whisperProvider: "OpenAI Whisper API",
      llmProvider: "OpenAI",
    },
  },
  {
    id: "sess-2",
    title: "Follow-ups Kunde Atlas",
    createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    mode: "tasks",
    status: "done",
    transcript: baseTranscript,
    enriched: enrichedByMode.tasks,
    metadata: {
      durationSec: 64,
      keywords: keywordsByMode.tasks,
      whisperProvider: "Local",
      llmProvider: "Claude",
    },
  },
  {
    id: "sess-3",
    title: "Weekly Summary",
    createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    mode: "smart",
    status: "done",
    transcript: baseTranscript,
    enriched: enrichedByMode.smart,
    metadata: {
      durationSec: 110,
      keywords: keywordsByMode.smart,
      whisperProvider: "Gemini",
      llmProvider: "Gemini",
    },
  },
];
