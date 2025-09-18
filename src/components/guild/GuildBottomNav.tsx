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
    <div className="flex-shrink-0 bg-background/80 backdrop-blur-md border-t border-border/50 flex justify-around p-2">
      {navItems.map(item => (
        <Button key={item.label} variant="ghost" className="flex flex-col h-auto p-2">
          <item.icon className="w-6 h-6" />
          <span className="text-xs mt-1">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}