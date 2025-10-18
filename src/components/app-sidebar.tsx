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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
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
        <NavMain items={data.navMain} />
        {data.projects.length > 0 && <NavProjects projects={data.projects} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" onClick={handleLogout} />
      </SidebarContent>
      <SidebarFooter className="border-t border-[#f5c16c]/15 bg-[#1a0b08]/60 backdrop-blur-xl">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
