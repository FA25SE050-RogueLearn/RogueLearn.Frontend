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
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      label: "Content Items",
      value: "157",
      icon: Library,
      trend: "Updated 2 days ago",
      color: "text-[#7289da]",
      bgColor: "bg-[#7289da]/10"
    },
    {
      label: "Active Users",
      value: "1,247",
      icon: Users,
      trend: "+8.3% vs last week",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
  ];

  const recentActivity = [
    { action: "Request Approved", target: "Spring Java Championship 2025", time: "2 hours ago", icon: CheckCircle, iconColor: "text-emerald-500" },
    { action: "Content Synced", target: "FAP Course Data (157 courses)", time: "2 days ago", icon: Library, iconColor: "text-[#7289da]" },
    { action: "Request Submitted", target: "Algorithm Mastery Tournament", time: "3 days ago", icon: Clock, iconColor: "text-amber-500" },
    { action: "Content Updated", target: "Agile Quest v2.2 published", time: "5 days ago", icon: TrendingUp, iconColor: "text-[#7289da]" },
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
          <h1 className="text-2xl font-bold text-[#2c2f33]">Dashboard</h1>
          <p className="text-[#2c2f33]/60">Welcome to the admin management console</p>
        </div>

        {/* Quick Access Links */}
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.href} className="bg-white border border-[#beaca3]/30 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-[#2c2f33]">{link.title}</CardTitle>
                      <p className="mt-1 text-sm text-[#2c2f33]/60">{link.description}</p>
                    </div>
                    <div className="rounded-lg bg-[#7289da]/10 p-2">
                      <Icon className="h-5 w-5 text-[#7289da]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" className="bg-[#7289da] hover:bg-[#7289da]/90 text-white">
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
              <Card key={metric.label} className="bg-white border border-[#beaca3]/30 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#2c2f33]/70">{metric.label}</CardTitle>
                  <div className={`rounded-lg ${metric.bgColor} p-2`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#2c2f33]">{metric.value}</div>
                  <p className="text-xs text-[#2c2f33]/50 mt-1">{metric.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <StatusCard />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="bg-white border border-[#beaca3]/30 shadow-sm">
            <CardHeader className="border-b border-[#beaca3]/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#2c2f33]/50" />
                <CardTitle className="text-base font-semibold text-[#2c2f33]">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#f4f6f8] border border-[#beaca3]/20">
                    <div className={`mt-0.5 ${item.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2c2f33]">{item.action}</p>
                      <p className="text-xs text-[#2c2f33]/60 truncate">{item.target}</p>
                      <p className="text-xs text-[#2c2f33]/40 mt-1">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-white border border-[#beaca3]/30 shadow-sm">
            <CardHeader className="border-b border-[#beaca3]/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#2c2f33]/50" />
                <CardTitle className="text-base font-semibold text-[#2c2f33]">Pending Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {pendingTasks.map((item, index) => (
                <div key={index} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-[#f4f6f8] border border-[#beaca3]/20">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2c2f33]">{item.task}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        item.priority === "High"
                          ? "bg-[#e07a5f]/10 text-[#e07a5f]"
                          : item.priority === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#beaca3]/30 text-[#2c2f33]/70"
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-[#2c2f33]/50">{item.deadline}</span>
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
