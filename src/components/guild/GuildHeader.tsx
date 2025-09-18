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
    <div className="flex justify-between items-center text-foreground p-4 bg-background/50 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold font-heading">{name}</h1>
        <p className="text-sm text-foreground/70 font-body">{createdAt}</p>
      </div>
      <Button variant="outline">
        <PanelRight className="mr-2 h-4 w-4" /> Guild Menu
      </Button>
    </div>
  );
}