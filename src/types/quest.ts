// roguelearn-web/src/types/quest.ts
// Represents a summary of a quest within a learning path.
export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  sequenceOrder: number;
  // ADDED: The ID of the parent Learning Path.
  learningPathId: string;
  // ADDED: The ID of the parent Quest Chapter.
  chapterId: string;
}

// Represents a chapter within a learning path.
export interface QuestChapter {
  id: string;
  title: string;
  sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  quests: QuestSummary[];
}

// Represents the user's main learning path or questline.
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapter[];
  completionPercentage: number;
}

// --- START OF MODIFICATIONS ---

// Define the specific content structure for each step type
export interface ReadingContent {
  readingMaterial: string;
  recommendedExercises: string;
}

export interface InteractiveContent {
  challenge?: string;
  learningPoints?: string[];
  scenario?: string;
  prompt?: string;
  keyLearning?: string[];
}

export interface CodingContent {
  challenge: string;
  template: string;
  expectedOutput: string;
}

export interface QuizContent {
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface SubmissionContent {
  assignment: string;
  submissionFormat: string;
  rubric: string;
}

export interface ReflectionContent {
  challenge: string;
  reflectionPrompt: string;
  expectedOutcome: string;
}

export interface VideoContent {
  videoUrl: string;
  summary: string;
}

// A union type for all possible content structures
type StepContent = ReadingContent | InteractiveContent | CodingContent | QuizContent | SubmissionContent | ReflectionContent | VideoContent;

/**
 * Represents a single objective or step within a quest.
 * MODIFICATION: The 'content' property is now optional ('?') to reflect that
 * some API endpoints may not return it.
 */
export interface QuestStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    stepType: 'Reading' | 'Video' | 'Interactive' | 'Coding' | 'Quiz' | 'Discussion' | 'Submission' | 'Reflection';
    content?: StepContent; // Made optional
}

/**
 * Represents the detailed view of a single quest.
 */
export interface QuestDetails {
    id: string;
    title: string;
    description: string;
    steps: QuestStep[];
}
// --- END OF MODIFICATIONS ---