// roguelearn-web/src/components/skills/SkillNode.tsx
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkillNode as ApiSkillNode } from '@/types/skill-tree';

// Helper to calculate XP progress for the current level
const calculateLevelProgress = (xp: number) => {
    const xpPerLevel = 1000;
    const currentLevelXp = xp % xpPerLevel;
    const progressPercentage = (currentLevelXp / xpPerLevel) * 100;
    return progressPercentage;
};

export function SkillNode({ data }: { data: ApiSkillNode }) {
  const progressPercentage = calculateLevelProgress(data.userExperiencePoints);
  const isUnlocked = data.userLevel > 0;

  return (
    <Card 
      className={`w-64 border-2 ${isUnlocked ? 'border-accent bg-accent/10' : 'border-white/20 bg-black/30'}`}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-white">{data.name}</CardTitle>
        <p className="text-xs text-foreground/60">{data.domain || 'General Skill'}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isUnlocked ? (
          <div className="space-y-2">
            <p className="text-sm font-bold text-accent">Level {data.userLevel}</p>
            <Progress value={progressPercentage} className="h-2 bg-white/10" />
            <p className="text-xs text-foreground/50">{data.userExperiencePoints % 1000} / 1000 XP</p>
          </div>
        ) : (
          <p className="text-sm text-foreground/50">Locked</p>
        )}
      </CardContent>
      {/* Handles for connecting edges */}
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </Card>
  );
}