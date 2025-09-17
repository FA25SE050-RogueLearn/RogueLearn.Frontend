// roguelearn-web/src/components/dashboard/ActiveQuest.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star } from "lucide-react";

// Represents the main "Active Quest" card in the center of the dashboard.
export function ActiveQuest() {
  return (
    <Card className="col-span-1 md:col-span-1 bg-card/50 p-6 flex flex-col">
      <CardHeader className="p-0 mb-4">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="font-heading text-2xl">Active Quest</CardTitle>
          <span className="text-xs font-semibold bg-primary/20 text-accent px-2 py-1 rounded-full">In Progress</span>
        </div>
        <CardDescription className="font-body text-lg text-foreground/80">The Fundamentals of Alchemy</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <p className="font-body text-foreground/70 mb-6">
          Your journey begins with understanding the core principles. Collect the five rare herbs of knowledge to unlock the secrets of transmutation and transformation.
        </p>
        <div className="mt-auto flex justify-around items-center text-center pt-4">
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent/80" />
            <span className="font-body text-sm text-foreground/70">Chapters Read</span>
            <span className="font-heading font-bold text-lg">3/5</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-accent/80" />
            <span className="font-body text-sm text-foreground/70">Time Spent</span>
            <span className="font-heading font-bold text-lg">2.5h</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Star className="w-6 h-6 text-accent/80" />
            <span className="font-body text-sm text-foreground/70">Mastery</span>
            <span className="font-heading font-bold text-lg">60%</span>
          </div>
        </div>
        <Button size="lg" className="w-full mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
          Continue Quest
        </Button>
      </CardContent>
    </Card>
  );
}