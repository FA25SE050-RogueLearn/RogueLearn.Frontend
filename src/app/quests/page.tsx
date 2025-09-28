// roguelearn-web/src/app/quests/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockQuests } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

// Renders the Quest Log page with tabs for different quest statuses.
export default function QuestsPage() {
  const quest = mockQuests.active[0];
  const progressPercentage = (quest.progress.chaptersRead / quest.progress.chaptersTotal) * 100;
  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-10 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold font-heading">Quest Log</h1>
          <p className="mt-2 text-foreground/70 font-body">Track your learning journey through the mystical realms of knowledge.</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <Card className="p-6 bg-card/50">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold font-heading">{quest.title}</h3>
                      <span className="text-xs font-semibold bg-primary/20 text-accent px-2 py-1 rounded-full">{quest.status}</span>
                    </div>
                    <p className="text-sm text-foreground/70 mb-4 font-body">{quest.description}</p>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-body text-foreground/80">Progress</span>
                      <Progress value={progressPercentage} className="w-[60%]" />
                      <span className="text-sm font-body text-foreground/80">{quest.progress.chaptersRead}/{quest.progress.chaptersTotal} Chapters</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground/70">
                      <span>{quest.progress.xp} XP</span>
                      <span>{quest.progress.timeSpentHours}h spent</span>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/quests/${quest.id}`}>Continue</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}