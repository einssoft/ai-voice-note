module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/locales/de.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"app.title":"ai voice note","app.theme":"Theme","app.settings":"Einstellungen","sidebar.title":"Deine Notizen","sidebar.new":"Neu","sidebar.search":"Suchen","sidebar.empty":"Keine Sessions gefunden.","sidebar.previewEmpty":"Noch kein Inhalt.","recorder.ready":"Bereit zur Aufnahme","recorder.recording":"Aufnahme läuft...","recorder.pressHotkey":"Drücke {hotkey}","recorder.live":"Live | {duration}","recorder.upload":"Audio hochladen","processing.title":"Session wird verarbeitet","processing.subtitle":"Bitte dieses Fenster geöffnet lassen.","processing.audioPreview":"Audio-Vorschau","steps.recording":"Aufnahme","steps.transcribing":"Transkribieren","steps.enriching":"Anreichern","error.title":"Etwas ist schiefgelaufen","error.fallback":"Die Session konnte nicht verarbeitet werden. Prüfe die Provider-Einstellungen und versuche es erneut.","error.retry":"Erneut versuchen","error.report":"Melden","error.details":"Details","tabs.enriched":"Anreicherung","tabs.transcript":"Transkript","tabs.metadata":"Metadaten","buttons.copy":"Kopieren","buttons.copyMarkdown":"Markdown kopieren","buttons.save":"Speichern...","buttons.openFolder":"Ordner öffnen","buttons.cancel":"Abbrechen","buttons.saveSettings":"Speichern","feedback.copied":"In Zwischenablage kopiert.","feedback.copiedMarkdown":"Markdown kopiert.","feedback.copyFailed":"Kopieren fehlgeschlagen.","feedback.saved":"Datei gespeichert.","feedback.saveFailed":"Speichern fehlgeschlagen.","feedback.openFolderFailed":"Ordner kann hier nicht geöffnet werden.","metadata.created":"Erstellt","metadata.duration":"Dauer","metadata.mode":"Modus","metadata.whisper":"Whisper","metadata.llm":"LLM","metadata.keywords":"Keywords","metadata.audio":"Audio","metadata.noAudio":"Kein Audio vorhanden","settings.title":"Einstellungen","settings.description":"Passe Erscheinungsbild, Provider und Prompt-Vorlagen an.","settings.tabs.general":"Allgemein","settings.tabs.api":"API Keys","settings.tabs.enrichments":"Anreicherungen","settings.general.appearance":"Erscheinungsbild","settings.general.theme":"Theme","settings.general.language":"Sprache","settings.general.hotkey":"Hotkey","settings.general.hotkeyLabel":"Globaler Hotkey","settings.api.whisperTitle":"Whisper (Transkription)","settings.api.provider":"Provider","settings.api.apiKey":"API Key","settings.api.endpoint":"Endpoint (optional)","settings.api.language":"Sprache","settings.api.llmTitle":"LLM (Anreicherung)","settings.api.model":"Modell","settings.api.baseUrl":"Base URL (optional)","settings.privacy.title":"Privacy Mode","settings.privacy.offline":"Offline-first (kein Netzwerk)","settings.privacy.storeAudio":"Audio lokal speichern","settings.enrichments.title":"Prompt-Vorlagen","settings.enrichments.description":"Verwalte Ausgabe-Templates und Prompts für die Transkript-Anreicherung.","settings.enrichments.add":"Enrichment hinzufügen","settings.enrichments.name":"Name","settings.enrichments.icon":"Icon","settings.enrichments.prompt":"Prompt","settings.enrichments.delete":"Löschen","settings.enrichments.empty":"Noch keine Enrichments.","settings.enrichments.newName":"Neues Enrichment","settings.keywords.title":"Keywords","settings.keywords.description":"Prompt für die Keyword-Extraktion per LLM.","settings.keywords.prompt":"Keyword-Prompt","settings.keywords.reset":"Auf Standard zurücksetzen","theme.system":"System","theme.light":"Hell","theme.dark":"Dunkel","language.de":"Deutsch","language.en":"Englisch","language.fr":"Französisch","language.it":"Italienisch","language.auto":"Auto","provider.local":"Local","provider.openai":"OpenAI","provider.gemini":"Gemini","provider.claude":"Claude","provider.grok":"Grok","provider.whisperOpenAI":"OpenAI Whisper API","provider.whisperOther":"Other","enrichment.smart":"Smart Notes","enrichment.tasks":"Aufgabenliste","enrichment.meeting":"Meeting-Notizen","enrichment.email":"E-Mail Entwurf","enrichment.prompt.smart":"Erstelle Smart Notes mit:\\n- Kurze Zusammenfassung\\n- Entscheidungen\\n- Naechste Schritte","enrichment.prompt.tasks":"Extrahiere alle Aufgaben und To-dos als kurze Liste. Halte jeden Punkt knapp.","enrichment.prompt.meeting":"Erstelle strukturierte Meeting-Notizen:\\n- Zusammenfassung\\n- Kernthemen\\n- Entscheidungen\\n- Action Items","enrichment.prompt.email":"Erstelle eine kurze, professionelle E-Mail basierend auf dem Transkript. Fuege eine Betreffzeile hinzu.","keywords.defaultPrompt":"Extrahiere 4-6 praegnante Keywords oder kurze Schluesselphrasen aus dem Transkript. Gib ausschließlich ein JSON-Array von Strings zurueck.","common.untitled":"Ohne Titel","aria.sessionTitle":"Session-Titel","aria.searchSessions":"Sessions durchsuchen","aria.deleteNote":"Notiz löschen","aria.toggleTheme":"Theme wechseln","aria.pause":"Pause","aria.play":"Abspielen","aria.seekAudio":"Audio suchen","aria.startRecording":"Aufnahme starten","aria.stopRecording":"Aufnahme stoppen","aria.resizeSidebar":"Seitenleiste anpassen","aria.close":"Schließen","errors.microphoneUnsupported":"Mikrofonzugriff wird in dieser Umgebung nicht unterstützt.","errors.microphoneDenied":"Mikrofonzugriff wurde verweigert. Bitte erlaube den Zugriff und versuche es erneut.","errors.noAudioCaptured":"Kein Audio erfasst. Bitte Mikrofon prüfen.","errors.recordingError":"Beim Aufnehmen ist ein Fehler aufgetreten.","errors.audioRetryUnavailable":"Audio-Datei für den Retry nicht verfügbar.","errors.audioTooLarge":"Audio-Datei ist größer als 25MB. Bitte kürzer aufnehmen.","errors.offlineMode":"Offline-Modus ist aktiv. Deaktiviere ihn für Cloud-Verarbeitung.","errors.localTranscription":"Lokale Transkription ist nicht konfiguriert.","errors.localLlm":"Lokales LLM ist nicht konfiguriert.","errors.missingWhisperKey":"Whisper API-Key fehlt in den Einstellungen.","errors.missingLlmKey":"LLM API-Key fehlt in den Einstellungen.","errors.customWhisperEndpointRequired":"Custom Whisper Endpoint ist erforderlich.","errors.baseUrlRequired":"Base URL ist für Nicht-OpenAI-Provider erforderlich.","errors.noTranscript":"Kein Transkript zum Anreichern vorhanden.","errors.audioBlobMissingDetails":"Audio-Daten nicht gefunden. Bitte erneut aufnehmen oder Datei neu hochladen.","errors.transcriptionFailed":"Transkription fehlgeschlagen.","errors.enrichmentFailed":"Anreicherung fehlgeschlagen.","file.defaultName":"voice-note","errorDetails.stage":"Phase","errorDetails.whisperProvider":"Whisper-Provider","errorDetails.llmProvider":"LLM-Provider","errorDetails.whisperEndpoint":"Whisper-Endpoint","errorDetails.llmBaseUrl":"LLM Base URL","errorDetails.message":"Meldung","placeholder.apiKey":"sk-...","placeholder.endpoint":"https://api.example.com","placeholder.baseUrl":"https://api.example.com","settings.enrichments.reset":"Auf Standard zurücksetzen","settings.source.label":"Quelle","settings.source.tauri":"Tauri","settings.source.local":"LocalStorage","settings.source.default":"Standard"});}),
"[project]/locales/en.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"app.title":"ai voice note","app.theme":"Theme","app.settings":"Settings","sidebar.title":"Your Notes","sidebar.new":"New","sidebar.search":"Search","sidebar.empty":"No sessions found.","sidebar.previewEmpty":"No content yet.","recorder.ready":"Ready to record","recorder.recording":"Recording...","recorder.pressHotkey":"Press {hotkey}","recorder.live":"Live | {duration}","recorder.upload":"Upload audio","processing.title":"Processing session","processing.subtitle":"Please keep this window open.","processing.audioPreview":"Audio preview","steps.recording":"Recording","steps.transcribing":"Transcribing","steps.enriching":"Enriching","error.title":"Something went wrong","error.fallback":"The session could not be processed. Check your provider settings and try again.","error.retry":"Retry","error.report":"Report","error.details":"Details","tabs.enriched":"Enriched","tabs.transcript":"Transcript","tabs.metadata":"Metadata","buttons.copy":"Copy","buttons.copyMarkdown":"Copy Markdown","buttons.save":"Save...","buttons.openFolder":"Open Folder","buttons.cancel":"Cancel","buttons.saveSettings":"Save","feedback.copied":"Copied to clipboard.","feedback.copiedMarkdown":"Markdown copied.","feedback.copyFailed":"Copy failed.","feedback.saved":"File saved.","feedback.saveFailed":"Save failed.","feedback.openFolderFailed":"Open folder not supported here.","metadata.created":"Created","metadata.duration":"Duration","metadata.mode":"Mode","metadata.whisper":"Whisper","metadata.llm":"LLM","metadata.keywords":"Keywords","metadata.audio":"Audio","metadata.noAudio":"No audio captured","settings.title":"Settings","settings.description":"Configure appearance, providers, and enrichment templates.","settings.tabs.general":"General","settings.tabs.api":"API Keys","settings.tabs.enrichments":"Enrichments","settings.general.appearance":"Appearance","settings.general.theme":"Theme","settings.general.language":"Language","settings.general.hotkey":"Hotkey","settings.general.hotkeyLabel":"Global Hotkey","settings.api.whisperTitle":"Whisper (Transcription)","settings.api.provider":"Provider","settings.api.apiKey":"API Key","settings.api.endpoint":"Endpoint (optional)","settings.api.language":"Language","settings.api.llmTitle":"LLM (Enrichment)","settings.api.model":"Model","settings.api.baseUrl":"Base URL (optional)","settings.privacy.title":"Privacy Mode","settings.privacy.offline":"Offline-first (no network)","settings.privacy.storeAudio":"Store audio files locally","settings.enrichments.title":"Prompt Templates","settings.enrichments.description":"Manage output templates and prompts for transcript enrichment.","settings.enrichments.add":"Add enrichment","settings.enrichments.name":"Name","settings.enrichments.icon":"Icon","settings.enrichments.prompt":"Prompt","settings.enrichments.delete":"Delete","settings.enrichments.empty":"No enrichments yet.","settings.enrichments.newName":"New enrichment","settings.keywords.title":"Keywords","settings.keywords.description":"Prompt for LLM-based keyword extraction.","settings.keywords.prompt":"Keyword prompt","settings.keywords.reset":"Reset to defaults","theme.system":"System","theme.light":"Light","theme.dark":"Dark","language.de":"Deutsch","language.en":"English","language.fr":"Français","language.it":"Italiano","language.auto":"Auto","provider.local":"Local","provider.openai":"OpenAI","provider.gemini":"Gemini","provider.claude":"Claude","provider.grok":"Grok","provider.whisperOpenAI":"OpenAI Whisper API","provider.whisperOther":"Other","enrichment.smart":"Smart Notes","enrichment.tasks":"Tasks","enrichment.meeting":"Meeting Notes","enrichment.email":"Email Draft","enrichment.prompt.smart":"Create smart notes with:\\n- Short summary\\n- Decisions\\n- Next steps","enrichment.prompt.tasks":"Extract all action items and tasks as a short bullet list. Keep each item concise.","enrichment.prompt.meeting":"Create well-structured meeting notes:\\n- Summary\\n- Key points\\n- Decisions\\n- Action items","enrichment.prompt.email":"Draft a concise professional email based on the transcript. Include a subject line.","keywords.defaultPrompt":"Extract 4-6 concise keywords or short key phrases from the transcript. Return only a JSON array of strings.","common.untitled":"Untitled","aria.sessionTitle":"Session title","aria.searchSessions":"Search sessions","aria.deleteNote":"Delete note","aria.toggleTheme":"Toggle theme","aria.pause":"Pause","aria.play":"Play","aria.seekAudio":"Seek audio","aria.startRecording":"Start recording","aria.stopRecording":"Stop recording","aria.resizeSidebar":"Resize sidebar","aria.close":"Close","errors.microphoneUnsupported":"Microphone access is not supported in this environment.","errors.microphoneDenied":"Microphone access was denied. Please allow access and try again.","errors.noAudioCaptured":"No audio captured. Please check microphone input.","errors.recordingError":"Recording error occurred.","errors.audioRetryUnavailable":"Audio file not available for retry.","errors.audioTooLarge":"Audio file is larger than 25MB. Please record a shorter clip.","errors.offlineMode":"Offline mode is enabled. Disable it to use cloud processing.","errors.localTranscription":"Local transcription is not configured.","errors.localLlm":"Local LLM is not configured.","errors.missingWhisperKey":"Missing Whisper API key in Settings.","errors.missingLlmKey":"Missing LLM API key in Settings.","errors.customWhisperEndpointRequired":"Custom Whisper endpoint is required.","errors.baseUrlRequired":"Base URL is required for non-OpenAI providers.","errors.noTranscript":"No transcript to enrich.","errors.audioBlobMissingDetails":"Audio blob not found. Try recording again or re-upload the file.","errors.transcriptionFailed":"Transcription failed.","errors.enrichmentFailed":"Enrichment failed.","file.defaultName":"voice-note","errorDetails.stage":"Stage","errorDetails.whisperProvider":"Whisper provider","errorDetails.llmProvider":"LLM provider","errorDetails.whisperEndpoint":"Whisper endpoint","errorDetails.llmBaseUrl":"LLM base URL","errorDetails.message":"Message","placeholder.apiKey":"sk-...","placeholder.endpoint":"https://api.example.com","placeholder.baseUrl":"https://api.example.com","settings.enrichments.reset":"Reset to defaults","settings.source.label":"Source","settings.source.tauri":"Tauri","settings.source.local":"LocalStorage","settings.source.default":"Defaults"});}),
"[project]/locales/fr.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"app.title":"ai voice note","app.theme":"Thème","app.settings":"Paramètres","sidebar.title":"Vos notes","sidebar.new":"Nouveau","sidebar.search":"Rechercher","sidebar.empty":"Aucune session trouvée.","sidebar.previewEmpty":"Pas encore de contenu.","recorder.ready":"Prêt à enregistrer","recorder.recording":"Enregistrement...","recorder.pressHotkey":"Appuyez sur {hotkey}","recorder.live":"Live | {duration}","recorder.upload":"Téléverser l’audio","processing.title":"Traitement de la session","processing.subtitle":"Veuillez garder cette fenêtre ouverte.","processing.audioPreview":"Aperçu audio","steps.recording":"Enregistrement","steps.transcribing":"Transcription","steps.enriching":"Enrichissement","error.title":"Une erreur est survenue","error.fallback":"La session n’a pas pu être traitée. Vérifiez les paramètres du fournisseur et réessayez.","error.retry":"Réessayer","error.report":"Signaler","error.details":"Détails","tabs.enriched":"Enrichi","tabs.transcript":"Transcription","tabs.metadata":"Métadonnées","buttons.copy":"Copier","buttons.copyMarkdown":"Copier en Markdown","buttons.save":"Enregistrer...","buttons.openFolder":"Ouvrir le dossier","buttons.cancel":"Annuler","buttons.saveSettings":"Enregistrer","feedback.copied":"Copié dans le presse‑papiers.","feedback.copiedMarkdown":"Markdown copié.","feedback.copyFailed":"Échec de la copie.","feedback.saved":"Fichier enregistré.","feedback.saveFailed":"Échec de l’enregistrement.","feedback.openFolderFailed":"Ouverture du dossier non prise en charge ici.","metadata.created":"Créé","metadata.duration":"Durée","metadata.mode":"Mode","metadata.whisper":"Whisper","metadata.llm":"LLM","metadata.keywords":"Mots‑clés","metadata.audio":"Audio","metadata.noAudio":"Aucun audio enregistré","settings.title":"Paramètres","settings.description":"Configurez l’apparence, les fournisseurs et les modèles d’enrichissement.","settings.tabs.general":"Général","settings.tabs.api":"Clés API","settings.tabs.enrichments":"Enrichissements","settings.general.appearance":"Apparence","settings.general.theme":"Thème","settings.general.language":"Langue","settings.general.hotkey":"Raccourci","settings.general.hotkeyLabel":"Raccourci global","settings.api.whisperTitle":"Whisper (Transcription)","settings.api.provider":"Fournisseur","settings.api.apiKey":"Clé API","settings.api.endpoint":"Endpoint (optionnel)","settings.api.language":"Langue","settings.api.llmTitle":"LLM (Enrichissement)","settings.api.model":"Modèle","settings.api.baseUrl":"Base URL (optionnel)","settings.privacy.title":"Mode confidentialité","settings.privacy.offline":"Hors ligne (pas de réseau)","settings.privacy.storeAudio":"Stocker l’audio localement","settings.enrichments.title":"Modèles de prompt","settings.enrichments.description":"Gérez les modèles de sortie et les prompts pour l’enrichissement du transcript.","settings.enrichments.add":"Ajouter un enrichissement","settings.enrichments.name":"Nom","settings.enrichments.icon":"Icône","settings.enrichments.prompt":"Prompt","settings.enrichments.delete":"Supprimer","settings.enrichments.empty":"Aucun enrichissement pour le moment.","settings.enrichments.newName":"Nouvel enrichissement","settings.keywords.title":"Mots-clés","settings.keywords.description":"Prompt pour l’extraction de mots-clés par LLM.","settings.keywords.prompt":"Prompt de mots-clés","settings.keywords.reset":"Réinitialiser par défaut","theme.system":"Système","theme.light":"Clair","theme.dark":"Sombre","language.de":"Allemand","language.en":"Anglais","language.fr":"Français","language.it":"Italien","language.auto":"Auto","provider.local":"Local","provider.openai":"OpenAI","provider.gemini":"Gemini","provider.claude":"Claude","provider.grok":"Grok","provider.whisperOpenAI":"OpenAI Whisper API","provider.whisperOther":"Autre","enrichment.smart":"Notes intelligentes","enrichment.tasks":"Tâches","enrichment.meeting":"Notes de réunion","enrichment.email":"Brouillon d’e‑mail","enrichment.prompt.smart":"Crée des notes intelligentes avec :\\n- Résumé court\\n- Décisions\\n- Prochaines étapes","enrichment.prompt.tasks":"Extrait toutes les actions et tâches sous forme de liste concise.","enrichment.prompt.meeting":"Crée des notes de réunion structurées :\\n- Résumé\\n- Points clés\\n- Décisions\\n- Actions","enrichment.prompt.email":"Rédige un e‑mail professionnel concis basé sur la transcription. Inclure un objet.","keywords.defaultPrompt":"Extrait 4 à 6 mots-clés concis ou courtes expressions du transcript. Renvoyer uniquement un tableau JSON de chaînes.","common.untitled":"Sans titre","aria.sessionTitle":"Titre de la session","aria.searchSessions":"Rechercher des sessions","aria.deleteNote":"Supprimer la note","aria.toggleTheme":"Basculer le thème","aria.pause":"Pause","aria.play":"Lire","aria.seekAudio":"Rechercher dans l’audio","aria.startRecording":"Démarrer l’enregistrement","aria.stopRecording":"Arrêter l’enregistrement","aria.resizeSidebar":"Redimensionner la barre latérale","aria.close":"Fermer","errors.microphoneUnsupported":"L’accès au micro n’est pas pris en charge dans cet environnement.","errors.microphoneDenied":"Accès au micro refusé. Autorisez l’accès et réessayez.","errors.noAudioCaptured":"Aucun audio capturé. Vérifiez le micro.","errors.recordingError":"Erreur lors de l’enregistrement.","errors.audioRetryUnavailable":"Fichier audio indisponible pour la relance.","errors.audioTooLarge":"Le fichier audio dépasse 25 Mo. Enregistrez un clip plus court.","errors.offlineMode":"Le mode hors ligne est activé. Désactivez‑le pour le traitement cloud.","errors.localTranscription":"La transcription locale n’est pas configurée.","errors.localLlm":"Le LLM local n’est pas configuré.","errors.missingWhisperKey":"Clé API Whisper manquante dans les paramètres.","errors.missingLlmKey":"Clé API LLM manquante dans les paramètres.","errors.customWhisperEndpointRequired":"Un endpoint Whisper personnalisé est requis.","errors.baseUrlRequired":"La Base URL est requise pour les fournisseurs non‑OpenAI.","errors.noTranscript":"Aucune transcription à enrichir.","errors.audioBlobMissingDetails":"Audio introuvable. Réenregistrez ou rechargez le fichier.","errors.transcriptionFailed":"Transcription échouée.","errors.enrichmentFailed":"Enrichissement échoué.","file.defaultName":"voice-note","errorDetails.stage":"Étape","errorDetails.whisperProvider":"Fournisseur Whisper","errorDetails.llmProvider":"Fournisseur LLM","errorDetails.whisperEndpoint":"Endpoint Whisper","errorDetails.llmBaseUrl":"Base URL LLM","errorDetails.message":"Message","placeholder.apiKey":"sk-...","placeholder.endpoint":"https://api.example.com","placeholder.baseUrl":"https://api.example.com","settings.enrichments.reset":"Réinitialiser par défaut","settings.source.label":"Source","settings.source.tauri":"Tauri","settings.source.local":"LocalStorage","settings.source.default":"Par défaut"});}),
"[project]/locales/it.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"app.title":"ai voice note","app.theme":"Tema","app.settings":"Impostazioni","sidebar.title":"Le tue note","sidebar.new":"Nuova","sidebar.search":"Cerca","sidebar.empty":"Nessuna sessione trovata.","sidebar.previewEmpty":"Nessun contenuto per ora.","recorder.ready":"Pronto a registrare","recorder.recording":"Registrazione...","recorder.pressHotkey":"Premi {hotkey}","recorder.live":"Live | {duration}","recorder.upload":"Carica audio","processing.title":"Elaborazione sessione","processing.subtitle":"Tieni questa finestra aperta.","processing.audioPreview":"Anteprima audio","steps.recording":"Registrazione","steps.transcribing":"Trascrizione","steps.enriching":"Arricchimento","error.title":"Qualcosa è andato storto","error.fallback":"La sessione non può essere elaborata. Controlla le impostazioni del provider e riprova.","error.retry":"Riprova","error.report":"Segnala","error.details":"Dettagli","tabs.enriched":"Arricchito","tabs.transcript":"Trascrizione","tabs.metadata":"Metadati","buttons.copy":"Copia","buttons.copyMarkdown":"Copia Markdown","buttons.save":"Salva...","buttons.openFolder":"Apri cartella","buttons.cancel":"Annulla","buttons.saveSettings":"Salva","feedback.copied":"Copiato negli appunti.","feedback.copiedMarkdown":"Markdown copiato.","feedback.copyFailed":"Copia non riuscita.","feedback.saved":"File salvato.","feedback.saveFailed":"Salvataggio non riuscito.","feedback.openFolderFailed":"Apertura cartella non supportata qui.","metadata.created":"Creato","metadata.duration":"Durata","metadata.mode":"Modalità","metadata.whisper":"Whisper","metadata.llm":"LLM","metadata.keywords":"Parole chiave","metadata.audio":"Audio","metadata.noAudio":"Nessun audio registrato","settings.title":"Impostazioni","settings.description":"Configura aspetto, provider e modelli di arricchimento.","settings.tabs.general":"Generale","settings.tabs.api":"API Keys","settings.tabs.enrichments":"Arricchimenti","settings.general.appearance":"Aspetto","settings.general.theme":"Tema","settings.general.language":"Lingua","settings.general.hotkey":"Scorciatoia","settings.general.hotkeyLabel":"Scorciatoia globale","settings.api.whisperTitle":"Whisper (Trascrizione)","settings.api.provider":"Provider","settings.api.apiKey":"API Key","settings.api.endpoint":"Endpoint (opzionale)","settings.api.language":"Lingua","settings.api.llmTitle":"LLM (Arricchimento)","settings.api.model":"Modello","settings.api.baseUrl":"Base URL (opzionale)","settings.privacy.title":"Modalità privacy","settings.privacy.offline":"Offline-first (nessuna rete)","settings.privacy.storeAudio":"Salva audio localmente","settings.enrichments.title":"Modelli di prompt","settings.enrichments.description":"Gestisci i template di output e i prompt per l’arricchimento del transcript.","settings.enrichments.add":"Aggiungi arricchimento","settings.enrichments.name":"Nome","settings.enrichments.icon":"Icona","settings.enrichments.prompt":"Prompt","settings.enrichments.delete":"Elimina","settings.enrichments.empty":"Nessun arricchimento al momento.","settings.enrichments.newName":"Nuovo arricchimento","settings.keywords.title":"Parole chiave","settings.keywords.description":"Prompt per l’estrazione di parole chiave tramite LLM.","settings.keywords.prompt":"Prompt parole chiave","settings.keywords.reset":"Ripristina predefiniti","theme.system":"Sistema","theme.light":"Chiaro","theme.dark":"Scuro","language.de":"Tedesco","language.en":"Inglese","language.fr":"Francese","language.it":"Italiano","language.auto":"Auto","provider.local":"Local","provider.openai":"OpenAI","provider.gemini":"Gemini","provider.claude":"Claude","provider.grok":"Grok","provider.whisperOpenAI":"OpenAI Whisper API","provider.whisperOther":"Altro","enrichment.smart":"Smart Notes","enrichment.tasks":"Attività","enrichment.meeting":"Note riunione","enrichment.email":"Bozza email","enrichment.prompt.smart":"Crea note intelligenti con:\\n- Breve sintesi\\n- Decisioni\\n- Prossimi passi","enrichment.prompt.tasks":"Estrai tutte le attività e i to‑do come elenco conciso.","enrichment.prompt.meeting":"Crea note di riunione strutturate:\\n- Sintesi\\n- Punti chiave\\n- Decisioni\\n- Azioni","enrichment.prompt.email":"Redigi un’e‑mail professionale concisa basata sulla trascrizione. Includi un oggetto.","keywords.defaultPrompt":"Estrai 4-6 parole chiave concise o brevi frasi dal transcript. Restituisci solo un array JSON di stringhe.","common.untitled":"Senza titolo","aria.sessionTitle":"Titolo sessione","aria.searchSessions":"Cerca sessioni","aria.deleteNote":"Elimina nota","aria.toggleTheme":"Cambia tema","aria.pause":"Pausa","aria.play":"Riproduci","aria.seekAudio":"Cerca audio","aria.startRecording":"Avvia registrazione","aria.stopRecording":"Ferma registrazione","aria.resizeSidebar":"Ridimensiona barra laterale","aria.close":"Chiudi","errors.microphoneUnsupported":"L’accesso al microfono non è supportato in questo ambiente.","errors.microphoneDenied":"Accesso al microfono negato. Consenti l’accesso e riprova.","errors.noAudioCaptured":"Nessun audio catturato. Verifica il microfono.","errors.recordingError":"Si è verificato un errore di registrazione.","errors.audioRetryUnavailable":"File audio non disponibile per il retry.","errors.audioTooLarge":"Il file audio supera i 25MB. Registra un clip più corto.","errors.offlineMode":"La modalità offline è attiva. Disattivala per la lavorazione cloud.","errors.localTranscription":"La trascrizione locale non è configurata.","errors.localLlm":"Il LLM locale non è configurato.","errors.missingWhisperKey":"Chiave API Whisper mancante nelle impostazioni.","errors.missingLlmKey":"Chiave API LLM mancante nelle impostazioni.","errors.customWhisperEndpointRequired":"È richiesto un endpoint Whisper personalizzato.","errors.baseUrlRequired":"Base URL richiesta per provider non‑OpenAI.","errors.noTranscript":"Nessuna trascrizione da arricchire.","errors.audioBlobMissingDetails":"Audio non trovato. Registra di nuovo o ricarica il file.","errors.transcriptionFailed":"Trascrizione non riuscita.","errors.enrichmentFailed":"Arricchimento non riuscito.","file.defaultName":"voice-note","errorDetails.stage":"Fase","errorDetails.whisperProvider":"Provider Whisper","errorDetails.llmProvider":"Provider LLM","errorDetails.whisperEndpoint":"Endpoint Whisper","errorDetails.llmBaseUrl":"Base URL LLM","errorDetails.message":"Messaggio","placeholder.apiKey":"sk-...","placeholder.endpoint":"https://api.example.com","placeholder.baseUrl":"https://api.example.com","settings.enrichments.reset":"Ripristina predefiniti","settings.source.label":"Origine","settings.source.tauri":"Tauri","settings.source.local":"LocalStorage","settings.source.default":"Predefiniti"});}),
"[project]/lib/i18n.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMessages",
    ()=>getMessages,
    "messages",
    ()=>messages,
    "supportedLocales",
    ()=>supportedLocales,
    "t",
    ()=>t,
    "toIntlLocale",
    ()=>toIntlLocale,
    "useI18n",
    ()=>useI18n
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$de$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/de.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$en$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/en.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$fr$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/fr.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$it$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/it.json (json)");
"use client";
;
;
;
;
const messages = {
    de: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$de$2e$json__$28$json$29$__["default"],
    en: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$en$2e$json__$28$json$29$__["default"],
    fr: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$fr$2e$json__$28$json$29$__["default"],
    it: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$it$2e$json__$28$json$29$__["default"]
};
const supportedLocales = [
    "de",
    "en",
    "fr",
    "it"
];
const fallbackLocale = "en";
function getMessages(locale) {
    return messages[locale || fallbackLocale] ?? messages[fallbackLocale];
}
function t(localeMessages, key, vars) {
    const template = localeMessages[key] ?? messages[fallbackLocale][key] ?? key;
    if (!vars) return template;
    return Object.keys(vars).reduce((acc, varKey)=>acc.replaceAll(`{${varKey}}`, String(vars[varKey])), template);
}
function toIntlLocale(locale) {
    switch(locale){
        case "de":
            return "de-DE";
        case "fr":
            return "fr-FR";
        case "it":
            return "it-IT";
        case "en":
        default:
            return "en-US";
    }
}
function useI18n(locale) {
    const localeMessages = getMessages(locale);
    const translate = (key, vars)=>t(localeMessages, key, vars);
    return {
        t: translate,
        messages: localeMessages
    };
}
}),
"[project]/lib/mock.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultEnrichmentIds",
    ()=>defaultEnrichmentIds,
    "generateMockContent",
    ()=>generateMockContent,
    "getDefaultEnrichments",
    ()=>getDefaultEnrichments,
    "getDefaultKeywordsPrompt",
    ()=>getDefaultKeywordsPrompt,
    "seedSessions",
    ()=>seedSessions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-ssr] (ecmascript)");
