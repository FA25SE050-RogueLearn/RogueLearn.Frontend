// roguelearn-web/src/types/quest.ts
/**
 * Feature: Quests
 * Purpose: Defines the detailed structure of quests and their interactive steps.
 * Aligns with the backend's "on-demand" generation and rich interaction model.
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
}

/** The full details of a single quest, including all its steps. */
export interface QuestDetails {
  id: string;
  title: string;
  description: string;
  steps: QuestStep[];
}

/** An individual step within a quest. */
export interface QuestStep {
  id: string;
  questId: string;
  skillId: string;
  stepNumber: number;
  title: string;
  description: string;
  stepType: 'Reading' | 'Video' | 'Interactive' | 'Coding' | 'Quiz' | 'Discussion' | 'Submission' | 'Reflection';
  experiencePoints: number;
  content?: StepContent;
}

// UNION TYPE FOR ALL POSSIBLE STEP CONTENT SCHEMAS
export type StepContent =
  | ReadingContent
  | InteractiveContent
  | QuizContent
  | CodingContent
  | SubmissionContent
  | ReflectionContent;

// --- SPECIFIC CONTENT SCHEMAS ---

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

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

/** This is a metadata payload for requesting a challenge from a separate microservice. */
export interface CodingContent {
  skillId: string;
  language: 'CSharp' | 'Java' | 'Python' | 'JavaScript';
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