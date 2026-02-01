"use client";

import type { Settings, ApiKeyEntry } from "@/lib/store";
import { getMessages, t as translate } from "@/lib/i18n";

const OPENAI_BASE_URL = "https://api.openai.com";
const OPENAI_WHISPER_MODEL = "whisper-1";
const OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const KEYWORD_LIMIT = 6;
const DEFAULT_KEYWORD_PROMPT =
  "Extract 4-6 keywords as a JSON array. Prefer nouns or noun phrases. No filler words, no duplicates, max 3 words each.";

const STOPWORDS = new Set([
  "und",
  "oder",
  "aber",
  "mit",
  "ohne",
  "wir",
  "ihr",
  "sie",
  "ich",
  "du",
  "der",
  "die",
  "das",
  "ein",
  "eine",
  "einer",
  "einem",
  "auf",
  "aus",
  "von",
  "für",
  "zum",
  "zur",
  "den",
  "dem",
  "des",
  "im",
  "in",
  "an",
  "am",
  "to",
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "with",
  "without",
  "we",
  "you",
  "they",
  "is",
  "are",
  "was",
  "were",
  "be",
  "for",
  "of",
  "on",
  "at",
  "in",
  "this",
  "that",
  "these",
  "those",
]);

function resolveEndpoint(base: string | undefined, path: string, fallbackBase = OPENAI_BASE_URL) {
  const trimmed = (base ?? "").trim();
  if (!trimmed) return `${fallbackBase}${path}`;
  if (trimmed.includes(path)) return trimmed;
  const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  if (normalized.endsWith("/v1") && path.startsWith("/v1")) {
    return `${normalized}${path.slice(3)}`;
  }
  return `${normalized}${path}`;
}

function normalizeBaseUrl(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function isTauriRuntime() {
  return (
    typeof window !== "undefined" &&
    ("__TAURI__" in window || "__TAURI_INTERNALS__" in window)
  );
}

async function readErrorMessage(response: Response) {
  const fallback = `Request failed (${response.status})`;
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || fallback;
  } catch {
    try {
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function extractResponseText(payload: any) {
  if (!payload) return "";
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  if (Array.isArray(payload.output)) {
    let result = "";
    for (const item of payload.output) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part?.type === "output_text" && typeof part.text === "string") {
            result += part.text;
          }
        }
      }
    }
    if (result.trim()) return result.trim();
  }
  if (Array.isArray(payload.choices)) {
    const content = payload.choices[0]?.message?.content;
    if (typeof content === "string") return content.trim();
  }
  return "";
}

async function runLocalLlm(prompt: string, settings: Settings, signal?: AbortSignal) {
  const messages = getMessages(settings.general.language);
  if (isTauriRuntime()) {
    const { invoke } = await import("@tauri-apps/api/core");
    const model = settings.local.llm.ollamaModel?.trim();
    if (!model) {
      throw new Error(translate(messages, "errors.localLlm"));
    }
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    try {
      const text = await invoke<string>("test_ollama_generate", {
        baseUrl: settings.local.llm.ollamaBaseUrl,
        model,
        prompt,
      });
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      if (!text || typeof text !== "string") {
        throw new Error("Local LLM returned no text.");
      }
      return text.trim();
    } catch (error) {
      throw new Error(getErrorMessage(error) || translate(messages, "errors.localLlm"));
    }
  }

  const baseUrl = normalizeBaseUrl(settings.local.llm.ollamaBaseUrl, OLLAMA_BASE_URL);
  const model = settings.local.llm.ollamaModel?.trim();
  if (!model) {
    throw new Error(translate(messages, "errors.localLlm"));
  }
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        prompt,
        model,
        stream: false,
      }),
    });
  } catch {
    throw new Error(translate(messages, "errors.localLlm"));
  }
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const payload = await response.json();
  const text = payload?.response ?? payload?.message?.content ?? "";
  if (!text || typeof text !== "string") {
    throw new Error("Local LLM returned no text.");
  }
  return text.trim();
}

