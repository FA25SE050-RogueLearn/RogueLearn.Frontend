// roguelearn-web/src/components/guild/ChatInput.tsx
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Renders the input field and send button for the chat.
export function ChatInput() {
  return (
    <div className="flex gap-4">
      <Input 
        type="text" 
        placeholder="I would say it's a good sub legacy" 
        className="bg-background/80 border-border/50 focus:ring-accent"
      />
      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Send</Button>
    </div>
  );
}