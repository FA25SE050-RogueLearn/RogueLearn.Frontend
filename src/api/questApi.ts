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
      // ⭐ Parse content strings if needed
      const questDetails = res.data;
      if (questDetails?.steps) {
        questDetails.steps = questDetails.steps.map(step => ({
          ...step,
          content: typeof step.content === 'string' 
            ? JSON.parse(step.content) 
            : step.content
        }));
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
      // ⭐ Parse content if it's a string
      const step = res.data;
      if (step && typeof step.content === 'string') {
        step.content = JSON.parse(step.content);
      }
      
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
   * ⭐ NEW: Checks the status of a quest step generation job.
   * Call this repeatedly (every 1-2 seconds) to check if generation is complete.
   * 
   * Returns:
   * - status: "Processing" (still running)
   * - status: "Succeeded" (complete - fetch quest details)
   * - status: "Failed" (failed - show error)
   * 
   * Corresponds to GET /api/quests/generation-status/{jobId}
   */
  checkGenerationStatus: (jobId: string): Promise<ApiResponse<JobStatusResponse>> =>
  axiosClient.get<JobStatusResponse>(`/api/quests/generation-status/${jobId}`)
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
   * ⭐ NEW: Gets real-time progress of quest generation job.
   * Called by the modal to display live progress updates.
   * Returns current step, total steps, percentage, and message.
   * 
   * Corresponds to GET /api/quests/generation-progress/{jobId}
   */
 getGenerationProgress: (jobId: string): Promise<ApiResponse<QuestGenerationProgressResponse>> =>
  axiosClient.get<QuestGenerationProgressResponse>(`/api/quests/generation-progress/${jobId}`)
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
};

export default questApi;
