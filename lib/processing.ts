"use client";

import type { Settings } from "@/lib/store";
import { getMessages, t as translate } from "@/lib/i18n";

const OPENAI_BASE_URL = "https://api.openai.com";
const OPENAI_WHISPER_MODEL = "whisper-1";
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

export async function transcribeAudio(
  blob: Blob,
  settings: Settings,
  signal?: AbortSignal
) {
  const messages = getMessages(settings.general.language);
  if (settings.privacy.offline) {
    throw new Error(translate(messages, "errors.offlineMode"));
  }
  if (settings.api.whisper.provider === "Local") {
    throw new Error(translate(messages, "errors.localTranscription"));
  }
  if (settings.api.whisper.provider === "Other" && !settings.api.whisper.endpoint.trim()) {
    throw new Error(translate(messages, "errors.customWhisperEndpointRequired"));
  }
  if (!settings.api.whisper.apiKey) {
    throw new Error(translate(messages, "errors.missingWhisperKey"));
  }
  if (blob.size > MAX_AUDIO_BYTES) {
    throw new Error(translate(messages, "errors.audioTooLarge"));
  }

  const endpoint = resolveEndpoint(settings.api.whisper.endpoint, "/v1/audio/transcriptions");
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
      Authorization: `Bearer ${settings.api.whisper.apiKey}`,
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
  const endpoint = resolveEndpoint(settings.api.llm.baseUrl, "/v1/responses");
  const systemPrompt =
    (prompt?.trim() || fallbackPrompt || DEFAULT_KEYWORD_PROMPT) +
    "\n\nReturn only a JSON array of strings. Respond in the same language as the transcript.";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.api.llm.apiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      model: settings.api.llm.model || "gpt-4o-mini",
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
  const raw = extractResponseText(payload);
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
  if (!transcript.trim()) {
    throw new Error(translate(messages, "errors.noTranscript"));
  }
  if (settings.privacy.offline) {
    throw new Error(translate(messages, "errors.offlineMode"));
  }
  if (settings.api.llm.provider === "Local") {
    throw new Error(translate(messages, "errors.localLlm"));
  }
  if (!settings.api.llm.apiKey) {
    throw new Error(translate(messages, "errors.missingLlmKey"));
  }
  if (settings.api.llm.provider !== "OpenAI" && !settings.api.llm.baseUrl.trim()) {
    throw new Error(translate(messages, "errors.baseUrlRequired"));
  }

  const endpoint = resolveEndpoint(settings.api.llm.baseUrl, "/v1/responses");
  const systemPrompt = (prompt || getModePrompt("smart")) + "\n\nRespond in the same language as the transcript.";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.api.llm.apiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      model: settings.api.llm.model || "gpt-4o-mini",
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
  const enriched = extractResponseText(payload);
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
