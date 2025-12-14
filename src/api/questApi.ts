// roguelearn-web/src/api/questApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { QuestDetails, QuestStep, QuestProgress } from '../types/quest';
import { 
  GetStepProgressResponse, 
  GetCompletedActivitiesResponse, 
  GetQuestProgressResponse, 
  SubmitQuizAnswerResponse
} from '../types/quest-progress';
import { normalizeStepActivities } from '../lib/normalizeActivities';

// ========== NEW RESPONSE TYPES FOR BACKGROUND JOBS ==========

/**
 * Response from scheduling quest step generation
 * Returns jobId for polling status
 */
interface GenerateQuestStepsResponse {
  jobId: string;
  status: string;
  message: string;
  questId: string;
}

/**
 * Skill prerequisite info
 */
interface SkillPrerequisite {
  skillId: string;
  skillName: string;
}

/**
 * Skill info returned from quest skills endpoint
 */
interface QuestSkillInfo {
  skillId: string;
  skillName: string;
  domain: string;
  relevanceWeight: number;
  prerequisites: SkillPrerequisite[];
}

/**
 * Response from POST /api/quests/{questId}/start
 */
export interface StartQuestResponse {
  attemptId: string;
  status: string;
  assignedDifficulty: string;
  isNew: boolean;
}

/**
 * Response from GET /api/quests/{questId}/skills
 */
export interface GetQuestSkillsResponse {
  questId: string;
  subjectId: string;
  subjectName: string;
  skills: QuestSkillInfo[];
}

/**
 * Response from checking job status
 * Check this periodically to see if generation is complete
 */
interface JobStatusResponse {
  jobId: string;
  status: string;  // "Processing", "Succeeded", "Failed", "Scheduled", etc.
  createdAt: string;
  error?: string | null;
  message?: string | null;
}

/**
 * ⭐ NEW: Real-time progress of quest generation job
 */
interface QuestGenerationProgressResponse {
  currentStep: number;
  totalSteps: number;
  message: string;
  progressPercentage: number;
  updatedAt: string;
}

interface AdminStepFeedbackItem {
  id: string;
  questId: string;
  stepId: string;
  subjectId: string;
  authUserId: string;
  rating: number;
  category: 'ContentError' | 'TechnicalIssue' | 'TooDifficult' | 'TooEasy' | 'Other';
  comment?: string;
  adminNotes?: string | null;
  isResolved: boolean;
  createdAt: string;
}

// ========== ADMIN QUEST MANAGEMENT TYPES ==========

/**
 * Quest summary for admin listing
 */
