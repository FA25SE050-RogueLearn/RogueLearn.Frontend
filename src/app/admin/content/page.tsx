import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Database, 
  FileText,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const contentModules = [
  {
    id: "course-data",
    title: "Curriculum Import",
    description: "Import and sync FAP/FLM course data and syllabi",
    icon: BookOpen,
    href: "/admin/content/courses"
  },
  {
    id: "subjects",
    title: "Subject Catalog",
    description: "Manage all subjects and their syllabus content",
    icon: FileText,
    href: "/admin/content/subjects"
  },
  {
    id: "problem-bank",
    title: "Problem Bank",
    description: "Organize coding challenges and exercises",
    icon: Database,
    href: "/admin/content/problems"
  },
];

export default function ContentManagementPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-white/50">Manage curriculum, subjects, and coding challenges</p>
        </div>

        {/* Content Modules */}
        <div className="grid gap-4 md:grid-cols-3">
          {contentModules.map((module) => {
            const Icon = module.icon;

            return (
              <Card key={module.id} className="bg-[#1a0b08]/80 border border-[#f5c16c]/20 hover:border-[#f5c16c]/40 transition-all">
                <CardHeader>
                  <div className="rounded-lg bg-[#f5c16c]/20 p-3 w-fit">
                    <Icon className="h-6 w-6 text-[#f5c16c]" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold text-white">{module.title}</CardTitle>
                  <p className="text-sm text-white/60">{module.description}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">
                    <Link href={module.href} className="flex items-center justify-center gap-2">
                      Manage
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
