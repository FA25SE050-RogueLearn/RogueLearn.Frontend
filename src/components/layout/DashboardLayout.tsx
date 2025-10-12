// roguelearn-web/src/components/layout/DashboardLayout.tsx
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

// The DashboardLayout has been refactored to use Flexbox for a more robust structure.
// This ensures the sidebar has a fixed height and the main content area is scrollable.
export async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    // The main container is now a flexbox, taking up the full viewport height.
    <div className="h-screen flex gap-8 p-8">
      {/* The sidebar has a fixed width and will not shrink. */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <SidebarNav />
      </aside>
      
      {/* The main content area grows to fill remaining space and handles its own scrolling. */}
      <div className="flex-grow overflow-y-auto">
        {children}
      </div>
    </div>
  );
}