// roguelearn-web/src/components/dashboard/SidebarNav.tsx
import { Archive, LayoutGrid, Network, ScrollText, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

// Defines the navigation items for the sidebar.
const navItems = [
  { href: '#', label: 'Dashboard', icon: LayoutGrid },
  { href: '#', label: 'Quests', icon: ScrollText },
  { href: '#', label: 'Skill Tree', icon: Network },
  { href: '#', label: 'Arsenal', icon: Archive },
  { href: '#', label: 'Community', icon: Users },
];

// Renders the main sidebar navigation menu.
export function SidebarNav() {
  return (
    <div className="h-full flex flex-col bg-card/50 rounded-lg p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-center">RogueLearn</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={item.label}>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base font-body p-6",
                  index === 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/50"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-4 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto text-center">
        <p className="text-sm font-body text-foreground/60">May wisdom guide your journey, Scribe.</p>
      </div>
    </div>
  );
}