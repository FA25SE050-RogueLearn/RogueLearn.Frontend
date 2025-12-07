import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusCard } from "@/components/admin/StatusCard";
import {
  Library,
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const quickLinks = [
    {
      title: "Subject Catalog",
      description: "Manage subject syllabi and learning content",
      icon: BookOpen,
      href: "/admin/content/subjects",
    },
    {
      title: "Content Management",
      description: "Sync course data and manage curriculum",
      icon: Library,
      href: "/admin/content",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50">Welcome to the admin management console</p>
        </div>

        {/* Quick Access Links */}
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.href} className="bg-[#1a0b08]/80 border border-[#f5c16c]/20 hover:border-[#f5c16c]/40 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-white">{link.title}</CardTitle>
                      <p className="mt-1 text-sm text-white/50">{link.description}</p>
                    </div>
                    <div className="rounded-lg bg-[#f5c16c]/20 p-2">
                      <Icon className="h-5 w-5 text-[#f5c16c]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">
                    <Link href={link.href} className="flex items-center gap-2">
                      Access
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <StatusCard />
      </div>
    </AdminLayout>
  );
}
