import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { FapRecordData, GapAnalysisResponse, ForgedLearningPath } from '../types/academic';
import { QuestStep } from '../types/quest';

/**
 * API service for handling academic record processing, gap analysis,
 * and on-demand quest generation.
 */
const academicApi = {
  /**
   * Transaction 1: Sends raw FAP HTML to the backend for extraction and analysis.
   * Does not save anything to the database.
   * Corresponds to POST /api/academic-records/extract
   * @param htmlContent The raw HTML string from the user's FAP page.
   */
  extractFapRecord: (htmlContent: string): Promise<ApiResponse<FapRecordData>> => {
    const formData = new FormData();
    formData.append('fapHtmlContent', htmlContent);
    // The backend is expecting multipart/form-data, so we send it as such.
    return axiosClient.post('/academic-records/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },

  /**
   * Transaction 2: Sends the user-verified academic data to perform a gap analysis
   * against their chosen career class.
   * Corresponds to POST /api/learning-paths/analyze-gap
   * @param recordData The verified academic data from the previous step.
   */
  analyzeLearningGap: (recordData: FapRecordData): Promise<ApiResponse<GapAnalysisResponse>> =>
    axiosClient.post('/learning-paths/analyze-gap', recordData).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /**
   * Transaction 3: Confirms the recommendation and instructs the backend to create
   * the high-level LearningPath and QuestChapter entities.
   * Corresponds to POST /api/learning-paths/forge
   * @param forgingPayload The payload received from the gap analysis step.
   */
  forgeLearningPath: (forgingPayload: any): Promise<ApiResponse<ForgedLearningPath>> =>
    axiosClient.post('/learning-paths/forge', forgingPayload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /**
   * Transaction 4: Generates the detailed, playable steps for a single quest on-demand.
   * Corresponds to POST /api/quests/{questId}/generate-steps
   * @param questId The ID of the quest for which to generate content.
   */
  generateQuestSteps: (questId: string): Promise<ApiResponse<QuestStep[]>> =>
    axiosClient.post(`/quests/${questId}/generate-steps`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
};

export default academicApi;