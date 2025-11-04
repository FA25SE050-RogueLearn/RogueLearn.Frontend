// roguelearn-web/src/types/quest.ts

// CORE QUESTLINE STRUCTURE
// Represents the entire personalized learning journey for a user
export interface LearningPath {
    id: string;
    name: string;
    description: string;
    chapters: QuestChapter[];
    completionPercentage: number;
}

// Represents a major section of a learning path, like a semester or module
export interface QuestChapter {
    id: string;
    title: string;
    sequence: number;
    status: 'NotStarted' | 'InProgress' | 'Completed';
    quests: QuestSummary[];
}

// A summary of a quest, used in lists and overviews
export interface QuestSummary {
    id: string;
    title: string;
    status: 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned';
    sequenceOrder: number;
    learningPathId: string;
    chapterId: string;
}

// The full details of a single quest, including all its steps
export interface QuestDetails {
    id: string;
    title: string;
    description: string;
    steps: QuestStep[];
}

// An individual step within a quest.
export interface QuestStep {
    id: string;
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
    skillTag: string;
    articleTitle?: string;
    summary?: string;
    url?: string;
}

export interface InteractiveContent {
    skillTag: string;
    challenge: string;
    questions: InteractiveQuestion[];
}

export interface InteractiveQuestion {
    task: string;
    options: string[];
    answer: string;
}

export interface QuizContent {
    skillTag: string;
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface CodingContent {
    skillTag: string;
    challenge: string;
    template: string;
    expectedOutput: string;
}

export interface SubmissionContent {
    skillTag: string;
    challenge: string;
    submissionFormat: string;
}

export interface ReflectionContent {
    skillTag: string;
    challenge: string;
    reflectionPrompt: string;
    expectedOutcome: string;
}