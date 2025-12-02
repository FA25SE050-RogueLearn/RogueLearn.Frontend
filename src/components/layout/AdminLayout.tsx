"use client";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

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

        const isAdmin = roles.some(
          (role) => role.toLowerCase() === "admin" || role.toLowerCase() === "administrator"
        );

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
          <AdminSidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
