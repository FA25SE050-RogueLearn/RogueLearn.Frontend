"use client";

import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { ReactNode } from "react";

// Client component layout - auth checks should be done in individual server pages
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1410] relative">
      {/* Subtle dungeon texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/black-thread-light.png')`,
        }}
      />
      
      {/* Top accent border with dungeon aesthetic */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent z-50" />
      
      <div className="flex min-h-screen relative z-10">
        <aside className="hidden w-64 border-r border-amber-900/30 bg-[#1f1812] lg:block relative">
          {/* Sidebar subtle glow */}
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-600/20 to-transparent" />
          <AdminSidebarNav />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
