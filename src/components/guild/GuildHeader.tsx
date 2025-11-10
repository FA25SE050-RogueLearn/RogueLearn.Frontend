// roguelearn-web/src/components/guild/GuildHeader.tsx
import { Button } from "../ui/button";
import { PanelRight } from "lucide-react";

interface GuildHeaderProps {
  name: string;
  createdAt: string;
}

// Renders the header for the guild page, displaying the name and menu button.
export function GuildHeader({ name, createdAt }: GuildHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/12 bg-linear-to-r from-white/12 via-white/5 to-transparent p-5 text-foreground shadow-[0_14px_40px_rgba(26,6,12,0.4)] backdrop-blur-xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-heading text-white">{name}</h1>
        <p className="text-xs uppercase tracking-[0.35em] text-foreground/60 font-body">Founded {createdAt}</p>
      </div>
      <Button variant="outline" className="rounded-full border-accent/40 bg-accent/10 text-xs uppercase tracking-[0.35em] text-accent hover:bg-accent/20">
        <PanelRight className="mr-2 h-4 w-4" /> Guild Menu
      </Button>
    </div>
  );
}