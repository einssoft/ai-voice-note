import type { ActionDefinition } from "./types";

let nodeCounter = 0;

function nodeId(): string {
  return `n${++nodeCounter}`;
}

function escapeLabel(text: string): string {
  return text.replace(/"/g, "'").replace(/\n/g, " ").trim();
}

function extractFirstLines(text: string, max: number): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").replace(/^#{1,6}\s*/, "").trim())
    .filter((l) => l.length > 3 && l.length < 60)
    .slice(0, max);
}

export const flowchartAction: ActionDefinition = {
  id: "flowchart",
  title: "Flowchart",
  icon: "GitBranch",
  category: "visualize",
  description: "actions.flowchartDesc",
  run: async (session) => {
    nodeCounter = 0;
    const lines: string[] = ["graph TD"];

    const titleNode = nodeId();
    const title = escapeLabel(session.title || "Note");
    lines.push(`  ${titleNode}["${title}"]`);

    const keywords = session.metadata.keywords;
    if (keywords.length) {
      const kwNode = nodeId();
      lines.push(`  ${kwNode}["Keywords"]`);
      lines.push(`  ${titleNode} --> ${kwNode}`);
      keywords.forEach((kw) => {
        const kid = nodeId();
        lines.push(`  ${kid}("${escapeLabel(kw)}")`);
        lines.push(`  ${kwNode} --> ${kid}`);
      });
    }

    const points = extractFirstLines(session.enriched, 5);
    if (points.length) {
      const notesNode = nodeId();
      lines.push(`  ${notesNode}["Notizen"]`);
      lines.push(`  ${titleNode} --> ${notesNode}`);
      points.forEach((p) => {
        const pid = nodeId();
        lines.push(`  ${pid}("${escapeLabel(p)}")`);
        lines.push(`  ${notesNode} --> ${pid}`);
      });
    }

    const todos = session.enriched
      .split("\n")
      .filter((l) => /^[-*]\s/.test(l))
      .map((l) => l.replace(/^[-*]\s*/, "").trim())
      .filter((l) => l.length > 3 && l.length < 60)
      .slice(0, 5);
    if (todos.length) {
      const todoNode = nodeId();
      lines.push(`  ${todoNode}["ToDos"]`);
      lines.push(`  ${titleNode} --> ${todoNode}`);
      todos.forEach((t) => {
        const tid = nodeId();
        lines.push(`  ${tid}("${escapeLabel(t)}")`);
        lines.push(`  ${todoNode} --> ${tid}`);
      });
    }

    const mermaidCode = lines.join("\n");

    return {
      ok: true,
      artifacts: [{ type: "mermaid", content: mermaidCode, label: "Flowchart" }],
    };
  },
};
