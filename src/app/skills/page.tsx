// roguelearn-web/src/app/skills/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockSkillTree } from "@/lib/mockData";

// Renders the Skill Tree page. The actual graph is a placeholder for now.
export default function SkillsPage() {
  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-10 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold font-heading">Skill Tree: {mockSkillTree.title}</h1>
        </div>
        <Card className="p-6 bg-card/50 h-[600px] flex items-center justify-center">
          <CardContent className="p-0 text-center text-foreground/50">
            <p className="text-2xl font-heading">Skill Tree Visualization Placeholder</p>
            <p className="font-body mt-2">An interactive graph of skills will be rendered here.</p>
            <p className="text-sm font-body mt-8">Click on any star to explore skill details</p>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}