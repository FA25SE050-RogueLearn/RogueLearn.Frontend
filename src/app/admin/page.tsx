import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusCard } from "@/components/admin/StatusCard";
import {
  Calendar,
  Library,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const metrics = [
    {
      label: "Pending Requests",
      value: "3",
      icon: Clock,
      trend: "+2 this week",
      color: "text-[#f5c16c]",
      bgColor: "bg-[#f5c16c]/20"
    },
    {
      label: "Content Items",
      value: "157",
      icon: Library,
      trend: "Updated 2 days ago",
      color: "text-[#d23187]",
      bgColor: "bg-[#d23187]/20"
    },
    {
      label: "Active Users",
      value: "1,247",
      icon: Users,
      trend: "+8.3% vs last week",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20"
    },
  ];

  const recentActivity = [
    { action: "Request Approved", target: "Spring Java Championship 2025", time: "2 hours ago", icon: CheckCircle, iconColor: "text-emerald-400" },
    { action: "Content Synced", target: "FAP Course Data (157 courses)", time: "2 days ago", icon: Library, iconColor: "text-[#d23187]" },
    { action: "Request Submitted", target: "Algorithm Mastery Tournament", time: "3 days ago", icon: Clock, iconColor: "text-[#f5c16c]" },
    { action: "Content Updated", target: "Agile Quest v2.2 published", time: "5 days ago", icon: TrendingUp, iconColor: "text-[#d23187]" },
  ];

  const pendingTasks = [
    { task: "Review Spring Java Championship 2025", priority: "High", deadline: "Today" },
    { task: "Sync FLM updates for PRJ301", priority: "Medium", deadline: "Tomorrow" },
    { task: "Approve Guild: Code Warriors", priority: "Low", deadline: "This week" },
  ];

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

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="bg-[#1a0b08]/80 border border-[#f5c16c]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/60">{metric.label}</CardTitle>
                  <div className={`rounded-lg ${metric.bgColor} p-2`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <p className="text-xs text-white/40 mt-1">{metric.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <StatusCard />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="bg-[#1a0b08]/80 border border-[#f5c16c]/20">
            <CardHeader className="border-b border-[#f5c16c]/10">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#f5c16c]" />
                <CardTitle className="text-base font-semibold text-white">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className={`mt-0.5 ${item.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.action}</p>
                      <p className="text-xs text-white/50 truncate">{item.target}</p>
                      <p className="text-xs text-white/30 mt-1">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-[#1a0b08]/80 border border-[#f5c16c]/20">
            <CardHeader className="border-b border-[#f5c16c]/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#f5c16c]" />
                <CardTitle className="text-base font-semibold text-white">Pending Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {pendingTasks.map((item, index) => (
                <div key={index} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.task}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        item.priority === "High"
                          ? "bg-red-500/20 text-red-400"
                          : item.priority === "Medium"
                            ? "bg-[#f5c16c]/20 text-[#f5c16c]"
                            : "bg-white/10 text-white/60"
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-white/40">{item.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
