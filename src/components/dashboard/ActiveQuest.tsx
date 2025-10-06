import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star } from "lucide-react";

// Define a type for the Quest data.
type Quest = {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: {
    chaptersRead: number;
    chaptersTotal: number;
    timeSpentHours: number;
    masteryPercent: number;
  }
} | null;


// The component now accepts a quest object as a prop.
export function ActiveQuest({ quest }: { quest: Quest }) {
  // If there's no active quest, show a placeholder or a "Find a Quest" card.
  if (!quest) {
    return (
      <Card className="col-span-1 md:col-span-1 bg-card/50 p-6 flex flex-col items-center justify-center text-center">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="font-heading text-2xl">No Active Quest</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="font-body text-foreground/70 mb-6">
            Your adventure awaits! Visit the Quest Log to begin your next journey.
          </p>
          <Button size="lg" className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            Find a Quest
          </Button>
        </CardContent>
      </Card>
    );
  }

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
