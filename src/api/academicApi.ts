// roguelearn-web/src/api/academicApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { FapRecordData, GapAnalysisResponse, ForgedLearningPath, UserQuestProgress } from '../types/academic';
import { QuestStep } from '../types/quest';

/**
 * API service for handling academic record processing, gap analysis,
 * and on-demand quest generation.
 */
const academicApi = {
  // ... (other methods are unchanged)
  extractFapRecord: (htmlContent: string): Promise<ApiResponse<FapRecordData>> => {
    const formData = new FormData();
    formData.append('fapHtmlContent', htmlContent);
    return axiosClient.post('api/academic-records/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },
  analyzeLearningGap: (recordData: FapRecordData): Promise<ApiResponse<GapAnalysisResponse>> =>
    axiosClient.post('api/learning-paths/analyze-gap', recordData).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
  forgeLearningPath: (forgingPayload: any): Promise<ApiResponse<ForgedLearningPath>> =>
    axiosClient.post('api/learning-paths/forge', forgingPayload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
  generateQuestSteps: (questId: string): Promise<ApiResponse<QuestStep[]>> =>
    axiosClient.post(`api/quests/${questId}/generate-steps`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
  updateQuestStepProgress: (questId: string, stepId: string, status: string) =>
    axiosClient.post(`api/quests/${questId}/steps/${stepId}/progress`, { status }),

  // MODIFICATION: Add the new function to fetch user-specific quest progress.
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

export default academicApi;