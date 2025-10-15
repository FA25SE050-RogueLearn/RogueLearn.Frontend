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
  { href: '/character', label: 'Dashboard', icon: LayoutGrid },
  { href: '/quests', label: 'Quests', icon: ScrollText },
  { href: '/skills', label: 'Skill Tree', icon: Network },
  { href: '/arsenal', label: 'Arsenal', icon: Archive },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/code-battle', label: 'Code Battle', icon: Code },
];

// Renders the main sidebar navigation menu, highlighting the active page.
export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Handles the user logout process.
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login'); // Redirect to login page after sign out.
    router.refresh(); // Refresh the page to clear any cached user data.
  };

  return (
    <div className="h-full flex flex-col bg-card/50 rounded-lg p-4">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold font-heading text-center">RogueLearn</h1>
      </div>
      {/* The nav element now grows to push the logout button to the bottom. */}
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            // Determine if the current nav item is the active page.
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-base font-body p-6",
                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/50"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-4 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* The logout section is now correctly positioned at the bottom. */}
      <div className="flex-shrink-0 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-body p-6 hover:bg-destructive/80 hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-4 h-5 w-5" />
          Logout
        </Button>
        <p className="text-sm font-body text-foreground/60 text-center mt-4">May wisdom guide your journey, Scribe.</p>
      </div>
    </div>
  );
}