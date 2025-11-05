// roguelearn-web/src/components/layout/DashboardLayout.tsx
import { DashboardFrame } from "@/components/layout/DashboardFrame";
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
    <div className="relative max-h-screen w-full overflow-hidden bg-[#08040a] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0510]/95 via-[#1b0b19]/90 to-[#070b1c]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.35),_transparent_60%)]" />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
          }}
        />
      </div>

      <DashboardFrame>{children}</DashboardFrame>
    </div>
  );
}