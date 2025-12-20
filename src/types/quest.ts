// roguelearn-web/src/types/quest.ts
/**
 * Feature: Quests
 * Purpose: Defines the detailed structure of quests and their interactive weekly modules.
 * Updated to support weekly learning modules with multiple activities per week.
 */

// CORE QUESTLINE STRUCTURE
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapter[];
  completionPercentage: number;
}

export interface QuestChapter {
  id: string;
  title: string;
  sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  quests: QuestSummary[];
}

export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned';
  sequenceOrder: number;
  learningPathId: string;
  chapterId: string;
  subjectId?: string;
  isRecommended: boolean;
  recommendationReason?: string;
  subjectCode?: string;
  subjectGrade?: string;
  subjectStatus?: string;
  expectedDifficulty?: 'Challenging' | 'Standard' | 'Supportive' | 'Adaptive';
  difficultyReason?: string;
}

export interface QuestDetails {
  id: string;
  title: string;
  description: string;
  steps: QuestStep[];
}

export interface QuestStep {
  id: string;
  questId?: string;
  stepNumber: number;
  title: string;
  description: string;
  stepType?: string;
  experiencePoints: number;
  content: WeeklyModuleContent;
}

export interface WeeklyModuleContent {
  activities: Activity[];
}

export interface Activity {
  activityId: string;
  type: 'Reading' | 'KnowledgeCheck' | 'Quiz' | 'Coding';
  skillId: string;
  payload: ActivityPayload;
}

export type ActivityPayload =
  | ReadingActivityPayload
  | KnowledgeCheckActivityPayload
  | QuizActivityPayload
  | QuestCodingActivityPayload;

export interface ReadingActivityPayload {
  articleTitle: string;
  summary: string;
  url?: string;
  experiencePoints?: number;
}

export interface KnowledgeCheckActivityPayload {
  questions: KnowledgeCheckQuestion[];
  topic?: string;
  experiencePoints?: number;
}

export interface KnowledgeCheckQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizActivityPayload {
  questions: QuizQuestion[];
  experiencePoints?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

/** 
 * ⭐ NEW: Quest-specific Coding Activity Payload 
 * Matches structure from QuestStepsPromptBuilder.cs
 */
export interface QuestCodingActivityPayload {
  topic: string;
  language: string; // "csharp", "python", etc.
  description: string;
  starterCode: string;
  validationCriteria?: string; // Hidden from user, used by AI grader
  experiencePoints: number;
}

// Deprecated types kept for backward compatibility if needed
export type StepContent = any;
export interface ReadingContent { skillId: string; }
export interface InteractiveContent { skillId: string; }
export interface QuizContent { skillId: string; }
export interface CodingContent {
  skillId: string;
  language: string;
  difficulty: string;
  topic: string;
}
export interface SubmissionContent { skillId: string; }
export interface ReflectionContent { skillId: string; }

export interface WeeklyProgress {
  stepId: string;
  stepNumber: number;
  completedActivities: string[];
  totalActivities: number;
  completionPercentage: number;
  experienceEarned: number;
  totalExperience: number;
}

export interface QuestProgress {
  questId: string;
  currentStepNumber: number;
  totalSteps: number;
  weeklyProgress: WeeklyProgress[];
  overallCompletionPercentage: number;
}