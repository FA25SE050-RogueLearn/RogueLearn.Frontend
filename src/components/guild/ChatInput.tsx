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
        className="rounded-full border border-white/15 bg-white/10 px-6 text-foreground placeholder:text-foreground/40 focus-visible:border-accent focus-visible:ring-0"
      />
      <Button className="rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90">Send</Button>
    </div>
  );
}