import type { ActionDefinition } from "./types";

function escapeLabel(text: string): string {
  return text.replace(/[()[\]{}]/g, " ").replace(/\s+/g, " ").trim();
}

function extractBullets(text: string, max: number): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").replace(/^#{1,6}\s*/, "").trim())
    .filter((l) => l.length > 3 && l.length < 80)
    .slice(0, max);
}

export const mindmapAction: ActionDefinition = {
  id: "mindmap",
  title: "Mindmap",
  icon: "Network",
  category: "visualize",
  description: "actions.mindmapDesc",
  run: async (session) => {
    const title = escapeLabel(session.title || "Note");
    const lines: string[] = ["mindmap", `  root((${title}))`];

    const keywords = session.metadata.keywords;
    if (keywords.length) {
      lines.push("    Keywords");
      keywords.forEach((kw) => lines.push(`      ${escapeLabel(kw)}`));
    }

    const bullets = extractBullets(session.enriched, 6);
    if (bullets.length) {
      lines.push("    Notizen");
      bullets.forEach((b) => lines.push(`      ${escapeLabel(b)}`));
    }

    const todoLines = session.enriched
      .split("\n")
      .filter((l) => /^[-*]\s/.test(l) && /todo|aufgabe|action|task/i.test(l))
      .map((l) => l.replace(/^[-*]\s*/, "").trim())
      .slice(0, 5);
    if (todoLines.length) {
      lines.push("    ToDos");
      todoLines.forEach((t) => lines.push(`      ${escapeLabel(t)}`));
    }

    const mermaidCode = lines.join("\n");

    return {
      ok: true,
      artifacts: [{ type: "mermaid", content: mermaidCode, label: "Mindmap" }],
    };
  },
};
