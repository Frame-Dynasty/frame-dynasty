"use client";

import { useRef, useState, useEffect } from "react";
import { registerMedia, unregisterMedia } from "@/lib/media-store";

const VIDEO_URL = "https://pub-6ff7acfeb6774783bdea82b8fa66e289.r2.dev/videos/frame.mp4";

export default function VideoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          registerMedia(video);
          video.play().catch(() => {});
          setPlaying(true);
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current!);
    return () => { observer.disconnect(); unregisterMedia(video); };
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      registerMedia(video);
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        onClick={togglePlay}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Center play/pause indicator */}
      <button
        onClick={togglePlay}
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        {!playing && (
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </button>

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-200 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}>
        <span className="text-white/60 text-xs font-[family-name:var(--font-montserrat)] uppercase tracking-wider">
          {playing ? "Playing" : "Paused"}
        </span>

        <button
          onClick={toggleMute}
          className="p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-colors"
        >
          {muted ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
