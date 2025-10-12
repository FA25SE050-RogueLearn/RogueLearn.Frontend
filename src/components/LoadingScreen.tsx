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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [targetProgress, setTargetProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // Track asset loading
  useEffect(() => {
    const assetsToLoad = [
      '/RougeLearn-Clear.png',
      '/RougeLearn-extended.png',
      '/guild-background.jpg',
      '/Scene-1.mp4'
    ];

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length + 1;

    const updateProgress = (assetName: string = 'asset') => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalAssets) * 100);
      console.log(`Loaded ${assetName}: ${loadedCount}/${totalAssets} (${progress}%)`);
      setTargetProgress(progress);

      if (loadedCount >= totalAssets) {
        setTargetProgress(100);
      }
    };

    // Preload images
    const imagePromises = assetsToLoad
      .filter(asset => asset.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(src => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            updateProgress(src);
            resolve(src);
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            updateProgress(src);
            resolve(src);
          };
          img.src = src;
        });
      });

    // Preload video with better error handling
    const videoPromise = new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';

      const handleVideoLoad = () => {
        console.log('Video loaded successfully');
        updateProgress('/Scene-1.mp4');
        resolve('/Scene-1.mp4');
      };

      const handleVideoError = (e: Event) => {
        console.error('Video load error:', e);
        setVideoError(true);
        updateProgress('/Scene-1.mp4'); // Still update progress
        resolve('/Scene-1.mp4');
      };

      video.oncanplaythrough = handleVideoLoad;

      video.src = '/Scene-1.mp4';
      video.load();

      // Fallback timeout after 5 seconds
      setTimeout(() => {
        if (loadedCount < totalAssets) {
          console.warn('Video load timeout, proceeding anyway');
          setVideoError(true);
          updateProgress('/Scene-1.mp4');
          resolve('/Scene-1.mp4');
        }
      }, 5000);
    });

    // Wait for fonts and document
    const documentPromise = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        updateProgress('document');
        resolve('document');
      } else {
        window.addEventListener('load', () => {
          updateProgress('document');
          resolve('document');
        });
      }
    });

    Promise.all([...imagePromises, videoPromise, documentPromise]).then(() => {
      console.log('All assets loaded');
    });

    return () => { };
  }, []);

  // Smooth progress animation
  useEffect(() => {
    if (loadingProgress >= targetProgress) {
      if (targetProgress >= 100 && loadingProgress >= 100) {
        setAssetsLoaded(true);
      }
      return;
    }

    const getRandomDelay = () => {
      const random = Math.random();
      if (random < 0.4) return 15 + Math.random() * 20;
      if (random < 0.8) return 35 + Math.random() * 25;
      return 60 + Math.random() * 20;
    };

    const timer = setTimeout(() => {
      setLoadingProgress(prev => Math.min(prev + 1, targetProgress));
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [loadingProgress, targetProgress]);

  // Update logo fill
  useEffect(() => {
    const logoFill = logoFillRef.current;
    if (!logoFill) return;

    const invertedProgress = 100 - loadingProgress;
    gsap.to(logoFill, {
      clipPath: `inset(${invertedProgress}% 0% 0% 0%)`,
      duration: 0.3,
      ease: "power2.out"
    });
  }, [loadingProgress]);

  // Start video when loaded
  useEffect(() => {
    if (!assetsLoaded || loadingProgress < 100) return;

    setTimeout(() => {
      if (videoError) {
        // Skip video if there's an error
        console.log('Skipping video due to error');
        onLoadingComplete();
      } else {
        setShowVideo(true);
        setTimeout(() => {
          const video = videoRef.current;
          if (video) {
            video.play().catch((error) => {
              console.error("Video autoplay failed:", error);
              // If autoplay fails, just complete loading
              onLoadingComplete();
            });
          }
        }, 300);
      }
    }, 500);
  }, [assetsLoaded, loadingProgress, videoError, onLoadingComplete]);

  // Video playback handlers
  useEffect(() => {
    if (!showVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const progress = (currentTime / duration) * 100;

      if (progress >= 90 && !fadeOut) {
        setFadeOut(true);
        gsap.to(screenRef.current, {
          opacity: 0,
          scale: 1.2,
          duration: 1,
          ease: "power2.inOut"
        });
      }
    };

    const handleEnded = () => {
      setTimeout(() => {
        onLoadingComplete();
      }, 1000);
    };

    const handleError = (e: Event) => {
      console.error('Video playback error:', e);
      onLoadingComplete();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [showVideo, fadeOut, onLoadingComplete]);

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#53252f" }}
    >
      {!showVideo ? (
        <>
          <div className="flex flex-col items-center">
            <div ref={logoContainerRef} className="relative w-96 h-96 flex items-center justify-center">
              <div className="absolute inset-0 opacity-30">
                <Image
                  src="/RougeLearn-Clear.png"
                  alt="RogueLearn Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

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

            <div className="mt-4 text-center">
              <span className="text-white/90 text-2xl font-bold font-mono">
                {Math.round(loadingProgress)}%
              </span>
              {!assetsLoaded && (
                <p className="text-white/50 text-sm mt-2">
                  Loading assets...
                </p>
              )}
              {assetsLoaded && !videoError && (
                <p className="text-white/70 text-sm mt-2 animate-pulse">
                  Ready!
                </p>
              )}
              {videoError && (
                <p className="text-white/70 text-sm mt-2">
                  Starting...
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        >
          <source src="/Scene-1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}