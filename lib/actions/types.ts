import type { Session } from "@/lib/store";

export type ArtifactType = "text" | "mermaid" | "url";

export type Artifact = {
  type: ArtifactType;
  content: string;
  label?: string;
  mimeType?: string;
};

export type ActionResult = {
  ok: boolean;
  message?: string;
  artifacts?: Artifact[];
};

export type ActionCategory = "export" | "integrate" | "visualize";

export type ActionDefinition = {
  id: string;
  title: string;
  icon: string;
  category: ActionCategory;
  description: string;
  requiresNetwork?: boolean;
  params?: ActionParam[];
  run: (session: Session, params: Record<string, string | boolean>) => Promise<ActionResult>;
};

export type ActionParam = {
  key: string;
  label: string;
  type: "string" | "boolean";
  placeholder?: string;
  defaultValue?: string | boolean;
  required?: boolean;
};