function getModePrompt(mode: string) {
  switch (mode) {
    case "tasks":
      return [
        "Extract all action items as a list.",
        "Rules:",
        "- One task per bullet.",
        "- Include owner/date/status if mentioned.",
        "- No duplicates, no extra context.",
      ].join("\n");
    case "meeting":
      return [
        "Create structured meeting notes in Markdown:",
        "- Summary",
        "- Key points",
        "- Decisions",
        "- Action items (with owner/date if mentioned)",
        "- Open questions",
        "Rules:",
        "- Use only transcript facts.",
        "- Keep it concise.",
      ].join("\n");
    case "email":
      return [
        "Draft a short professional email based on the transcript.",
        "Structure:",
        "- Subject",
        "- Greeting",
        "- 3-6 sentences summary + next steps",
        "- Closing",
        "Rules:",
        "- Do not invent facts.",
      ].join("\n");
    case "smart":
    default:
      return [
        "Create smart notes in Markdown with clear section headings:",
        "- Summary (3-5 bullets)",
        "- Decisions",
        "- Next steps",
        "Rules:",
        "- Use only information from the transcript.",
        "- No inventions, no filler.",
        "- Keep each bullet short.",
      ].join("\n");
  }
}

function normalizeKeywords(list: string[], limit = KEYWORD_LIMIT) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of list) {
    const cleaned = raw
      .replace(/^[\s\-*•]+/g, "")
      .replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "")
      .trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    if (!cleaned.includes(" ") && STOPWORDS.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
    if (result.length >= limit) break;
  }
  return result;
}

function parseKeywords(text: string, limit = KEYWORD_LIMIT) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeKeywords(parsed.map((item) => String(item)), limit);
      }
    } catch {
      // fall through to heuristic parsing
    }
  }
  const candidates = trimmed
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  return normalizeKeywords(candidates, limit);
}

