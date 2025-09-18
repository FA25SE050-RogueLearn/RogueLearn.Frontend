// roguelearn-web/src/app/page.tsx
import { UserHeader } from "@/components/dashboard/UserHeader";
import { CharacterStats } from "@/components/dashboard/CharacterStats";
import { ActiveQuest } from "@/components/dashboard/ActiveQuest";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// The homepage is the main dashboard, now wrapped in the reusable DashboardLayout.
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-7 flex flex-col gap-8">
        <UserHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CharacterStats />
          <ActiveQuest />
        </div>
      </main>
      <aside className="col-span-12 lg:col-span-3">
        <UpcomingEvents />
      </aside>
    </DashboardLayout>
  );
}