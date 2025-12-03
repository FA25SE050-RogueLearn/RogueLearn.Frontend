// roguelearn-web/src/components/layout/DashboardLayout.tsx
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getCachedUserFullInfo } from "@/lib/api-server";

interface FullUserInfoResponse {
  profile: {
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
}

export async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      redirect('/login');
    }
  } catch (authError) {
    console.error('Auth error in DashboardLayout:', authError);
    redirect('/login');
  }

  // Fetch user profile for sidebar (uses cached version to avoid duplicate API calls)
  let userProfile = null;
  try {
    const fullInfo = await getCachedUserFullInfo();
    userProfile = fullInfo?.profile;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
  }

  return (
    <div className="relative min-h-screen w-full bg-[#08040a] text-foreground">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#0b0510]/95 via-[#1b0b19]/90 to-[#070b1c]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.35),transparent_60%)]" />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
          }}
        />
      </div>

      <div className="relative z-10">
        <DashboardFrame userProfile={userProfile || undefined}>{children}</DashboardFrame>
      </div>
    </div>
  );
}