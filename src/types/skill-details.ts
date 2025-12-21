// roguelearn-web/src/types/skill-details.ts
export interface DependencyStatusDto {
  skillId: string;
  name: string;
  isMet: boolean;
  userLevel: number;
  statusLabel: string;
}

export interface SkillQuestDto {
  questId: string;
  title: string;
  xpReward: number;
  type: string;
}

export interface SkillDetailDto {
  id: string;
  name: string;
  domain: string;
  tier: string;
  description: string;
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
  xpProgressInLevel: number;
  progressPercentage: number;
  prerequisites: DependencyStatusDto[];
  unlocks: DependencyStatusDto[];
  learningPath: SkillQuestDto[];
}

