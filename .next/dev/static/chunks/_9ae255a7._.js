(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/mock.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateMockContent",
    ()=>generateMockContent,
    "modeOptions",
    ()=>modeOptions,
    "seedSessions",
    ()=>seedSessions
]);
const modeOptions = [
    {
        value: "smart",
        label: "Smart Notes"
    },
    {
        value: "tasks",
        label: "Tasks"
    },
    {
        value: "meeting",
        label: "Meeting Notes"
    },
    {
        value: "email",
        label: "E-Mail Draft"
    }
];
const baseTranscript = "Heute haben wir die wichtigsten Punkte zum Projektstatus besprochen. Offene Fragen betreffen die Timeline, das Budget und die Abhaengigkeiten im Design. Naechste Schritte sind eine Review-Runde am Mittwoch und das Sammeln der Kundenfeedbacks.";
const enrichedByMode = {
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
        "- Feedback-Formular versenden"
    ].join("\n"),
    tasks: [
        "- Review-Agenda fuer Mittwoch erstellen (Owner: Alex)",
        "- Kundenfeedback einsammeln und clustern (Owner: Sam)",
        "- Budgetfreigabe mit Finance abstimmen (Owner: Mia)",
        "- Timeline-Update in den Projektplan einpflegen (Owner: Chris)"
    ].join("\n"),
    meeting: [
        "**Meeting Notes**",
        "- Thema: Projektstatus & naechste Schritte",
        "- Diskussion: Timeline, Budget, Design-Abhaengigkeiten",
        "- Beschluss: Design-Review als Gate fuer Sprintstart",
        "- Follow-ups: Review-Agenda erstellen, Kundenfeedback sammeln"
    ].join("\n"),
    email: [
        "Betreff: Projektstatus & naechste Schritte",
        "",
        "Hi Team,",
        "",
        "kurzes Update aus dem heutigen Gespraech: Wir haben Timeline, Budget und Design-Abhaengigkeiten geprueft. Als naechster Schritt planen wir die Review-Runde am Mittwoch und sammeln bis dahin das Kundenfeedback.",
        "",
        "Danke und viele Gruesse",
        "[Dein Name]"
    ].join("\n")
};
const keywordsByMode = {
    smart: [
        "Timeline",
        "Budget",
        "Design",
        "Review"
    ],
    tasks: [
        "To-dos",
        "Owner",
        "Follow-up"
    ],
    meeting: [
        "Meeting",
        "Entscheidung",
        "Agenda"
    ],
    email: [
        "Update",
        "Team",
        "Naechste Schritte"
    ]
};
function generateMockContent(mode) {
    return {
        transcript: baseTranscript,
        enriched: enrichedByMode[mode],
        keywords: keywordsByMode[mode]
    };
}
const now = Date.now();
const seedSessions = [
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
            llmProvider: "OpenAI"
        }
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
            llmProvider: "Claude"
        }
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
            llmProvider: "Gemini"
        }
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/audioRecorder.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AudioRecorder",
    ()=>AudioRecorder
]);
class AudioRecorder {
    mediaRecorder = null;
    audioChunks = [];
    stream = null;
    audioContext = null;
    analyser = null;
    source = null;
    rafId = null;
    onDataAvailable = null;
    onError = null;
    onLevel = null;
    async initialize() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });
            if (!this.audioContext) {
                const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContextCtor();
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.source = this.audioContext.createMediaStreamSource(this.stream);
                this.source.connect(this.analyser);
            }
        } catch  {
            throw new Error("Microphone access denied. Please allow microphone access to record audio.");
        }
    }
    setOnDataAvailable(callback) {
        this.onDataAvailable = callback;
    }
    setOnError(callback) {
        this.onError = callback;
    }
    setOnLevel(callback) {
        this.onLevel = callback;
    }
    async startRecording() {
        if (!this.stream) await this.initialize();
        this.audioChunks = [];
        const mimeType = this.getSupportedMimeType();
        this.mediaRecorder = mimeType ? new MediaRecorder(this.stream, {
            mimeType,
            audioBitsPerSecond: 128000
        }) : new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = (event)=>{
            if (event.data.size > 0) this.audioChunks.push(event.data);
        };
        this.mediaRecorder.onstop = ()=>{
            const resolvedType = mimeType || this.mediaRecorder?.mimeType || "audio/webm";
            const audioBlob = new Blob(this.audioChunks, {
                type: resolvedType
            });
            if (audioBlob.size < 1000) {
                if (this.onError) this.onError(new Error("No audio captured. Please check microphone input."));
                return;
            }
            if (this.onDataAvailable) this.onDataAvailable(audioBlob);
        };
        this.mediaRecorder.onerror = ()=>{
            if (this.onError) this.onError(new Error("Recording error occurred"));
        };
        if (this.audioContext?.state === "suspended") {
            await this.audioContext.resume();
        }
        this.startMetering();
        this.mediaRecorder.start(1000);
    }
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            this.mediaRecorder.stop();
        }
    }
    cleanup() {
        this.stopRecording();
        if (this.stream) {
            this.stream.getTracks().forEach((track)=>track.stop());
            this.stream = null;
        }
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        if (this.audioContext) {
            void this.audioContext.close();
            this.audioContext = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
    }
    startMetering() {
        if (!this.analyser || !this.onLevel) return;
        const data = new Uint8Array(this.analyser.fftSize);
        const tick = ()=>{
            if (!this.analyser) return;
            this.analyser.getByteTimeDomainData(data);
            let sum = 0;
            for(let i = 0; i < data.length; i += 1){
                const normalized = (data[i] - 128) / 128;
                sum += normalized * normalized;
            }
            const rms = Math.sqrt(sum / data.length);
            this.onLevel?.(Math.min(1, rms * 2));
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    }
    getSupportedMimeType() {
        const mimeTypes = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/mp4",
            "audio/mpeg"
        ];
        for (const mimeType of mimeTypes){
            if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
        }
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/processing.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "enrichTranscript",
    ()=>enrichTranscript,
    "extractKeywords",
    ()=>extractKeywords,
    "transcribeAudio",
    ()=>transcribeAudio
]);
"use client";
const OPENAI_BASE_URL = "https://api.openai.com";
const OPENAI_WHISPER_MODEL = "whisper-1";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
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
    "those"
]);
function resolveEndpoint(base, path, fallbackBase = OPENAI_BASE_URL) {
    const trimmed = (base ?? "").trim();
    if (!trimmed) return `${fallbackBase}${path}`;
    if (trimmed.includes(path)) return trimmed;
    const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
    if (normalized.endsWith("/v1") && path.startsWith("/v1")) {
        return `${normalized}${path.slice(3)}`;
    }
    return `${normalized}${path}`;
}
async function readErrorMessage(response) {
    const fallback = `Request failed (${response.status})`;
    try {
        const data = await response.json();
        return data?.error?.message || data?.message || fallback;
    } catch  {
        try {
            const text = await response.text();
            return text || fallback;
        } catch  {
            return fallback;
        }
    }
}
function extractResponseText(payload) {
    if (!payload) return "";
    if (typeof payload.output_text === "string" && payload.output_text.trim()) {
        return payload.output_text.trim();
    }
    if (Array.isArray(payload.output)) {
        let result = "";
        for (const item of payload.output){
            if (item?.type === "message" && Array.isArray(item.content)) {
                for (const part of item.content){
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
function getModePrompt(mode) {
    switch(mode){
        case "tasks":
            return "Extract all action items and tasks as a short bullet list. Keep each item concise.";
        case "meeting":
            return [
                "Create well-structured meeting notes:",
                "- Summary",
                "- Key points",
                "- Decisions",
                "- Action items"
            ].join("\n");
        case "email":
            return "Draft a concise professional email based on the transcript. Include a subject line.";
        case "smart":
        default:
            return [
                "Create smart notes with:",
                "- Short summary",
                "- Decisions",
                "- Next steps"
            ].join("\n");
    }
}
function extractKeywords(text, limit = 4) {
    const tokens = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((token)=>token.length > 2 && !STOPWORDS.has(token));
    const counts = new Map();
    tokens.forEach((token)=>counts.set(token, (counts.get(token) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b)=>b[1] - a[1]).slice(0, limit).map(([token])=>token);
}
async function transcribeAudio(blob, settings) {
    if (settings.privacy.offline) {
        throw new Error("Offline mode is enabled. Disable it to use cloud transcription.");
    }
    if (settings.whisper.provider === "Local") {
        throw new Error("Local transcription is not configured.");
    }
    if (settings.whisper.provider === "Other" && !settings.whisper.endpoint.trim()) {
        throw new Error("Custom Whisper endpoint is required.");
    }
    if (!settings.whisper.apiKey) {
        throw new Error("Missing Whisper API key in Settings.");
    }
    if (blob.size > MAX_AUDIO_BYTES) {
        throw new Error("Audio file is larger than 25MB. Please record a shorter clip.");
    }
    const endpoint = resolveEndpoint(settings.whisper.endpoint, "/v1/audio/transcriptions");
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("model", OPENAI_WHISPER_MODEL);
    formData.append("response_format", "text");
    if (settings.whisper.language !== "Auto") {
        formData.append("language", settings.whisper.language);
    }
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${settings.whisper.apiKey}`
        },
        body: formData
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
async function enrichTranscript(transcript, mode, settings) {
    if (!transcript.trim()) {
        throw new Error("No transcript to enrich.");
    }
    if (settings.privacy.offline) {
        throw new Error("Offline mode is enabled. Disable it to use cloud enrichment.");
    }
    if (settings.llm.provider === "Local") {
        throw new Error("Local LLM is not configured.");
    }
    if (!settings.llm.apiKey) {
        throw new Error("Missing LLM API key in Settings.");
    }
    if (settings.llm.provider !== "OpenAI" && !settings.llm.baseUrl.trim()) {
        throw new Error("Base URL is required for non-OpenAI providers.");
    }
    const endpoint = resolveEndpoint(settings.llm.baseUrl, "/v1/responses");
    const systemPrompt = `${getModePrompt(mode)}\n\nRespond in the same language as the transcript.`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${settings.llm.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: settings.llm.model || "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            temperature: 0.3,
            max_output_tokens: 1200
        })
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
        keywords: extractKeywords(enriched)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/store.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppStoreProvider",
    ()=>AppStoreProvider,
    "useAppStore",
    ()=>useAppStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioRecorder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioRecorder.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/processing.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const defaultSettings = {
    theme: "system",
    hotkey: "Ctrl+Shift+R",
    whisper: {
        provider: "Local",
        apiKey: "",
        endpoint: "",
        language: "Auto"
    },
    llm: {
        provider: "Local",
        model: "Local Default",
        apiKey: "",
        baseUrl: ""
    },
    privacy: {
        offline: false,
        storeAudio: true
    }
};
const SETTINGS_KEY = "vi-settings";
const SESSIONS_KEY = "vi-sessions";
const SETTINGS_FILE = "voice-intelligence-settings.json";
const SESSIONS_FILE = "voice-intelligence-sessions.json";
const isTauri = ()=>("TURBOPACK compile-time value", "object") !== "undefined" && "__TAURI__" in window;
async function readFromTauri(filename) {
    if (!isTauri()) return null;
    try {
        const { readTextFile, exists, BaseDirectory } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/fs.js [app-client] (ecmascript, async loader)");
        const fileExists = await exists(filename, {
            dir: BaseDirectory.AppConfig
        });
        if (!fileExists) return null;
        return await readTextFile(filename, {
            dir: BaseDirectory.AppConfig
        });
    } catch  {
        return null;
    }
}
async function writeToTauri(filename, contents) {
    if (!isTauri()) return;
    try {
        const { writeFile, BaseDirectory } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@tauri-apps+api@1.6.0/node_modules/@tauri-apps/api/fs.js [app-client] (ecmascript, async loader)");
        await writeFile({
            path: filename,
            contents
        }, {
            dir: BaseDirectory.AppConfig
        });
    } catch  {
    // ignore
    }
}
function safeParseJson(value, fallback) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch  {
        return fallback;
    }
}
const StoreContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function getRandomId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `sess-${Math.random().toString(36).slice(2, 10)}`;
}
function applyTheme(theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = theme === "system" ? prefersDark ? "dark" : "light" : theme;
    root.classList.toggle("dark", resolved === "dark");
}
function AppStoreProvider({ children }) {
    _s();
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedSessions"]);
    const [activeSessionId, setActiveSessionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("smart");
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultSettings);
    const [isHydrated, setIsHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recordingLevel, setRecordingLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const hasLoadedSessions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const hasUserUpdatedSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const hasUserModifiedSessions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const recorderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recordingSessionIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioBlobsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    const sessionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(sessions);
    const settingsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(settings);
    const modeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(mode);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppStoreProvider.useEffect": ()=>{
            let active = true;
            const load = {
                "AppStoreProvider.useEffect.load": async ()=>{
                    const localSettings = safeParseJson(("TURBOPACK compile-time truthy", 1) ? localStorage.getItem(SETTINGS_KEY) : "TURBOPACK unreachable", defaultSettings);
                    const localSessions = safeParseJson(("TURBOPACK compile-time truthy", 1) ? localStorage.getItem(SESSIONS_KEY) : "TURBOPACK unreachable", __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedSessions"]);
                    const tauriSettingsRaw = await readFromTauri(SETTINGS_FILE);
                    const tauriSessionsRaw = await readFromTauri(SESSIONS_FILE);
                    const tauriSettings = safeParseJson(tauriSettingsRaw, localSettings);
                    const tauriSessions = safeParseJson(tauriSessionsRaw, localSessions);
                    const loadedSettings = tauriSettingsRaw ? tauriSettings : localSettings;
                    const loadedSessions = tauriSessionsRaw ? tauriSessions : localSessions;
                    if (!active) return;
                    if (!hasUserUpdatedSettings.current) {
                        setSettings(loadedSettings);
                    }
                    if (!hasUserModifiedSessions.current) {
                        setSessions(loadedSessions.length ? loadedSessions : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedSessions"]);
                    }
                    hasLoadedSessions.current = true;
                    setIsHydrated(true);
                }
            }["AppStoreProvider.useEffect.load"];
            void load();
            return ({
                "AppStoreProvider.useEffect": ()=>{
                    active = false;
                }
            })["AppStoreProvider.useEffect"];
        }
    }["AppStoreProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppStoreProvider.useEffect": ()=>{
            sessionsRef.current = sessions;
        }
    }["AppStoreProvider.useEffect"], [
        sessions
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppStoreProvider.useEffect": ()=>{
            settingsRef.current = settings;
        }
    }["AppStoreProvider.useEffect"], [
        settings
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppStoreProvider.useEffect": ()=>{
            modeRef.current = mode;
        }
    }["AppStoreProvider.useEffect"], [
        mode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppStoreProvider.useEffect": ()=>{
            if (!isHydrated && !hasUserUpdatedSettings.current) return;
            const payload = JSON.stringify(settings);
            try {
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem(SETTINGS_KEY, payload);
                }
            } catch  {
            // ignore
            }
            void writeToTauri(SETTINGS_FILE, payload);
            applyTheme(settings.theme);
        }
    }["AppStoreProvider.useEffect"], [
        settings,
        isHydrated
    ]);
    const createSession = (partial)=>{
        const newSession = {
            id: getRandomId(),
            title: "Untitled",
            createdAt: new Date().toISOString(),
            mode,
            status: "idle",
            transcript: "",
            enriched: "",
            audioUrl: undefined,
            metadata: {
                durationSec: 0,
                keywords: [],
                whisperProvider: settings.whisper.provider,
                llmProvider: settings.llm.provider
            },
            ...partial
        };
        hasUserModifiedSessions.current = true;
        setSessions((prev)=>{
            const next = [
                newSession,
                ...prev
            ];
            const serializable = next.map(({ audioUrl, ...rest })=>rest);
            try {
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
                }
            } catch  {
            // ignore
            }
            void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
            return next;
        });
        setActiveSessionId(newSession.id);
        return newSession;
    };
    const updateSession = (id, updates)=>{
        hasUserModifiedSessions.current = true;
        setSessions((prev)=>{
            const next = prev.map((session)=>session.id === id ? {
                    ...session,
                    ...updates
                } : session);
            const serializable = next.map(({ audioUrl, ...rest })=>rest);
            try {
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
                }
            } catch  {
            // ignore
            }
            void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
            return next;
        });
    };
    const getSessionById = (id)=>sessionsRef.current.find((session)=>session.id === id);
    const setAudioBlob = (id, blob)=>{
        audioBlobsRef.current[id] = blob;
    };
    const clearAudioBlob = (id)=>{
        delete audioBlobsRef.current[id];
    };
    const buildErrorDetails = (stage, settingsSnapshot, message)=>{
        const lines = [
            `Stage: ${stage}`,
            `Whisper provider: ${settingsSnapshot.whisper.provider}`,
            `LLM provider: ${settingsSnapshot.llm.provider}`
        ];
        if (stage === "transcribing") {
            lines.push(`Whisper endpoint: ${settingsSnapshot.whisper.endpoint || "default"}`);
        } else {
            lines.push(`LLM base URL: ${settingsSnapshot.llm.baseUrl || "default"}`);
        }
        lines.push(`Message: ${message}`);
        return lines.join("\n");
    };
    const getActiveSession = ()=>sessions.find((session)=>session.id === activeSessionId) ?? null;
    const processAudio = async (sessionId, blob, durationSec)=>{
        const settingsSnapshot = settingsRef.current;
        const sessionSnapshot = getSessionById(sessionId);
        const sessionMode = sessionSnapshot?.mode ?? modeRef.current;
        const baseMetadata = sessionSnapshot?.metadata ?? {
            durationSec: 0,
            keywords: [],
            whisperProvider: settingsSnapshot.whisper.provider,
            llmProvider: settingsSnapshot.llm.provider
        };
        updateSession(sessionId, {
            status: "processing",
            stage: "transcribing",
            transcript: "",
            enriched: "",
            errorMessage: undefined,
            recordingStartedAt: undefined,
            metadata: {
                ...baseMetadata,
                durationSec,
                whisperProvider: settingsSnapshot.whisper.provider,
                llmProvider: settingsSnapshot.llm.provider
            }
        });
        let transcript = "";
        try {
            transcript = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transcribeAudio"])(blob, settingsSnapshot);
            updateSession(sessionId, {
                transcript,
                stage: "enriching",
                errorMessage: undefined,
                errorDetails: undefined
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Transcription failed.";
            updateSession(sessionId, {
                status: "error",
                stage: undefined,
                errorMessage: message,
                errorDetails: buildErrorDetails("transcribing", settingsSnapshot, message)
            });
            if (!settingsSnapshot.privacy.storeAudio) {
                clearAudioBlob(sessionId);
            }
            return;
        }
        try {
            const { enriched, keywords } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enrichTranscript"])(transcript, sessionMode, settingsSnapshot);
            updateSession(sessionId, {
                status: "done",
                stage: undefined,
                enriched,
                errorMessage: undefined,
                errorDetails: undefined,
                metadata: {
                    ...baseMetadata,
                    durationSec,
                    keywords: keywords.length ? keywords : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractKeywords"])(transcript),
                    whisperProvider: settingsSnapshot.whisper.provider,
                    llmProvider: settingsSnapshot.llm.provider
                }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Enrichment failed.";
            updateSession(sessionId, {
                status: "error",
                stage: undefined,
                errorMessage: message,
                errorDetails: buildErrorDetails("enriching", settingsSnapshot, message)
            });
        } finally{
            if (!settingsSnapshot.privacy.storeAudio) {
                clearAudioBlob(sessionId);
            }
        }
    };
    const cleanupRecorder = ()=>{
        if (recorderRef.current) {
            recorderRef.current.cleanup();
        }
        recorderRef.current = null;
        recordingSessionIdRef.current = null;
    };
    const actions = {
        setSearchQuery,
        setMode,
        selectSession: (id)=>setActiveSessionId(id),
        createEmptySession: ()=>{
            createSession({
                status: "idle"
            });
        },
        deleteSession: (id)=>{
            hasUserModifiedSessions.current = true;
            const existing = getSessionById(id);
            if (existing?.audioUrl) {
                try {
                    URL.revokeObjectURL(existing.audioUrl);
                } catch  {
                // ignore
                }
            }
            clearAudioBlob(id);
            setSessions((prev)=>{
                const next = prev.filter((session)=>session.id !== id);
                const serializable = next.map(({ audioUrl, ...rest })=>rest);
                try {
                    if ("TURBOPACK compile-time truthy", 1) {
                        localStorage.setItem(SESSIONS_KEY, JSON.stringify(serializable));
                    }
                } catch  {
                // ignore
                }
                void writeToTauri(SESSIONS_FILE, JSON.stringify(serializable));
                if (activeSessionId === id) {
                    setActiveSessionId(next[0]?.id ?? null);
                }
                return next;
            });
        },
        startRecording: async ()=>{
            if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
                createSession({
                    status: "error",
                    title: "Microphone unavailable",
                    errorMessage: "Microphone access is not supported in this environment."
                });
                return;
            }
            try {
                cleanupRecorder();
                const active = getActiveSession();
                const sessionId = active && active.status === "idle" && !active.transcript && !active.enriched ? active.id : createSession({
                    status: "recording",
                    recordingStartedAt: Date.now(),
                    title: "Untitled"
                }).id;
                if (active && active.id === sessionId) {
                    updateSession(active.id, {
                        status: "recording",
                        recordingStartedAt: Date.now(),
                        mode,
                        errorMessage: undefined,
                        metadata: {
                            ...active.metadata,
                            whisperProvider: settings.whisper.provider,
                            llmProvider: settings.llm.provider
                        }
                    });
                }
                recordingSessionIdRef.current = sessionId;
                const recorder = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioRecorder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AudioRecorder"]();
                recorderRef.current = recorder;
                setRecordingLevel(0);
                recorder.setOnDataAvailable(async (blob)=>{
                    const targetId = recordingSessionIdRef.current ?? sessionId;
                    if (!targetId) {
                        cleanupRecorder();
                        return;
                    }
                    setAudioBlob(targetId, blob);
                    if (settingsRef.current.privacy.storeAudio) {
                        const url = URL.createObjectURL(blob);
                        updateSession(targetId, {
                            audioUrl: url,
                            errorMessage: undefined,
                            errorDetails: undefined
                        });
                    } else {
                        updateSession(targetId, {
                            errorMessage: undefined,
                            errorDetails: undefined
                        });
                    }
                    const currentSession = getSessionById(targetId);
                    const elapsed = currentSession?.recordingStartedAt ? Math.max(0, Math.floor((Date.now() - currentSession.recordingStartedAt) / 1000)) : 0;
                    await processAudio(targetId, blob, elapsed);
                    cleanupRecorder();
                });
                recorder.setOnError((error)=>{
                    const targetId = recordingSessionIdRef.current ?? sessionId;
                    if (targetId) {
                        updateSession(targetId, {
                            status: "error",
                            errorMessage: error.message,
                            errorDetails: buildErrorDetails("transcribing", settingsRef.current, error.message)
                        });
                    }
                    cleanupRecorder();
                });
                recorder.setOnLevel((level)=>{
                    setRecordingLevel((prev)=>Math.abs(prev - level) > 0.02 ? level : prev);
                });
                await recorder.startRecording();
            } catch (error) {
                const message = error instanceof Error ? error.message : "Microphone access was denied. Please allow access and try again.";
                const targetId = recordingSessionIdRef.current;
                if (targetId) {
                    updateSession(targetId, {
                        status: "error",
                        recordingStartedAt: undefined,
                        errorMessage: message,
                        errorDetails: buildErrorDetails("transcribing", settingsRef.current, message)
                    });
                } else {
                    createSession({
                        status: "error",
                        title: "Microphone blocked",
                        errorMessage: message,
                        errorDetails: buildErrorDetails("transcribing", settingsRef.current, message)
                    });
                }
                cleanupRecorder();
            }
        },
        stopRecording: ()=>{
            if (recorderRef.current) {
                recorderRef.current.stopRecording();
            }
            setRecordingLevel(0);
        },
        uploadAudio: (file)=>{
            if (!file) return;
            const session = createSession({
                status: "processing",
                stage: "transcribing",
                title: file.name || "Audio Upload"
            });
            setAudioBlob(session.id, file);
            if (settingsRef.current.privacy.storeAudio) {
                const url = URL.createObjectURL(file);
                updateSession(session.id, {
                    audioUrl: url
                });
            }
            void processAudio(session.id, file, 0);
        },
        retryProcessing: ()=>{
            const active = getActiveSession();
            if (!active) return;
            const blob = audioBlobsRef.current[active.id];
            if (!blob) {
                updateSession(active.id, {
                    status: "error",
                    stage: undefined,
                    errorMessage: "Audio file not available for retry.",
                    errorDetails: "Audio blob not found. Try recording again or re-upload the file."
                });
                return;
            }
            void processAudio(active.id, blob, active.metadata.durationSec);
        },
        updateSessionTitle: (id, title)=>updateSession(id, {
                title: title.trim() ? title : "Untitled"
            }),
        updateSettings: async (nextSettings)=>{
            hasUserUpdatedSettings.current = true;
            setSettings(nextSettings);
            const payload = JSON.stringify(nextSettings);
            try {
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.setItem(SETTINGS_KEY, payload);
                }
            } catch  {
            // ignore
            }
            void writeToTauri(SETTINGS_FILE, payload);
        },
        toggleTheme: ()=>{
            setSettings((prev)=>({
                    ...prev,
                    theme: prev.theme === "dark" ? "light" : "dark"
                }));
        }
    };
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AppStoreProvider.useMemo[value]": ()=>({
                state: {
                    sessions,
                    activeSessionId,
                    searchQuery,
                    mode,
                    settings,
                    recordingLevel
                },
                actions
            })
    }["AppStoreProvider.useMemo[value]"], [
        sessions,
        activeSessionId,
        searchQuery,
        mode,
        settings,
        recordingLevel
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StoreContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/store.tsx",
        lineNumber: 628,
        columnNumber: 10
    }, this);
}
_s(AppStoreProvider, "hVnJt2R/37EQ47gZWZ8KOOSzEcU=");
_c = AppStoreProvider;
function useAppStore() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(StoreContext);
    if (!context) {
        throw new Error("useAppStore must be used within AppStoreProvider");
    }
    return context;
}
_s1(useAppStore, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AppStoreProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProviders",
    ()=>AppProviders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.tsx [app-client] (ecmascript)");
"use client";
;
;
function AppProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppStoreProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = AppProviders;
var _c;
__turbopack_context__.k.register(_c, "AppProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_9ae255a7._.js.map