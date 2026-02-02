# ai-voice-note

Desktop-Anwendung für Sprachaufnahmen mit automatischer Transkription und KI-gestützter Anreicherung. Per Hotkey aktivierbar, läuft lokal oder nutzt Cloud-APIs nach Wahl.

## Kurzbeschreibung des Problems

Teams und Einzelpersonen wollen Audio-Notizen schnell aufnehmen, transkribieren und in strukturierte, direkt nutzbare Outputs transformieren. Die Anwendung soll:
- **Nahtlos im Workflow nutzbar sein**: Per Hotkey aktivierbar, ohne die aktuelle Arbeit zu unterbrechen
- **Flexible Verarbeitung bieten**: Von einfacher Transkription bis zu strukturierten Notizen, Tasks oder E-Mail-Drafts
- **Lokal oder Cloud**: Wahlweise komplett offline mit lokalen Modellen (Whisper.cpp + Ollama) oder mit Cloud-APIs (OpenAI, Gemini, Claude, Grok)
- **Fokussiert und ruhig**: Minimalistisches UI, das sich auf die Kernfunktion konzentriert

## Setup-Anleitung

### Voraussetzungen

- **Node.js** 18+ (empfohlen: 20+)
- **pnpm** (Package Manager)
- **Für Desktop-Build**: Rust + Tauri CLI v2.x

Optional für lokale AI:
- **FFmpeg** (für Audio-Konvertierung)
- **whisper.cpp** (für lokale Transkription)
- **Ollama** (für lokales LLM)

> **Hinweis**: Der Setup-Wizard in der App kann FFmpeg, whisper.cpp und Ollama automatisch erkennen und teilweise installieren.

### Installation

```bash
# Repository klonen
git clone https://github.com/einssoft/ai-voice-note.git
cd ai-voice-note

# Dependencies installieren
pnpm install
```

### Development

**Web-Version** (läuft im Browser auf `http://localhost:3000`):
```bash
pnpm dev
```

**Desktop-Version** (Tauri):
```bash
pnpm tauri dev
```

> Die Desktop-Version startet automatisch den lokalen API-Server auf Port 3895.

### Production Build

**Desktop-App bauen**:
```bash
pnpm tauri build
```

Die fertige App befindet sich in `src-tauri/target/release/bundle/`.

### Erste Schritte

1. **App starten** (Web oder Tauri)
2. **Setup-Wizard öffnen** (beim ersten Start oder via Settings)
3. **Provider konfigurieren**:
   - Für **Cloud**: API-Keys in Settings → API Keys eingeben
   - Für **Lokal**: Setup-Wizard durchlaufen (FFmpeg, Whisper, Ollama)
4. **Hotkey testen**: `Ctrl+Shift+R` (oder konfigurierte Kombination)
5. **Erste Aufnahme**: Mic-Button klicken oder Hotkey drücken, sprechen, stoppen

---

## Die Lösung

### Workflow

```
🎤 Sprechen  ──►  📝 Transkription  ──►  🤖 KI-Enrichment  ──►  📋 Aktion
                                                │
                                                │  ♻️ Ergebnis erneut
                                                │     anreichern
                                                └───────┘
```

Jede Sprachaufnahme durchläuft eine Pipeline: Aufnahme → Transkription → KI-Anreicherung → Aktion. Das Besondere: **Enrichments sind verkettbar** – das Ergebnis eines Enrichments kann als Input für ein weiteres dienen, bis das gewünschte Ergebnis steht.

### Beispiel: Vom Scrum-Planning zur Management-Mail

```
🎤 Scrum-Planning Meeting
    │
    ▼
📝 Voice-to-Text (Transkription)
    │
    ▼
🤖 Enrichment 1: "Backlog für den nächsten Sprint"
    │               → Strukturierte User Stories, Prioritäten, Story Points
    ▼
🤖 Enrichment 2: "Kritische Analyse"
    │               → Risiken, Abhängigkeiten, fehlende Akzeptanzkriterien
    ▼
🤖 Enrichment 3: "Email an Management"
    │               → Professionelle Zusammenfassung mit Status & Empfehlungen
    ▼
📋 Aktion: Webhook → Send Mail
                      → E-Mail wird automatisch versendet
```

