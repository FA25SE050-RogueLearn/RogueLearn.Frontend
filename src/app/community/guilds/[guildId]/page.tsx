// roguelearn-web/src/app/community/guilds/[guildId]/page.tsx
import { mockCommunity } from "@/lib/mockData";
import { GuildHeader } from "@/components/guild/GuildHeader";
import { MembersList } from "@/components/guild/MembersList";
import { ChatFeed } from "@/components/guild/ChatFeed";
import { ChatInput } from "@/components/guild/ChatInput";
import { GuildBottomNav } from "@/components/guild/GuildBottomNav";

// Define the PageProps interface for Next.js 15
interface PageProps {
  params: Promise<{ guildId: string }>
}

// This new page renders the detailed view for a single guild.
// Updated for Next.js 15 async params pattern
export default async function GuildDetailPage({ params }: PageProps) {
  // Await the params in Next.js 15
  const { guildId } = await params;
  
  const guild = mockCommunity.guilds.find(g => g.id === guildId);

  if (!guild) {
    return <div className="p-8">Guild not found.</div>;
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/guild-background.jpg')" }}
    >
      <div className="flex-grow p-4 md:p-8">
        <div className="flex h-full w-full flex-col gap-8 rounded-[32px] border border-white/12 bg-[rgba(20,10,12,0.78)] p-4 shadow-[0_20px_70px_rgba(18,6,12,0.6)] backdrop-blur-xl md:flex-row md:p-8">
        {/* Main Content Area */}
          <main className="flex h-full max-h-[90vh] flex-1 flex-col">
            <GuildHeader name={guild.name} createdAt={guild.createdAt} />
            <div className="my-4 flex-grow overflow-hidden">
              <ChatFeed messages={guild.chatMessages} />
            </div>
            <ChatInput />
          </main>

          {/* Right Sidebar for Members */}
          <aside className="hidden w-64 flex-shrink-0 md:block">
            <MembersList members={guild.membersList} />
          </aside>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <GuildBottomNav />
    </div>
  );
}
