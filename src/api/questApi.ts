// roguelearn-web/src/api/questApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { QuestDetails, QuestStep, QuestProgress } from '../types/quest';

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

/**
 * API service for handling quest-specific interactions.
 * Corresponds to QuestsController.cs
 * Updated to support weekly module structure and background job polling.
 */
const questApi = {
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
        isSuccess: true,
        data: res.data,  // Contains: jobId, status, createdAt, error
      } as const))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      } as const)),

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
        isSuccess: true,
        data: res.data,  // Contains: currentStep, totalSteps, message, progressPercentage, updatedAt
      } as const))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      } as const)),

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
};

export default questApi;