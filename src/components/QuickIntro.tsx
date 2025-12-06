"use client";

import { useEffect, useRef, useState } from "react";

interface QuickIntroProps {
  onComplete: () => void;
}

export default function QuickIntro({ onComplete }: QuickIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Fallback: if video doesn't start within 1s, skip intro
    const fallbackTimer = setTimeout(() => {
      if (video.currentTime === 0) {
        onComplete();
      }
    }, 1000);

    // Play video immediately at 1.5x speed
    video.playbackRate = 1.5;
    video.play().catch(() => {
      onComplete();
    });

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      if (progress >= 85 && !fadeOut) {
        setFadeOut(true);
      }
    };

    const handleEnded = () => {
      setTimeout(onComplete, 300);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      clearTimeout(fallbackTimer);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [fadeOut, onComplete]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[10000] bg-[#53252f] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        suppressHydrationWarning
      >
        <source src="/Scene-1.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
