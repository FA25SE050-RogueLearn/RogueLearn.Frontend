// roguelearn-web/src/components/layout/AdminLayout.tsx
"use client";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

// REMOVED: SubjectImportProvider import (now in app/admin/layout.tsx)

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login?redirect=/admin");
          return;
        }

        // Parse JWT to get roles
        const token = session.access_token;
        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles: string[] = payload.roles || [];

        const adminRoles = ["Admin", "Administrator", "Game Master"];
        const isAdmin = roles.some((role) => adminRoles.includes(role));

        if (!isAdmin) {
          router.replace("/unauthorized");
          return;
        }

        setIsAuthorized(true);
      } catch {
        router.replace("/unauthorized");
      }
    };

    checkAdminRole();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0a0506] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
          <p className="text-white/60">Verifying access...</p>
        </div>
      </div>
    );
  }

  // REMOVED: SubjectImportProvider wrapper
  return (
    <div className="relative min-h-screen w-full bg-[#0a0506] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b08]/90 via-[#0a0506] to-[#0b0510]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,193,108,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(210,49,135,0.06),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#f5c16c]/10 bg-[#1a0b08]/80 backdrop-blur-sm lg:block">
          <AdminSidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}