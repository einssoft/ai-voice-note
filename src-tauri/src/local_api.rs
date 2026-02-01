use std::net::SocketAddr;
use std::path::{Path as StdPath, PathBuf};
use std::process::Command;
use std::sync::{Arc, Mutex};

use axum::{
  body::Bytes,
  extract::{Path, State, DefaultBodyLimit},
  http::{HeaderMap, StatusCode},
  response::IntoResponse,
  routing::{get, post},
  Json, Router,
};
use rusqlite::{params, Connection};
use serde_json::{json, Value};
use tower_http::cors::{Any, CorsLayer};

use tauri::{AppHandle, Manager};

const LOCAL_API_PORT: u16 = 3895;

#[derive(Clone)]
struct AppState {
  app: AppHandle,
  db: Arc<Mutex<Connection>>,
  base_url: String,
  audio_dir: PathBuf,
}

pub fn start(app: &AppHandle) {
  let state = match init_state(app) {
    Ok(state) => state,
    Err(err) => {
      eprintln!("local api init failed: {err}");
      return;
    }
  };

  tauri::async_runtime::spawn(async move {
    let app = Router::new()
      .route("/health", get(health))
      .route("/settings", get(get_settings).put(put_settings))
      .route("/sessions", get(list_sessions))
      .route(
        "/sessions/:id",
        get(get_session).put(put_session).delete(delete_session),
      )
      .route("/audio/:id", post(upload_audio).get(get_audio))
      .layer(DefaultBodyLimit::max(30 * 1024 * 1024))
      .layer(
        CorsLayer::new()
          .allow_origin(Any)
          .allow_methods(Any)
          .allow_headers(Any),
      )
      .with_state(state.clone());

    let addr = SocketAddr::from(([127, 0, 0, 1], LOCAL_API_PORT));
    match tokio::net::TcpListener::bind(addr).await {
      Ok(listener) => {
        if let Err(err) = axum::serve(listener, app).await {
          eprintln!("local api server error: {err}");
        }
      }
      Err(err) => {
        eprintln!("local api bind error: {err}");
      }
    }
  });
}

fn init_state(app: &AppHandle) -> Result<AppState, String> {
  let data_dir = app
    .path()
    .app_data_dir()
    .map_err(|err| err.to_string())?;
  std::fs::create_dir_all(&data_dir).map_err(|err| err.to_string())?;
  let audio_dir = data_dir.join("audio");
  std::fs::create_dir_all(&audio_dir).map_err(|err| err.to_string())?;

  let db_path = data_dir.join("ai-voice-note.db");
  let conn = Connection::open(db_path).map_err(|err| err.to_string())?;
  conn
    .execute(
      "CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), json TEXT NOT NULL);",
      [],
    )
    .map_err(|err| err.to_string())?;
  conn
    .execute(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, json TEXT NOT NULL, audio_path TEXT, audio_mime TEXT, updated_at TEXT);",
      [],
    )
    .map_err(|err| err.to_string())?;

  Ok(AppState {
    app: app.clone(),
    db: Arc::new(Mutex::new(conn)),
    base_url: format!("http://127.0.0.1:{LOCAL_API_PORT}"),
    audio_dir,
  })
}

async fn health() -> impl IntoResponse {
  Json(json!({ "ok": true, "version": "0.1.0" }))
}

async fn get_settings(State(state): State<AppState>) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let result: Result<String, _> =
    conn.query_row("SELECT json FROM settings WHERE id = 1;", [], |row| row.get(0));
  match result {
    Ok(json_str) => match serde_json::from_str::<Value>(&json_str) {
      Ok(value) => Json(value).into_response(),
      Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    },
    Err(_) => Json(json!({})).into_response(),
  }
}

async fn put_settings(State(state): State<AppState>, Json(payload): Json<Value>) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let json_str = match serde_json::to_string(&payload) {
    Ok(value) => value,
    Err(_) => return StatusCode::BAD_REQUEST.into_response(),
  };
  if conn
    .execute(
      "INSERT INTO settings (id, json) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json;",
      [json_str],
    )
    .is_err()
  {
    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
  }
  StatusCode::NO_CONTENT.into_response()
}

async fn list_sessions(State(state): State<AppState>) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let mut stmt = match conn.prepare(
    "SELECT id, json, audio_path, audio_mime FROM sessions ORDER BY updated_at DESC;",
  ) {
    Ok(stmt) => stmt,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let rows = match stmt.query_map([], |row| {
    let id: String = row.get(0)?;
    let json_str: String = row.get(1)?;
    let audio_path: Option<String> = row.get(2)?;
    let audio_mime: Option<String> = row.get(3)?;
    Ok((id, json_str, audio_path, audio_mime))
  }) {
    Ok(rows) => rows,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };

  let mut sessions: Vec<Value> = Vec::new();
  for row in rows.flatten() {
    let (id, json_str, audio_path, audio_mime) = row;
    let mut value = serde_json::from_str::<Value>(&json_str).unwrap_or_else(|_| json!({ "id": id }));
    attach_audio_info(&mut value, &state.base_url, &id, audio_path, audio_mime);
    sessions.push(value);
  }
  Json(sessions).into_response()
}

