// roguelearn-web/src/api/questApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { QuestDetails, QuestStep } from '../types/quest';

/**
 * API service for handling quest-specific interactions.
 * Corresponds to QuestsController.cs
 */
const questApi = {
  /**
   * Gets the detailed information for a single quest.
   * Corresponds to GET /api/quests/{questId}
   */
  getQuestDetails: (questId: string): Promise<ApiResponse<QuestDetails | null>> =>
    axiosClient.get<QuestDetails>(`/api/quests/${questId}`).then(res => ({
        isSuccess: true,
        data: res.data,
    })),
  
  /**
   * Generates or retrieves the detailed steps for a single quest.
   * This should be called when a user starts a quest for the first time.
   * Corresponds to POST /api/quests/{questId}/generate-steps
   */
  generateQuestSteps: (questId: string): Promise<ApiResponse<QuestStep[]>> =>
    axiosClient.post(`api/quests/${questId}/generate-steps`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /**
   * Marks a quest step as complete for the user.
   * Corresponds to POST /api/quests/{questId}/steps/{stepId}/progress
   */
  updateQuestStepProgress: (questId: string, stepId: string, status: string) =>
    axiosClient.post(`/api/quests/${questId}/steps/${stepId}/progress`, { status }),
    
  /**
   * Manually updates the status of an entire quest for the user (e.g., to "Completed").
   * Corresponds to POST /api/quests/{questId}/progress
   */
  updateQuestProgress: (questId: string, status: 'Completed' | 'InProgress' | 'NotStarted') =>
    axiosClient.post(`/api/quests/${questId}/progress`, { status }),
};

export default questApi;