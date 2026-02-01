#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod local_api;
mod setup;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      setup::detect_command,
      setup::detect_ffmpeg,
      setup::test_ffmpeg,
      setup::run_command,
      setup::detect_ollama,
      setup::start_ollama_serve,
      setup::pull_ollama_model,
      setup::test_ollama_generate,
      setup::transcribe_local_whisper,
      setup::download_whisper_model
    ])
    .setup(|app| {
      local_api::start(app.handle());
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