async fn get_session(Path(id): Path<String>, State(state): State<AppState>) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let result: Result<(String, Option<String>, Option<String>), _> = conn.query_row(
    "SELECT json, audio_path, audio_mime FROM sessions WHERE id = ?;",
    [id.clone()],
    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
  );
  match result {
    Ok((json_str, audio_path, audio_mime)) => {
      let mut value =
        serde_json::from_str::<Value>(&json_str).unwrap_or_else(|_| json!({ "id": id }));
      attach_audio_info(&mut value, &state.base_url, &id, audio_path, audio_mime);
      Json(value).into_response()
    }
    Err(_) => StatusCode::NOT_FOUND.into_response(),
  }
}

async fn put_session(
  Path(id): Path<String>,
  State(state): State<AppState>,
  Json(payload): Json<Value>,
) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let json_str = match serde_json::to_string(&payload) {
    Ok(value) => value,
    Err(_) => return StatusCode::BAD_REQUEST.into_response(),
  };
  let result = conn.execute(
    "INSERT INTO sessions (id, json, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at;",
    params![id, json_str],
  );
  if result.is_err() {
    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
  }
  StatusCode::NO_CONTENT.into_response()
}

async fn delete_session(Path(id): Path<String>, State(state): State<AppState>) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let audio_path: Option<String> = conn
    .query_row(
      "SELECT audio_path FROM sessions WHERE id = ?;",
      [id.clone()],
      |row| row.get(0),
    )
    .ok()
    .flatten();
  let _ = conn.execute("DELETE FROM sessions WHERE id = ?;", [id]);
  if let Some(path) = audio_path {
    let target = state.audio_dir.join(path);
    let _ = std::fs::remove_file(target);
  }
  StatusCode::NO_CONTENT.into_response()
}

async fn upload_audio(
  Path(id): Path<String>,
  State(state): State<AppState>,
  headers: HeaderMap,
  body: Bytes,
) -> impl IntoResponse {
  let mime = headers
    .get("content-type")
    .and_then(|value| value.to_str().ok())
    .unwrap_or("application/octet-stream")
    .to_string();
  let extension = extension_for_mime(&mime);
  let filename = format!("{id}.{extension}");
  let target = state.audio_dir.join(&filename);
  if let Err(err) = std::fs::write(&target, body) {
    eprintln!("audio write failed: {err}");
    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
  }

  let (final_filename, final_mime) =
    maybe_convert_audio(&state, &id, &target, &mime).unwrap_or((filename.clone(), mime.clone()));
  if final_filename != filename {
    let _ = std::fs::remove_file(&target);
  }

  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let result = conn.execute(
    "INSERT INTO sessions (id, json, audio_path, audio_mime, updated_at) VALUES (?, ?, ?, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET audio_path = excluded.audio_path, audio_mime = excluded.audio_mime, updated_at = excluded.updated_at;",
    params![id, "{}", final_filename, final_mime],
  );
  if result.is_err() {
    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
  }

  StatusCode::NO_CONTENT.into_response()
}

async fn get_audio(Path(id): Path<String>, State(state): State<AppState>) -> impl IntoResponse {
  let conn = match state.db.lock() {
    Ok(conn) => conn,
    Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
  };
  let result: Result<(String, Option<String>), _> = conn.query_row(
    "SELECT audio_path, audio_mime FROM sessions WHERE id = ?;",
    [id.clone()],
    |row| Ok((row.get(0)?, row.get(1)?)),
  );
  let (mut audio_path, mut audio_mime) = match result {
    Ok((path, mime)) => (path, mime),
    Err(_) => return StatusCode::NOT_FOUND.into_response(),
  };
  if let Some(mime) = audio_mime.clone() {
    if needs_conversion(&mime) {
      let original_target = state.audio_dir.join(&audio_path);
      if let Some((converted_path, converted_mime)) =
        maybe_convert_audio(&state, &id, &original_target, &mime)
      {
        audio_path = converted_path;
        audio_mime = Some(converted_mime);
        if let Ok(conn) = state.db.lock() {
          let _ = conn.execute(
            "UPDATE sessions SET audio_path = ?, audio_mime = ?, updated_at = datetime('now') WHERE id = ?;",
            params![audio_path, audio_mime, id.clone()],
          );
        }
        let _ = std::fs::remove_file(original_target);
      }
    }
  }
  let target = state.audio_dir.join(audio_path);
  let data = match std::fs::read(target) {
    Ok(data) => data,
    Err(_) => return StatusCode::NOT_FOUND.into_response(),
  };
  let mime = audio_mime.unwrap_or_else(|| "application/octet-stream".to_string());
  (
    StatusCode::OK,
    [(axum::http::header::CONTENT_TYPE, mime)],
    data,
  )
    .into_response()
}

