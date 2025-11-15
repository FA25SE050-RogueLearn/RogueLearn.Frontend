/* eslint-disable react-hooks/purity */
"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import gsap from "gsap"
import {
  Archive,
  Compass,
  LayoutGrid,
  Network,
  ScrollText,
  Sword,
  Users,
  LogOut,
  Skull,
  Anvil,
  ChevronDown,
  Sparkles,
  Flame,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import profileApi from "@/api/profileApi"
import { UserProfileDto } from "@/types/user-profile"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CharacterCreationWizard } from "@/components/features/character-creation/CharacterCreationWizard"
import { usePageTransition } from "@/components/layout/PageTransition"

const navItems = [
  { title: "Sanctum", url: "/dashboard", icon: LayoutGrid, color: "from-purple-500 to-pink-500" },
  { title: "Quests", url: "/quests", icon: ScrollText, color: "from-amber-500 to-orange-500" },
  { title: "Skills", url: "/skills", icon: Network, color: "from-blue-500 to-cyan-500" },
  { title: "Arsenal", url: "/arsenal", icon: Archive, color: "from-green-500 to-emerald-500" },
  { title: "Party", url: "/party", icon: Users, color: "from-pink-500 to-rose-500" },
  { title: "Community", url: "/community", icon: Anvil, color: "from-orange-500 to-red-500" },
  { title: "Battle", url: "/code-battle", icon: Sword, color: "from-red-500 to-rose-600" },
  { title: "Adventure", url: "/game", icon: Compass, color: "from-indigo-500 to-purple-500" },
]

