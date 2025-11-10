"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import gsap from "gsap"
import { Shield, Sword, Skull } from "lucide-react"

// Create context for navigation control
const TransitionContext = React.createContext<{
  navigateTo: (url: string) => void
} | null>(null)

export function usePageTransition() {
  const context = React.useContext(TransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider')
  }
  return context
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [targetUrl, setTargetUrl] = React.useState<string | null>(null)
  const [isNavigating, setIsNavigating] = React.useState(false)

  const leftCurtainRef = React.useRef<HTMLDivElement>(null)
  const rightCurtainRef = React.useRef<HTMLDivElement>(null)
  const shieldRef = React.useRef<HTMLDivElement>(null)
  const swordRef = React.useRef<HTMLDivElement>(null)
  const logoRef = React.useRef<HTMLDivElement>(null)
  const slashRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const navigateTo = React.useCallback((url: string) => {
    console.log('PageTransition - Navigate to:', url)
    setTargetUrl(url)
    setIsTransitioning(true)
  }, [])

  // Start closing animation when navigation is triggered
  React.useEffect(() => {
    if (!isTransitioning || !targetUrl || isNavigating) return

    console.log('PageTransition - Starting closing animation for:', targetUrl)

    // Wait for refs to be ready
    const startAnimation = () => {
      if (!leftCurtainRef.current || !rightCurtainRef.current ||
          !shieldRef.current || !swordRef.current ||
          !logoRef.current || !slashRef.current) {
        console.error('PageTransition - Refs not ready')
        return
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            console.log('PageTransition - Closing complete, navigating now!')
            // Navigate at the peak of the animation (when curtains are closed)
            setIsNavigating(true)
            router.push(targetUrl)
          }
        })

        // Phase 1: Curtains close
        tl.to([leftCurtainRef.current, rightCurtainRef.current], {
          x: 0,
          duration: 0.6,
          ease: "power3.inOut",
        })

        // Phase 2: Shield and Sword appear
        tl.fromTo(shieldRef.current,
          { x: -200, rotation: -45, scale: 0, opacity: 0 },
          { x: -30, rotation: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
          "+=0.1"
        )
        tl.fromTo(swordRef.current,
          { x: 200, rotation: 45, scale: 0, opacity: 0 },
          { x: 30, rotation: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" },
          "-=0.4"
        )

        // Logo appears
        tl.fromTo(logoRef.current,
          { scale: 0, rotation: -180, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" },
          "-=0.3"
        )

        // Clash effect
        tl.to([shieldRef.current, swordRef.current], {
          x: "+=5",
          duration: 0.05,
          yoyo: true,
          repeat: 3,
        })
        tl.to(logoRef.current, {
          scale: 1.2,
          duration: 0.1,
        }, "-=0.15")
        tl.to(logoRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "elastic.out(2, 0.3)"
        })

      }, containerRef)

      return () => ctx.revert()
    }

    requestAnimationFrame(startAnimation)
  }, [isTransitioning, targetUrl, isNavigating, router])

  // Start reveal animation when pathname changes (page has loaded)
  React.useEffect(() => {
    if (!isNavigating || !targetUrl) return

    // Check if we've arrived at the target URL
    if (pathname === targetUrl) {
      console.log('PageTransition - Page loaded, starting reveal animation')

      const startReveal = () => {
        if (!leftCurtainRef.current || !rightCurtainRef.current ||
            !shieldRef.current || !swordRef.current ||
            !logoRef.current || !slashRef.current) {
          return
        }

        const ctx = gsap.context(() => {
          const revealTl = gsap.timeline({
            onComplete: () => {
              console.log('PageTransition - Animation complete!')
              setIsTransitioning(false)
              setTargetUrl(null)
              setIsNavigating(false)
            }
          })

          // Sword slashes
          revealTl.to(swordRef.current, {
            x: -100,
            y: 100,
            rotation: -135,
            scale: 1.5,
            duration: 0.3,
            ease: "power2.in",
          })

          // Slash effect
          revealTl.to(slashRef.current, {
            opacity: 1,
            duration: 0.1,
          }, "-=0.2")
          revealTl.to(slashRef.current, {
            scaleX: 3,
            scaleY: 1.5,
            duration: 0.2,
          }, "-=0.1")

          // Shield shatters
          revealTl.to(shieldRef.current, {
            scale: 0,
            rotation: 180,
            opacity: 0,
            duration: 0.3,
          }, "-=0.1")

          // Curtains slide open (same as they slid in)
          revealTl.to(leftCurtainRef.current, {
            x: "-100%",
            duration: 0.6,
            ease: "power3.inOut"
          }, "-=0.3")
          revealTl.to(rightCurtainRef.current, {
            x: "100%",
            duration: 0.6,
            ease: "power3.inOut"
          }, "-=0.6")

          // Everything fades
          revealTl.to([logoRef.current, swordRef.current, slashRef.current], {
            opacity: 0,
            scale: 1.5,
            duration: 0.3,
          }, "-=0.4")

        }, containerRef)

        return () => ctx.revert()
      }

      // Small delay to ensure page is fully rendered
      const timer = setTimeout(startReveal, 100)
      return () => clearTimeout(timer)
    }
  }, [isNavigating, targetUrl, pathname])

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}
      {isTransitioning && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-9999 pointer-events-none"
          style={{ isolation: 'isolate' }}
        >
          {/* Left Curtain */}
          <div
            ref={leftCurtainRef}
            className="absolute top-0 left-0 bottom-0 w-1/2 bg-linear-to-r from-[#0c0308] via-[#1a0b10] to-[#14080f]"
            style={{
              transform: 'translateX(-100%)',
              boxShadow: 'inset -40px 0 80px rgba(210, 49, 135, 0.3)'
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(245, 193, 108, 0.1) 2px, rgba(245, 193, 108, 0.1) 4px)'
            }} />
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-linear-to-l from-[#f5c16c]/30 to-transparent" />
          </div>

          {/* Right Curtain */}
          <div
            ref={rightCurtainRef}
            className="absolute top-0 right-0 bottom-0 w-1/2 bg-linear-to-l from-[#0c0308] via-[#1a0b10] to-[#14080f]"
            style={{
              transform: 'translateX(100%)',
              boxShadow: 'inset 40px 0 80px rgba(210, 49, 135, 0.3)'
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(245, 193, 108, 0.1) 2px, rgba(245, 193, 108, 0.1) 4px)'
            }} />
            <div className="absolute top-0 left-0 bottom-0 w-8 bg-linear-to-r from-[#f5c16c]/30 to-transparent" />
          </div>

          {/* Center elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Shield */}
            <div ref={shieldRef} className="absolute" style={{ opacity: 0 }}>
              <div className="relative">
                <Shield className="size-32 text-[#f5c16c]" strokeWidth={2} fill="rgba(210, 49, 135, 0.2)" />
                <div className="absolute inset-0 bg-[#f5c16c] blur-2xl opacity-40 scale-75" />
              </div>
            </div>

            {/* Logo */}
            <div ref={logoRef} className="absolute" style={{ opacity: 0 }}>
              <div className="relative flex items-center justify-center">
                <div className="size-20 rounded-full bg-linear-to-br from-[#d23187] via-[#f061a6] to-[#f5c16c] flex items-center justify-center shadow-[0_0_60px_rgba(210,49,135,0.8)]">
                  <Skull className="size-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-[#f5c16c] animate-ping" style={{ animationDuration: '1s' }} />
              </div>
            </div>

            {/* Sword */}
            <div ref={swordRef} className="absolute" style={{ opacity: 0 }}>
              <div className="relative">
                <Sword className="size-32 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" strokeWidth={2} />
                <div className="absolute inset-0 bg-linear-to-br from-white via-[#f5c16c] to-transparent blur-xl opacity-60" />
              </div>
            </div>

            {/* Slash Effect */}
            <div ref={slashRef} className="absolute" style={{ opacity: 0 }}>
              <svg width="400" height="400" viewBox="0 0 400 400" className="absolute -translate-x-1/2 -translate-y-1/2">
                <defs>
                  <linearGradient id="slashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                    <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
                    <stop offset="100%" stopColor="rgba(245, 193, 108, 0)" />
                  </linearGradient>
                </defs>
                <path d="M 50 50 L 350 350" stroke="url(#slashGradient)" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 50 50 L 350 350" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          {/* Flash overlay */}
          <div className="absolute inset-0 bg-white opacity-0 mix-blend-screen" style={{
            animation: 'clash-flash 0.3s ease-out 1.2s'
          }} />

          <style jsx>{`
            @keyframes clash-flash {
              0% { opacity: 0; }
              50% { opacity: 0.4; }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </TransitionContext.Provider>
  )
}
