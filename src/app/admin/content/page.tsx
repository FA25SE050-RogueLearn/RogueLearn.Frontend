import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Gamepad2, 
  Database, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const contentModules = [
  {
    id: "course-data",
    title: "Course Data",
    description: "Sync FAP/FLM course data and syllabi",
    lastSync: "2 days ago",
    status: "sync-required",
    icon: BookOpen,
    color: "text-accent",
    bgColor: "bg-accent/10",
    href: "/admin/content/courses"
  },
  {
    id: "game-library",
    title: "Game Library",
    description: "Manage game content and curriculum mappings",
    lastSync: "30 days ago",
    status: "update-needed",
    icon: Gamepad2,
    color: "text-emerald-300",
    bgColor: "bg-emerald-400/10",
    href: "/admin/content/games"
  },
  {
    id: "problem-bank",
    title: "Problem Bank",
    description: "Organize coding challenges and exercises",
    lastSync: "1 week ago",
    status: "up-to-date",
    icon: Database,
    color: "text-amber-300",
    bgColor: "bg-amber-400/10",
    href: "/admin/content/problems"
  },
  {
    id: "ai-generator",
    title: "AI Generator",
    description: "Generate content updates with AI assistance",
    lastSync: "—",
    status: "ready",
    icon: Sparkles,
    color: "text-blue-300",
    bgColor: "bg-blue-400/10",
    href: "/admin/content/ai-generator"
  },
];

const recentUpdates = [
  { title: "PRJ301 Syllabus v3.2", type: "FLM Import", date: "2 days ago", status: "pending" },
  { title: "Agile Quest v2.1", type: "Game Update", date: "30 days ago", status: "published" },
  { title: "Spring Boot Problems", type: "Problem Set", date: "1 week ago", status: "published" },
];

export default function ContentManagementPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* RPG-styled Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 rounded-lg blur-xl" />
          <div className="relative p-6 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
            <h1 className="text-3xl font-bold tracking-tight text-amber-100">Content Vault</h1>
            <p className="text-amber-700">
              Sync, update and forge learning tomes
            </p>
          </div>
        </div>

        {/* Sync Alert with RPG styling */}
        <Card className="relative overflow-hidden border-amber-600/50 bg-gradient-to-r from-amber-950/50 to-amber-900/30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-10 pointer-events-none" />
          <CardContent className="relative flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-900/50">
              <AlertCircle className="h-6 w-6 text-amber-50" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-100">FLM Scrolls Updated 2 Days Ago</h3>
              <p className="text-sm text-amber-600">Tome sync required for PRJ301 and related scrolls</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50 shadow-lg shadow-amber-900/50">
              <Link href="/admin/content/courses">
                Sync Vault
                <RefreshCw className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Content Modules */}
        <div className="grid gap-6 md:grid-cols-2">
          {contentModules.map((module) => {
            const Icon = module.icon;
            const statusBadge = {
              "sync-required": { text: "Sync Required", color: "text-amber-200", bg: "bg-amber-950/50 border border-amber-700/30" },
              "update-needed": { text: "Update Needed", color: "text-rose-300", bg: "bg-rose-950/50 border border-rose-700/30" },
              "up-to-date": { text: "Up to Date", color: "text-emerald-300", bg: "bg-emerald-950/50 border border-emerald-700/30" },
              "ready": { text: "Ready", color: "text-blue-300", bg: "bg-blue-950/50 border border-blue-700/30" },
            };
            const badge = statusBadge[module.status as keyof typeof statusBadge];

            return (
              <Card key={module.id} className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410] transition-all hover:border-amber-700/50 hover:shadow-lg hover:shadow-amber-900/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-950/50 to-amber-900/30 border border-amber-800/30">
                      <Icon className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs ${badge.bg} ${badge.color}`}>
                      {badge.text}
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-amber-100">{module.title}</CardTitle>
                  <p className="text-sm text-amber-700">{module.description}</p>
                </CardHeader>
                <CardContent className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-800">Last Updated</p>
                    <p className="text-sm font-semibold text-amber-300">{module.lastSync}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 hover:text-amber-200"
                  >
                    <Link href={module.href} className="flex items-center gap-2">
                      Manage
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Updates */}
        <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 rounded-lg pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Recent Chronicles</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-6">
            {recentUpdates.map((update, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-200">{update.title}</h4>
                  <p className="text-xs text-amber-700">{update.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-amber-800">{update.date}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      update.status === "published"
                        ? "bg-emerald-950/50 text-emerald-400 border border-emerald-700/30"
                        : "bg-amber-950/50 text-amber-400 border border-amber-700/30"
                    }`}
                  >
                    {update.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
