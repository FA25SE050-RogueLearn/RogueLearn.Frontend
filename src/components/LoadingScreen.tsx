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

  // Track asset loading
  useEffect(() => {
    const assetsToLoad = [
      // Images
      '/RougeLearn-Clear.png',
      '/RougeLearn-extended-old.png',
      '/guild-background.jpg',
      // Video
      '/Scene-1.mp4'
    ];

    let loadedCount = 0;
    const totalAssets = assetsToLoad.length + 1; // +1 for fonts/document ready

    const updateProgress = (assetName: string = 'asset') => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalAssets) * 100);
      console.log(`Loaded ${assetName}: ${loadedCount}/${totalAssets} (${progress}%)`);
      setTargetProgress(progress);
      
      // When all assets loaded, ensure we reach 100%
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
            updateProgress(src); // Still update progress even on error
            resolve(src);
          };
          img.src = src;
        });
      });

    // Preload video with more detailed tracking
    const videoPromise = new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      
      video.oncanplaythrough = () => {
        updateProgress('/Scene-1.mp4');
        resolve('/Scene-1.mp4');
      };
      
      video.onerror = () => {
        console.warn('Failed to load video');
        updateProgress('/Scene-1.mp4');
        resolve('/Scene-1.mp4');
      };
      
      video.src = '/Scene-1.mp4';
      video.load();
    });

    // Wait for fonts and document to be ready
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

    // Wait for all assets
    Promise.all([...imagePromises, videoPromise, documentPromise]).then(() => {
      console.log('All assets loaded');
    });

    return () => {
      // Cleanup
    };
  }, []);

  // Game-like loading animation - increment by 1% with variable speed
  useEffect(() => {
    // If we've reached the target, do nothing
    if (loadingProgress >= targetProgress) {
      // But if target is 100%, make sure we mark as loaded
      if (targetProgress >= 100 && loadingProgress >= 100) {
        setAssetsLoaded(true);
      }
      return;
    }

    // Random delay between increments (15ms to 80ms) for organic feel
    const getRandomDelay = () => {
      const random = Math.random();
      if (random < 0.4) return 15 + Math.random() * 20;   // Fast: 15-35ms (40% chance)
      if (random < 0.8) return 35 + Math.random() * 25;   // Medium: 35-60ms (40% chance)
      return 60 + Math.random() * 20;                      // Slow: 60-80ms (20% chance)
    };

    const timer = setTimeout(() => {
      setLoadingProgress(prev => {
        const next = Math.min(prev + 1, targetProgress);
        return next;
      });
    }, getRandomDelay());

    return () => clearTimeout(timer);
  }, [loadingProgress, targetProgress]);

  // Update logo fill based on loading progress
  useEffect(() => {
    const logoFill = logoFillRef.current;
    if (!logoFill) return;

    // Update logo fill to match loading progress
    const invertedProgress = 100 - loadingProgress;
    gsap.to(logoFill, {
      clipPath: `inset(${invertedProgress}% 0% 0% 0%)`,
      duration: 0.3,
      ease: "power2.out"
    });
  }, [loadingProgress]);

  // When assets are fully loaded and display reaches 100%, start video
  useEffect(() => {
    if (!assetsLoaded || loadingProgress < 100) return;

    // After all assets loaded and reached 100%, start video
    setTimeout(() => {
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
    }, 500); // Small delay to show 100% completion
  }, [assetsLoaded, loadingProgress]);

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
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#53252f" }}
    >
      {!showVideo ? (
        <>
          {/* Logo loading animation */}
          <div className="flex flex-col items-center">
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

            {/* Loading percentage */}
            <div className="mt-4 text-center">
              <span className="text-white/90 text-2xl font-bold font-mono">{Math.round(loadingProgress)}%</span>
              {!assetsLoaded && (
                <p className="text-white/50 text-sm mt-2">
                  Loading assets...
                </p>
              )}
              {assetsLoaded && (
                <p className="text-white/70 text-sm mt-2 animate-pulse">
                  Ready!
                </p>
              )}
            </div>
          </div>
        </>
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
