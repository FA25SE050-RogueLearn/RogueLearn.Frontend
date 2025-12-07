"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Library,
  Shield,
  Scroll,
  Network,
  GraduationCap,
  BookCopy,
  ChevronLeft,
  MessageSquare,
  Trophy,
  BookOpen
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Event Requests", icon: Calendar },
  { href: "/admin/content", label: "Content Vault", icon: Library },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/skills", label: "Skills", icon: Network },
  { href: "/admin/mappings", label: "Subject Mappings", icon: BookCopy },
  { href: "/admin/lecturer-requests", label: "Lecturer Requests", icon: Scroll },
  { href: "/admin/user-roles", label: "User Roles", icon: Shield },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 px-2 py-4 border-b border-[#f5c16c]/20">
        <Image
          src="/RougeLearn-Clear.png"
          alt="RogueLearn"
          width={40}
          height={40}
          className="rounded-xl"
        />
        <div>
          <h2 className="text-base font-bold text-[#f5c16c]">Admin Panel</h2>
          <p className="text-xs text-white/50">Management Console</p>
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
                  ? "bg-[#f5c16c]/15 text-[#f5c16c] border border-[#f5c16c]/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#f5c16c]' : 'text-white/40 group-hover:text-[#f5c16c]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Back to Dashboard */}
      <div className="mt-4 border-t border-[#f5c16c]/20 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </nav>
  );
}