> **Kernidee**: Sprache rein, strukturierte Ergebnisse raus – in beliebig vielen Verarbeitungsschritten, ohne die App zu verlassen.

---

## Architektur-Übersicht

### Tech Stack

**Frontend:**
- Next.js 16.1.6 (App Router)
- React 19.2.4 + TypeScript 5.5.4
- TailwindCSS 3.4.10 + shadcn/ui (Radix UI)
- Lucide Icons
- i18next (4 Sprachen: DE, EN, FR, IT)

**Desktop Runtime:**
- Tauri 2.x (Rust 2021)
- Cross-Platform: macOS, Windows, Linux
- Tauri Plugins: dialog, fs, shell

**Backend (Tauri):**
- Axum Web Server (Port 3895, localhost only)
- SQLite Database (rusqlite)
- Tokio Async Runtime
- Audio-Dateispeicherung im AppData-Verzeichnis

**State Management:**
- React Context Store (`lib/store.tsx`)
- Lokale Persistenz: SQLite (Tauri) oder localStorage (Web)

### Systemarchitektur

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AppShell    │  │ RecorderPanel│  │ SessionView  │      │
│  │  (Hotkeys)   │  │ (Audio Rec)  │  │ (Results)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                   ┌────────▼─────────┐                      │
│                   │   React Store    │                      │
│                   │  (lib/store.tsx) │                      │
│                   └────────┬─────────┘                      │
└────────────────────────────┼──────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐    ┌────────▼─────────┐  ┌──────▼──────┐
│ Audio Rec    │    │ Processing       │  │ Local API   │
│ (Web Audio)  │    │ (Transcription   │  │ (Port 3895) │
│              │    │  + Enrichment)   │  │             │
└──────────────┘    └────────┬─────────┘  └──────┬──────┘
                             │                    │
                    ┌────────┴────────┐    ┌──────▼──────┐
                    │                 │    │   SQLite    │
            ┌───────▼──────┐  ┌───────▼──────┐  │  Database   │
            │ Local Whisper│  │  Local LLM   │  │             │
            │ (whisper.cpp)│  │  (Ollama)    │  └─────────────┘
            └──────────────┘  └──────────────┘
                    │                 │
            ┌───────▼──────┐  ┌───────▼──────┐
            │ Remote APIs  │  │ Remote APIs  │
            │ (Whisper API)│  │ (OpenAI, etc)│
            └──────────────┘  └──────────────┘
