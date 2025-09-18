// roguelearn-web/src/components/layout/DashboardLayout.tsx
import { SidebarNav } from "@/components/dashboard/SidebarNav";

// A reusable layout component for all authenticated pages.
// It sets up the sidebar and the main content area grid.
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-8 grid grid-cols-12 gap-8">
      <aside className="col-span-12 lg:col-span-2">
        <SidebarNav />
      </aside>
      {children}
    </div>
  );
}