"use client";

import {
  Sparkles,
  ListChecks,
  NotebookPen,
  Mail,
  StickyNote,
  ClipboardList,
  Lightbulb,
  PenSquare,
  type LucideIcon,
} from "lucide-react";

export const iconOptions: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "Sparkles", label: "Sparkles", icon: Sparkles },
  { id: "ListChecks", label: "List Checks", icon: ListChecks },
  { id: "NotebookPen", label: "Notebook", icon: NotebookPen },
  { id: "Mail", label: "Mail", icon: Mail },
  { id: "StickyNote", label: "Sticky Note", icon: StickyNote },
  { id: "ClipboardList", label: "Clipboard", icon: ClipboardList },
  { id: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
  { id: "PenSquare", label: "Pen", icon: PenSquare },
];

export function getIconById(id: string | undefined) {
  const match = iconOptions.find((item) => item.id === id);
  return match?.icon ?? Sparkles;
}
