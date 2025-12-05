// roguelearn-web/src/types/quest.ts
/**
 * Feature: Quests
 * Purpose: Defines the detailed structure of quests and their interactive weekly modules.
 * Updated to support weekly learning modules with multiple activities per week.
 * 
 * ============================================================================
 * IMPORTANT: Field Storage vs Synthetic Fields
 * ============================================================================
 * 
 * STORED IN DATABASE:
 * - quest.id               → quests.id (Master Quest ID)
 * - quest.subjectId        → quests.subject_id
 * - expectedDifficulty     → user_quest_attempts.assigned_difficulty
 * - status                 → user_quest_attempts.status
 * - subjectGrade           → user_subject_records.grade
 * - subjectStatus          → user_subject_records.status (Passed/NotPassed/Studying)
 * 
 * SYNTHETIC (Generated at Runtime):
 * - learningPathId         → From user's learning_paths table
 * - chapterId              → Generated UUID per request (grouped by semester)
 * - chapter.title          → Derived from "Semester {n}" or "Electives / Unassigned"
 * - chapter.sequence       → The semester number (0 for electives)
 * 
 * IMPORTANT FOR FRONTEND:
 * - DO NOT use chapter.id as React key (changes every request)
 * - USE chapter.sequence as React key (stable)
 * - Use quest.id for navigation (database ID, stable)
 * ============================================================================
 */

// CORE QUESTLINE STRUCTURE
/** 
 * Represents the entire personalized learning journey for a user.
 * Stored in: learning_paths table
 */
export interface LearningPath {
  id: string;                      // Stored: learning_paths.id
  name: string;                    // Stored: learning_paths.name
  description: string;             // Stored: learning_paths.description
  chapters: QuestChapter[];        // Synthetic: Built from student_semester_subjects
  completionPercentage: number;    // Computed at runtime
}

/** 
 * Represents a major section of a learning path, like a semester or module.
 * NOT stored in database - generated dynamically from subjects.semester
 */
export interface QuestChapter {
  id: string;                      // ⚠️ SYNTHETIC: New UUID each request - DO NOT use as React key
  title: string;                   // Synthetic: "Semester 1", "Electives / Unassigned"
  sequence: number;                // ✅ STABLE: Use this as React key (semester number)
  status: 'NotStarted' | 'InProgress' | 'Completed';  // Computed from quest statuses
  quests: QuestSummary[];
}

/** A summary of a quest, used in lists and overviews, with full context for navigation. */
export interface QuestSummary {
  id: string;                      // ✅ STORED: quests.id - Use for navigation
  title: string;                   // Stored: quests.title
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned';  // Stored: user_quest_attempts.status
  sequenceOrder: number;           // Stored: quests.sequence_order
  learningPathId: string;          // Synthetic: From user's learning path
  chapterId: string;               // ⚠️ SYNTHETIC: Generated UUID - Do not use for navigation
  subjectId?: string;              // Stored: quests.subject_id
  isRecommended: boolean;          // Computed based on user progress
  recommendationReason?: string;
  subjectCode?: string;            // Stored: subjects.code
  subjectGrade?: string;           // Stored: user_subject_records.grade
  subjectStatus?: string;          // Stored: user_subject_records.status
  expectedDifficulty?: 'Challenging' | 'Standard' | 'Supportive' | 'Adaptive';  // Stored: user_quest_attempts.assigned_difficulty
  difficultyReason?: string;       // Computed based on grade
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

// ⭐ Activity Structure (matches API response from Master Quest generation)
/** 
 * Represents a single learning activity within a weekly module.
 * Can be Reading, KnowledgeCheck, Quiz, or Coding.
 * 
 * Note: skillId is at the root level of the activity, NOT in the payload.
 * This matches the LLM-generated structure from QuestStepsPromptBuilder.
 */
export interface Activity {
  activityId: string;
  type: 'Reading' | 'KnowledgeCheck' | 'Quiz' | 'Coding';
  skillId: string;  // ⚠️ At root level, not in payload
  payload: ActivityPayload;
}

// Union type for all activity payloads
export type ActivityPayload =
  | ReadingActivityPayload
  | KnowledgeCheckActivityPayload
  | QuizActivityPayload
  | CodingActivityPayload;

// --- SPECIFIC ACTIVITY PAYLOAD SCHEMAS ---
// Note: These match the LLM output structure from QuestStepsPromptBuilder

/** 
 * Reading activity: Links to external articles/tutorials
 * Generated by LLM with APPROVED RESOURCE URLs from syllabus
 */
export interface ReadingActivityPayload {
  articleTitle: string;
  summary: string;
  url?: string;  // Optional - may not be present if no approved URL
  experiencePoints?: number;  // Optional - may be calculated server-side
}

/** 
 * Knowledge Check activity: 3-4 quick questions after readings
 * Uses questions array format (not single question)
 */
export interface KnowledgeCheckActivityPayload {
  questions: KnowledgeCheckQuestion[];
  topic?: string;  // Optional topic label
  experiencePoints?: number;
}

export interface KnowledgeCheckQuestion {
  question: string;
  options: string[];
  answer: string;  // ⚠️ API uses 'answer', not 'correctAnswer'
  explanation: string;
}

/** 
 * Quiz activity: Comprehensive assessment (MANDATORY final activity)
 * - Supportive: 7-8 questions
 * - Standard: 8-9 questions  
 * - Challenging: 9-10 questions
 */
export interface QuizActivityPayload {
  questions: QuizQuestion[];
  experiencePoints?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;  // ⚠️ API uses 'answer', not 'correctAnswer'
  explanation: string;
}

/** Coding activity: Programming challenge */
export interface CodingActivityPayload {
  topic: string;
  language: 'CSharp' | 'Java' | 'Python' | 'JavaScript' | 'Kotlin' | 'XML';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  experiencePoints?: number;
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
