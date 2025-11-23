// roguelearn-web/src/types/quest-progress.ts

/**
 * Step progress response - completion status and percentage
 */
export interface GetStepProgressResponse {
  stepId: string;
  stepTitle: string;
  status: 'InProgress' | 'Completed';
  completedActivitiesCount: number;
  totalActivitiesCount: number;
  startedAt: string | null;
  completedAt: string | null;
  completedActivityIds: string[];
  progressPercentage: number;
}

/**
 * Individual activity progress with completion status
 */
export interface ActivityProgressDto {
  activityId: string;
  activityType: string; // Reading, Quiz, KnowledgeCheck, Coding
  isCompleted: boolean;
  title: string | null;
  experiencePoints: number;
  skillId: string | null;
}

/**
 * Completed activities response - all activities in a step with their status
 */
export interface GetCompletedActivitiesResponse {
  stepId: string;
  activities: ActivityProgressDto[];
  completedCount: number;
  totalCount: number;
}

/**
 * Overall quest progress response - all steps and their completion status
 */
export interface GetQuestProgressResponse {
  questId: string;
  questTitle: string;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  steps: StepSummaryDto[];
  completedStepsCount: number;
  totalStepsCount: number;
  progressPercentage: number;
}

/**
 * Individual step summary in quest progress
 */
export interface StepSummaryDto {
  stepId: string;
  title: string;
  status: 'InProgress' | 'Completed';
  stepNumber: number;
  completedActivities: number;
  totalActivities: number;
}
export interface SubmitQuizAnswerResponse {
  submissionId: string;
  correctAnswerCount: number;
  totalQuestions: number;
  scorePercentage: number;
  isPassed: boolean;
  message: string;
  canCompleteActivity: boolean;
}