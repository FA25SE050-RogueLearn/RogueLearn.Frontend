// roguelearn-web/src/app/community/guilds/[guildId]/page.tsx
import { mockCommunity } from "@/lib/mockData";
import { GuildHeader } from "@/components/guild/GuildHeader";
import { MembersList } from "@/components/guild/MembersList";
import { ChatFeed } from "@/components/guild/ChatFeed";
import { ChatInput } from "@/components/guild/ChatInput";
import { GuildBottomNav } from "@/components/guild/GuildBottomNav";

// This new page renders the detailed view for a single guild.
export default function GuildDetailPage({ params }: { params: { guildId: string } }) {
  const guild = mockCommunity.guilds.find(g => g.id === params.guildId);

  if (!guild) {
    return <div className="p-8">Guild not found.</div>;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/guild-background.jpg')" }}
    >
      <div className="flex-grow flex backdrop-blur-sm backdrop-brightness-50 p-4 md:p-8 gap-8">
        {/* Main Content Area */}
        <main className="flex-grow flex flex-col h-full max-h-[90vh]">
          <GuildHeader name={guild.name} createdAt={guild.createdAt} />
          <div className="flex-grow my-4 overflow-hidden">
            <ChatFeed messages={guild.chatMessages} />
          </div>
          <ChatInput />
        </main>

        {/* Right Sidebar for Members */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <MembersList members={guild.membersList} />
        </aside>
      </div>
      
      {/* Bottom Navigation */}
      <GuildBottomNav />
    </div>
  );
}