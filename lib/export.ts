"use client";

type SaveResult =
  | { ok: true; path?: string }
  | { ok: false; canceled?: boolean; message?: string };

const isTauri = () =>
  typeof window !== "undefined" &&
  ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);

export async function saveTextFile(
  content: string,
  suggestedName: string
): Promise<SaveResult> {
  if (isTauri()) {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeFile } = await import("@tauri-apps/plugin-fs");
      const path = await save({
        defaultPath: suggestedName,
        filters: [
          { name: "Text", extensions: ["txt", "md"] },
          { name: "Markdown", extensions: ["md"] },
        ],
      });
      if (!path) return { ok: false, canceled: true };
      await writeFile({ path, contents: content });
      return { ok: true, path };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Save failed." };
    }
  }

  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = suggestedName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Save failed." };
  }
}

export async function openAppFolder(path?: string): Promise<SaveResult> {
  if (!isTauri()) return { ok: false };
  try {
    const { appConfigDir, dirname } = await import("@tauri-apps/api/path");
    const { open } = await import("@tauri-apps/plugin-shell");
    const fallbackDir = await appConfigDir();
    const targetDir = path ? await dirname(path) : fallbackDir;
    await open(targetDir);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Open failed." };
  }
}
