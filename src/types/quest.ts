// roguelearn-web/src/types/quest.ts
/**
 * Represents a summary of a quest within a learning path.
 */
export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  sequenceOrder: number;
}

/**
 * Represents a chapter within a learning path.
 */
export interface QuestChapter {
  id: string;
  title: string;
  sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  quests: QuestSummary[];
}

/**
 * Represents the user's main learning path or questline.
 * Corresponds to LearningPathDto from the backend.
 */
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapter[];
  completionPercentage: number;
}

/**
 * Represents a single objective or step within a quest.
 */
export interface QuestStep {
    id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Completed';
    // ... other fields from backend QuestStep entity
}

/**
 * Represents the detailed view of a single quest.
 */
export interface QuestDetails {
    id: string;
    title: string;
    description: string;
    status: 'NotStarted' | 'InProgress' | 'Completed';
    experiencePointsReward: number;
    objectives: QuestStep[];
}