function resolveAudioExtensionFromBlob(blob: Blob) {
  const type = (blob.type || "").split(";")[0].trim().toLowerCase();
  if (type === "audio/webm") return "webm";
  if (type === "audio/ogg") return "ogg";
  if (type === "audio/mpeg") return "mp3";
  if (type === "audio/mp4") return "m4a";
  if (type === "audio/wav") return "wav";
  if ("name" in blob && typeof (blob as File).name === "string") {
    const name = (blob as File).name.toLowerCase();
    if (name.endsWith(".webm")) return "webm";
    if (name.endsWith(".ogg")) return "ogg";
    if (name.endsWith(".mp3")) return "mp3";
    if (name.endsWith(".m4a") || name.endsWith(".mp4")) return "m4a";
    if (name.endsWith(".wav")) return "wav";
  }
  return "webm";
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function extractKeywords(text: string, limit = 4) {
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
  const counts = new Map<string, number>();
  tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}

function pickKeyByProvider(
  keys: ApiKeyEntry[] | undefined,
  provider: string,
  activeId?: string
) {
  if (!keys || !keys.length) return null;
  if (provider === "Local") {
    if (activeId) {
      const selected = keys.find((entry) => entry.id === activeId);
      if (selected && selected.provider === provider) return selected;
    }
    const byProvider = keys.find((entry) => entry.provider === provider);
    return byProvider ?? null;
  }
  if (activeId) {
    const selected = keys.find((entry) => entry.id === activeId);
    if (selected && selected.provider === provider) return selected;
  }
  const byProvider = keys.find((entry) => entry.provider === provider);
  return byProvider ?? keys[0] ?? null;
}

function resolveWhisperCredentials(settings: Settings) {
  const provider = settings.api.whisper.provider;
  const selected = pickKeyByProvider(
    settings.api.whisper.keys,
    provider,
    settings.api.whisper.activeKeyId
  );

  return {
    provider,
    apiKey: selected?.apiKey ?? settings.api.whisper.apiKey,
    endpoint: selected?.endpoint ?? settings.api.whisper.endpoint,
  };
}

function resolveLlmCredentials(settings: Settings) {
  const provider = settings.api.llm.provider;
  const selected = pickKeyByProvider(
    settings.api.llm.keys,
    provider,
    settings.api.llm.activeKeyId
  );
  return {
    provider,
    apiKey: selected?.apiKey ?? settings.api.llm.apiKey,
    baseUrl: selected?.baseUrl ?? settings.api.llm.baseUrl,
    model: selected?.model ?? settings.api.llm.model,
  };
}

export async function transcribeAudio(
  blob: Blob,
  settings: Settings,
  signal?: AbortSignal
) {
  const messages = getMessages(settings.general.language);
  const whisper = resolveWhisperCredentials(settings);
  if (settings.privacy.offline && whisper.provider !== "Local") {
    throw new Error(translate(messages, "errors.offlineMode"));
  }
  if (whisper.provider === "Local") {
    const isTauriApp =
      typeof window !== "undefined" &&
      ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
    if (!isTauriApp) {
      throw new Error(translate(messages, "errors.localTranscription"));
    }
    const { invoke } = await import("@tauri-apps/api/core");
    const audioBase64 = await blobToBase64(blob);
    const audioExt = resolveAudioExtensionFromBlob(blob);
    const language =
      settings.api.whisper.language !== "Auto" ? settings.api.whisper.language : null;
    const transcript = await invoke<string>("transcribe_local_whisper", {
      audioBase64,
      audioExt,
      language,
      model: settings.local.whisper.model || null,
      binaryPath: settings.local.whisper.binaryPath || null,
      ffmpegPath: settings.ffmpegPath || null,
    });
    if (!transcript.trim()) {
      throw new Error("Transcription returned no text.");
    }
    return transcript.trim();
  }
  if (whisper.provider === "Other" && !whisper.endpoint.trim()) {
    throw new Error(translate(messages, "errors.customWhisperEndpointRequired"));
  }
  if (!whisper.apiKey) {
    throw new Error(translate(messages, "errors.missingWhisperKey"));
  }
  if (blob.size > MAX_AUDIO_BYTES) {
    throw new Error(translate(messages, "errors.audioTooLarge"));
  }

  const endpoint = resolveEndpoint(whisper.endpoint, "/v1/audio/transcriptions");
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  formData.append("model", OPENAI_WHISPER_MODEL);
  formData.append("response_format", "text");
  if (settings.api.whisper.language !== "Auto") {
    formData.append("language", settings.api.whisper.language);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${whisper.apiKey}`,
    },
    signal,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await response.json();
    const text = data?.text ?? data?.transcript ?? "";
    if (!text) throw new Error("Transcription returned no text.");
    return text.trim();
  }
  const text = await response.text();
  if (!text.trim()) throw new Error("Transcription returned no text.");
  return text.trim();
}

async function generateKeywords(
  transcript: string,
  prompt: string,
  settings: Settings,
  signal?: AbortSignal
) {
  const messages = getMessages(settings.general.language);
  const fallbackPrompt = translate(messages, "keywords.defaultPrompt");
  const systemPrompt =
    (prompt?.trim() || fallbackPrompt || DEFAULT_KEYWORD_PROMPT) +
    "\n\nReturn only a JSON array of strings. Respond in the same language as the transcript.";
  let raw = "";

  if (settings.api.llm.provider === "Local") {
    const localPrompt = `${systemPrompt}\n\n${transcript}`;
    raw = await runLocalLlm(localPrompt, settings, signal);
  } else {
    const llm = resolveLlmCredentials(settings);
    const endpoint = resolveEndpoint(llm.baseUrl, "/v1/responses");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llm.apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: llm.model || "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        temperature: 0.2,
        max_output_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const payload = await response.json();
    raw = extractResponseText(payload);
  }

  const keywords = parseKeywords(raw, KEYWORD_LIMIT);
  if (!keywords.length) {
    throw new Error("Keyword extraction returned no keywords.");
  }
  return keywords;
}

export async function enrichTranscript(
  transcript: string,
  prompt: string,
  settings: Settings,
  signal?: AbortSignal
) {
  const messages = getMessages(settings.general.language);
  const llm = resolveLlmCredentials(settings);
  if (!transcript.trim()) {
    throw new Error(translate(messages, "errors.noTranscript"));
  }
  if (settings.privacy.offline && llm.provider !== "Local") {
    throw new Error(translate(messages, "errors.offlineMode"));
  }
  const systemPrompt =
    (prompt || getModePrompt("smart")) + "\n\nRespond in the same language as the transcript.";
  let enriched = "";

  if (llm.provider === "Local") {
    const localPrompt = `${systemPrompt}\n\n${transcript}`;
    enriched = await runLocalLlm(localPrompt, settings, signal);
  } else {
    if (!llm.apiKey) {
      throw new Error(translate(messages, "errors.missingLlmKey"));
    }
    if (llm.provider !== "OpenAI" && !llm.baseUrl.trim()) {
      throw new Error(translate(messages, "errors.baseUrlRequired"));
    }

    const endpoint = resolveEndpoint(llm.baseUrl, "/v1/responses");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llm.apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model: llm.model || "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
        max_output_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const payload = await response.json();
    enriched = extractResponseText(payload);
  }
  if (!enriched) {
    throw new Error("Enrichment returned no text.");
  }

  return {
    enriched,
    keywords: await (async () => {
      try {
        return await generateKeywords(transcript, settings.keywordsPrompt, settings, signal);
      } catch {
        return extractKeywords(transcript, KEYWORD_LIMIT);
      }
    })(),
  };
}
