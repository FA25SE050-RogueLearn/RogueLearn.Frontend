"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#d23187]/25 data-[state=open]:text-[#f5c16c] hover:bg-[#d23187]/20 border border-[#f5c16c]/20"
            >
              <Avatar className="h-8 w-8 rounded-lg border-2 border-[#d23187]/50">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#d23187] to-[#f5c16c] text-white">RS</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-[#f5c16c]">{user.name}</span>
                <span className="truncate text-xs text-[#f5c16c]/70">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-[#f5c16c]/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#1a0b08]/95 border-[#f5c16c]/30 backdrop-blur-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg border-2 border-[#d23187]/50">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#d23187] to-[#f5c16c] text-white">RS</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#f5c16c]">{user.name}</span>
                  <span className="truncate text-xs text-[#f5c16c]/70">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#f5c16c]/20" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-white/90 hover:bg-[#d23187]/20 hover:text-[#f5c16c]">
                <Sparkles className="text-[#f5c16c]" />
                Upgrade to Legend
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#f5c16c]/20" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-white/90 hover:bg-[#d23187]/20 hover:text-[#f5c16c]">
                <BadgeCheck className="text-[#f5c16c]" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/90 hover:bg-[#d23187]/20 hover:text-[#f5c16c]">
                <CreditCard className="text-[#f5c16c]" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/90 hover:bg-[#d23187]/20 hover:text-[#f5c16c]">
                <Bell className="text-[#f5c16c]" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#f5c16c]/20" />
            <DropdownMenuItem className="text-white/90 hover:bg-[#d23187]/20 hover:text-[#f5c16c]">
              <LogOut className="text-[#f5c16c]" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
