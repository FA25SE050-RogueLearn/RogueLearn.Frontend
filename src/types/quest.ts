// roguelearn-web/src/types/quest.ts
// Represents a summary of a quest within a learning path.
export interface QuestSummary {
  id: string;
  title: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  sequenceOrder: number;
  learningPathId: string;
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

// --- MODIFICATION START ---
// Updated interfaces to match the rich JSON structure from the AI.

export interface ReadingContent {
  // Original properties (can be kept for backward compatibility or removed if unused)
  readingMaterial?: string;
  recommendedExercises?: string;
  // New properties from your JSON
  articleTitle?: string;
  url?: string;
  summary?: string;
}

export interface InteractiveContent {
  challenge?: string;
  // This content can now contain questions, backlog items, or user stories.
  // By making them optional, the component can handle different types of interactive content.
  questions?: {
    task: string;
    options: string[];
    answer: string;
  }[];
  backlogItems?: {
    id: string;
    story: string;
    priority: string;
    effortEstimate: number;
  }[];
  userStories?: {
    id: string;
    story: string;
    value: string;
    effort: string;
  }[];
  guidance?: string;
  task?: string;
  answerExplanation?: string;
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
    correctAnswer: string; // Renamed from 'answer' to be more explicit
    explanation: string;
  }[];
}

export interface SubmissionContent {
  challenge: string;
  submissionFormat: string;
  exampleUserStory?: string; // Made optional
  rubric?: string; // Made optional
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

type StepContent = ReadingContent | InteractiveContent | CodingContent | QuizContent | SubmissionContent | ReflectionContent | VideoContent;

export interface QuestStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    stepType: 'Reading' | 'Video' | 'Interactive' | 'Coding' | 'Quiz' | 'Discussion' | 'Submission' | 'Reflection';
    content?: StepContent;
}

export interface QuestDetails {
    id: string;
    title: string;
    description: string;
    steps: QuestStep[];
}
// --- MODIFICATION END ---