```

### Voice-Pipeline

1. **Aufnahme** (`lib/audioRecorder.ts`)
   - Mikrofonzugriff via Web Audio API (`MediaRecorder`)
   - Echtzeitpegel-Visualisierung (12-Bar Spektrum mit FFT)
   - Audio-Einstellungen: Echo-Cancellation, Noise-Suppression, Auto-Gain
   - Sample-Rate: 16kHz (optimiert für Sprache)
   - Formate: WebM/Opus, MP4, OGG (abhängig von Browser-Support)

2. **Transkription** (`lib/processing.ts`)
   - **Lokal**: whisper.cpp via Tauri Command mit FFmpeg-Konvertierung
   - **Remote**: OpenAI Whisper API oder Custom Endpoints
   - **Transcript Upload**: Direkter Upload von Text/Markdown-Dateien (überspringt Whisper-Transkription)
   - Spracherkennung: Auto-Detection oder manuell wählbar
   - Max. Dateigröße: 25MB
   - Fehlerbehandlung mit Retry-Logik

3. **Enrichment** (KI-Anreicherung)
   - **Lokal**: Ollama (diverse Modelle: llama3, mistral, etc.)
   - **Remote**: OpenAI, Gemini, Claude, Grok via OpenAI-kompatible APIs
   - 5 vordefinierte Modi mit anpassbaren Prompts:
     - **Smart Notes**: Zusammenfassung, Entscheidungen, nächste Schritte (Markdown)
     - **Tasks**: Action Items mit Owner, Datum, Status
     - **Meeting Notes**: Summary, Key Points, Decisions, Action Items, Open Questions
     - **Email**: Subject + professioneller E-Mail-Draft
     - **Prompt erstellen**: Generiert wiederverwendbare LLM-Prompts aus Transkripten
   - Keyword-Extraktion (4-6 Keywords) mit LLM oder Fallback-Algorithmus
   - Temperature: 0.3 (konservativ), Max Tokens: 1200

4. **Actions** (Post-Enrichment)
   - Plugin-artiges Action-System (`lib/actions/`)
   - **Webhook**: Session-Daten (Anreicherung, Keywords, Titel) per POST an konfigurierbare URL senden
   - **Mindmap**: Automatische Mermaid-Mindmap aus Keywords, Notizen und ToDos
   - **Flowchart**: Automatischer Mermaid-Flowchart (graph TD) aus Session-Daten
   - Mermaid-Diagramme mit farbigem Theme, Zoom-Steuerung und Save-Funktion
   - Ergebnisse sind einzeln zu-/aufklappbar
   - Erweiterbar über `registerAction()` Registry

### Komponenten-Übersicht

**Hauptkomponenten:**
- `components/AppShell.tsx` - Container mit Topbar, Sidebar, Hotkey-Handling
- `components/RecorderPanel.tsx` - Aufnahme-Interface (zentraler Mic-Button, Audio-Level)
- `components/SessionView.tsx` - Session-Detail mit Tabs (Enriched/Transcript/Metadata) + ActionPanel
- `components/ActionPanel.tsx` - Action-System UI (Webhook, Mindmap, Flowchart mit Mermaid-Rendering)
- `components/SettingsDialog.tsx` - Umfassende Settings (APIs, Provider, Hotkeys, Privacy)
- `components/SetupWizard.tsx` - Auto-Setup für FFmpeg/Whisper/Ollama (Download & Detection)
- `components/Sidebar.tsx` - Session-Liste mit Suche

**Bibliotheken:**
- `lib/store.tsx` - React Context Store (Sessions, Settings, Actions)
- `lib/processing.ts` - Transkriptions- und Enrichment-Logik
- `lib/audioRecorder.ts` - Audio-Aufnahme mit Web Audio API
- `lib/localApi.ts` - API-Client für Tauri Backend
- `lib/i18n.ts` - Internationalisierung (4 Sprachen)
- `lib/actions/` - Action-System (Registry, Webhook, Mindmap, Flowchart)
- `lib/utils.ts` - Utilities (Hotkey-Matching, Formatierung)

**Tauri Backend:**
- `src-tauri/src/main.rs` - Tauri App-Setup mit Command-Handlers
- `src-tauri/src/local_api.rs` - Axum Web-Server + SQLite (Sessions, Settings, Audio-Storage)
- `src-tauri/src/setup.rs` - Command-Execution (Whisper, Ollama, FFmpeg Detection/Testing)

### Persistenz

**Tauri (Desktop):**
- SQLite-Datenbank: `ai-voice-note.db` (Sessions, Settings)
- Audio-Dateien: `{AppData}/audio/` Verzeichnis
- Settings-Fallback: `ai-voice-note-settings.json`
- Sessions-Fallback: `ai-voice-note-sessions.json`

**Web (Browser):**
- `localStorage` für Settings und Sessions
- Audio als Base64-encoded Blobs (limitiert auf kleinere Dateien)

**Datenschutz:**
- Konfigurierbare Audio-Aufbewahrung (speichern/verwerfen nach Verarbeitung)
- Offline-Modus für komplette Lokalbetrieb
- Keine Telemetrie oder Tracking

## Features

### Core-Funktionalität

✅ **Hotkey-Aktivierung**
- Globale Tastenkombination (Standard: `Ctrl+Shift+R` / `Cmd+Shift+R`)
- Cancel-Hotkey (Standard: `Esc`)
- Anpassbar in Settings
- Verhindert Trigger in Eingabefeldern
- Cross-Platform Key-Handling

✅ **Voice Recording**
- Web Audio API mit MediaRecorder
- Echtzeit Audio-Level Visualization (12-Bar Spektrum)
- Automatische Format-Auswahl (WebM/Opus bevorzugt)
- Echo-Cancellation, Noise-Suppression, Auto-Gain Control
- Mikrofonberechtigungs-Handling
- **Audio-Upload**: Unterstützung für bestehende Audio-Dateien
- **Transcript-Upload**: Direkter Upload von Text/Markdown-Dateien (überspringt Transkription)

✅ **Transkription**
- **Lokal**: whisper.cpp Integration mit Modell-Download
- **Remote**: OpenAI Whisper API, Custom Endpoints
- **Transcript-Import**: Text/Markdown-Dateien hochladen und direkt zum Enrichment springen
- Sprachauswahl: Auto-Detection oder manuell (20+ Sprachen)
- FFmpeg-Konvertierung für Kompatibilität
- Modell-Download via Setup-Wizard

✅ **KI-Enrichment**
- 5 vordefinierte Modi mit editierbaren Prompts (Smart Notes, Tasks, Meeting Notes, Email, Prompt erstellen)
- Keyword-Extraktion (LLM-basiert mit Frequency-Fallback)
- **Provider**:
  - Lokal: Ollama (automatische Erkennung + Modell-Pull)
  - Remote: OpenAI, Google Gemini, Anthropic Claude, xAI Grok
- Multi-API-Key Support (mehrere Keys pro Provider)
- Offline-Modus für Lokalbetrieb

✅ **Action-System (Post-Enrichment)**
- Plugin-artiges System mit Registry-Pattern (`lib/actions/`)
- **Webhook**: Session-Daten (Anreicherung, Keywords) per POST an konfigurierbare URL
- **Mindmap**: Automatische Mermaid-Mindmap-Generierung aus Session-Daten
- **Flowchart**: Automatische Mermaid-Flowchart-Generierung
- Farbiges Mermaid-Theme mit Zoom-Steuerung (25%–300%)
- Ergebnisse einzeln zu-/aufklappbar, als `.mmd` Datei speicherbar
- Erweiterbar: Neue Actions via `registerAction()` hinzufügbar

✅ **Session-Management**
- Persistente Sessions mit Status-Tracking
- Suche und Filterung
- Audio-Preview und Playback
- Export als Text-Datei
- Bulk-Delete und Cleanup

✅ **Setup-Wizard**
- Automatische FFmpeg-Erkennung
- Whisper.cpp Binary-Detection + Download
- Ollama-Setup (Server-Start, Modell-Pull)
- Echtzeit-Logging mit Event-Streaming
- Skip-Option für bereits konfigurierte Tools

✅ **Internationalisierung**
- 4 Sprachen: Deutsch, English, Français, Italiano
- UI-weite Übersetzungen inkl. Fehlermeldungen
- Sprachauswahl in Settings

✅ **Privacy & Offline**
- Konfigurierbare Audio-Speicherung
- Kompletter Offline-Betrieb möglich
- Lokale Datenbank (keine Cloud-Zwang)
- Audio-Cleanup nach Verarbeitung (optional)

### UI/UX-Features

- **App Shell**: Resizable Sidebar mit persistenter Breite
- **Theme**: Hell/Dunkel/System-Sync (via next-themes)
- **Session Cards**: Schneller Überblick (Titel, Dauer, Keywords, Preview)
- **Status Feedback**: Idle → Recording → Processing → Done/Error
- **Error Handling**: Lokalisierte Fehlermeldungen mit Details (Stage, Provider, Endpoint)
- **Kontextabhängige Copy/Save Actions**:
  - **Enriched Tab**: Kopiert/Speichert die KI-Anreicherung
  - **Transcript Tab**: Kopiert/Speichert die Transkription
  - **Metadata Tab**: Kopiert/Speichert vollständiges Dokument (Metadaten + Anreicherung + Transkript)

### Nutzungsszenarien

**Voice Recording & Transkription**
1. Modus wählen (Smart Notes, Tasks, Meeting Notes, Email)
2. Provider auswählen (Whisper/LLM)
3. Aufnahme starten (Mic-Button oder Hotkey)
4. Sprechen
5. Aufnahme stoppen → Automatische Transkription & Anreicherung

**Audio-Upload**
1. "Audio hochladen" Button klicken
2. Audio-Datei auswählen (MP3, WAV, M4A, etc.)
3. Automatische Transkription & Anreicherung

**Transcript-Import (Skip Whisper)**
1. "Transkript hochladen" Button klicken
2. Text- oder Markdown-Datei auswählen
3. Direkter Sprung zur KI-Anreicherung (überspringt Transkription)
4. Ideal für bereits transkribierte Texte oder Meeting-Notizen

**Export-Workflows**
- **Enriched Tab aktiv**: Copy/Save exportiert die KI-Anreicherung
- **Transcript Tab aktiv**: Copy/Save exportiert die reine Transkription
- **Metadata Tab aktiv**: Copy/Save exportiert vollständiges Dokument (Metadaten + Anreicherung + Transkript)

**Actions (nach Anreicherung)**
- Aktionen-Panel unterhalb der Tabs (aufklappbar)
- **Mindmap generieren**: Erzeugt Mermaid-Mindmap, mit Zoom und Speichern
- **Flowchart generieren**: Erzeugt Mermaid-Flowchart, mit Zoom und Speichern
- **Webhook senden**: POST an konfigurierbare URL (Anreicherung + Keywords)

### Konfiguration

**API-Keys** (für Remote-Provider):
- Settings → API Keys → Provider auswählen → Keys hinzufügen
- Unterstützt mehrere Keys pro Provider (automatischer Fallback bei Limit)

**Whisper-Provider**:
- Settings → Whisper → Provider wählen (Local/OpenAI/Other)
- Modell, Sprache, Endpoint konfigurieren

**LLM-Provider**:
- Settings → LLM → Provider wählen (Ollama/OpenAI/Gemini/Claude/Grok/Other)
- Modell, Base-URL, Endpoint konfigurieren

**Enrichment-Prompts**:
- Settings → Enrichments → Modus wählen → Prompt editieren
- Keyword-Prompt anpassbar

**Privacy**:
- Settings → Privacy → Audio-Aufbewahrung konfigurieren
- Offline-Modus aktivieren (deaktiviert Remote-APIs)

### Systemberechtigungen

**macOS/Windows/Linux**:
- Mikrofonzugriff muss in System-Einstellungen erlaubt werden
- Bei Tauri: Benachrichtigungen für Setup-Wizard empfohlen

**Browser**:
- Mikrofonberechtigung wird beim ersten Recording angefragt
- HTTPS erforderlich (außer localhost)

## Design-Entscheidungen

### Architektur

**Hybrid Web/Desktop Approach**
- Next.js als Basis ermöglicht Web-Testing ohne Tauri-Build
- Tauri wrapper für echte Desktop-Integration (Hotkeys, System-Integration)
- Beide Modi nutzen denselben Code (keine Duplikation)
- Graceful Degradation: Web-Version nutzt localStorage, Tauri nutzt SQLite + API-Server

**Lokaler API-Server (Tauri)**
- Axum Server auf Port 3895 (localhost-only für Sicherheit)
- SQLite für strukturierte Daten, Dateisystem für Audio
- Trennung Frontend/Backend auch in Desktop-App (saubere Interfaces)
- Ermöglicht zukünftige Remote-Backend-Anbindung ohne große Refactors

**Provider-Architektur**
- Einheitliche Interfaces für Whisper/LLM (`lib/processing.ts`)
- Einfaches Hinzufügen neuer Provider (nur Endpoint + Header-Mapping)
- Multi-Key Support mit automatischem Fallback
- Local-First: Ollama + whisper.cpp als Offline-Option

**State Management**
- React Context statt Redux/Zustand (ausreichend für App-Scope)
- Zentrale Store-Datei (`lib/store.tsx`) für alle Sessions/Settings/UI
- Debounced Saves (200ms) für Performance
- Optimistic Updates mit Error Rollback

### UI/UX

**Minimalismus & Fokus**
- Viel Whitespace, neutrale Farben (Grau-Palette)
- Ein Akzentton für Primary Actions (Blau)
- Keine visuellen Ablenkungen während Recording
- Klare Status-Kommunikation (Idle/Recording/Processing/Done/Error)

**App Shell Layout**
- **Topbar**: Globale Actions (Settings, Language) + Branding
- **Resizable Sidebar**: Session-Liste, persistent width, kollabierbar
- **Main Content**: RecorderPanel (Idle) oder SessionView (Session ausgewählt)
- Layout-Persistenz über localStorage/Settings

**Recording im Zentrum**
- Zentraler, großer Mic-Button (visueller Fokus)
- Audio-Level Visualisierung direkt um Button herum
- Klare Provider-Auswahl (Whisper/LLM) vor Recording
- Modus-Auswahl (Smart Notes/Tasks/Meeting/Email) integriert
- **Upload-Optionen**:
  - Audio-Upload: Bestehende Audio-Dateien verarbeiten
  - Transcript-Upload: Text/Markdown-Dateien direkt zum Enrichment senden (Skip Whisper)

**Sessions als Cards**
- Schneller Überblick: Titel, Dauer, Keywords, Timestamp
- Preview der ersten Zeilen (Enriched oder Transcript)
- Status-Badge (Done/Error/Processing)
- Hover-Actions: Play, Delete

**Outputs via Tabs**
- **Enriched**: Strukturierte KI-Anreicherung (primärer Output)
- **Transcript**: Reine Transkription (Fallback, Verifikation)
- **Metadata**: Technische Details (Provider, Dauer, Keywords, Timestamps)
- **Kontextabhängige Copy/Save Buttons**:
  - Buttons passen sich automatisch dem aktiven Tab an
  - Enriched Tab → kopiert/speichert nur Enrichment
  - Transcript Tab → kopiert/speichert nur Transkript
  - Metadata Tab → kopiert/speichert vollständiges Dokument
  - Intuitive UX: Copy/Save bezieht sich immer auf das aktuell Sichtbare

**Settings Struktur**
- **General**: Sprache, Theme, Hotkeys, Audio-Devices
- **API Keys**: Multi-Provider, Multi-Key Support, sicheres Masking
- **Whisper**: Provider, Modell, Sprache, Endpoint
- **LLM**: Provider, Modell, Base-URL, Endpoint
- **Enrichments**: 4 Modi mit editierbaren Prompts, Keyword-Prompt
- **Privacy**: Audio-Aufbewahrung, Offline-Modus
- Accordion-Layout für Übersichtlichkeit

**Setup-Wizard**
- Progressive Steps: FFmpeg → Whisper → Ollama
- Automatische Detection mit Skip-Option
- Echtzeit-Logging (Event-Streaming vom Backend)
- Download-Progress für Modelle
- Retry-Logik bei Fehlern

### Technische Entscheidungen

**Next.js App Router**
- Server Components für statische Teile
- Client Components für interaktive Logik
- Einfaches Routing (single-page für App Shell)

**TypeScript**
- Strikte Typisierung für alle Komponenten/Functions
- Interfaces für Store, Session, Settings
- Type-Safety für Tauri Commands

**TailwindCSS + shadcn/ui**
- Utility-First CSS (schnelle Entwicklung)
- Radix UI Primitives (Accessibility, Keyboard-Navigation)
- Konsistente Design-Tokens
- Dark Mode Support out-of-the-box

**Audio via Web Audio API**
- MediaRecorder für Browser-native Recording
- AnalyserNode für Echtzeit-Pegel (FFT-basiert)
- AudioContext für Low-Latency Metering
- Format-Fallbacks (WebM → MP4 → OGG)

**Error Handling**
- Lokalisierte Fehlermeldungen (per i18n)
- Error-Details: Stage, Provider, Endpoint (Debugging)
- Graceful Degradation: Keyword-Fallback bei LLM-Fehler
- Retry-Mechanismus für Netzwerk-Fehler
- Validation bei Eingaben (API-Keys, Endpoints)

**Internationalisierung**
- i18next für alle UI-Texte
- Sprach-Dateien in `locales/*.json`
- Lazy-Loading per Sprache
- Fallback zu EN bei fehlenden Übersetzungen
- Plural-Support, Variable-Interpolation

**Performance**
- Lazy-Loading für Audio-Blobs (nicht alle Sessions laden Audio sofort)
- Debounced Search (300ms)
- Debounced Saves (200ms)
- Virtualisierung für lange Session-Listen (zukünftig bei >100 Sessions)
- Web Worker für Audio-Processing (zukünftig)

**Security**
- API-Keys nur im Memory/Settings (nicht in UI-Logs)
- CORS-restricted API (localhost-only für Tauri-Server)
- Input-Sanitization für Prompts (LLM-Injection-Protection)
- Keine Telemetrie oder Tracking
- Audio-Files optional nach Verarbeitung löschen

### Warum Tauri statt Electron?

- **Kleinere Bundle-Size**: ~10-20MB vs. ~100-200MB (kein Chromium-Bundle)
- **Weniger RAM**: Nutzt System-WebView statt eingebettetem Browser
- **Rust Backend**: Bessere Performance für Whisper/FFmpeg-Integration
- **Native Installers**: DMG, MSI, AppImage out-of-the-box
- **Modernes Tooling**: Vite-basiert, schnelle Dev-Builds

### Zukünftige Erweiterungen (nicht implementiert)

- **Cloud-Sync**: Session-Sync über Remote-Backend
- **Collaborative Sessions**: Mehrere User annotieren dieselbe Aufnahme
- **Speaker Diarization**: Erkennung verschiedener Sprecher
- **Custom Enrichment Modes**: User-defined Modi mit Template-System
- **Plugins**: Weitere Actions via `registerAction()` (Grundlage bereits implementiert)
- **Mobile App**: React Native Companion (Session-Viewer)
- **Browser Extension**: Quick-Capture von beliebigen Tabs

## Projektstruktur

```
ai-voice-note/
├── app/                          # Next.js App Router
│   ├── globals.css              # Globale Styles + Tailwind
│   ├── layout.tsx               # Root Layout (i18n, Theme Provider)
│   └── page.tsx                 # Main Page (App Shell)
│
├── components/                   # React Components
│   ├── AppShell.tsx             # Container (Topbar + Sidebar + Main)
│   ├── RecorderPanel.tsx        # Recording Interface
│   ├── SessionView.tsx          # Session Detail (Tabs: Enriched/Transcript/Metadata)
│   ├── ActionPanel.tsx          # Action-System UI (Webhook, Mindmap, Flowchart)
│   ├── SettingsDialog.tsx       # Settings (Multi-Provider Config)
│   ├── SetupWizard.tsx          # Setup für FFmpeg/Whisper/Ollama
│   ├── Sidebar.tsx              # Session List + Search
│   ├── AudioPreview.tsx         # Audio Playback Component
│   └── ui/                      # shadcn/ui Components (Button, Dialog, Tabs, etc.)
│
├── lib/                          # Bibliotheken & Business Logic
│   ├── store.tsx                # React Context Store (Sessions, Settings, Actions)
│   ├── processing.ts            # Transcription & Enrichment Logic
│   ├── audioRecorder.ts         # Web Audio API Recording
│   ├── localApi.ts              # API Client (Tauri Backend)
│   ├── i18n.ts                  # Internationalisierung
│   ├── utils.ts                 # Utilities (Hotkey-Matching, Formatierung)
│   ├── icons.tsx                # Icon Mapping (Provider → Lucide Icons)
│   ├── export.ts                # File Export (Text Download)
│   └── actions/                 # Action-System (Plugin-artig)
│       ├── index.ts             # Registriert alle Actions, Re-Exports
│       ├── types.ts             # ActionDefinition, ActionResult, Artifact Types
│       ├── registry.ts          # registerAction(), getActions(), getActionById()
│       ├── webhookAction.ts     # POST Session-Daten an konfigurierbare URL
│       ├── mindmapAction.ts     # Mermaid Mindmap aus Session-Daten
│       └── flowchartAction.ts   # Mermaid Flowchart aus Session-Daten
│
├── locales/                      # i18n JSON Files
│   ├── de.json                  # Deutsch
│   ├── en.json                  # English
│   ├── fr.json                  # Français
│   └── it.json                  # Italiano
│
├── src-tauri/                    # Tauri Backend (Rust)
│   ├── src/
│   │   ├── main.rs              # App Setup + Command Handlers
│   │   ├── local_api.rs         # Axum Server + SQLite (Sessions, Settings, Audio)
│   │   └── setup.rs             # Command Execution (Whisper, Ollama, FFmpeg)
│   ├── Cargo.toml               # Rust Dependencies
│   └── tauri.conf.json          # Tauri Config (Permissions, Identifier, etc.)
│
├── public/                       # Static Assets
├── package.json                  # npm Dependencies + Scripts
├── tsconfig.json                # TypeScript Config
├── tailwind.config.ts           # Tailwind CSS Config
├── next.config.js               # Next.js Config (Static Export für Tauri)
└── README.md                    # Dieses Dokument
```

## Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## Credits

Entwickelt mit:
- [Next.js](https://nextjs.org/)
- [Tauri](https://tauri.app/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- [Ollama](https://ollama.ai/)
