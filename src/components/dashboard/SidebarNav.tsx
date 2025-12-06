// roguelearn-web/src/components/dashboard/SidebarNav.tsx
'use client';

import { Archive, Code, LayoutGrid, LogOut, Network, ScrollText, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Defines the navigation items for the sidebar with their corresponding paths.
const navItems = [
  { href: '/dashboard', label: 'Sanctum', icon: LayoutGrid },
  { href: '/quests', label: 'Quests', icon: ScrollText },
  { href: '/skills', label: 'Skill Tree', icon: Network },
  { href: '/arsenal', label: 'Arsenal', icon: Archive },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/code-battle', label: 'Code Battle', icon: Code },
];

interface SidebarNavProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

// Renders the main sidebar navigation menu, highlighting the active page.
export function SidebarNav({ isCollapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Handles the user logout process.
  const handleLogout = async () => {
    const supabase = await createClient();
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
    router.push('/login'); // Redirect to login page after sign out.
    router.refresh(); // Refresh the page to clear any cached user data.
  };

  const navLinkProps = (href: string) => ({
    href,
    onClick: () => {
      if (onNavigate) {
        onNavigate();
      }
    },
  });

  if (isCollapsed) {
    return (
      <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[30px] border border-[#f5c16c]/25 bg-linear-to-br from-[#2a140f]/92 via-[#160b08]/94 to-[#080403]/96 p-4 shadow-[0_22px_70px_rgba(38,12,6,0.55)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.25),transparent_70%)]" />
        <div className="relative z-10 flex h-full w-full flex-col items-center gap-6">
          <Link
            href="/dashboard"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f5c16c]/40 bg-[#1a0c08]/90 text-lg font-semibold uppercase tracking-[0.4em] text-[#f5c16c] shadow-[0_10px_25px_rgba(210,49,135,0.35)]"
            onClick={onNavigate}
          >
            RL
          </Link>

          <nav className="flex flex-1 flex-col items-center gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  {...navLinkProps(item.href)}
                  className={cn(
                    "group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-[#140806]/70 text-[#f5c16c] transition-all",
                    isActive
                      ? "border-[#d23187]/50 bg-[#d23187]/25 shadow-[0_10px_30px_rgba(210,49,135,0.35)] text-white"
                      : "hover:border-[#d23187]/35 hover:bg-[#d23187]/20 hover:text-white"
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            className="group flex h-12 w-full items-center justify-center rounded-2xl border border-[#d23187]/45 bg-[#d23187]/15 text-xs font-semibold uppercase tracking-[0.45em] text-[#f9d9eb] transition hover:border-[#d23187]/60 hover:bg-[#d23187]/25 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[#f5c16c]/20 bg-linear-to-br from-[#2a140f]/90 via-[#160b08]/92 to-[#0a0503]/95 p-6 shadow-[0_22px_70px_rgba(38,12,6,0.55)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.25),transparent_70%)]" />
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-4 h-20 w-20 rounded-full border border-[#f5c16c]/50 bg-[#2a1a3a] bg-cover bg-center shadow-[0_10px_30px_rgba(210,49,135,0.35)]"
          />
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">Guild Codex</p>
            <h1 className="text-2xl font-semibold text-white">RogueLearn</h1>
            <p className="text-sm text-foreground/70">Sanctum of Endless Dungeons</p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-[#d23187]/45 bg-[#d23187]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#f9d9eb]">
            <span className="h-2 w-2 rounded-full bg-[#f5c16c] shadow-[0_0_12px_rgba(245,193,108,0.75)]" />
            Online
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                {...navLinkProps(item.href)}
                className={cn(
                  "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#f5c16c]/12 bg-[#140806]/80 px-5 py-4 transition-all duration-300",
                  "before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-[#d23187]/0 before:via-[#d23187]/15 before:to-[#f5c16c]/35 before:transition-transform before:duration-500 group-hover:before:translate-x-0",
                  isActive
                    ? "border-[#d23187]/45 bg-[#d23187]/20 shadow-[0_15px_40px_rgba(210,49,135,0.35)] text-white"
                    : "hover:border-[#d23187]/35 hover:bg-[#d23187]/15 hover:text-white"
                )}
              >
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a0c08]/80 text-[#f5c16c] shadow-inner shadow-[#d23187]/30">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="relative z-10 flex flex-1 flex-col">
                  <span className="text-sm font-semibold uppercase tracking-widest text-white">{item.label}</span>
                  <span className="text-[11px] text-[#f5c16c]/70">Traverse the {item.label.toLowerCase()}</span>
                </div>
                <span
                  className={cn(
                    "relative z-10 h-2 w-2 rounded-full transition-colors",
                    isActive ? "bg-[#f5c16c] shadow-[0_0_12px_rgba(245,193,108,0.7)]" : "bg-white/20"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-[#f5c16c]/18 bg-[#1a0b08]/80 p-4 text-sm text-[#f5c16c]/80">
            <p className="font-semibold text-white">Daily Omen</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              &quot;The labyrinth shifts tonight. Prepare your runes and sharpen your resolve.&quot;
            </p>
          </div>
          <Button
            variant="ghost"
            className="group flex w-full items-center justify-between rounded-2xl border border-[#d23187]/40 bg-[#d23187]/15 px-5 py-4 text-sm font-semibold uppercase tracking-widest text-[#f9d9eb] transition hover:border-[#d23187]/60 hover:bg-[#d23187]/25 hover:text-white"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              Log Out
            </span>
            <span className="text-[10px] tracking-[0.4em] text-[#f5c16c]/70">EXIT</span>
          </Button>
          <p className="text-center text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/50">
            May wisdom guide your journey, Scribe.
          </p>
        </div>
      </div>
    </div>
  );
}
