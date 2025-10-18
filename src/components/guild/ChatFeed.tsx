// roguelearn-web/src/components/guild/ChatFeed.tsx
import { ChatMessage as Message } from "@/lib/mockData";

interface ChatFeedProps {
  messages: Message[];
}

// Renders the scrollable list of chat messages.
export function ChatFeed({ messages }: ChatFeedProps) {
  return (
    <div className="h-full overflow-y-auto pr-4 space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-bold text-accent">
            {msg.name.charAt(0)}
          </div>
          <div>
            <p className="font-heading font-semibold text-accent">{msg.name}</p>
            <p className="font-body text-foreground/80">{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}