"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"

const TransitionContext = React.createContext<{
  navigateTo: (url: string) => void
} | null>(null)

export function usePageTransition() {
  const context = React.useContext(TransitionContext)
  const router = useRouter()
  
  // Return fallback if context not available (graceful degradation)
  if (!context) {
    return {
      navigateTo: (url: string) => router.push(url)
    }
  }
  return context
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [targetUrl, setTargetUrl] = React.useState<string | null>(null)
  const [phase, setPhase] = React.useState<'idle' | 'exit' | 'enter'>('idle')

  const navigateTo = React.useCallback((url: string) => {
    if (url === pathname) return
    setTargetUrl(url)
    setIsTransitioning(true)
    setPhase('exit')
  }, [pathname])

  React.useEffect(() => {
    if (phase === 'exit' && targetUrl) {
      const timer = setTimeout(() => {
        router.push(targetUrl)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [phase, targetUrl, router])

  React.useEffect(() => {
    if (isTransitioning && targetUrl && pathname === targetUrl) {
      setPhase('enter')
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setTargetUrl(null)
        setPhase('idle')
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [pathname, targetUrl, isTransitioning])

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}
      
      {/* RPG Portal Transition */}
      <div
        className={`fixed inset-0 z-[9999] pointer-events-none transition-all duration-400 ${
          phase === 'idle' ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
      >
        {/* Dark vignette background */}
        <div 
          className={`absolute inset-0 bg-[#0c0308] transition-opacity duration-300 ${
            phase === 'exit' ? 'opacity-95' : phase === 'enter' ? 'opacity-0' : 'opacity-0'
          }`}
        />

        {/* Center portal effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`absolute w-40 h-40 rounded-full border-2 border-[#f5c16c]/30 transition-all duration-500 ${
              phase === 'exit' 
                ? 'scale-100 opacity-100 rotate-180' 
                : phase === 'enter' 
                  ? 'scale-150 opacity-0 rotate-360' 
                  : 'scale-0 opacity-0'
            }`}
            style={{ 
              boxShadow: '0 0 40px rgba(245, 193, 108, 0.2), inset 0 0 40px rgba(210, 49, 135, 0.1)',
            }}
          >
            {/* Rune decorations */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute w-2 h-2 bg-[#f5c16c] opacity-0 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translateY(-70px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>

          {/* Inner rune circle */}
          <div 
            className={`absolute w-24 h-24 rounded-full border border-dashed border-[#d23187]/50 transition-all duration-400 ${
              phase === 'exit' 
                ? 'scale-100 opacity-100 -rotate-90' 
                : phase === 'enter' 
                  ? 'scale-125 opacity-0 -rotate-180' 
                  : 'scale-0 opacity-0'
            }`}
          />

          {/* Portal glow */}
          <div 
            className={`absolute w-32 h-32 rounded-full transition-all duration-400 ${
              phase === 'exit' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(210, 49, 135, 0.4) 0%, rgba(245, 193, 108, 0.2) 50%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />

          {/* Center logo */}
          <div 
            className={`relative transition-all duration-400 ${
              phase === 'exit' 
                ? 'scale-100 opacity-100' 
                : phase === 'enter' 
                  ? 'scale-110 opacity-0' 
                  : 'scale-0 opacity-0'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d23187]/20 via-[#f061a6]/20 to-[#f5c16c]/20 flex items-center justify-center shadow-[0_0_30px_rgba(210,49,135,0.6)] backdrop-blur-sm">
              <Image 
                src="/RougeLearn-Clear.png" 
                alt="RogueLearn" 
                width={56} 
                height={56} 
                className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
            </div>
            
            {/* Pulse ring */}
            <div 
              className={`absolute inset-0 rounded-full border-2 border-[#f5c16c] ${
                phase === 'exit' ? 'animate-ping-slow' : ''
              }`}
              style={{ animationDuration: '1s' }}
            />
          </div>
        </div>

        {/* Top and bottom accent lines */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f5c16c] to-transparent transition-all duration-300 ${
            phase === 'exit' ? 'opacity-60 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d23187] to-transparent transition-all duration-300 ${
            phase === 'exit' ? 'opacity-60 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />

        {/* Corner runes */}
        {phase !== 'idle' && (
          <>
            <div className="absolute top-8 left-8 text-[#f5c16c]/30 text-2xl animate-pulse">◆</div>
            <div className="absolute top-8 right-8 text-[#f5c16c]/30 text-2xl animate-pulse" style={{ animationDelay: '0.1s' }}>◆</div>
            <div className="absolute bottom-8 left-8 text-[#d23187]/30 text-2xl animate-pulse" style={{ animationDelay: '0.2s' }}>◆</div>
            <div className="absolute bottom-8 right-8 text-[#d23187]/30 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>◆</div>
          </>
        )}

        <style jsx>{`
          @keyframes float-particle {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            50% {
              transform: translateY(-100px) scale(1.5);
              opacity: 0.6;
            }
            90% {
              opacity: 0.2;
            }
          }
          .animate-float-particle {
            animation: float-particle 0.8s ease-out forwards;
          }
          .animate-ping-slow {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </TransitionContext.Provider>
  )
}
