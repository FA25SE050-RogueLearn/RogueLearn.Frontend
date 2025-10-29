import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Library, 
  Users, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Sword,
  Shield,
  Scroll
} from "lucide-react";

export default function AdminDashboard() {
  const metrics = [
    { 
      label: "Pending Quests", 
      value: "3", 
      icon: Sword, 
      trend: "+2 this week",
      color: "text-amber-500",
      bgGradient: "from-amber-950/50 to-amber-900/30"
    },
    { 
      label: "Content Vault", 
      value: "2 days", 
      icon: Library, 
      trend: "157 tomes updated",
      color: "text-blue-400",
      bgGradient: "from-blue-950/50 to-blue-900/30"
    },
    { 
      label: "Active Adventurers", 
      value: "1,247", 
      icon: Users, 
      trend: "+8.3% vs last week",
      color: "text-emerald-400",
      bgGradient: "from-emerald-950/50 to-emerald-900/30"
    },
    { 
      label: "Sanctum Health", 
      value: "98.7%", 
      icon: Shield, 
      trend: "All wards stable",
      color: "text-purple-400",
      bgGradient: "from-purple-950/50 to-purple-900/30"
    },
  ];

  const recentActivity = [
    { 
      action: "Quest Approved", 
      target: "Spring Java Championship 2025", 
      time: "2 hours ago",
      icon: CheckCircle,
      iconColor: "text-emerald-400"
    },
    { 
      action: "Vault Synced", 
      target: "FAP Course Data (157 courses)", 
      time: "2 days ago",
      icon: Library,
      iconColor: "text-blue-400"
    },
    { 
      action: "Quest Submitted", 
      target: "Algorithm Mastery Tournament", 
      time: "3 days ago",
      icon: Clock,
      iconColor: "text-amber-400"
    },
    { 
      action: "Tome Updated", 
      target: "Agile Quest v2.2 published", 
      time: "5 days ago",
      icon: TrendingUp,
      iconColor: "text-purple-400"
    },
  ];

  const pendingTasks = [
    { task: "Review Spring Java Championship 2025", priority: "High", deadline: "Today" },
    { task: "Sync FLM updates for PRJ301", priority: "Medium", deadline: "Tomorrow" },
    { task: "Approve Guild: Code Warriors", priority: "Low", deadline: "This week" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* RPG-styled Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 rounded-lg blur-xl" />
          <div className="relative flex items-center gap-4 p-6 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-900/50">
              <Shield className="h-8 w-8 text-amber-50" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-amber-100">Command Center</h1>
              <p className="text-amber-700">
                Master overview and realm control
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid with RPG styling */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-200">
                    {metric.label}
                  </CardTitle>
                  <div className={`rounded-lg bg-gradient-to-br ${metric.bgGradient} p-2`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold text-amber-100">{metric.value}</div>
                  <p className="text-xs text-amber-700">{metric.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Activity - RPG styled */}
          <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
            <CardHeader className="border-b border-amber-900/20">
              <div className="flex items-center gap-2">
                <Scroll className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-100">Recent Chronicles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {recentActivity.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 rounded-lg border border-amber-900/20 bg-amber-950/20 p-3">
                    <div className={`rounded-md bg-gradient-to-br from-amber-950/50 to-amber-900/30 p-2 ${item.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-amber-200">{item.action}</p>
                      <p className="text-xs text-amber-600">{item.target}</p>
                      <p className="text-xs text-amber-800">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Pending Tasks - RPG styled */}
          <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
            <CardHeader className="border-b border-amber-900/20">
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-100">Active Missions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {pendingTasks.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-200">{item.task}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-amber-700">
                      <span
                        className={`font-semibold rounded px-1.5 py-0.5 ${
                          item.priority === "High"
                            ? "bg-red-950/50 text-red-400"
                            : item.priority === "Medium"
                            ? "bg-orange-950/50 text-orange-400"
                            : "bg-amber-950/50 text-amber-500"
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span>•</span>
                      <span>{item.deadline}</span>
                    </div>
                  </div>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
