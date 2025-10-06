// roguelearn-web/src/components/dashboard/CharacterStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Updated type to make stats optional
type UserProfile = {
  stats?: {
    class?: string;
    curriculum?: string;
    intellect?: number;
    wisdom?: number;
  }
} | null;

export function CharacterStats({ userProfile }: { userProfile: UserProfile }) {
  if (!userProfile) {
    return (
      <Card className="col-span-1 md:col-span-1 bg-card/50 p-6 animate-pulse">
        <CardHeader className="p-0 mb-4">
          <div className="h-8 bg-secondary rounded w-3/4"></div>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="h-6 bg-secondary rounded w-full"></div>
          <div className="h-6 bg-secondary rounded w-full"></div>
          <div className="h-6 bg-secondary rounded w-full mt-6 pt-4 border-t border-transparent"></div>
          <div className="h-6 bg-secondary rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  // Default values if stats don't exist yet
  const stats = {
    class: userProfile.stats?.class || "Novice Developer",
    curriculum: userProfile.stats?.curriculum || "Not Set",
    intellect: userProfile.stats?.intellect || 10,
    wisdom: userProfile.stats?.wisdom || 10
  };

  return (
    <Card className="col-span-1 md:col-span-1 bg-card/50 p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="font-heading text-2xl">Character Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-0 font-body text-lg space-y-4">
        <div className="flex justify-between">
          <span className="text-foreground/70">Class:</span>
          <span className="font-semibold">{stats.class}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/70">Curriculum:</span>
          <span className="font-semibold">{stats.curriculum}</span>
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
          <span className="text-foreground/70">Intellect:</span>
          <span className="font-semibold text-accent">{stats.intellect}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/70">Wisdom:</span>
          <span className="font-semibold text-accent">{stats.wisdom}</span>
        </div>
      </CardContent>
    </Card>
  );
}