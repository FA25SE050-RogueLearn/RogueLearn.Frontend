// roguelearn-web/src/types/quest.ts
/**
 * Feature: Quests
 * Purpose: Defines the detailed structure of quests and their interactive weekly modules.
 * Updated to support weekly learning modules with multiple activities per week.
 */

// CORE QUESTLINE STRUCTURE
/** Represents the entire personalized learning journey for a user. */
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapter[];
  completionPercentage: number;
}

/** Represents a major section of a learning path, like a semester or module. */
export interface QuestChapter {
  id: string;
  title: string;
  sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  quests: QuestSummary[];
}

/** A summary of a quest, used in lists and overviews, with full context for navigation. */
export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned';
  sequenceOrder: number;
  learningPathId: string;
  chapterId: string;
  isRecommended: boolean;
  recommendationReason?: string;  // "Passed", "Studying", "Failed", etc.
  // Difficulty indicator based on academic performance
  subjectCode?: string;
  subjectGrade?: string;           // e.g., "8.5" or null
  subjectStatus?: string;          // "Passed", "NotPassed", "Studying"
  expectedDifficulty?: 'Challenging' | 'Standard' | 'Supportive' | 'Adaptive';
  difficultyReason?: string;       // e.g., "High score (8.5) - advanced content"
}


/** The full details of a single quest, including all its weekly steps. */
export interface QuestDetails {
  id: string;
  title: string;
  description: string;
  steps: QuestStep[]; // Each step represents a weekly module
}

// ⭐ UPDATED: QuestStep now represents a weekly learning module
/** 
 * A weekly learning module within a quest.
 * Each step contains multiple activities (Reading, KnowledgeCheck, Quiz, Coding).
 */
export interface QuestStep {
  id: string;
  questId?: string;
  stepNumber: number; // Week number (1, 2, 3, ...)
  title: string; // e.g., "Week 1: Mobile Development Overview"
  description: string;
  stepType?: string; // Optional, for backward compatibility
  experiencePoints: number; // Total XP for this week
  content: WeeklyModuleContent; // ⭐ CHANGED: Now contains activities
}

// ⭐ NEW: Weekly module content structure
/** Content structure for a weekly learning module */
export interface WeeklyModuleContent {
  activities: Activity[]; // List of all activities in this week
}

// ⭐ NEW: Activity union type
/** 
 * Represents a single learning activity within a weekly module.
 * Can be Reading, KnowledgeCheck, Quiz, or Coding.
 */
export interface Activity {
  activityId: string;
  type: 'Reading' | 'KnowledgeCheck' | 'Quiz' | 'Coding';
  payload: ActivityPayload;
}

// ⭐ NEW: Union type for all activity payloads
export type ActivityPayload =
  | ReadingActivityPayload
  | KnowledgeCheckActivityPayload
  | QuizActivityPayload
  | CodingActivityPayload;

// --- SPECIFIC ACTIVITY PAYLOAD SCHEMAS ---

/** Reading activity: Links to external articles/tutorials */
export interface ReadingActivityPayload {
  skillId: string;
  articleTitle: string;
  summary: string;
  url: string; // URL to the reading material
  experiencePoints: number;
}

/** Knowledge Check activity: 1-2 quick questions after readings */
export interface KnowledgeCheckActivityPayload {
  skillId: string;
  topic?: string;
  questions?: KnowledgeCheckQuestion[]; // Single question format
  question?: string; // Alternative: single question format
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  experiencePoints: number;
}

export interface KnowledgeCheckQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/** Quiz activity: Comprehensive assessment with multiple questions */
export interface QuizActivityPayload {
  skillId: string;
  questions: QuizQuestion[];
  experiencePoints: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/** Coding activity: Programming challenge */
export interface CodingActivityPayload {
  skillId: string;
  topic: string;
  language: 'CSharp' | 'Java' | 'Python' | 'JavaScript' | 'Kotlin' | 'XML';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  experiencePoints: number;
}

// ⭐ DEPRECATED: Old content types (kept for backward compatibility)
// These are no longer used in the new weekly module structure
export type StepContent =
  | ReadingContent
  | InteractiveContent
  | QuizContent
  | CodingContent
  | SubmissionContent
  | ReflectionContent;

export interface ReadingContent {
  skillId: string;
  articleTitle?: string;
  summary?: string;
  url?: string;
}

export interface InteractiveContent {
  skillId: string;
  challenge: string;
  questions: InteractiveQuestion[];
}

export interface InteractiveQuestion {
  task: string;
  options: string[];
  answer: string;
}

export interface QuizContent {
  skillId: string;
  questions: QuizQuestion[];
}

export interface CodingContent {
  skillId: string;
  language: 'CSharp' | 'Java' | 'Python' | 'JavaScript' | 'Kotlin' | 'XML';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
}

export interface SubmissionContent {
  skillId: string;
  challenge: string;
  submissionFormat: string;
}

export interface ReflectionContent {
  skillId: string;
  challenge: string;
  reflectionPrompt: string;
  expectedOutcome: string;
}

// ⭐ NEW: Helper types for UI state management
/** Progress tracking for a weekly module */
export interface WeeklyProgress {
  stepId: string;
  stepNumber: number;
  completedActivities: string[]; // Array of activityIds
  totalActivities: number;
  completionPercentage: number;
  experienceEarned: number;
  totalExperience: number;
}

/** User's overall quest progress */
export interface QuestProgress {
  questId: string;
  currentStepNumber: number; // Current week
  totalSteps: number; // Total weeks
  weeklyProgress: WeeklyProgress[];
  overallCompletionPercentage: number;
}