fn attach_audio_info(
  value: &mut Value,
  base_url: &str,
  id: &str,
  audio_path: Option<String>,
  audio_mime: Option<String>,
) {
  if let Some(obj) = value.as_object_mut() {
    obj.remove("audioPath");
    if audio_path.is_some() {
      let url = format!("{base_url}/audio/{id}");
      obj.insert("audioUrl".to_string(), Value::String(url));
    } else {
      obj.insert("audioUrl".to_string(), Value::Null);
      obj.remove("audioPath");
    }
    if let Some(mime) = audio_mime {
      obj.insert("audioMime".to_string(), Value::String(mime));
    }
  }
}

fn extension_for_mime(mime: &str) -> &str {
  let base = mime.split(';').next().unwrap_or(mime).trim();
  match base {
    "audio/webm" => "webm",
    "audio/ogg" => "ogg",
    "audio/mp4" => "m4a",
    "audio/mpeg" => "mp3",
    "audio/wav" => "wav",
    _ => "bin",
  }
}

fn needs_conversion(mime: &str) -> bool {
  let base = mime.split(';').next().unwrap_or(mime).trim().to_lowercase();
  base == "audio/webm" || base == "audio/ogg"
}

fn ffmpeg_names() -> Vec<&'static str> {
  #[cfg(target_os = "windows")]
  {
    return vec![
      "ffmpeg.exe",
      "ffmpeg-x86_64-pc-windows-msvc.exe",
      "ffmpeg-x86_64-pc-windows-gnu.exe",
      "ffmpeg-aarch64-pc-windows-msvc.exe",
    ];
  }
  #[cfg(target_os = "macos")]
  {
    return vec![
      "ffmpeg",
      "ffmpeg-x86_64-apple-darwin",
      "ffmpeg-aarch64-apple-darwin",
      "ffmpeg-macos",
      "ffmpeg-arm64",
    ];
  }
  #[cfg(target_os = "linux")]
  {
    return vec![
      "ffmpeg",
      "ffmpeg-x86_64-unknown-linux-gnu",
      "ffmpeg-aarch64-unknown-linux-gnu",
      "ffmpeg-linux",
      "ffmpeg-arm64",
    ];
  }
}

fn ffmpeg_candidates(app: &AppHandle) -> Vec<PathBuf> {
  let mut candidates = Vec::new();
  if let Ok(path) = std::env::var("FFMPEG_PATH") {
    candidates.push(PathBuf::from(path));
  }
  if let Ok(app_data) = app.path().app_data_dir() {
    for name in ffmpeg_names() {
      candidates.push(app_data.join("ffmpeg").join(name));
    }
  }
  if let Ok(resource_dir) = app.path().resource_dir() {
    for name in ffmpeg_names() {
      candidates.push(resource_dir.join(name));
      candidates.push(resource_dir.join("bin").join(name));
    }
  }
  if let Ok(exe) = std::env::current_exe() {
    if let Some(dir) = exe.parent() {
      for name in ffmpeg_names() {
        candidates.push(dir.join(name));
      }
    }
  }
  candidates.push(PathBuf::from("ffmpeg"));
  candidates
}

fn resolve_ffmpeg(app: &AppHandle) -> Option<PathBuf> {
  for candidate in ffmpeg_candidates(app) {
    if candidate.is_absolute() {
      if candidate.exists() {
        return Some(candidate);
      }
    } else if Command::new(&candidate).arg("-version").output().is_ok() {
      return Some(candidate);
    }
  }
  None
}

fn run_ffmpeg(ffmpeg: &StdPath, input: &StdPath, output: &StdPath) -> Result<(), String> {
  let status = Command::new(ffmpeg)
    .arg("-y")
    .arg("-i")
    .arg(input)
    .arg("-acodec")
    .arg("pcm_s16le")
    .arg(output)
    .status()
    .map_err(|err| err.to_string())?;
  if status.success() {
    Ok(())
  } else {
    Err("ffmpeg conversion failed".to_string())
  }
}

fn maybe_convert_audio(
  state: &AppState,
  id: &str,
  input_path: &StdPath,
  mime: &str,
) -> Option<(String, String)> {
  if !needs_conversion(mime) {
    return None;
  }
  let output_filename = format!("{id}.wav");
  let output_path = state.audio_dir.join(&output_filename);
  if output_path.exists() {
    return Some((output_filename, "audio/wav".to_string()));
  }
  let ffmpeg = match resolve_ffmpeg(&state.app) {
    Some(path) => path,
    None => {
      eprintln!("ffmpeg not found; skipping audio conversion");
      return None;
    }
  };
  if run_ffmpeg(&ffmpeg, input_path, &output_path).is_ok() && output_path.exists() {
    return Some((output_filename, "audio/wav".to_string()));
  } else {
    eprintln!("ffmpeg conversion failed for {:?}", input_path);
  }
  None
}
