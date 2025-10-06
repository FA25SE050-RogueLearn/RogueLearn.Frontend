import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockQuests } from "@/lib/mock-data";
import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
interface PageProps {
  params: Promise<{ questId: string }>;
}

// Renders the details for a specific quest, including its modules/objectives.
export default async function QuestDetailPage({ params }: PageProps) {
  // Await the params to get the actual values
  const { questId } = await params;
  const quest = mockQuests.active.find(q => q.id === questId);

  if (!quest) {
    return (
      <DashboardLayout>
        <main className="col-span-12 lg:col-span-10">
          <p>Quest not found.</p>
        </main>
      </DashboardLayout>
    );
  }

  const completedModules = quest.modules.filter(m => m.completed).length;
  const totalModules = quest.modules.length;
  const progressPercentage = (completedModules / totalModules) * 100;

  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-10 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold font-heading">{quest.title}</h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="font-body">Quest Progress</span>
            <Progress value={progressPercentage} className="w-1/2" />
            <span className="font-body font-semibold">{progressPercentage.toFixed(0)}% Complete</span>
          </div>
        </div>

        <Card className="p-6 bg-card/50">
          <CardContent className="p-0">
            <h2 className="text-2xl font-heading mb-6">Objectives</h2>
            <div className="space-y-4">
              {quest.modules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div className="flex items-center gap-4">
                    {module.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-foreground/50" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold font-heading">{module.title}</h3>
                      <p className="text-sm text-foreground/70 font-body">{module.description}</p>
                    </div>
                  </div>
                  <Button variant="outline">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
