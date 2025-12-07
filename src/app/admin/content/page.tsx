import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  ArrowRight,
  Tag,
  ScrollText
} from "lucide-react";
import Link from "next/link";

const contentModules = [
  {
    id: "curriculum",
    title: "Curriculum",
    description: "Manage academic programs and import curriculum data",
    icon: ScrollText,
    href: "/admin/programs"
  },
  {
    id: "problem-bank",
    title: "Problem Bank",
    description: "Organize coding challenges and exercises",
    icon: Database,
    href: "/admin/content/problems"
  },
  {
    id: "tags",
    title: "Problem Tags",
    description: "Manage tags for categorizing problems",
    icon: Tag,
    href: "/admin/content/tags"
  },
];

export default function ContentManagementPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Content Vault</h1>
          <p className="text-white/60">Manage curriculum, coding challenges, and problem categorization</p>
        </div>

        {/* Content Modules */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contentModules.map((module) => {
            const Icon = module.icon;

            return (
              <Card key={module.id} className="bg-[#1a1410] border border-[#f5c16c]/20 hover:border-[#f5c16c]/40 transition-all">
                <CardHeader>
                  <div className="rounded-lg bg-[#f5c16c]/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-[#f5c16c]" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold text-white">{module.title}</CardTitle>
                  <p className="text-sm text-white/60">{module.description}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]">
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
