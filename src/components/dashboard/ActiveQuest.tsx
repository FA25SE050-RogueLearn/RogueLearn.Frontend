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
  if (!quest) {
    return (
      <Card className="col-span-1 flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[#f5c16c]/35 bg-[#1a0c08]/80 p-6 text-center backdrop-blur">
        <CardHeader className="mb-4">
          <CardTitle className="text-lg uppercase tracking-[0.35em] text-[#f5c16c]/70">No Active Quest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-foreground/70">
          <p>Whispers echo through the empty halls. Seek the Guildmaster to claim your next challenge.</p>
          <Button size="lg" className="w-full rounded-2xl bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-sm font-semibold uppercase tracking-[0.35em] text-[#2b130f] shadow-[0_12px_30px_rgba(210,49,135,0.35)] transition hover:from-[#f061a6] hover:via-[#f5c16c] hover:to-[#f2ac64]">
            Find a Quest
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative col-span-1 flex flex-col overflow-hidden rounded-3xl border border-[#f5c16c]/22 bg-[#23110d]/85 p-6 shadow-[0_20px_65px_rgba(36,10,6,0.6)]">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1547703465-94f05b7abe13?auto=format&fit=crop&w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#2d140f]/92 via-[#160807]/88 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_68%)]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <CardHeader className="mb-6 border-b border-[#f5c16c]/25 pb-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.45em] text-[#f5c16c]/70">
            <span>Current Expedition</span>
            <span className="rounded-full border border-[#f5c16c]/45 bg-[#f5c16c]/15 px-3 py-1 text-[#2b130f]">
              {quest.status}
            </span>
          </div>
          <CardTitle className="mt-4 text-2xl font-semibold text-white">{quest.title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-relaxed text-foreground/70">
            {quest.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between gap-6">
          <div className="grid grid-cols-3 gap-4 text-center text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">
            <div className="rounded-2xl border border-[#f5c16c]/25 bg-[#140806]/80 px-3 py-4">
              <BookOpen className="mx-auto mb-3 h-6 w-6 text-[#f5c16c]" />
              <p>Chapters</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {quest.progress.chaptersRead}<span className="text-sm text-foreground/50">/{quest.progress.chaptersTotal}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-[#f5c16c]/25 bg-[#140806]/80 px-3 py-4">
              <Clock className="mx-auto mb-3 h-6 w-6 text-[#f5c16c]" />
              <p>Time Spent</p>
              <p className="mt-2 text-xl font-semibold text-white">{quest.progress.timeSpentHours}h</p>
            </div>
            <div className="rounded-2xl border border-[#f5c16c]/25 bg-[#140806]/80 px-3 py-4">
              <Star className="mx-auto mb-3 h-6 w-6 text-[#f5c16c]" />
              <p>Mastery</p>
              <p className="mt-2 text-xl font-semibold text-white">{quest.progress.masteryPercent}%</p>
            </div>
          </div>

          <Button className="w-full rounded-2xl bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-sm font-semibold uppercase tracking-[0.35em] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.35)] transition hover:from-[#f061a6] hover:via-[#f5c16c] hover:to-[#f2ac64]">
            Continue Quest
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
