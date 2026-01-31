import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: string | number | Date, locale = "en-US") {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

export function matchesHotkey(event: KeyboardEvent, hotkey: string) {
  const parts = hotkey
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return false;

  const key = parts[parts.length - 1];
  const modifiers = new Set(parts.slice(0, -1));

  const needsCtrl = modifiers.has("ctrl") || modifiers.has("control");
  const needsShift = modifiers.has("shift");
  const needsAlt = modifiers.has("alt") || modifiers.has("option");
  const needsMeta = modifiers.has("cmd") || modifiers.has("meta") || modifiers.has("command");

  if (needsCtrl && !event.ctrlKey) return false;
  if (needsShift && !event.shiftKey) return false;
  if (needsAlt && !event.altKey) return false;
  if (needsMeta && !event.metaKey) return false;

  return event.key.toLowerCase() === key;
}
