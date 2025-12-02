"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Library,
  Settings,
  Shield,
  Scroll,
  Network,
  GraduationCap,
  BookCopy,
  ScrollText,
  ChevronLeft,
  MessageSquare
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Event Requests", icon: Calendar },
  { href: "/admin/content", label: "Content", icon: Library },
  { href: "/admin/lecturer-requests", label: "Lecturer Requests", icon: Scroll },
  { href: "/admin/programs", label: "Programs", icon: ScrollText },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/skills", label: "Skills", icon: Network },
  { href: "/admin/mappings", label: "Subject Mappings", icon: BookCopy },
  { href: "/admin/user-roles", label: "User Roles", icon: Shield },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 px-2 py-4 border-b border-slate-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Admin Panel</h2>
          <p className="text-xs text-slate-500">Management Console</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Back to Dashboard */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </nav>
  );
}
