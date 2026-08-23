"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { registerMedia, unregisterMedia } from "@/lib/media-store";

interface AudioPlayerProps {
  src: string;
}

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      registerMedia(a);
      a.play();
    } else {
      a.pause();
    }
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    const a = audioRef.current;
    if (!bar || !a) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * a.duration;
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onPlay = () => { registerMedia(a); setPlaying(true); };
    const onPause = () => setPlaying(false);
    const onTime = () => { if (!dragging) setCurrent(a.currentTime); };
    const onLoaded = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setCurrent(0); };

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnd);

    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnd);
      unregisterMedia(a);
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const bar = barRef.current;
      const a = audioRef.current;
      if (!bar || !a) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setCurrent(pct * a.duration);
    };

    const onUp = (e: MouseEvent) => {
      const bar = barRef.current;
      const a = audioRef.current;
      if (bar && a) {
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        a.currentTime = pct * a.duration;
      }
      setDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  return (
    <div className="flex items-center gap-4 w-full">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause */}
      <button
        type="button"
        onClick={toggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          playing
            ? "bg-gold shadow-[0_0_20px_rgba(255,200,37,0.4)]"
            : "bg-white/10 hover:bg-white/15"
        }`}
      >
        {playing ? (
          <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Progress bar */}
        <div
          ref={barRef}
          onClick={seek}
          onMouseDown={() => setDragging(true)}
          className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
        >
          {/* Filled */}
          <div
            className="absolute top-0 left-0 h-full bg-gold rounded-full transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold border-2 border-black transition-opacity ${
              dragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>

        {/* Time */}
        <div className="flex justify-between text-[11px] text-white/40 font-[family-name:var(--font-montserrat)] tabular-nums">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
