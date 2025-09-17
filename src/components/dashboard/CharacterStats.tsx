// roguelearn-web/src/components/dashboard/CharacterStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Represents the "Character Stats" card, displaying key player attributes.
export function CharacterStats() {
  return (
    <Card className="col-span-1 md:col-span-1 bg-card/50 p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="font-heading text-2xl">Character Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-0 font-body text-lg space-y-4">
        <div className="flex justify-between">
          <span className="text-foreground/70">Class:</span>
          <span className="font-semibold">Full-Stack Developer</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/70">Curriculum:</span>
          <span className="font-semibold">Computer Science</span>
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
          <span className="text-foreground/70">Intellect:</span>
          <span className="font-semibold text-accent">12</span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/70">Wisdom:</span>
          <span className="font-semibold text-accent">14</span>
        </div>
      </CardContent>
    </Card>
  );
}