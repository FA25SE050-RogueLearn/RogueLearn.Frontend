// roguelearn-web/src/components/guild/GuildBottomNav.tsx
import { Button } from "../ui/button";
import { Home, ScrollText, Calendar, Users } from "lucide-react";

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Story', icon: ScrollText },
  { label: 'Events', icon: Calendar },
  { label: 'Members', icon: Users },
];

// Renders the fixed bottom navigation bar for the guild page.
export function GuildBottomNav() {
  return (
    <div className="flex justify-around p-2 flex-shrink-0 border-t border-white/12 bg-black/40 backdrop-blur-xl text-foreground/70">
      {navItems.map(item => (
        <Button key={item.label} variant="ghost" className="flex h-auto flex-col rounded-xl bg-white/5 px-4 py-2 text-foreground hover:bg-accent/15 hover:text-accent">
          <item.icon className="h-6 w-6" />
          <span className="mt-1 text-xs tracking-[0.25em] uppercase">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}