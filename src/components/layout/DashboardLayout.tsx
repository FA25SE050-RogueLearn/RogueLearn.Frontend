// roguelearn-web/src/components/layout/DashboardLayout.tsx
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// A reusable layout component for all authenticated pages.
// It now also acts as a security boundary, redirecting unauthenticated users.
export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient(); // ← Correctly awaited
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen p-8 grid grid-cols-12 gap-8">
      <aside className="col-span-12 lg:col-span-2">
        <SidebarNav />
      </aside>
      {children}
    </div>
  );
}