use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command as TokioCommand;
use tokio::{fs::File, io::AsyncWriteExt};

const LOG_EVENT: &str = "setup-wizard:log";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandDetection {
  found: bool,
  path: Option<String>,
  version: Option<String>,
  error: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OllamaStatus {
  binary_found: bool,
  binary_path: Option<String>,
  server_available: bool,
  model_available: bool,
  models: Vec<String>,
  error: Option<String>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct CommandLogEvent {
  id: String,
  stream: String,
  message: String,
  code: Option<i32>,
}

fn emit_log(app: &AppHandle, payload: CommandLogEvent) {
  let _ = app.emit(LOG_EVENT, payload);
}

fn write_temp_file(bytes: &[u8], extension: &str) -> Result<PathBuf, String> {
  let temp_dir = std::env::temp_dir();
  let millis = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|error| error.to_string())?
    .as_millis();
  let filename = format!("vi-whisper-input-{}.{}", millis, extension);
  let path = temp_dir.join(filename);
  fs::write(&path, bytes).map_err(|error| error.to_string())?;
  Ok(path)
}

fn decode_base64(data: &str) -> Result<Vec<u8>, String> {
  STANDARD.decode(data).map_err(|error| error.to_string())
}

fn detect_command_path(name: &str) -> Option<String> {
  if cfg!(target_os = "windows") {
    let output = Command::new("cmd")
      .args(["/C", "where", name])
      .output()
      .ok()?;
    if !output.status.success() {
      return None;
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    stdout.lines().next().map(|line| line.trim().to_string()).filter(|line| !line.is_empty())
  } else {
    let script = format!("command -v {}", name);
    let output = Command::new("sh")
      .args(["-lc", script.as_str()])
      .output()
      .ok()?;
    if output.status.success() {
      let stdout = String::from_utf8_lossy(&output.stdout);
      if let Some(found) = stdout.lines().next().map(|line| line.trim().to_string()) {
        if !found.is_empty() {
          return Some(found);
        }
      }
    }

    let candidates = [
      "/opt/homebrew/bin",
      "/usr/local/bin",
      "/usr/bin",
      "/bin",
    ];
    for dir in candidates {
      let path = Path::new(dir).join(name);
      if path.is_file() {
        return Some(path.to_string_lossy().to_string());
      }
    }
    None
  }
}

fn find_whisper_binary(binary_path: Option<String>) -> Option<String> {
  if let Some(candidate) = binary_path {
    let trimmed = candidate.trim();
    if !trimmed.is_empty() {
      if Path::new(trimmed).is_file() {
        return Some(trimmed.to_string());
      }
      if let Some(found) = detect_command_path(trimmed) {
        return Some(found);
      }
    }
  }
  let candidates = ["whisper", "whisper.cpp", "whisper-cpp", "whisper-cli"];
  for name in candidates {
    if let Some(path) = detect_command_path(name) {
      return Some(path);
    }
  }
  None
}

fn read_version_line(cmd: &str) -> Option<String> {
  let output = Command::new(cmd)
    .arg("-version")
    .output()
    .ok()?;
  let stdout = String::from_utf8_lossy(&output.stdout);
  let stderr = String::from_utf8_lossy(&output.stderr);
  stdout.lines().next().or_else(|| stderr.lines().next()).map(|line| line.trim().to_string())
}

fn convert_to_wav(input: &Path, output: &Path, ffmpeg_path: Option<String>) -> Result<(), String> {
  let ffmpeg_cmd = ffmpeg_path
    .filter(|path| !path.trim().is_empty())
    .or_else(|| detect_command_path("ffmpeg"))
    .unwrap_or_else(|| "ffmpeg".to_string());
  let output = Command::new(&ffmpeg_cmd)
    .args([
      "-y",
      "-i",
      input.to_string_lossy().as_ref(),
      "-ar",
      "16000",
      "-ac",
      "1",
      output.to_string_lossy().as_ref(),
    ])
    .output()
    .map_err(|error| error.to_string())?;
  if output.status.success() {
    return Ok(());
  }
  Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
}

fn resolve_filename(url: &str, filename: Option<String>) -> String {
  if let Some(name) = filename {
    let trimmed = name.trim();
    if !trimmed.is_empty() {
      return trimmed.to_string();
    }
  }
  if let Ok(parsed) = reqwest::Url::parse(url) {
    if let Some(seg) = parsed.path_segments().and_then(|segments| segments.last()) {
      if !seg.is_empty() {
        return seg.to_string();
      }
    }
  }
  "whisper-model.bin".to_string()
}

#[tauri::command]
pub async fn download_whisper_model(
  app: AppHandle,
  request_id: String,
  url: String,
  filename: Option<String>,
) -> Result<String, String> {
  let url = url.trim().to_string();
  if url.is_empty() {
    return Err("Model URL required".to_string());
  }
  let target_name = resolve_filename(&url, filename);
  let data_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
  let models_dir = data_dir.join("whisper");
  fs::create_dir_all(&models_dir).map_err(|error| error.to_string())?;
  let target_path = models_dir.join(&target_name);

  emit_log(
    &app,
    CommandLogEvent {
      id: request_id.clone(),
      stream: "stdout".to_string(),
      message: format!("Downloading {}", target_name),
      code: None,
    },
  );

  let client = reqwest::Client::new();
  let mut response = client
    .get(url.clone())
    .send()
    .await
    .map_err(|error| error.to_string())?;
  if !response.status().is_success() {
    return Err(format!("Download failed ({})", response.status()));
  }

  let total = response.content_length().unwrap_or(0);
  let mut file = File::create(&target_path).await.map_err(|error| error.to_string())?;
  let mut downloaded: u64 = 0;
  let mut last_reported: u64 = 0;

  while let Some(chunk) = response.chunk().await.map_err(|error| error.to_string())? {
    file.write_all(&chunk).await.map_err(|error| error.to_string())?;
    downloaded += chunk.len() as u64;
    if total > 0 {
      let percent = (downloaded * 100) / total;
      if percent >= last_reported + 10 {
        last_reported = percent;
        emit_log(
          &app,
          CommandLogEvent {
            id: request_id.clone(),
            stream: "stdout".to_string(),
            message: format!("Downloaded {}% ({}/{})", percent, downloaded, total),
            code: None,
          },
        );
      }
    } else if downloaded >= last_reported + 5 * 1024 * 1024 {
      last_reported = downloaded;
      emit_log(
        &app,
        CommandLogEvent {
          id: request_id.clone(),
          stream: "stdout".to_string(),
          message: format!("Downloaded {} bytes", downloaded),
          code: None,
        },
      );
    }
  }
  file.flush().await.map_err(|error| error.to_string())?;

  emit_log(
    &app,
    CommandLogEvent {
      id: request_id,
      stream: "terminated".to_string(),
      message: String::new(),
      code: Some(0),
    },
  );

  Ok(target_path.to_string_lossy().to_string())
}

fn write_silence_wav(path: &Path) -> Result<(), String> {
  let sample_rate = 44100u32;
  let channels = 1u16;
  let bits_per_sample = 16u16;
  let duration_seconds = 1u32;
  let num_samples = sample_rate * duration_seconds;
  let byte_rate = sample_rate * channels as u32 * (bits_per_sample as u32 / 8);
  let block_align = channels * (bits_per_sample / 8);
  let data_size = num_samples * block_align as u32;
  let riff_size = 36 + data_size;

  let mut bytes = Vec::with_capacity((data_size + 44) as usize);
  bytes.extend_from_slice(b"RIFF");
  bytes.extend_from_slice(&riff_size.to_le_bytes());
  bytes.extend_from_slice(b"WAVE");
  bytes.extend_from_slice(b"fmt ");
  bytes.extend_from_slice(&16u32.to_le_bytes());
  bytes.extend_from_slice(&1u16.to_le_bytes());
  bytes.extend_from_slice(&channels.to_le_bytes());
  bytes.extend_from_slice(&sample_rate.to_le_bytes());
  bytes.extend_from_slice(&byte_rate.to_le_bytes());
  bytes.extend_from_slice(&block_align.to_le_bytes());
  bytes.extend_from_slice(&bits_per_sample.to_le_bytes());
  bytes.extend_from_slice(b"data");
  bytes.extend_from_slice(&data_size.to_le_bytes());
  bytes.resize((data_size + 44) as usize, 0);

  fs::write(path, bytes).map_err(|error| error.to_string())
}

async fn spawn_command_with_events(
  app: AppHandle,
  request_id: String,
  cmd: String,
  args: Vec<String>,
  cleanup: Vec<PathBuf>,
) -> Result<(), String> {
  let mut child = TokioCommand::new(&cmd)
    .args(&args)
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .spawn()
    .map_err(|error| error.to_string())?;

  if let Some(stdout) = child.stdout.take() {
    let app = app.clone();
    let request_id = request_id.clone();
    tokio::spawn(async move {
      let mut reader = BufReader::new(stdout).lines();
      while let Ok(Some(line)) = reader.next_line().await {
        emit_log(
          &app,
          CommandLogEvent {
            id: request_id.clone(),
            stream: "stdout".to_string(),
            message: line,
            code: None,
          },
        );
      }
    });
  }

  if let Some(stderr) = child.stderr.take() {
    let app = app.clone();
    let request_id = request_id.clone();
    tokio::spawn(async move {
      let mut reader = BufReader::new(stderr).lines();
      while let Ok(Some(line)) = reader.next_line().await {
        emit_log(
          &app,
          CommandLogEvent {
            id: request_id.clone(),
            stream: "stderr".to_string(),
            message: line,
            code: None,
          },
        );
      }
    });
  }

  let status = child.wait().await.map_err(|error| error.to_string())?;
  for path in cleanup {
    let _ = fs::remove_file(path);
  }
  emit_log(
    &app,
    CommandLogEvent {
      id: request_id,
      stream: "terminated".to_string(),
      message: String::new(),
      code: status.code(),
    },
  );
  Ok(())
}

#[tauri::command]
pub async fn detect_command(name: String) -> Result<CommandDetection, String> {
  if name.contains('/') || name.contains('\\') {
    let path = Path::new(&name);
    if path.is_file() {
      return Ok(CommandDetection {
        found: true,
        path: Some(name),
        version: None,
        error: None,
      });
    }
    return Ok(CommandDetection {
      found: false,
      path: None,
      version: None,
      error: Some("Command not found".to_string()),
    });
  }

  let path = detect_command_path(&name);
  Ok(CommandDetection {
    found: path.is_some(),
    path,
    version: None,
    error: None,
  })
}

#[tauri::command]
pub async fn detect_ffmpeg(ffmpeg_path: Option<String>) -> Result<CommandDetection, String> {
  let mut path = None;
  let mut error = None;

  if let Some(candidate) = ffmpeg_path.clone() {
    if Path::new(&candidate).is_file() {
      path = Some(candidate);
    } else if Command::new(&candidate).arg("-version").output().is_ok() {
      path = Some(candidate);
    } else {
      error = Some("FFmpeg path not found".to_string());
    }
  }

  if path.is_none() {
    path = detect_command_path("ffmpeg");
  }
  if path.is_some() {
    error = None;
  }

  let version = path
    .as_deref()
    .and_then(read_version_line);

  Ok(CommandDetection {
    found: path.is_some(),
    path,
    version,
    error,
  })
}

#[tauri::command]
pub async fn test_ffmpeg(
  app: AppHandle,
  request_id: String,
  ffmpeg_path: Option<String>,
) -> Result<(), String> {
  let ffmpeg_cmd = ffmpeg_path.filter(|path| !path.trim().is_empty()).unwrap_or_else(|| "ffmpeg".to_string());
  let temp_dir = std::env::temp_dir();
  let input_path = temp_dir.join("ffmpeg-test-input.wav");
  let output_path = temp_dir.join("ffmpeg-test-output.wav");
  write_silence_wav(&input_path)?;
  let args = vec![
    "-y".to_string(),
    "-i".to_string(),
    input_path.to_string_lossy().to_string(),
    "-ar".to_string(),
    "16000".to_string(),
    output_path.to_string_lossy().to_string(),
  ];
  spawn_command_with_events(app, request_id, ffmpeg_cmd, args, vec![input_path, output_path]).await
}

#[tauri::command]
pub async fn run_command(
  app: AppHandle,
  request_id: String,
  cmd: String,
  args: Vec<String>,
) -> Result<(), String> {
  spawn_command_with_events(app, request_id, cmd, args, Vec::new()).await
}

#[tauri::command]
pub async fn detect_ollama(base_url: String, model: String) -> Result<OllamaStatus, String> {
  let base_url = if base_url.trim().is_empty() {
    "http://127.0.0.1:11434".to_string()
  } else {
    base_url
  };

  let binary_path = detect_command_path("ollama");
  let binary_found = binary_path.is_some();
  let mut models: Vec<String> = Vec::new();
  let mut server_available = false;
  let mut model_available = false;
  let mut error = None;

  let client = reqwest::Client::new();
  let tags_url = format!("{}/api/tags", base_url.trim_end_matches('/'));
  match client.get(tags_url).send().await {
    Ok(response) => {
      if response.status().is_success() {
        server_available = true;
        if let Ok(payload) = response.json::<serde_json::Value>().await {
          if let Some(items) = payload.get("models").and_then(|value| value.as_array()) {
            models = items
              .iter()
              .filter_map(|item| item.get("name").and_then(|name| name.as_str()))
              .map(|name| name.to_string())
              .collect();
          }
        }
      } else {
        error = Some(format!("Ollama server returned {}", response.status()));
      }
    }
    Err(err) => {
      error = Some(err.to_string());
    }
  }

  if !model.trim().is_empty() {
    let needle = model.trim();
    model_available = models.iter().any(|item| {
      item == needle || item.starts_with(&format!("{needle}:")) || needle.starts_with(&format!("{item}:"))
    });
  }

  Ok(OllamaStatus {
    binary_found,
    binary_path,
    server_available,
    model_available,
    models,
    error,
  })
}

#[tauri::command]
pub async fn start_ollama_serve(app: AppHandle, request_id: String) -> Result<(), String> {
  spawn_command_with_events(
    app,
    request_id,
    "ollama".to_string(),
    vec!["serve".to_string()],
    Vec::new(),
  )
  .await
}

#[tauri::command]
pub async fn pull_ollama_model(
  app: AppHandle,
  request_id: String,
  model: String,
) -> Result<(), String> {
  if model.trim().is_empty() {
    return Err("Model name required".to_string());
  }
  spawn_command_with_events(
    app,
    request_id,
    "ollama".to_string(),
    vec!["pull".to_string(), model],
    Vec::new(),
  )
  .await
}

#[tauri::command]
pub async fn test_ollama_generate(
  base_url: String,
  model: String,
  prompt: String,
) -> Result<String, String> {
  let base_url = if base_url.trim().is_empty() {
    "http://127.0.0.1:11434".to_string()
  } else {
    base_url
  };
  if model.trim().is_empty() {
    return Err("Model name required".to_string());
  }
  let client = reqwest::Client::new();
  let url = format!("{}/api/generate", base_url.trim_end_matches('/'));
  let response = client
    .post(url)
    .json(&serde_json::json!({
      "model": model,
      "prompt": prompt,
      "stream": false,
    }))
    .send()
    .await
    .map_err(|error| error.to_string())?;

  if !response.status().is_success() {
    return Err(format!("Ollama returned {}", response.status()));
  }

  let payload = response
    .json::<serde_json::Value>()
    .await
    .map_err(|error| error.to_string())?;
  let text = payload
    .get("response")
    .and_then(|value| value.as_str())
    .unwrap_or("")
    .trim()
    .to_string();
  Ok(text)
}

#[tauri::command]
pub async fn transcribe_local_whisper(
  audio_base64: String,
  audio_ext: String,
  language: Option<String>,
  model: Option<String>,
  binary_path: Option<String>,
  ffmpeg_path: Option<String>,
) -> Result<String, String> {
  let bytes = decode_base64(audio_base64.trim())?;
  let ext = if audio_ext.trim().is_empty() {
    "webm".to_string()
  } else {
    audio_ext.trim().to_string()
  };
  let language = language.and_then(|value| {
    let trimmed = value.trim();
    if trimmed.is_empty() {
      None
    } else {
      Some(trimmed.to_string())
    }
  });
  let input_path = write_temp_file(&bytes, &ext)?;
  let wav_path = input_path.with_extension("wav");
  convert_to_wav(&input_path, &wav_path, ffmpeg_path)?;

  let whisper_bin = find_whisper_binary(binary_path)
    .ok_or_else(|| "Whisper binary not found. Set the path in Setup Wizard.".to_string())?;
  let whisper_name = Path::new(&whisper_bin)
    .file_name()
    .and_then(|value| value.to_str())
    .unwrap_or("");

  let (transcript, txt_path) = if whisper_name == "whisper" {
    let mut args = vec![
      wav_path.to_string_lossy().to_string(),
      "--output_format".to_string(),
      "txt".to_string(),
      "--output_dir".to_string(),
      wav_path
        .parent()
        .unwrap_or_else(|| Path::new("."))
        .to_string_lossy()
        .to_string(),
      "--task".to_string(),
      "transcribe".to_string(),
      "--fp16".to_string(),
      "False".to_string(),
    ];
    if let Some(lang) = language.as_ref() {
      args.push("--language".to_string());
      args.push(lang.to_string());
    }
    if let Some(model) = model {
      if !model.trim().is_empty() {
        args.push("--model".to_string());
        args.push(model);
      }
    }
    let output = Command::new(&whisper_bin)
      .args(args)
      .output()
      .map_err(|error| error.to_string())?;
    if !output.status.success() {
      return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    let path = wav_path.with_extension("txt");
    let content = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    (content, Some(path))
  } else {
    let model_path = model.unwrap_or_default();
    if model_path.trim().is_empty() {
      return Err("Whisper model path required for whisper.cpp.".to_string());
    }
    let output_prefix = wav_path.with_extension("");
    let mut args = vec![
      "-m".to_string(),
      model_path.trim().to_string(),
      "-f".to_string(),
      wav_path.to_string_lossy().to_string(),
      "-otxt".to_string(),
      "-of".to_string(),
      output_prefix.to_string_lossy().to_string(),
    ];
    if let Some(lang) = language.as_ref() {
      args.push("--language".to_string());
      args.push(lang.to_string());
    }
    let output = Command::new(&whisper_bin)
      .args(args)
      .output()
      .map_err(|error| error.to_string())?;
    if !output.status.success() {
      return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    let path = output_prefix.with_extension("txt");
    let content = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    (content, Some(path))
  };

  let _ = fs::remove_file(&input_path);
  let _ = fs::remove_file(&wav_path);
  if let Some(path) = txt_path {
    let _ = fs::remove_file(path);
  }
  Ok(transcript.trim().to_string())
}
