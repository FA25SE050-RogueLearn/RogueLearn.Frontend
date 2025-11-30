"use client";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ReactNode } from "react";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#beaca3]/30 bg-[#beaca3]/20 lg:block">
          <AdminSidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#f4f6f8]">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
