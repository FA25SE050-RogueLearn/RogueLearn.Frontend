// roguelearn-web/src/api/questApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { LearningPath, QuestDetails } from '../types/quest';

const questApi = {
  /**
   * Gets the primary learning path for the currently authenticated user.
   * Corresponds to GET /api/learning-paths/me
   */
  getMyLearningPath: (): Promise<ApiResponse<LearningPath | null>> =>
    axiosClient.get<LearningPath>('/api/learning-paths/me').then(res => ({
        isSuccess: true,
        data: res.data,
    })),

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
   * Marks a quest step as complete for the user.
   * Corresponds to POST /api/quests/{questId}/steps/{stepId}/progress
   */
  updateQuestStepProgress: (questId: string, stepId: string, status: string) =>
    axiosClient.post(`/api/quests/${questId}/steps/${stepId}/progress`, { status }),
    
  // MODIFICATION: Added a new function to update the progress of an entire quest.
  // This provides the manual override capability you requested.
  /**
   * Manually updates the status of an entire quest for the user (e.g., to "Completed").
   * Corresponds to POST /api/quests/{questId}/progress
   */
  updateQuestProgress: (questId: string, status: 'Completed' | 'InProgress' | 'NotStarted') =>
    axiosClient.post(`/api/quests/${questId}/progress`, { status }),
};

export default questApi;