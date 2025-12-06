"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  ScrollText,
  Sword,
  Shield,
  Users,
  MoreHorizontal,
  Network,
  Archive,
  Compass,
  LogOut,
  Settings,
  User,
  GraduationCap,
  Swords,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/utils/supabase/client";
import notificationsApi from "@/api/notificationsApi";
import UserProfileModal from "@/components/profile/UserProfileModal";
import { usePageTransition } from "@/components/layout/PageTransition";

interface SidebarNavProps {
  userProfile?: {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  };
}

const primaryNavItems = [
  { title: "Sanctum", url: "/dashboard", icon: LayoutGrid },
  { title: "Quests", url: "/quests", icon: ScrollText },
  { title: "Battle", url: "/code-battle", icon: Sword },
  { title: "Boss Fight", url: "/boss-fight", icon: Swords },
  { title: "Community", url: "/community", icon: Users },
];

const secondaryNavItems = [
  { title: "Skills", url: "/skills", icon: Network },
  { title: "Arsenal", url: "/arsenal", icon: Archive },
  { title: "Party", url: "/parties", icon: Users },
  { title: "Adventure", url: "/game", icon: Compass },
  { title: "Admin", url: "/admin", icon: Shield },
];

export function SidebarNav({ userProfile }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { navigateTo } = usePageTransition();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<"profile" | "settings" | "verification">("profile");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res.isSuccess && typeof res.data === "number") {
        setUnreadCount(res.data);
      }
    } catch {}
  };

  // Initial fetch and respond to notification updates
  // Refresh when modal opens/closes and on custom event from modal actions
  useEffect(() => {
    let mounted = true;
    const load = async () => { await refreshUnreadCount(); };
    load();
    const handler = () => { if (mounted) refreshUnreadCount(); };
    try { window.addEventListener("notifications:updated", handler as any); } catch {}
    return () => { mounted = false; try { window.removeEventListener("notifications:updated", handler as any); } catch {} };
  }, [profileModalOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const domain = process.env['NEXT_PUBLIC_COOKIE_DOMAIN'];
      const secure = isHttps ? '; Secure' : '';
      const sameSite = isHttps ? 'None' : 'Lax';
      const dom = domain ? `; Domain=${domain}` : '';
      document.cookie = `rl_access_token=; Path=/; Max-Age=0${secure}; SameSite=${sameSite}${dom}`;
      document.cookie = `rl_refresh_token=; Path=/; Max-Age=0${secure}; SameSite=${sameSite}${dom}`;
    } catch {}
    router.push("/login");
  };

  const openModal = (tab: "profile" | "settings" | "verification") => {
    setProfileModalTab(tab);
    setProfileModalOpen(true);
  };

  const handleNavigation = (url: string) => {
    if (pathname !== url) {
      navigateTo(url);
    }
  };

  return (
    <>
    <UserProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} defaultTab={profileModalTab} />
    <nav className="fixed left-0 top-0 z-50 flex h-screen w-[80px] flex-col items-center border-r border-[#f5c16c]/20 bg-[#0c0308]/95 backdrop-blur-sm">
      {/* Logo Section */}
      <button 
        onClick={() => handleNavigation("/dashboard")}
        className="flex w-full justify-center p-4 transition-transform hover:scale-110"
      >
        <Image 
          src="/RougeLearn-Clear.png" 
          alt="RogueLearn" 
          width={40} 
          height={40} 
          className="h-10 w-10 object-contain"
        />
      </button>

      {/* Navigation Items */}
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-1 flex-col space-y-4 py-4">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;

            return (
              <Tooltip key={item.url}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavigation(item.url)}
                    className={`group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:bg-[#f5c16c]/15 ${
                      isActive
                        ? "bg-[#f5c16c]/15 text-[#f5c16c]"
                        : "text-[#f5c16c]/60 hover:text-[#f5c16c]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute left-0 h-8 w-1 rounded-r-full bg-[#f5c16c]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="border-[#f5c16c]/20 bg-[#1a0b08] text-[#f5c16c]">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* More Menu Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger className="flex h-12 w-12 items-center justify-center rounded-full text-[#f5c16c]/60 transition-all duration-200 hover:bg-[#f5c16c]/15 hover:text-[#f5c16c]">
                  <MoreHorizontal className="h-5 w-5" />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-[#f5c16c]/20 bg-[#1a0b08] text-[#f5c16c]">
                <p>More</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              side="right"
              className="border-[#f5c16c]/20 bg-[#1a0b08]"
            >
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.url}
                    onClick={() => handleNavigation(item.url)}
                    className="cursor-pointer text-[#f5c16c]/80 hover:bg-[#f5c16c]/15 hover:text-[#f5c16c]"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>

      {/* Profile Section at Bottom */}
      <DropdownMenu>
        <DropdownMenuTrigger className="mb-4 flex flex-col items-center gap-1 p-3 hover:bg-[#f5c16c]/10 rounded-lg transition-colors">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-[#f5c16c]/30">
              <AvatarImage src={userProfile?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#f5c16c] to-[#d23187] text-white text-xs font-bold">
                {userProfile?.firstName?.[0] || 'R'}
                {userProfile?.lastName?.[0] || 'L'}
              </AvatarFallback>
            </Avatar>
            {unreadCount > 0 && (
              <span
                aria-label={`You have ${unreadCount} unread notifications`}
                className="absolute -top-2 left-1/2 translate-x-1/2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d23187] text-white text-[10px] leading-none font-bold flex items-center justify-center ring-2 ring-[#0c0308] shadow-[0_0_12px_rgba(210,49,135,0.5)]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="w-[60px] truncate text-center text-[10px] text-[#f5c16c]">
            {userProfile?.username || 'User'}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          className="border-[#f5c16c]/20 bg-[#1a0b08] w-48"
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-[#f5c16c]">
              {userProfile?.firstName || ''} {userProfile?.lastName || ''}
            </p>
            <p className="text-xs text-[#f5c16c]/60">@{userProfile?.username || 'user'}</p>
          </div>
          <DropdownMenuSeparator className="bg-[#f5c16c]/20" />
          <DropdownMenuItem
            onClick={() => openModal("profile")}
            className="cursor-pointer text-[#f5c16c]/80 hover:bg-[#f5c16c]/15 hover:text-[#f5c16c]"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openModal("settings")}
            className="cursor-pointer text-[#f5c16c]/80 hover:bg-[#f5c16c]/15 hover:text-[#f5c16c]"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openModal("verification")}
            className="cursor-pointer text-[#f5c16c]/80 hover:bg-[#f5c16c]/15 hover:text-[#f5c16c]"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Lecturer Verification
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#f5c16c]/20" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-400 hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
    </>
  );
}
