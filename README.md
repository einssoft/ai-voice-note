# ai-voice-note
Minimalistische Desktop-App fuer Sprachaufnahmen, Transkription und KI-Anreicherung. UI-only, keine Backend-Implementierung.

## Kurzbeschreibung des Problems
Teams und Einzelpersonen wollen Audio-Notizen schnell aufnehmen, transkribieren und in klare Outputs (Smart Notes, Tasks, Meeting Notes, E-Mail Drafts) transformieren. Die App soll dabei ruhig, fokussiert und ohne komplexe Setups nutzbar sein.

## Architektur-Ueberblick
- **Frontend:** Next.js (App Router) + React, TailwindCSS, shadcn/ui, lucide-react.
- **Desktop:** Tauri wrapper fuer macOS/Windows/Linux.
- **State:** React Context Store in `lib/store.tsx` fuer Sessions, Settings, UI-Status.
- **Audio:** `lib/audioRecorder.ts` nutzt `MediaRecorder` + Web Audio Analyser fuer Aufnahme und Pegelanzeige.
- **Processing Pipeline:** `lib/processing.ts` bildet Whisper/LLM Schritte als Stubs ab (spaetere Anbindung vorbereitet).
- **Persistenz:**
  - Browser: `localStorage`
  - Tauri: JSON-Dateien in `AppConfig` (`ai-voice-note-settings.json`, `ai-voice-note-sessions.json`)
- **i18n:** Sprachdateien in `locales/*.json` und Loader in `lib/i18n.ts`.

## Setup-Anleitung
Voraussetzungen:
- Node.js 18+
- pnpm
- (fuer Desktop) Rust + Tauri CLI (v2.x)

Installieren:
```bash
pnpm install
```

Web-Dev:
```bash
pnpm dev
```

Tauri-Dev:
```bash
pnpm tauri dev
```

Tauri-Build:
```bash
pnpm tauri build
```

Hinweis: Mikrofon-Zugriff muss im OS erlaubt werden (System Settings / Privacy).
Tauri 2.x nutzt Plugins fuer Dialog/FS/Shell. Diese werden in `package.json` und `src-tauri/src/main.rs` registriert.

## Design-Entscheidungen
- **Minimalismus:** viel Whitespace, neutrale Farben, ein Akzentton fuer Primary Actions.
- **App Shell:** Topbar + resizable Sidebar + Main Content; Sidebar-Breite wird gespeichert.
- **Sessions als Cards:** schnelle Sichtbarkeit von Titel, Zeit, Mode und Preview.
- **Recording im Fokus:** zentraler Aufnahme-Button, klare Status/Microcopy fuer Idle/Recording/Processing/Done/Error.
- **Outputs via Tabs:** Enriched/Transcript/Metadata mit Copy/Save Aktionen.
- **Settings strukturiert:** General | API Keys | Enrichments, anpassbare Prompt-Templates, lokale Persistenz.
- **Kein Backend:** alle Schritte sind UI/Stub-first, Schnittstellen fuer Whisper/LLM sind klar getrennt (`lib/processing.ts`).
