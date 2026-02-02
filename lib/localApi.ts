"use client";

import type { Settings, Session } from "@/lib/store";

export const LOCAL_API_PORT = 3895;
export const LOCAL_API_BASE = `http://127.0.0.1:${LOCAL_API_PORT}`;
const API_TIMEOUT_MS = 1200;
const API_CACHE_TTL_MS = 1500;

let cachedAvailable: boolean | null = null;
let lastChecked = 0;

async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeout = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(id);
  }
}

export async function isLocalApiAvailable(force = false) {
  const now = Date.now();
  if (!force && cachedAvailable !== null && now - lastChecked < API_CACHE_TTL_MS) {
    return cachedAvailable;
  }
  try {
    const response = await fetchWithTimeout(`${LOCAL_API_BASE}/health`);
    cachedAvailable = response.ok;
    lastChecked = now;
    return response.ok;
  } catch {
    cachedAvailable = false;
    lastChecked = now;
    return false;
  }
}

export function getAudioUrl(sessionId: string) {
  return `${LOCAL_API_BASE}/audio/${sessionId}`;
}

export async function fetchSettings(): Promise<Settings | null> {
  const response = await fetchWithTimeout(`${LOCAL_API_BASE}/settings`);
  if (!response.ok) return null;
  const data = await response.json();
  return data as Settings;
}

export async function saveSettings(settings: Settings) {
  await fetchWithTimeout(`${LOCAL_API_BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

export async function fetchSessions(): Promise<Session[]> {
  const response = await fetchWithTimeout(`${LOCAL_API_BASE}/sessions`);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? (data as Session[]) : [];
}

export async function fetchSession(sessionId: string): Promise<Session | null> {
  const response = await fetchWithTimeout(`${LOCAL_API_BASE}/sessions/${sessionId}`);
  if (!response.ok) return null;
  const data = (await response.json()) as Session;
  return { ...data, audioUrl: data.audioUrl || undefined };
}

export async function saveSession(session: Session) {
  try {
    const res = await fetchWithTimeout(`${LOCAL_API_BASE}/sessions/${session.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
    if (!res.ok) {
      console.error("[saveSession] failed:", res.status, res.statusText, "id:", session.id);
    }
  } catch (err) {
    console.error("[saveSession] error:", err, "id:", session.id);
  }
}

export async function deleteSession(sessionId: string) {
  await fetchWithTimeout(`${LOCAL_API_BASE}/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function uploadAudio(sessionId: string, blob: Blob) {
  await fetchWithTimeout(`${LOCAL_API_BASE}/audio/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
    },
    body: blob,
  });
}

export async function fetchAudioBlob(sessionId: string) {
  const response = await fetchWithTimeout(`${LOCAL_API_BASE}/audio/${sessionId}`, {
    method: "GET",
  });
  if (!response.ok) return null;
  return await response.blob();
}
