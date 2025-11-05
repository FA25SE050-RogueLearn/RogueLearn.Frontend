// roguelearn-web/src/api/userQuestProgressApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserQuestProgress } from '../types/academic';

/**
 * API service for fetching user-specific quest progress.
 * Corresponds to UserQuestProgressController.cs
 */
const userQuestProgressApi = {
  /**
   * Gets the user's progress for a specific quest, including the status of each step.
   * Corresponds to GET /api/user-progress/quests/{questId}
   */
  getUserQuestProgress: (questId: string): Promise<ApiResponse<UserQuestProgress | null>> =>
    axiosClient.get(`api/user-progress/quests/${questId}`).then(res => ({
        isSuccess: true,
        data: res.data,
    })),
};

export default userQuestProgressApi;