export function DungeonNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { navigateTo } = usePageTransition()
  const [userProfile, setUserProfile] = React.useState<UserProfileDto | null>(null)
  const [showCharacterWizard, setShowCharacterWizard] = React.useState(false)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const navRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const particlesRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const response = await profileApi.getMyProfile()
      if (response.isSuccess) setUserProfile(response.data)
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile()
      else setUserProfile(null)
    })
    return () => subscription?.unsubscribe()
  }, [])
  // CRITICAL FIX: Automatically trigger onboarding wizard for users who haven't completed it
  React.useEffect(() => {
    if (userProfile && !userProfile.onboardingCompleted) {
      setShowCharacterWizard(true)
    }
  }, [userProfile])


  // Subtle entrance animation - fade in only
  React.useEffect(() => {
    if (!navRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      })
    }, navRef)
    return () => ctx.revert()
  }, [])

  // Particle animation
  React.useEffect(() => {
    if (!particlesRef.current) return
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.animationDuration = `${2 + Math.random() * 3}s`
      particle.style.opacity = `${0.3 + Math.random() * 0.5}`
      particlesRef.current?.appendChild(particle)
      setTimeout(() => particle.remove(), 5000)
    }

    const interval = setInterval(createParticle, 300)
    return () => clearInterval(interval)
  }, [])

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index)
    const item = itemRefs.current[index]
    if (item) {
      gsap.to(item, {
        scale: 1.2,
        y: -10,
        duration: 0.3,
        ease: "back.out(1.7)",
      })

      // Pulse effect
      gsap.to(item.querySelector('.icon-glow'), {
        scale: 1.5,
        opacity: 0.8,
        duration: 0.3,
      })
    }
  }

  const handleMouseLeave = (index: number) => {
    setHoveredIndex(null)
    const item = itemRefs.current[index]
    if (item) {
      gsap.to(item, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      })

      gsap.to(item.querySelector('.icon-glow'), {
        scale: 1,
        opacity: 0.4,
        duration: 0.3,
      })
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleOnboardingComplete = () => {
    if (userProfile) setUserProfile({ ...userProfile, onboardingCompleted: true })
    setShowCharacterWizard(false)
  }

  const activeIndex = navItems.findIndex(item => pathname === item.url || pathname?.startsWith(item.url + "/"))

  return (
    <>
      {/* Minimal Top Bar - Game HUD Style */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14">
        {/* Ornamental top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#f5c16c] to-transparent opacity-60" />

        <div className="relative h-full bg-linear-to-b from-[#0c0308]/98 via-[#0c0308]/95 to-transparent backdrop-blur-md border-b border-[#f5c16c]/10">
          {/* Diagonal pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 193, 108, 0.1) 10px, rgba(245, 193, 108, 0.1) 20px)'
          }} />

          <div className="relative h-full mx-auto max-w-[1800px] px-6 flex items-center justify-between">
            {/* Logo - Game Title Style */}
            <button
              onClick={(e) => {
                e.preventDefault()
                if (pathname !== "/dashboard") {
                  navigateTo("/dashboard")
                }
              }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative">
                {/* Spinning outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#f5c16c]/30 animate-spin" style={{ animationDuration: '8s' }} />
                <div className="relative flex size-10 items-center justify-center rounded-full bg-linear-to-br from-[#d23187] via-[#f061a6] to-[#f5c16c] shadow-[0_0_20px_rgba(210,49,135,0.6)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(245,193,108,0.8)]">
                  <Skull className="size-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <Sparkles className="absolute -top-1 -right-1 size-3 text-[#f5c16c] animate-pulse" />
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-[#f5c16c] tracking-wider uppercase drop-shadow-[0_0_10px_rgba(245,193,108,0.5)]" style={{ fontFamily: 'serif' }}>
                  RogueLearn
                </div>
                <div className="text-[9px] text-[#f5c16c]/50 uppercase tracking-[0.3em]">Guild Sanctum</div>
              </div>
            </button>

            {/* XP Bar */}
            <div className="hidden lg:flex items-center gap-3">
              <Flame className="size-4 text-orange-500 animate-pulse" />
              <div className="w-48 h-2 rounded-full bg-[#1a0b08]/80 border border-[#f5c16c]/20 overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] rounded-full shadow-[0_0_10px_rgba(245,193,108,0.6)]" style={{ width: '65%' }} />
              </div>
              <span className="text-xs text-[#f5c16c]/70 font-semibold">650/1000 XP</span>
            </div>

            {/* User Profile - RPG Style */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 border border-[#f5c16c]/20 bg-[#1a0b08]/40 backdrop-blur-sm transition-all duration-300 hover:border-[#f5c16c]/40 hover:bg-[#1a0b08]/60">
                <div className="relative">
                  <Avatar className="size-8 border-2 border-[#f5c16c]/40 shadow-[0_0_12px_rgba(210,49,135,0.4)]">
                    <AvatarFallback className="bg-linear-to-br from-[#d23187] to-[#f5c16c] text-white text-xs font-bold">
                      {userProfile?.username?.slice(0, 2).toUpperCase() || "RS"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-linear-to-br from-amber-400 to-orange-500 border border-[#1a0b08] flex items-center justify-center text-[8px] font-bold text-white">
                    {userProfile?.level || 1}
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-[#f5c16c]">{userProfile?.username || "Scholar"}</div>
                  <div className="text-[9px] text-[#f5c16c]/50 uppercase">Lv.{userProfile?.level || 1}</div>
                </div>
                <ChevronDown className="size-3 text-[#f5c16c]/60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-2 border-[#f5c16c]/30 bg-[#0c0308]/98 backdrop-blur-xl shadow-[0_0_40px_rgba(210,49,135,0.4)]">
                <div className="px-3 py-2 border-b border-[#f5c16c]/20">
                  <p className="text-sm font-bold text-[#f5c16c]">{userProfile?.username || "Rogue Scholar"}</p>
                  <p className="text-xs text-[#f5c16c]/60">Level {userProfile?.level || 1} • {userProfile?.roles || "Novice"}</p>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="text-[#f5c16c]/70 hover:text-[#f5c16c] hover:bg-[#f5c16c]/10 cursor-pointer mt-1">
                  <LogOut className="mr-2 size-4" />Exit Sanctum
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="h-14" />

      {/* Bottom Dock - Enchanted Spell Bar */}
      <nav ref={navRef} className="fixed bottom-0 left-0 right-0 z-50 pb-4 px-4">
        <div className="relative mx-auto max-w-5xl">
          {/* Mystical floating runes on sides */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[#f5c16c]/20 text-4xl animate-pulse" style={{ animationDuration: '3s' }}>◈</div>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-[#f5c16c]/20 text-4xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>◈</div>

          {/* Main spell bar container with arcane energy */}
          <div className="relative">
            {/* Pulsing energy background */}
            <div className="absolute inset-0 bg-linear-to-r from-[#d23187]/20 via-[#f5c16c]/20 to-[#d23187]/20 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />

            {/* Skill tree connectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" style={{ top: '-20px' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f5c16c" stopOpacity="0" />
                  <stop offset="50%" stopColor="#f5c16c" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f5c16c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[...Array(7)].map((_, i) => (
                <line
                  key={i}
                  x1={`${12.5 + i * 12.5}%`}
                  y1="50%"
                  x2={`${12.5 + (i + 1) * 12.5}%`}
                  y2="50%"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s`, animationDuration: '2s' }}
                />
              ))}
            </svg>

            {/* Main container with layered glass effect */}
            <div className="relative overflow-visible">
              {/* Clipped background layer */}
              <div className="absolute inset-0 pointer-events-none" style={{
                clipPath: 'polygon(2% 0%, 98% 0%, 100% 20%, 100% 80%, 98% 100%, 2% 100%, 0% 80%, 0% 20%)'
              }}>
                {/* Particle background */}
                <div ref={particlesRef} className="absolute inset-0" />

                {/* Animated border strips */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#f5c16c] to-transparent animate-pulse" />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#d23187] to-transparent animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Main background with depth */}
                <div className="absolute inset-0 bg-linear-to-b from-[#0a0508]/95 via-[#140810]/98 to-[#0a0508]/95 backdrop-blur-2xl border-y-2 border-[#f5c16c]/20">
                  {/* Embossed pattern */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(245, 193, 108, 0.1) 50px, rgba(245, 193, 108, 0.1) 51px)`
                  }} />

                  {/* Energy wave effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#f5c16c]/5 to-transparent animate-pulse" style={{ animationDuration: '5s' }} />
                </div>
              </div>

              {/* Navigation Items - not clipped */}
              <div className="relative flex items-center justify-center gap-10 px-6 py-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = index === activeIndex

                  return (
                    <button
                      key={item.url}
                      onClick={(e) => {
                        e.preventDefault()
                        if (pathname !== item.url) {
                          navigateTo(item.url)
                        }
                      }}
                      className="group relative shrink-0"
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={() => handleMouseLeave(index)}
                    >
                      <div
                        ref={(el) => { itemRefs.current[index] = el }}
                        className="nav-icon relative"
                        style={{ transformOrigin: 'bottom center' }}
                      >
                        {/* Outer rotating ring */}
                        <div className={cn(
                          "absolute inset-0 rounded-full transition-all duration-500",
                          isActive && "animate-spin"
                        )} style={{
                          animationDuration: '20s',
                          background: `conic-gradient(from 0deg, transparent, ${isActive ? '#f5c16c' : 'transparent'}, transparent)`
                        }} />

                        {/* Spell circle frame */}
                        <div className={cn(
                          "relative flex size-20 items-center justify-center rounded-full transition-all duration-300",
                          "before:absolute before:inset-0 before:rounded-full before:border-2 before:transition-all before:duration-300",
                          "after:absolute after:inset-1 after:rounded-full after:border after:transition-all after:duration-300",
                          isActive
                            ? "before:border-[#f5c16c] before:shadow-[0_0_20px_rgba(245,193,108,0.6)] after:border-white/20"
                            : "before:border-[#f5c16c]/20 group-hover:before:border-[#f5c16c]/50 after:border-[#f5c16c]/10"
                        )}>
                          {/* Pulsing glow */}
                          <div className={cn(
                            "icon-glow absolute inset-0 rounded-full bg-linear-to-br opacity-0 blur-xl transition-all duration-300",
                            item.color,
                            isActive ? "opacity-60" : "group-hover:opacity-40"
                          )} />

                          {/* Inner rune circle */}
                          <div className={cn(
                            "absolute inset-3 rounded-full border border-dashed transition-all duration-300",
                            isActive
                              ? "border-[#f5c16c]/40 animate-spin"
                              : "border-[#f5c16c]/10 group-hover:border-[#f5c16c]/30"
                          )} style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

                          {/* Background with mystical gradient */}
                          <div className={cn(
                            "absolute inset-2 rounded-full transition-all duration-300",
                            isActive
                              ? `bg-linear-to-br ${item.color} shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]`
                              : "bg-linear-to-br from-[#1a0b08]/90 to-[#0c0308]/90 group-hover:from-[#1a0b08]/70 group-hover:to-[#0c0308]/70"
                          )} />

                          {/* Icon with enhanced glow */}
                          <Icon className={cn(
                            "relative size-8 transition-all duration-300 filter",
                            isActive
                              ? "text-white drop-shadow-[0_0_16px_rgba(255,255,255,1)] scale-110"
                              : "text-[#f5c16c]/60 group-hover:text-[#f5c16c] group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(245,193,108,0.8)]"
                          )} />

                          {/* Active state - orbital dots */}
                          {isActive && (
                            <>
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-ping" />
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-ping" style={{ animationDelay: '0.5s' }} />
                            </>
                          )}

                          {/* Level indicator mini badge */}
                          <div className={cn(
                            "absolute -top-1 -right-1 size-5 rounded-full border transition-all duration-300 flex items-center justify-center text-[9px] font-bold",
                            isActive
                              ? "bg-linear-to-br from-amber-400 to-orange-500 border-white/40 text-white shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                              : "bg-[#0c0308] border-[#f5c16c]/30 text-[#f5c16c]/60"
                          )}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Enhanced tooltip with rune styling */}
                        <div className={cn(
                          "absolute -top-20 left-1/2 -translate-x-1/2 transition-all duration-300",
                          hoveredIndex === index
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none"
                        )}>
                          <div className="relative px-5 py-2.5 bg-linear-to-br from-[#0c0308]/98 to-[#1a0b08]/98 backdrop-blur-xl border-2 border-[#f5c16c]/40 shadow-[0_0_30px_rgba(210,49,135,0.6)] rounded-lg">
                            {/* Tooltip decorative corners */}
                            <div className="absolute -top-1 -left-1 size-3 border-t-2 border-l-2 border-[#f5c16c]" />
                            <div className="absolute -top-1 -right-1 size-3 border-t-2 border-r-2 border-[#f5c16c]" />

                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                              <div className="size-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#f5c16c]/40" />
                            </div>

                            <span className="relative text-sm font-bold text-[#f5c16c] whitespace-nowrap uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(245,193,108,0.8)]">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom shadow casting depth */}
            <div className="absolute -bottom-8 left-0 right-0 h-8 bg-linear-to-b from-black/50 to-transparent blur-xl" />
          </div>
        </div>
      </nav>

      <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
        <DialogContent className="max-w-[1100px] overflow-hidden rounded-[40px] border border-white/12 bg-linear-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl">
          <div className="relative max-h-[82vh] overflow-y-auto bg-linear-to-br from-[#1d0a10] via-[#240d14] to-[#090307] px-8 py-10 shadow-[0_24px_80px_rgba(10,0,16,0.65)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-45" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.26),transparent_72%)] opacity-50" />
            <div className="relative z-10"><CharacterCreationWizard onOnboardingComplete={handleOnboardingComplete} /></div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .particle {
          position: absolute;
          bottom: 0;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, rgba(245, 193, 108, 0.8), transparent);
          border-radius: 50%;
          animation: float-up linear forwards;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 40 - 20}px);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
