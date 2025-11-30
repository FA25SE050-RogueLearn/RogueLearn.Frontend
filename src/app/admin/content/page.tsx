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
          <h1 className="text-2xl font-bold text-[#2c2f33]">Content Management</h1>
          <p className="text-[#2c2f33]/60">Manage curriculum, subjects, and coding challenges</p>
        </div>

        {/* Content Modules */}
        <div className="grid gap-4 md:grid-cols-3">
          {contentModules.map((module) => {
            const Icon = module.icon;

            return (
              <Card key={module.id} className="bg-white border border-[#beaca3]/30 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="rounded-lg bg-[#7289da]/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-[#7289da]" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold text-[#2c2f33]">{module.title}</CardTitle>
                  <p className="text-sm text-[#2c2f33]/60">{module.description}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-[#7289da] hover:bg-[#7289da]/90 text-white">
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
