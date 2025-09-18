// roguelearn-web/src/components/guild/ChatFeed.tsx
import { mockUser } from "@/lib/mockData";

interface Message {
  id: string;
  userId: string;
  name: string;
  message: string;
}

interface ChatFeedProps {
  messages: Message[];
}

// Renders the scrollable list of chat messages.
export function ChatFeed({ messages }: ChatFeedProps) {
  return (
    <div className="h-full overflow-y-auto pr-4 space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className="flex items-start gap-4">
          <div className="w-10 h-10 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center font-bold">
            {msg.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold font-heading text-accent">{msg.name}</p>
            <p className="font-body text-foreground/90">{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}