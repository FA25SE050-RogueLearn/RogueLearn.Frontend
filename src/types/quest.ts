/**
 * Feature: Quests & Learning Path Steps
 * Purpose: Define types for learning paths, chapters, quests, and detailed quest steps
 *          used by the quest/learning-path UI and API interactions.
 * References: Frontend quest pages and components; backend generators that produce quest lines and steps.
 */
/** Represents a summary of a quest within a learning path. */
export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  sequenceOrder: number;
  learningPathId: string;
  chapterId: string;
}

/** Represents a chapter within a learning path. */
export interface QuestChapter {
  id: string;
  title: string;
  sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  quests: QuestSummary[];
}

/** Represents the user's main learning path or questline. */
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapter[];
  completionPercentage: number;
}

// --- MODIFICATION START ---
// Updated interfaces to match the rich JSON structure from the AI.

/** Content for a reading step, including optional article metadata. */
export interface ReadingContent {
  /** Legacy/backward-compatible field for reading materials. */
  readingMaterial?: string;
  /** Legacy/backward-compatible field for recommended exercises. */
  recommendedExercises?: string;
  /** Optional article title, typically used when content links to an external resource. */
  articleTitle?: string;
  /** Optional URL for the reading resource. */
  url?: string;
  /** Optional human-readable summary of the reading content. */
  summary?: string;
}

/** Content for an interactive step (questions, backlog items, user stories). */
export interface InteractiveContent {
  /** Optional challenge prompt displayed to the learner. */
  challenge?: string;
  /** Optional list of MCQ-style questions. */
  questions?: {
    task: string;
    options: string[];
    answer: string;
  }[];
  /** Optional backlog items for agile/product scenarios. */
  backlogItems?: {
    id: string;
    story: string;
    priority: string;
    effortEstimate: number;
  }[];
  /** Optional user stories for product/development exercises. */
  userStories?: {
    id: string;
    story: string;
    value: string;
    effort: string;
  }[];
  /** Optional guidance or hints to support the learner. */
  guidance?: string;
  /** Optional single task prompt (non-MCQ). */
  task?: string;
  /** Optional explanation for the expected answer. */
  answerExplanation?: string;
}

/** Content for a coding step, including template and expected output. */
export interface CodingContent {
  challenge: string;
  template: string;
  expectedOutput: string;
}

/** Content for a quiz step made up of multiple questions. */
export interface QuizContent {
  questions: {
    question: string;
    options: string[];
    /** Correct answer text for the question. */
    correctAnswer: string;
    /** Optional explanation for the answer to aid learning. */
    explanation: string;
  }[];
}

/** Content for a submission step where learners submit artifacts for review. */
export interface SubmissionContent {
  challenge: string;
  submissionFormat: string;
  /** Optional example user story used as guidance. */
  exampleUserStory?: string;
  /** Optional assessment rubric details. */
  rubric?: string;
}

/** Content for a reflection step to consolidate learning. */
export interface ReflectionContent {
  challenge: string;
  reflectionPrompt: string;
  expectedOutcome: string;
}

/** Content for a video step with link and summary. */
export interface VideoContent {
  videoUrl: string;
  summary: string;
}

type StepContent = ReadingContent | InteractiveContent | CodingContent | QuizContent | SubmissionContent | ReflectionContent | VideoContent;

/** Represents a single step in a quest. */
export interface QuestStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    stepType: 'Reading' | 'Video' | 'Interactive' | 'Coding' | 'Quiz' | 'Discussion' | 'Submission' | 'Reflection';
    content?: StepContent;
}

/** Detailed quest view with ordered steps. */
export interface QuestDetails {
    id: string;
    title: string;
    description: string;
    steps: QuestStep[];
}
// --- MODIFICATION END ---

// ===== Queries =====
/** Query payload to load details for a quest by its identifier. */
export interface GetQuestByIdQueryRequest {
  id: string;
}
export type GetQuestByIdResponse = QuestDetails | null;

// ===== Commands =====
/** Command to generate a quest line (chapters and quests) from a curriculum version. */
export interface GenerateQuestLineFromCurriculumCommandRequest {
  curriculumVersionId: string;
  authUserId: string; // included for client clarity; backend may read from context
}

export interface GenerateQuestLineFromCurriculumResponse {
  learningPathId: string;
  chaptersCreated: number;
  questsCreated: number;
}

// Generate quest steps for a specific quest
/** DTO representing a generated quest step returned by backend. */
export interface GeneratedQuestStep {
  id: string;
  questId: string;
  stepNumber: number;
  title: string;
  description: string;
  stepType: QuestStep['stepType'];
  content?: StepContent;
}

/** Command to generate steps for a specific quest. */
export interface GenerateQuestStepsCommandRequest {
  authUserId: string; // JSON-ignored in backend
  questId: string; // JSON-ignored in backend; may be passed via route
}
export type GenerateQuestStepsResponse = GeneratedQuestStep[];