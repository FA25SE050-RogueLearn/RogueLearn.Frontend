import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAchievements } from "@/lib/mock-data";
import { Trophy } from "lucide-react";

// This new component renders the "Recent Achievements" section, as specified in the documentation.
export function RecentAchievements() {
  return (
    <Card className="bg-card/50 h-full">
      <CardHeader>
        <CardTitle className="font-heading">Recent Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {mockAchievements.map((achievement, idx) => (
            <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Trophy className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="font-body">{achievement.title}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
