"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

type AudioPreviewProps = {
  src: string;
};

export function AudioPreview({ src }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const fixingDurationRef = useRef(false);
  const {
    state: { settings },
  } = useAppStore();
  const { t } = useI18n(settings.general.language);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    fixingDurationRef.current = false;

    const handleLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        return;
      }
      // Fix WebM duration in Safari/WebKit: force duration calculation.
      fixingDurationRef.current = true;
      const onTimeUpdate = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
          audio.currentTime = 0;
          setCurrentTime(0);
          fixingDurationRef.current = false;
          audio.removeEventListener("timeupdate", onTimeUpdate);
        }
      };
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.currentTime = 1e101;
    };

    const handleTime = () => {
      if (fixingDurationRef.current) return;
      setCurrentTime(audio.currentTime);
    };
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [src]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // ignore autoplay restriction errors
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/70 px-3 py-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isPlaying ? t("aria.pause") : t("aria.play")}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex flex-1 items-center gap-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(currentTime, duration || currentTime)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="h-2 w-full accent-primary"
          aria-label={t("aria.seekAudio")}
        />
        <span className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
