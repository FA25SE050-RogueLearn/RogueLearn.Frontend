// Represents a summary of a quest within a learning path.
export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  sequenceOrder: number;
}

// Represents a chapter within a learning path.
export interface QuestChapter {
  id: string;
  title: string;
  sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  quests: QuestSummary[];
  description: string;
}

// Represents the user's main learning path or questline.
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapter[];
  completionPercentage: number;
}

/**
 * Represents a single objective or step within a quest.
 * MODIFIED: This now accurately reflects the data from the /api/quests/{id} endpoint.
 */
export interface QuestStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    stepType: string;
    // The 'content' field from the AI generation is not in the quest detail view yet,
    // but we can add it as optional for future use.
    content?: any; 
    // Status is not provided per-step by the API, so it's removed from the base type.
    // The frontend will manage the step's completion status in its own state.
}

/**
 * Represents the detailed view of a single quest.
 * MODIFIED: Changed 'objectives' to 'steps' to match the live API response.
 * Other fields not present in the provided JSON (like status, xp) are removed
 * to strictly match the API contract for this specific endpoint.
 */
export interface QuestDetails {
    id: string;
    title: string;
    description: string;
    steps: QuestStep[];
}