export interface AdminQuestListItem {
  id: string;
  title: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  stepsCount: number;
  stepsGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated response for admin quest list
 */
export interface AdminQuestListResponse {
  items: AdminQuestListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Admin quest step DTO with full content
 */
export interface AdminQuestStepDto {
  id: string;
  stepNumber: number;
  moduleNumber: number;
  title: string;
  description: string;
  experiencePoints: number;
  difficultyVariant: 'Standard' | 'Supportive' | 'Challenging';
  content: any;
  createdAt: string;
}

/**
 * Admin quest details with 3-way difficulty split
 */
export interface AdminQuestDetailsDto {
  id: string;
  title: string;
  description: string;
  questType: string;
  difficultyLevel: string;
  status: string;
  isActive: boolean;
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  // Grouped steps for 3-track visualization
  standardSteps: AdminQuestStepDto[];
  supportiveSteps: AdminQuestStepDto[];
  challengingSteps: AdminQuestStepDto[];
}


/**
 * API service for handling quest-specific interactions.
 * Corresponds to QuestsController.cs and UserQuestProgressController.cs
 * Updated to support weekly module structure and background job polling.
 */
const questApi = {
  // =================================================================
  // QUESTS (QuestsController)
  // =================================================================

  /**
   * Gets the detailed information for a single quest, including all weekly steps.
   * Corresponds to GET /api/quests/{questId}
   */
  getQuestDetails: (questId: string): Promise<ApiResponse<QuestDetails | null>> =>
    axiosClient.get<QuestDetails>(`/api/quests/${questId}`).then(res => {
      // ⭐ Parse content strings and normalize activity properties
      const questDetails = res.data;
      if (questDetails?.steps) {
        questDetails.steps = questDetails.steps.map(normalizeStepActivities);
      }
      
      return {
        isSuccess: true,
        data: questDetails,
      };
    }),

  /**
   * ⭐ NEW: Gets a specific weekly step within a quest.
   * Useful for fetching a single week's activities.
   * Corresponds to GET /api/quests/{questId}/steps/{stepId}
   */
  getQuestStep: (questId: string, stepId: string): Promise<ApiResponse<QuestStep | null>> =>
    axiosClient.get<QuestStep>(`/api/quests/${questId}/steps/${stepId}`).then(res => {
      // ⭐ Parse content and normalize activity properties
      const step = normalizeStepActivities(res.data);
      
      return {
        isSuccess: true,
        data: step,
      };
    }),

  /**
   * ⭐ UPDATED: Schedules quest step generation as a background job.
   * Returns immediately with jobId (202 Accepted).
   * Use checkGenerationStatus() to poll for completion.
   * 
   * Corresponds to POST /api/quests/{questId}/generate-steps
   */
  generateQuestSteps: (questId: string): Promise<ApiResponse<GenerateQuestStepsResponse>> =>
    axiosClient.post<GenerateQuestStepsResponse>(`/api/quests/${questId}/generate-steps`)
      .then(res => ({
        isSuccess: true,
        data: res.data,  // Contains: jobId, status, message, questId
      } as const))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      } as const)),

  /**
   * ⭐ UPDATED: Checks the status of a quest step generation job.
   * Call this repeatedly (every 1-2 seconds) to check if generation is complete.
   * 
   * Returns:
   * - status: "Processing" (still running)
   * - status: "Succeeded" (complete - fetch quest details)
   * - status: "Failed" (failed - show error)
   * 
   * Corresponds to GET /api/admin/quests/generation-status/{jobId}
   */
  checkGenerationStatus: (jobId: string): Promise<ApiResponse<JobStatusResponse>> =>
  axiosClient.get<JobStatusResponse>(`/api/admin/quests/generation-status/${jobId}`)
    .then(res => ({
      data: res.data,
      isSuccess: true,
      is404: false,                    // ⭐ NEW: Explicit false (no error)
      isPollingEndpoint: true,         // ⭐ NEW: Mark as polling
    } as const))
    .catch(error => {
      // ⭐ NEW: Extract flags from axios error
      const is404 = (error as any).is404 ?? false;
      const isPollingEndpoint = (error as any).isPollingEndpoint ?? false;
      const message = (error as any).normalized?.message || error.message;
      
      return ({
        data: null,
        isSuccess: false,
        message,
        is404,                        // ⭐ NEW: Pass 404 flag
        isPollingEndpoint,            // ⭐ NEW: Pass polling flag
      } as const);
    }),

  /**
   * ⭐ UPDATED: Gets real-time progress of quest generation job.
   * Called by the modal to display live progress updates.
   * Returns current step, total steps, percentage, and message.
   * 
   * Corresponds to GET /api/admin/quests/generation-progress/{jobId}
   */
 getGenerationProgress: (jobId: string): Promise<ApiResponse<QuestGenerationProgressResponse>> =>
  axiosClient.get<QuestGenerationProgressResponse>(`/api/admin/quests/generation-progress/${jobId}`)
    .then(res => ({
      data: res.data,
      isSuccess: true,
      is404: false,                    // ⭐ NEW
      isPollingEndpoint: true,         // ⭐ NEW
    } as const))
    .catch(error => {
      const is404 = (error as any).is404 ?? false;
      const isPollingEndpoint = (error as any).isPollingEndpoint ?? false;
      const message = (error as any).normalized?.message || error.message;
      
      return ({
        data: null,
        isSuccess: false,
        message,
        is404,                        // ⭐ NEW
        isPollingEndpoint,            // ⭐ NEW
      } as const);
    }),

  /**
   * Explicitly starts a quest for the user.
   * Creates UserQuestAttempt and assigns difficulty track.
   * Idempotent: returns existing attempt info if already started.
   * POST /api/quests/{questId}/start
   */
  startQuest: (questId: string): Promise<ApiResponse<StartQuestResponse>> =>
    axiosClient
      .post<StartQuestResponse>(`/api/quests/${questId}/start`)
      .then(res => ({
        isSuccess: true,
        data: res.data,
      })),

  /**
   * ⭐ UPDATED: Marks a specific activity within a weekly step as complete.
   * Corresponds to POST /api/quests/{questId}/steps/{stepId}/activities/{activityId}/progress
   */
  updateActivityProgress: (
    questId: string,
    stepId: string,
    activityId: string,
    status: 'Completed' | 'InProgress'
  ): Promise<ApiResponse<void>> =>
    axiosClient
      .post(`/api/quests/${questId}/steps/${stepId}/activities/${activityId}/progress`, { status })
      .then(res => ({
        isSuccess: true,
        data: undefined,
      })),

  /**
   * Marks an entire weekly step as complete for the user.
   * Corresponds to POST /api/quests/{questId}/steps/{stepId}/progress
   */
  updateQuestStepProgress: (
    questId: string,
    stepId: string,
    status: 'Completed' | 'InProgress' | 'NotStarted'
  ): Promise<ApiResponse<void>> =>
    axiosClient
      .post(`/api/quests/${questId}/steps/${stepId}/progress`, { status })
      .then(res => ({
        isSuccess: true,
        data: undefined,
      })),

  /**
   * Manually updates the status of an entire quest for the user.
   * Corresponds to POST /api/quests/{questId}/progress
   */
  updateQuestProgress: (
    questId: string,
    status: 'Completed' | 'InProgress' | 'NotStarted' | 'Abandoned'
  ): Promise<ApiResponse<void>> =>
    axiosClient.post(`/api/quests/${questId}/progress`, { status }).then(res => ({
      isSuccess: true,
      data: undefined,
    })),

  /**
   * ⭐ NEW: Gets the user's progress for a specific quest (all weekly steps).
   * Corresponds to GET /api/quests/{questId}/my-progress
   */
  getMyQuestProgress: (questId: string): Promise<ApiResponse<QuestProgress | null>> =>
    axiosClient.get<QuestProgress>(`/api/quests/${questId}/my-progress`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  // ========== ⭐ NEW: USER PROGRESS ENDPOINTS ==========

  /**
   * ⭐ NEW: Gets the overall progress for a specific quest including all steps.
   * Returns quest status, steps summary, and overall completion percentage.
   * Corresponds to GET /api/user-progress/quests/{questId}
   */
  getQuestProgress: (questId: string): Promise<ApiResponse<GetQuestProgressResponse>> =>
    axiosClient
      .get<GetQuestProgressResponse>(`/api/user-progress/quests/${questId}`)
      .then(res => ({
  isSuccess: true as const,  // ✅ Now TypeScript sees this as literal true
  data: res.data,
}))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      })),

  /**
   * ⭐ NEW: Gets the progress for a specific step including completion status and percentage.
   * Shows how many activities are completed out of total.
   * Corresponds to GET /api/user-progress/quests/{questId}/steps/{stepId}
   */
  getStepProgress: (questId: string, stepId: string): Promise<ApiResponse<GetStepProgressResponse>> =>
    axiosClient
      .get<GetStepProgressResponse>(`/api/user-progress/quests/${questId}/steps/${stepId}`)
      .then(res => ({
  isSuccess: true as const,  // ✅ Now TypeScript sees this as literal true
  data: res.data,
}))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      })),

  /**
   * ⭐ NEW: Gets all activities in a step with their individual completion status.
   * Returns detailed info for each activity (type, XP, skill, title, completion status).
   * Corresponds to GET /api/user-progress/quests/{questId}/steps/{stepId}/activities
   */
  getCompletedActivities: (questId: string, stepId: string): Promise<ApiResponse<GetCompletedActivitiesResponse>> =>
    axiosClient
      .get<GetCompletedActivitiesResponse>(`/api/user-progress/quests/${questId}/steps/${stepId}/activities`)
      .then(res => ({
  isSuccess: true as const,  // ✅ Now TypeScript sees this as literal true
  data: res.data,
}))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      })),
  adminListFeedback: (
    params: { subjectId?: string; questId?: string; unresolvedOnly?: boolean }
  ): Promise<ApiResponse<AdminStepFeedbackItem[]>> =>
    axiosClient
      .get<AdminStepFeedbackItem[]>(`/api/admin/quests/feedback`, { params })
      .then(res => ({ isSuccess: true as const, data: res.data }))
      .catch(error => ({ isSuccess: false, data: null, message: error.response?.data?.message || error.message })),
  adminUpdateFeedback: (
    id: string,
    payload: { isResolved?: boolean; adminNotes?: string }
  ): Promise<ApiResponse<void>> =>
    axiosClient
      .patch(`/api/admin/quests/feedback/${id}`, payload)
      .then(() => ({ isSuccess: true as const, data: undefined }))
      .catch(error => ({ isSuccess: false, data: null, message: error.response?.data?.message || error.message })),
  submitStepFeedback: async (
    questId: string,
    stepId: string,
    payload: { rating: number; category: 'ContentError' | 'TechnicalIssue' | 'TooDifficult' | 'TooEasy' | 'Other'; comment?: string }
  ): Promise<ApiResponse<void>> => {
    try {
      await axiosClient.post(`/api/quests/${questId}/steps/${stepId}/feedback`, payload);
      return { isSuccess: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit feedback';
      return { isSuccess: false, data: null, message };
    }
  },
      submitQuizAnswer: async (
  questId: string,
  stepId: string,
  activityId: string,
  answers: Record<string, string>,
  correctAnswerCount: number,
  totalQuestions: number
): Promise<ApiResponse<SubmitQuizAnswerResponse>> => {
  try {
    const response = await axiosClient.post<SubmitQuizAnswerResponse>(
      `/api/quests/${questId}/steps/${stepId}/activities/${activityId}/submit-quiz`,
      {
        answers,
        correctAnswerCount,
        totalQuestions
      }
    );

    // ✅ Explicitly return success response with literal true
    return {
      isSuccess: true,
      data: response.data,
    };
  } catch (error) {
    // ✅ Explicitly return failure response with literal false
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to submit quiz';
    
    return {
      isSuccess: false,
      data: null,
      message,
    };
  }
},

  // ========== QUEST SKILLS ==========

  /**
   * Gets the skills that will be developed by completing this quest.
   * Corresponds to GET /api/quests/{questId}/skills
   */
  getQuestSkills: async (questId: string): Promise<ApiResponse<GetQuestSkillsResponse>> => {
    try {
      const res = await axiosClient.get<GetQuestSkillsResponse>(`/api/quests/${questId}/skills`);
      return {
        isSuccess: true as const,
        data: res.data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch quest skills';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },

  // ========== ADMIN QUEST MANAGEMENT ==========

  /**
   * Gets a paginated list of all quests for admin management.
   * Corresponds to GET /api/admin/quests
   */
  adminListQuests: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    subjectId?: string;
    stepsGenerated?: boolean;
  }): Promise<ApiResponse<AdminQuestListResponse>> => {
    try {
      const res = await axiosClient.get<AdminQuestListResponse>('/api/admin/quests', { params });
      return {
        isSuccess: true as const,
        data: res.data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch quests';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },

  /**
   * Gets detailed quest information for admin including all steps grouped by difficulty.
   * Returns 3-way split: standardSteps, supportiveSteps, challengingSteps
   * Corresponds to GET /api/admin/quests/{questId}
   */
  adminGetQuestDetails: async (questId: string): Promise<ApiResponse<AdminQuestDetailsDto>> => {
    try {
      const res = await axiosClient.get<AdminQuestDetailsDto>(`/api/admin/quests/${questId}`);
      const data = res.data;
      
      // Parse content strings and normalize activity properties in each track
      if (data.standardSteps) data.standardSteps = data.standardSteps.map(normalizeStepActivities);
      if (data.supportiveSteps) data.supportiveSteps = data.supportiveSteps.map(normalizeStepActivities);
      if (data.challengingSteps) data.challengingSteps = data.challengingSteps.map(normalizeStepActivities);
      
      return {
        isSuccess: true as const,
        data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch quest details';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },

  /**
   * Triggers quest step generation for admin.
   * Same as generateQuestSteps but explicitly for admin use.
   * Corresponds to POST /api/admin/quests/{questId}/generate-steps
   */
  adminGenerateQuestSteps: async (questId: string): Promise<ApiResponse<GenerateQuestStepsResponse>> => {
    try {
      const res = await axiosClient.post<GenerateQuestStepsResponse>(`/api/admin/quests/${questId}/generate-steps`);
      return {
        isSuccess: true as const,
        data: res.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to start generation';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },

  /**
   * Regenerates quest steps (deletes existing and creates new).
   * Corresponds to POST /api/admin/quests/{questId}/regenerate-steps
   */
  adminRegenerateQuestSteps: async (questId: string): Promise<ApiResponse<GenerateQuestStepsResponse>> => {
    try {
      const res = await axiosClient.post<GenerateQuestStepsResponse>(`/api/admin/quests/${questId}/regenerate-steps`);
      return {
        isSuccess: true as const,
        data: res.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to start regeneration';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },

  /**
   * Deletes all steps for a quest.
   * Corresponds to DELETE /api/admin/quests/{questId}/steps
   */
  adminDeleteQuestSteps: async (questId: string): Promise<ApiResponse<void>> => {
    try {
      await axiosClient.delete(`/api/admin/quests/${questId}/steps`);
      return {
        isSuccess: true as const,
        data: undefined,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete steps';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },

  /**
   * Updates the learning activities for a specific quest step.
   * This is a full replacement operation - the activities array will overwrite existing content.
   * Corresponds to PUT /api/admin/quest-steps/{questStepId}/content
   */
  adminUpdateQuestStepContent: async (
    questStepId: string,
    activities: QuestStepActivityPayload[]
  ): Promise<ApiResponse<UpdateQuestStepContentResponse>> => {
    try {
      const res = await axiosClient.put<UpdateQuestStepContentResponse>(
        `/api/admin/quest-steps/${questStepId}/content`,
        { activities }
      );
      return {
        isSuccess: true as const,
        data: res.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update quest step content';
      return {
        isSuccess: false as const,
        data: null,
        message,
      };
    }
  },
};

// ========== QUEST STEP ACTIVITY TYPES ==========

/**
 * Activity payload for updating quest step content
 */
export interface QuestStepActivityPayload {
  activityId: string;
  type: 'Reading' | 'KnowledgeCheck' | 'Quiz';
  skillId: string;
  payload: ReadingPayload | KnowledgeCheckPayload | QuizPayload;
}

export interface ReadingPayload {
  experiencePoints: number;
  url: string;
  articleTitle: string;
  summary: string;
}

export interface QuestionPayload {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface KnowledgeCheckPayload {
  experiencePoints: number;
  questions: QuestionPayload[];
}

export interface QuizPayload {
  experiencePoints: number;
  questions: QuestionPayload[];
}

export interface UpdateQuestStepContentResponse {
  questStepId: string;
  isSuccess: boolean;
  message: string;
  activityCount: number;
  updatedAt: string;
}

export default questApi;