// roguelearn-web/src/components/dashboard/ActiveQuest.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star } from "lucide-react";
import { mockQuests } from "@/lib/mockData";

// Represents the main "Active Quest" card in the center of the dashboard.
export function ActiveQuest() {
  const quest = mockQuests.active[0]; // Get the first active quest for display
  return (
    <Card className="col-span-1 md:col-span-1 bg-card/50 p-6 flex flex-col">
      <CardHeader className="p-0 mb-4">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="font-heading text-2xl">Active Quest</CardTitle>
          <span className="text-xs font-semibold bg-primary/20 text-accent px-2 py-1 rounded-full">{quest.status}</span>
        </div>
        <CardDescription className="font-body text-lg text-foreground/80">{quest.title}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <p className="font-body text-foreground/70 mb-6">
          {quest.description}
        </p>
        <div className="mt-auto flex justify-around items-center text-center pt-4">
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent/80" />
            <span className="font-body text-sm text-foreground/70">Chapters Read</span>
            <span className="font-heading font-bold text-lg">{quest.progress.chaptersRead}/{quest.progress.chaptersTotal}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-accent/80" />
            <span className="font-body text-sm text-foreground/70">Time Spent</span>
            <span className="font-heading font-bold text-lg">{quest.progress.timeSpentHours}h</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Star className="w-6 h-6 text-accent/80" />
            <span className="font-body text-sm text-foreground/70">Mastery</span>
            {/* The mastery percentage is now correctly sourced from the mock data. */}
            <span className="font-heading font-bold text-lg">{quest.progress.masteryPercent}%</span>
          </div>
        </div>
        <Button size="lg" className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
          Continue Quest
        </Button>
      </CardContent>
    </Card>
  );
}