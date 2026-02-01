export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private rafId: number | null = null;
  private onDataAvailable: ((blob: Blob) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;
  private onLevel: ((level: number) => void) | null = null;

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      if (!this.audioContext) {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextCtor();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.source.connect(this.analyser);
      }
    } catch {
      throw new Error("Microphone access denied. Please allow microphone access to record audio.");
    }
  }

  setOnDataAvailable(callback: (blob: Blob) => void): void {
    this.onDataAvailable = callback;
  }

  setOnError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  setOnLevel(callback: (level: number) => void): void {
    this.onLevel = callback;
  }

  async startRecording(): Promise<void> {
    if (!this.stream) await this.initialize();
    this.audioChunks = [];
    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.stream!, { mimeType, audioBitsPerSecond: 128000 })
      : new MediaRecorder(this.stream!);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.audioChunks.push(event.data);
    };
    this.mediaRecorder.onstop = () => {
      const resolvedType = mimeType || this.mediaRecorder?.mimeType || "audio/webm";
      const audioBlob = new Blob(this.audioChunks, { type: resolvedType });
      if (audioBlob.size < 1000) {
        if (this.onError) this.onError(new Error("No audio captured. Please check microphone input."));
        return;
      }
      if (this.onDataAvailable) this.onDataAvailable(audioBlob);
    };
    this.mediaRecorder.onerror = () => {
      if (this.onError) this.onError(new Error("Recording error occurred"));
    };
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
    this.startMetering();
    this.mediaRecorder.start(1000);
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  cleanup(): void {
    this.stopRecording();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
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

  private startMetering(): void {
    if (!this.analyser || !this.onLevel) return;
    const data = new Uint8Array(this.analyser.fftSize);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / data.length);
      this.onLevel?.(Math.min(1, rms * 2));
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private getSupportedMimeType(): string | null {
    const mimeTypes = [
      "audio/mp4",
      "audio/mpeg",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ];
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
    }
    return null;
  }
}
