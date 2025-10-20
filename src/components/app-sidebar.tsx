// roguelearn-web/src/components/app-sidebar.tsx
"use client"

import * as React from "react"
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
  Wand2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { CharacterCreationWizard } from "@/components/features/character-creation/CharacterCreationWizard"
import { getMyProfile } from "@/services/profileService"
import { UserProfile } from "@/types/user"
import { Button } from "./ui/button"

const data = {
  user: {
    name: "Rogue Scholar",
    email: "scholar@roguelearn.com",
    avatar: "/avatars/rogue.jpg",
  },
  navMain: [
    {
      title: "Sanctum",
      url: "/dashboard",
      icon: LayoutGrid,
      isActive: true,
    },
    {
      title: "Quests",
      url: "/quests",
      icon: ScrollText,
    },
    {
      title: "Skill Tree",
      url: "/skills",
      icon: Network,
    },
    {
      title: "Arsenal",
      url: "/arsenal",
      icon: Archive,
    },
    {
      title: "Community",
      url: "/community",
      icon: Users,
    },
    {
      title: "Code Battle",
      url: "/code-battle",
      icon: Sword,
    },
    {
      title: "Adventure",
      url: "/game",
      icon: Compass,
    },
  ],
  navSecondary: [
    {
      title: "Exit Sanctum",
      url: "#",
      icon: LogOut,
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [showCharacterWizard, setShowCharacterWizard] = React.useState(false)
  const [showAlreadyOnboarded, setShowAlreadyOnboarded] = React.useState(false);

  React.useEffect(() => {
    getMyProfile().then(setUserProfile);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }
  
  const handleForgeClick = () => {
    if (userProfile?.onboardingCompleted) {
      setShowAlreadyOnboarded(true);
    } else {
      setShowCharacterWizard(true);
    }
  };

  // MODIFIED: This handler will optimistically update the client-side state
  // and close the dialog immediately upon successful onboarding submission.
  const handleOnboardingComplete = () => {
    if (userProfile) {
      setUserProfile({ ...userProfile, onboardingCompleted: true });
    }
    setShowCharacterWizard(false);
  };

  const navItems = React.useMemo(
    () => [
      ...data.navMain,
      {
        title: "Character Forge",
        url: "#",
        icon: Wand2,
        onSelect: handleForgeClick,
      },
    ],
    [userProfile] 
  )

  return (
    <>
      <Sidebar variant="inset" {...props} className="border-[#f5c16c]/20 bg-gradient-to-b from-[#0c0308]/98 via-[#14080f]/95 to-[#08030a]/98">
        <SidebarHeader className="border-b border-[#f5c16c]/15 bg-[#1a0b08]/60 backdrop-blur-xl">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-[#f5c16c]/40 bg-gradient-to-br from-[#d23187]/80 to-[#f5c16c]/70 text-white shadow-[0_8px_24px_rgba(210,49,135,0.4)]">
                    <Skull className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-[#f5c16c]">RogueLearn</span>
                    <span className="truncate text-xs text-[#f5c16c]/70">Guild Sanctum</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="bg-gradient-to-b from-transparent via-[#d23187]/5 to-transparent">
          <NavMain items={navItems} />
          {data.projects.length > 0 && <NavProjects projects={data.projects} />}
          <NavSecondary items={data.navSecondary} className="mt-auto" onClick={handleLogout} />
        </SidebarContent>
        <SidebarFooter className="border-t border-[#f5c16c]/15 bg-[#1a0b08]/60 backdrop-blur-xl">
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
        <DialogContent className="max-w-[1100px] overflow-hidden rounded-[40px] border border-white/12 bg-gradient-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl">
           <div className="relative max-h-[82vh] overflow-y-auto bg-gradient-to-br from-[#1d0a10] via-[#240d14] to-[#090307] px-8 py-10 shadow-[0_24px_80px_rgba(10,0,16,0.65)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.32),_transparent_70%)] opacity-45" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(240,177,90,0.26),_transparent_72%)] opacity-50" />
            <div className="relative z-10">
              {/* MODIFIED: The handler is passed down to the wizard. */}
              <CharacterCreationWizard onOnboardingComplete={handleOnboardingComplete} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAlreadyOnboarded} onOpenChange={setShowAlreadyOnboarded}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-white">Character Already Forged</DialogTitle>
                  <DialogDescription className="text-foreground/70 pt-2">
                      You have already completed the character creation process. In the future, this is where you'll be able to edit your character's path.
                  </DialogDescription>
              </DialogHeader>
              <Button onClick={() => setShowAlreadyOnboarded(false)} className="mt-4 bg-accent text-accent-foreground">
                  Close
              </Button>
          </DialogContent>
      </Dialog>
    </>
  )
}