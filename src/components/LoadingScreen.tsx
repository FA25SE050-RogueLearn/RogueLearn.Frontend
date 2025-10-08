"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const logoFillRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const logoContainer = logoContainerRef.current;
    const logoFill = logoFillRef.current;
    const screen = screenRef.current;

    if (!logoContainer || !logoFill || !screen) return;

    // Create timeline for logo loading animation
    const tl = gsap.timeline({
      onComplete: () => {
        // After logo animation completes, start video
        setShowVideo(true);
        
        // Wait a bit then start video playback
        setTimeout(() => {
          const video = videoRef.current;
          if (video) {
            video.play().catch((error) => {
              console.error("Video autoplay failed:", error);
            });
          }
        }, 300);
      }
    });

    // Animate logo fill from bottom to top (like a loading bar)
    tl.fromTo(
      logoFill,
      { 
        clipPath: "inset(100% 0% 0% 0%)" 
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 2.5,
        ease: "power2.inOut"
      }
    );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const progress = (currentTime / duration) * 100;

      // Start fade out at 90% of video duration
      if (progress >= 90 && !fadeOut) {
        setFadeOut(true);
        
        // Use GSAP for smooth fade out with zoom in effect
        gsap.to(screenRef.current, {
          opacity: 0,
          scale: 1.2,
          duration: 1,
          ease: "power2.inOut"
        });
      }
    };

    const handleEnded = () => {
      // Call the completion callback when video ends
      setTimeout(() => {
        onLoadingComplete();
      }, 1000);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [showVideo, fadeOut, onLoadingComplete]);

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ backgroundColor: "#53252f" }}
    >
      {!showVideo ? (
        // Logo loading animation
        <div ref={logoContainerRef} className="relative w-96 h-96 flex items-center justify-center">
          {/* Base logo (grayed out) */}
          <div className="absolute inset-0 opacity-30">
            <Image
              src="/RougeLearn-Clear.png"
              alt="RogueLearn Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Filling logo */}
          <div ref={logoFillRef} className="absolute inset-0">
            <Image
              src="/RougeLearn-Clear.png"
              alt="RogueLearn Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : (
        // Video playback
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        >
          <source src="/Scene-1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