;
const defaultEnrichmentIds = [
    "smart",
    "tasks",
    "meeting",
    "email"
];
function getDefaultEnrichments(locale = "de") {
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale);
    return [
        {
            id: "smart",
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.smart"),
            icon: "Sparkles",
            prompt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.prompt.smart")
        },
        {
            id: "tasks",
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.tasks"),
            icon: "ListChecks",
            prompt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.prompt.tasks")
        },
        {
            id: "meeting",
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.meeting"),
            icon: "NotebookPen",
            prompt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.prompt.meeting")
        },
        {
            id: "email",
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.email"),
            icon: "Mail",
            prompt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "enrichment.prompt.email")
        }
    ];
}
function getDefaultKeywordsPrompt(locale = "de") {
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "keywords.defaultPrompt");
}
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
}),
"[project]/lib/audioRecorder.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/processing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "enrichTranscript",
    ()=>enrichTranscript,
    "extractKeywords",
    ()=>extractKeywords,
    "transcribeAudio",
    ()=>transcribeAudio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-ssr] (ecmascript)");
"use client";
;
const OPENAI_BASE_URL = "https://api.openai.com";
const OPENAI_WHISPER_MODEL = "whisper-1";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const KEYWORD_LIMIT = 6;
const DEFAULT_KEYWORD_PROMPT = "Extract 4-6 concise keywords or short key phrases from the transcript. Avoid filler words.";
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
function normalizeKeywords(list, limit = KEYWORD_LIMIT) {
    const seen = new Set();
    const result = [];
    for (const raw of list){
        const cleaned = raw.replace(/^[\s\-*•]+/g, "").replace(/^[\"'“”‘’]+|[\"'“”‘’]+$/g, "").trim();
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
function parseKeywords(text, limit = KEYWORD_LIMIT) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return normalizeKeywords(parsed.map((item)=>String(item)), limit);
            }
        } catch  {
        // fall through to heuristic parsing
        }
    }
    const candidates = trimmed.split(/[\n,;]+/).map((value)=>value.trim()).filter(Boolean);
    return normalizeKeywords(candidates, limit);
}
function extractKeywords(text, limit = 4) {
    const tokens = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((token)=>token.length > 2 && !STOPWORDS.has(token));
    const counts = new Map();
    tokens.forEach((token)=>counts.set(token, (counts.get(token) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b)=>b[1] - a[1]).slice(0, limit).map(([token])=>token);
}
async function transcribeAudio(blob, settings) {
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(settings.general.language);
    if (settings.privacy.offline) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.offlineMode"));
    }
    if (settings.api.whisper.provider === "Local") {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.localTranscription"));
    }
    if (settings.api.whisper.provider === "Other" && !settings.api.whisper.endpoint.trim()) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.customWhisperEndpointRequired"));
    }
    if (!settings.api.whisper.apiKey) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.missingWhisperKey"));
    }
    if (blob.size > MAX_AUDIO_BYTES) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.audioTooLarge"));
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
            Authorization: `Bearer ${settings.api.whisper.apiKey}`
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
async function generateKeywords(transcript, prompt, settings) {
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(settings.general.language);
    const fallbackPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "keywords.defaultPrompt");
    const endpoint = resolveEndpoint(settings.api.llm.baseUrl, "/v1/responses");
    const systemPrompt = (prompt?.trim() || fallbackPrompt || DEFAULT_KEYWORD_PROMPT) + "\n\nReturn only a JSON array of strings. Respond in the same language as the transcript.";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${settings.api.llm.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: settings.api.llm.model || "gpt-4o-mini",
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
            temperature: 0.2,
            max_output_tokens: 200
        })
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
async function enrichTranscript(transcript, prompt, settings) {
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(settings.general.language);
    if (!transcript.trim()) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.noTranscript"));
    }
    if (settings.privacy.offline) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.offlineMode"));
    }
    if (settings.api.llm.provider === "Local") {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.localLlm"));
    }
    if (!settings.api.llm.apiKey) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.missingLlmKey"));
    }
    if (settings.api.llm.provider !== "OpenAI" && !settings.api.llm.baseUrl.trim()) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errors.baseUrlRequired"));
    }
    const endpoint = resolveEndpoint(settings.api.llm.baseUrl, "/v1/responses");
    const systemPrompt = (prompt || getModePrompt("smart")) + "\n\nRespond in the same language as the transcript.";
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${settings.api.llm.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: settings.api.llm.model || "gpt-4o-mini",
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
        keywords: await (async ()=>{
            try {
                return await generateKeywords(transcript, settings.keywordsPrompt, settings);
            } catch  {
                return extractKeywords(transcript, KEYWORD_LIMIT);
            }
        })()
    };
}
}),
"[project]/lib/store.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppStoreProvider",
    ()=>AppStoreProvider,
    "useAppStore",
    ()=>useAppStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioRecorder$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audioRecorder.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/processing.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const defaultSettings = {
    general: {
        language: "de",
        theme: "system",
        hotkey: "Ctrl+Shift+R"
    },
    api: {
        whisper: {
            provider: "Local",
            apiKey: "",
            endpoint: "",
            language: "Auto"
        },
        llm: {
            provider: "Local",
            model: "gpt-4o-mini",
            apiKey: "",
            baseUrl: ""
        }
    },
    privacy: {
        offline: false,
        storeAudio: true
    },
    enrichments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultEnrichments"])("de"),
    keywordsPrompt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDefaultKeywordsPrompt"])("de")
};
const SETTINGS_KEY = "vi-settings";
const SESSIONS_KEY = "vi-sessions";
const SETTINGS_FILE = "ai-voice-note-settings.json";
const SESSIONS_FILE = "ai-voice-note-sessions.json";
const LEGACY_SETTINGS_FILE = "voice-intelligence-settings.json";
const LEGACY_SESSIONS_FILE = "voice-intelligence-sessions.json";
const isTauri = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
const AUDIO_DIR = "audio";
const AUDIO_EXTENSION_BY_MIME = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav"
};
const AUDIO_MIME_BY_EXTENSION = {
    webm: "audio/webm",
    ogg: "audio/ogg",
    mp4: "audio/mp4",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav"
};
const BASE64_SUFFIX = ".b64";
const BASE64_CHUNK_SIZE = 0x8000;
function resolveAudioExtension(mime) {
    const normalized = (mime || "").toLowerCase();
    if (AUDIO_EXTENSION_BY_MIME[normalized]) return AUDIO_EXTENSION_BY_MIME[normalized];
    if (normalized.startsWith("audio/")) {
        const suffix = normalized.replace("audio/", "");
        if (suffix) return suffix;
    }
    return "webm";
}
function resolveAudioMime(path, fallback) {
    const parts = path.split(".");
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    return AUDIO_MIME_BY_EXTENSION[ext] ?? fallback ?? "audio/webm";
}
function encodeBase64(bytes) {
    let binary = "";
    for(let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE){
        const chunk = bytes.slice(i, i + BASE64_CHUNK_SIZE);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}
function decodeBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i += 1){
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
async function ensureAudioDir(dir) {
    if (!isTauri()) return;
    //TURBOPACK unreachable
    ;
}
async function writeBinaryAudio(filename, buffer, dir) {
    const { writeFile, BaseDirectory } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@tauri-apps+plugin-fs@2.4.5/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-ssr] (ecmascript, async loader)");
    await ensureAudioDir(dir);
    const base = dir === "AppConfig" ? BaseDirectory.AppConfig : BaseDirectory.AppData;
    await writeFile({
        path: filename,
        contents: buffer
    }, {
        dir: base
    });
}
async function writeBase64Audio(filename, buffer) {
    const { writeTextFile, BaseDirectory } = await __turbopack_context__.A("[project]/node_modules/.pnpm/@tauri-apps+plugin-fs@2.4.5/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-ssr] (ecmascript, async loader)");
    await ensureAudioDir("AppConfig");
    const base64 = encodeBase64(buffer);
    await writeTextFile(filename + BASE64_SUFFIX, base64, {
        dir: BaseDirectory.AppConfig
    });
    return filename + BASE64_SUFFIX;
}
async function persistAudioBlob(sessionId, blob) {
    if (!isTauri()) return null;
    //TURBOPACK unreachable
    ;
}
async function readAudioBlob(path, mime) {
    if (!isTauri()) return null;
    //TURBOPACK unreachable
    ;
}
async function removeAudioFile(path) {
    if (!isTauri()) return;
    //TURBOPACK unreachable
    ;
}
async function getAudioDuration(blob) {
    if (typeof Audio === "undefined") return 0;
    return new Promise((resolve)=>{
        const audio = new Audio();
        const url = URL.createObjectURL(blob);
        let settled = false;
        let timeoutId = 0;
        const cleanup = ()=>{
            window.clearTimeout(timeoutId);
            audio.removeEventListener("loadedmetadata", handleLoaded);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("error", handleError);
            URL.revokeObjectURL(url);
        };
        const finish = (value)=>{
            if (settled) return;
            settled = true;
            cleanup();
            resolve(value);
        };
        timeoutId = window.setTimeout(()=>finish(0), 4000);
        const handleTimeUpdate = ()=>{
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
                finish(audio.duration);
            }
        };
        const handleLoaded = ()=>{
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
                finish(audio.duration);
                return;
            }
            audio.addEventListener("timeupdate", handleTimeUpdate);
            audio.currentTime = 1e101;
        };
        const handleError = ()=>finish(0);
        audio.addEventListener("loadedmetadata", handleLoaded);
        audio.addEventListener("error", handleError);
        audio.preload = "metadata";
        audio.src = url;
    });
}
async function resolveAudioDurationSec(blob, fallback = 0) {
    const duration = await getAudioDuration(blob);
    const rounded = Number.isFinite(duration) ? Math.round(duration) : 0;
    return Math.max(fallback, rounded);
}
async function readFromTauri(filename) {
    if (!isTauri()) return null;
    //TURBOPACK unreachable
    ;
}
async function writeToTauri(filename, contents) {
    if (!isTauri()) return;
    //TURBOPACK unreachable
    ;
}
function safeParseJson(value, fallback) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch  {
        return fallback;
    }
}
function normalizeSettings(input) {
    const legacy = input ?? {};
    const general = legacy.general ?? {};
    const api = legacy.api ?? {};
    const keywordsPrompt = legacy.keywordsPrompt ?? legacy.keywords?.prompt ?? defaultSettings.keywordsPrompt;
    return {
        general: {
            language: general.language ?? legacy.language ?? defaultSettings.general.language,
            theme: general.theme ?? legacy.theme ?? defaultSettings.general.theme,
            hotkey: general.hotkey ?? legacy.hotkey ?? defaultSettings.general.hotkey
        },
        api: {
            whisper: {
                provider: api.whisper?.provider ?? legacy.whisper?.provider ?? defaultSettings.api.whisper.provider,
                apiKey: api.whisper?.apiKey ?? legacy.whisper?.apiKey ?? defaultSettings.api.whisper.apiKey,
                endpoint: api.whisper?.endpoint ?? legacy.whisper?.endpoint ?? defaultSettings.api.whisper.endpoint,
                language: api.whisper?.language ?? legacy.whisper?.language ?? defaultSettings.api.whisper.language
            },
            llm: {
                provider: api.llm?.provider ?? legacy.llm?.provider ?? defaultSettings.api.llm.provider,
                model: api.llm?.model ?? legacy.llm?.model ?? defaultSettings.api.llm.model,
                apiKey: api.llm?.apiKey ?? legacy.llm?.apiKey ?? defaultSettings.api.llm.apiKey,
                baseUrl: api.llm?.baseUrl ?? legacy.llm?.baseUrl ?? defaultSettings.api.llm.baseUrl
            }
        },
        privacy: {
            offline: legacy.privacy?.offline ?? defaultSettings.privacy.offline,
            storeAudio: legacy.privacy?.storeAudio ?? defaultSettings.privacy.storeAudio
        },
        enrichments: Array.isArray(legacy.enrichments) && legacy.enrichments.length ? legacy.enrichments : defaultSettings.enrichments,
        keywordsPrompt
    };
}
function localizeError(message, locale) {
    const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale);
    const map = {
        "Microphone access is not supported in this environment.": "errors.microphoneUnsupported",
        "Microphone access was denied. Please allow access and try again.": "errors.microphoneDenied",
        "Microphone access denied. Please allow microphone access to record audio.": "errors.microphoneDenied",
        "No audio captured. Please check microphone input.": "errors.noAudioCaptured",
        "Recording error occurred": "errors.recordingError",
        "Audio file not available for retry.": "errors.audioRetryUnavailable"
    };
    const key = map[message];
    return key ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, key) : message;
}
const StoreContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
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
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedSessions"]);
    const [activeSessionId, setActiveSessionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultSettings.enrichments[0]?.id ?? "smart");
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultSettings);
    const [settingsSource, setSettingsSource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("default");
    const [isHydrated, setIsHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [recordingLevel, setRecordingLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const hasLoadedSessions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const hasUserUpdatedSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const hasUserModifiedSessions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const recorderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recordingSessionIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioBlobsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    const sessionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(sessions);
    const settingsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(settings);
    const modeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(mode);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let active = true;
        const load = async ()=>{
            const localSettingsKey = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
            const localSettingsRaw = safeParseJson(localSettingsKey, defaultSettings);
            const localSessions = safeParseJson(("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedSessions"]);
            const tauriSettingsRaw = await readFromTauri(SETTINGS_FILE) ?? await readFromTauri(LEGACY_SETTINGS_FILE);
            const tauriSessionsRaw = await readFromTauri(SESSIONS_FILE) ?? await readFromTauri(LEGACY_SESSIONS_FILE);
            const tauriSettings = safeParseJson(tauriSettingsRaw, localSettingsRaw);
            const tauriSessions = safeParseJson(tauriSessionsRaw, localSessions);
            const loadedSettings = normalizeSettings(tauriSettingsRaw ? tauriSettings : localSettingsRaw);
            const resolvedSource = tauriSettingsRaw ? "tauri" : ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "default";
            const loadedSessions = tauriSessionsRaw ? tauriSessions : localSessions;
            if (!active) return;
            if (!hasUserUpdatedSettings.current) {
                setSettings(loadedSettings);
            }
            if (!hasUserModifiedSessions.current) {
                setSessions(loadedSessions.length ? loadedSessions : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedSessions"]);
            }
            setSettingsSource(resolvedSource);
            hasLoadedSessions.current = true;
            setIsHydrated(true);
        };
        void load();
        return ()=>{
            active = false;
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        sessionsRef.current = sessions;
    }, [
        sessions
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        settingsRef.current = settings;
    }, [
        settings
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        modeRef.current = mode;
    }, [
        mode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!activeSessionId) return;
        const session = getSessionById(activeSessionId);
        if (!session?.audioPath || session.audioUrl) return;
        let active = true;
        void (async ()=>{
            const blob = await readAudioBlob(session.audioPath, session.audioMime);
            if (!active) return;
            if (!blob) {
                updateSession(session.id, {
                    audioPath: undefined,
                    audioMime: undefined
                });
                return;
            }
            setAudioBlob(session.id, blob);
            const url = URL.createObjectURL(blob);
            const updates = {
                audioUrl: url,
                audioMime: session.audioMime ?? blob.type
            };
            if (session.metadata.durationSec <= 0) {
                const durationSec = await resolveAudioDurationSec(blob, 0);
                if (durationSec > 0) {
                    updates.metadata = {
                        ...session.metadata,
                        durationSec
                    };
                }
            }
            updateSession(session.id, updates);
        })();
        return ()=>{
            active = false;
        };
    }, [
        activeSessionId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!settings.enrichments.length) return;
        if (!settings.enrichments.some((item)=>item.id === mode)) {
            setMode(settings.enrichments[0].id);
        }
    }, [
        settings.enrichments,
        mode
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isHydrated && !hasUserUpdatedSettings.current) return;
        const payload = JSON.stringify(settings);
        try {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        } catch  {
        // ignore
        }
        void writeToTauri(SETTINGS_FILE, payload);
        applyTheme(settings.general.theme);
    }, [
        settings,
        isHydrated
    ]);
    const createSession = (partial)=>{
        const newSession = {
            id: getRandomId(),
            title: "",
            createdAt: new Date().toISOString(),
            mode,
            status: "idle",
            transcript: "",
            enriched: "",
            audioUrl: undefined,
            metadata: {
                durationSec: 0,
                keywords: [],
                whisperProvider: settings.api.whisper.provider,
                llmProvider: settings.api.llm.provider
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
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
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
            const next = prev.map((session)=>{
                if (session.id !== id) return session;
                if ("audioUrl" in updates && session.audioUrl && session.audioUrl !== updates.audioUrl) {
                    try {
                        URL.revokeObjectURL(session.audioUrl);
                    } catch  {
                    // ignore
                    }
                }
                return {
                    ...session,
                    ...updates
                };
            });
            const serializable = next.map(({ audioUrl, ...rest })=>rest);
            try {
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
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
        const messages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(settingsSnapshot.general.language);
        const stageLabel = stage === "transcribing" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "steps.transcribing") : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "steps.enriching");
        const lines = [
            `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errorDetails.stage")}: ${stageLabel}`,
            `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errorDetails.whisperProvider")}: ${settingsSnapshot.api.whisper.provider}`,
            `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errorDetails.llmProvider")}: ${settingsSnapshot.api.llm.provider}`
        ];
        if (stage === "transcribing") {
            lines.push(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errorDetails.whisperEndpoint")}: ${settingsSnapshot.api.whisper.endpoint || "default"}`);
        } else {
            lines.push(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errorDetails.llmBaseUrl")}: ${settingsSnapshot.api.llm.baseUrl || "default"}`);
        }
        lines.push(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])(messages, "errorDetails.message")}: ${message}`);
        return lines.join("\n");
    };
    const getActiveSession = ()=>sessions.find((session)=>session.id === activeSessionId) ?? null;
    const processAudio = async (sessionId, blob, durationSec)=>{
        const settingsSnapshot = settingsRef.current;
        const sessionSnapshot = getSessionById(sessionId);
        const sessionMode = sessionSnapshot?.mode ?? modeRef.current;
        const template = settingsSnapshot.enrichments.find((item)=>item.id === sessionMode) ?? settingsSnapshot.enrichments[0];
        const baseMetadata = sessionSnapshot?.metadata ?? {
            durationSec: 0,
            keywords: [],
            whisperProvider: settingsSnapshot.api.whisper.provider,
            llmProvider: settingsSnapshot.api.llm.provider
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
                whisperProvider: settingsSnapshot.api.whisper.provider,
                llmProvider: settingsSnapshot.api.llm.provider
            }
        });
        let transcript = "";
        try {
            transcript = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transcribeAudio"])(blob, settingsSnapshot);
            updateSession(sessionId, {
                transcript,
                stage: "enriching",
                errorMessage: undefined,
                errorDetails: undefined
            });
        } catch (error) {
            const locale = settingsSnapshot.general.language;
            const fallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale), "errors.transcriptionFailed");
            const message = error instanceof Error ? localizeError(error.message, locale) : fallback;
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
            const { enriched, keywords } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["enrichTranscript"])(transcript, template?.prompt || "", settingsSnapshot);
            updateSession(sessionId, {
                status: "done",
                stage: undefined,
                enriched,
                errorMessage: undefined,
                errorDetails: undefined,
                metadata: {
                    ...baseMetadata,
                    durationSec,
                    keywords: keywords.length ? keywords : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$processing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extractKeywords"])(transcript, 6),
                    whisperProvider: settingsSnapshot.api.whisper.provider,
                    llmProvider: settingsSnapshot.api.llm.provider
                }
            });
        } catch (error) {
            const locale = settingsSnapshot.general.language;
            const fallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale), "errors.enrichmentFailed");
            const message = error instanceof Error ? localizeError(error.message, locale) : fallback;
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
            if (existing?.audioPath) {
                void removeAudioFile(existing.audioPath);
            }
            clearAudioBlob(id);
            setSessions((prev)=>{
                const next = prev.filter((session)=>session.id !== id);
                const serializable = next.map(({ audioUrl, ...rest })=>rest);
                try {
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
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
                const locale = settingsRef.current.general.language;
                createSession({
                    status: "error",
                    title: "",
                    errorMessage: localizeError("Microphone access is not supported in this environment.", locale)
                });
                return;
            }
            try {
                cleanupRecorder();
                const active = getActiveSession();
                const sessionId = active && active.status === "idle" && !active.transcript && !active.enriched ? active.id : createSession({
                    status: "recording",
                    recordingStartedAt: Date.now(),
                    title: ""
                }).id;
                if (active && active.id === sessionId) {
                    updateSession(active.id, {
                        status: "recording",
                        recordingStartedAt: Date.now(),
                        mode,
                        errorMessage: undefined,
                        metadata: {
                            ...active.metadata,
                            whisperProvider: settings.api.whisper.provider,
                            llmProvider: settings.api.llm.provider
                        }
                    });
                }
                recordingSessionIdRef.current = sessionId;
                const recorder = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audioRecorder$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AudioRecorder"]();
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
                        const persisted = await persistAudioBlob(targetId, blob);
                        const url = URL.createObjectURL(blob);
                        updateSession(targetId, {
                            audioUrl: url,
                            audioPath: persisted?.path,
                            audioMime: persisted?.mime ?? blob.type,
                            errorMessage: undefined,
                            errorDetails: undefined
                        });
                    } else {
                        updateSession(targetId, {
                            audioUrl: undefined,
                            audioPath: undefined,
                            audioMime: undefined,
                            errorMessage: undefined,
                            errorDetails: undefined
                        });
                    }
                    const currentSession = getSessionById(targetId);
                    const elapsed = currentSession?.recordingStartedAt ? Math.max(0, Math.floor((Date.now() - currentSession.recordingStartedAt) / 1000)) : 0;
                    const durationSec = await resolveAudioDurationSec(blob, elapsed);
                    await processAudio(targetId, blob, durationSec);
                    cleanupRecorder();
                });
                recorder.setOnError((error)=>{
                    const targetId = recordingSessionIdRef.current ?? sessionId;
                    if (targetId) {
                        const locale = settingsRef.current.general.language;
                        const message = localizeError(error.message, locale);
                        updateSession(targetId, {
                            status: "error",
                            errorMessage: message,
                            errorDetails: buildErrorDetails("transcribing", settingsRef.current, message)
                        });
                    }
                    cleanupRecorder();
                });
                recorder.setOnLevel((level)=>{
                    setRecordingLevel((prev)=>Math.abs(prev - level) > 0.02 ? level : prev);
                });
                await recorder.startRecording();
            } catch (error) {
                const locale = settingsRef.current.general.language;
                const raw = error instanceof Error ? error.message : "Microphone access was denied. Please allow access and try again.";
                const message = localizeError(raw, locale);
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
                        title: "",
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
        uploadAudio: async (file)=>{
            if (!file) return;
            const session = createSession({
                status: "processing",
                stage: "transcribing",
                title: file.name || "Audio Upload"
            });
            setAudioBlob(session.id, file);
            if (settingsRef.current.privacy.storeAudio) {
                const persisted = await persistAudioBlob(session.id, file);
                const url = URL.createObjectURL(file);
                updateSession(session.id, {
                    audioUrl: url,
                    audioPath: persisted?.path,
                    audioMime: persisted?.mime ?? file.type
                });
            }
            const durationSec = await resolveAudioDurationSec(file, 0);
            void processAudio(session.id, file, durationSec);
        },
        retryProcessing: async ()=>{
            const active = getActiveSession();
            if (!active) return;
            let blob = audioBlobsRef.current[active.id];
            if (!blob && active.audioPath) {
                blob = await readAudioBlob(active.audioPath, active.audioMime) ?? undefined;
                if (blob) {
                    setAudioBlob(active.id, blob);
                    if (!active.audioUrl) {
                        const url = URL.createObjectURL(blob);
                        updateSession(active.id, {
                            audioUrl: url,
                            audioMime: active.audioMime ?? blob.type
                        });
                    }
                }
            }
            if (!blob) {
                const locale = settingsRef.current.general.language;
                updateSession(active.id, {
                    status: "error",
                    stage: undefined,
                    errorMessage: localizeError("Audio file not available for retry.", locale),
                    errorDetails: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["t"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale), "errors.audioBlobMissingDetails")
                });
                return;
            }
            const durationSec = active.metadata.durationSec || await resolveAudioDurationSec(blob, 0);
            void processAudio(active.id, blob, durationSec);
        },
        updateSessionTitle: (id, title)=>updateSession(id, {
                title: title.trim() ? title : ""
            }),
        updateSettings: async (nextSettings)=>{
            hasUserUpdatedSettings.current = true;
            const normalized = normalizeSettings(nextSettings);
            setSettings(normalized);
            setSettingsSource(isTauri() ? "TURBOPACK unreachable" : "local");
            const payload = JSON.stringify(normalized);
            try {
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            } catch  {
            // ignore
            }
            void writeToTauri(SETTINGS_FILE, payload);
        },
        toggleTheme: ()=>{
            setSettings((prev)=>({
                    ...prev,
                    general: {
                        ...prev.general,
                        theme: prev.general.theme === "dark" ? "light" : "dark"
                    }
                }));
        }
    };
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            state: {
                sessions,
                activeSessionId,
                searchQuery,
                mode,
                settings,
                settingsSource,
                recordingLevel
            },
            actions
        }), [
        sessions,
        activeSessionId,
        searchQuery,
        mode,
        settings,
        settingsSource,
        recordingLevel
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StoreContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/store.tsx",
        lineNumber: 1075,
        columnNumber: 10
    }, this);
}
function useAppStore() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(StoreContext);
    if (!context) {
        throw new Error("useAppStore must be used within AppStoreProvider");
    }
    return context;
}
}),
"[project]/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProviders",
    ()=>AppProviders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function AppProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppStoreProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.28.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7cfc9ea3._.js.map