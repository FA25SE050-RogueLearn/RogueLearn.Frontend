"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Library, 
  Settings,
  Shield,
  Scroll
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Command Center", icon: LayoutDashboard },
  { href: "/admin/events", label: "Event Quests", icon: Calendar },
  { href: "/admin/content", label: "Content Vault", icon: Library },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-6">
      {/* RPG-styled header */}
      <div className="mb-8 flex items-center gap-3 pb-6 border-b border-amber-900/30">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-900/50">
          <Shield className="h-5 w-5 text-amber-50" />
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-amber-500/50 to-transparent opacity-50 blur-sm" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-amber-100">Admin Sanctum</h2>
          <p className="text-xs text-amber-700">Master&apos;s Chamber</p>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-900/20 text-amber-200 border-l-2 border-amber-600"
                  : "text-gray-400 hover:bg-amber-900/10 hover:text-amber-300 hover:border-l-2 hover:border-amber-800/50"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 rounded-r-full shadow-lg shadow-amber-600/50" />
              )}
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-gray-500 group-hover:text-amber-600'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* RPG-styled status footer */}
      <div className="mt-auto rounded-lg border border-amber-900/40 bg-gradient-to-br from-amber-950/50 to-amber-900/20 p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Scroll className="h-3.5 w-3.5 text-amber-600" />
            <p className="text-xs font-semibold text-amber-200">System Status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-2 w-2">
              <div className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
              <div className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-amber-300">All Systems Operational</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
