// roguelearn-web/src/app/page.tsx
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UserHeader } from "@/components/dashboard/UserHeader";
import { CharacterStats } from "@/components/dashboard/CharacterStats";
import { ActiveQuest } from "@/components/dashboard/ActiveQuest";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";

// This is the new homepage, which renders the main dashboard layout.
export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8 grid grid-cols-12 gap-8">
      {/* Left Sidebar Navigation */}
      <aside className="col-span-12 lg:col-span-2">
        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <main className="col-span-12 lg:col-span-7 flex flex-col gap-8">
        <UserHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CharacterStats />
          <ActiveQuest />
        </div>
      </main>

      {/* Right Sidebar for Events */}
      <aside className="col-span-12 lg:col-span-3">
        <UpcomingEvents />
      </aside>
    </div>
  );
}