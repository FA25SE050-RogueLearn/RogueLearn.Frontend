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
  Anvil,
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
import { usePathname, useRouter } from "next/navigation";
import { CharacterCreationWizard } from "@/components/features/character-creation/CharacterCreationWizard"
import profileApi from "@/api/profileApi"
import { UserProfileDto } from "@/types/user-profile"
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
      title: "Party",
      url: "/party",
      icon: Users,
    },
    {
      title: "Community",
      url: "/community",
      icon: Anvil,
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
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = React.useState<UserProfileDto | null>(null);
  const [showCharacterWizard, setShowCharacterWizard] = React.useState(false)
  const hasCheckedOnboarding = React.useRef(false)
  React.useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async () => {
      const response = await profileApi.getMyProfile();
      if (response.isSuccess) {
        setUserProfile(response.data);
      } else {
        console.error("Failed to fetch profile even though user is authenticated.");
        setUserProfile(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        console.log("Auth state changed: User is signed in. Fetching profile...");
        fetchProfile();
      } else {
        console.log("Auth state changed: User is signed out.");
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // MODIFICATION: This handler now decides where to send the user based on their onboarding status.
  React.useEffect(() => {
    if (!hasCheckedOnboarding.current && userProfile) {
      hasCheckedOnboarding.current = true

      if (!userProfile.onboardingCompleted || !userProfile.routeId || !userProfile.classId) {
        setShowCharacterWizard(true)
      }
    }
  }, [userProfile])

  const handleOnboardingComplete = () => {
    if (userProfile) {
      setUserProfile({ ...userProfile, onboardingCompleted: true });
    }
    setShowCharacterWizard(false);
  };

  const navItems = data.navMain.map(item => ({
    ...item,
    isActive: item.url === pathname,
  }));

  return (
    <>
      <Sidebar variant="inset" {...props} className="border-[#f5c16c]/20 bg-linear-to-b from-[#0c0308]/98 via-[#14080f]/95 to-[#08030a]/98">
        <SidebarHeader className="border-b border-[#f5c16c]/15 bg-[#1a0b08]/60 backdrop-blur-xl">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-[#f5c16c]/40 bg-linear-to-br from-[#d23187]/80 to-[#f5c16c]/70 text-white shadow-[0_8px_24px_rgba(210,49,135,0.4)]">
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
        <SidebarContent className="bg-linear-to-b from-transparent via-[#d23187]/5 to-transparent">
          <NavMain items={navItems} />
          {data.projects.length > 0 && <NavProjects projects={data.projects} />}
          <NavSecondary items={data.navSecondary} className="mt-auto" onClick={handleLogout} />
        </SidebarContent>
        <SidebarFooter className="border-t border-[#f5c16c]/15 bg-[#1a0b08]/60 backdrop-blur-xl">
          <NavUser user={userProfile} />
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
        <DialogContent className="max-w-[1100px] overflow-hidden rounded-[40px] border border-white/12 bg-linear-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Character Creation</DialogTitle>
          </DialogHeader>
          <div className="relative max-h-[82vh] overflow-y-auto bg-linear-to-br from-[#1d0a10] via-[#240d14] to-[#090307] px-8 py-10 shadow-[0_24px_80px_rgba(10,0,16,0.65)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-45" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.26),transparent_72%)] opacity-50" />
            <div className="relative z-10">
              <CharacterCreationWizard onOnboardingComplete={handleOnboardingComplete} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}