// roguelearn-web/src/api/questApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { QuestDetails, QuestStep, QuestProgress, QuestSummary } from '../types/quest';
import { 
  GetStepProgressResponse, 
  GetCompletedActivitiesResponse, 
  GetQuestProgressResponse, 
  SubmitQuizAnswerResponse
} from '../types/quest-progress';
import { normalizeStepActivities } from '../lib/normalizeActivities';

// ... (Existing interfaces for background jobs and admin management)
interface GenerateQuestStepsResponse {
  jobId: string;
  status: string;
  message: string;
  questId: string;
}

interface SkillPrerequisite {
  skillId: string;
  skillName: string;
}

interface QuestSkillInfo {
  skillId: string;
  skillName: string;
  domain: string;
  relevanceWeight: number;
  prerequisites: SkillPrerequisite[];
}

export interface StartQuestResponse {
  attemptId: string;
  status: string;
  assignedDifficulty: string;
  isNew: boolean;
}

export interface GetQuestSkillsResponse {
  questId: string;
  subjectId: string;
  subjectName: string;
  skills: QuestSkillInfo[];
}

interface JobStatusResponse {
  jobId: string;
  status: string;
  createdAt: string;
  error?: string | null;
  message?: string | null;
}

interface QuestGenerationProgressResponse {
  currentStep: number;
  totalSteps: number;
  message: string;
  progressPercentage: number;
  updatedAt: string;
}

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

export interface AdminQuestListResponse {
  items: AdminQuestListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
  standardSteps: AdminQuestStepDto[];
  supportiveSteps: AdminQuestStepDto[];
  challengingSteps: AdminQuestStepDto[];
}

// ⭐ NEW: Response type for coding submission
export interface SubmitCodingActivityResponse {
  submissionId: string;
  isPassed: boolean;
  score: number;
  feedback: string;
  experiencePointsAwarded?: number;
}

// ⭐ NEW: Response type for syncing master quests
export interface AdminSyncQuestsResponse {
    createdCount: number;
    existingCount: number;
}

const questApi = {
  // =================================================================
  // QUESTS (QuestsController)
  // =================================================================

  getMyQuests: (): Promise<ApiResponse<QuestSummary[]>> =>
    axiosClient.get<QuestSummary[]>('/api/quests/me').then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  getQuestDetails: (questId: string): Promise<ApiResponse<QuestDetails | null>> =>
    axiosClient.get<QuestDetails>(`/api/quests/${questId}`).then(res => {
      const questDetails = res.data;
      if (questDetails?.steps) {
        questDetails.steps = questDetails.steps.map(normalizeStepActivities);
      }
      return {
        isSuccess: true,
        data: questDetails,
      };
    }),

  getQuestStep: (questId: string, stepId: string): Promise<ApiResponse<QuestStep | null>> =>
    axiosClient.get<QuestStep>(`/api/quests/${questId}/steps/${stepId}`).then(res => {
      const step = normalizeStepActivities(res.data);
      return {
        isSuccess: true,
        data: step,
      };
    }),

  generateQuestSteps: (questId: string): Promise<ApiResponse<GenerateQuestStepsResponse>> =>
    axiosClient.post<GenerateQuestStepsResponse>(`/api/quests/${questId}/generate-steps`)
      .then(res => ({
        isSuccess: true,
        data: res.data,
      } as const))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      } as const)),

  checkGenerationStatus: (jobId: string): Promise<ApiResponse<JobStatusResponse>> =>
  axiosClient.get<JobStatusResponse>(`/api/admin/quests/generation-status/${jobId}`)
    .then(res => ({
      data: res.data,
      isSuccess: true,
      is404: false,
      isPollingEndpoint: true,
    } as const))
    .catch(error => ({
        data: null,
        isSuccess: false,
        message: (error as any).normalized?.message || error.message,
        is404: (error as any).is404 ?? false,
        isPollingEndpoint: (error as any).isPollingEndpoint ?? false,
    } as const)),

 getGenerationProgress: (jobId: string): Promise<ApiResponse<QuestGenerationProgressResponse>> =>
  axiosClient.get<QuestGenerationProgressResponse>(`/api/admin/quests/generation-progress/${jobId}`)
    .then(res => ({
      data: res.data,
      isSuccess: true,
      is404: false,
      isPollingEndpoint: true,
    } as const))
    .catch(error => ({
        data: null,
        isSuccess: false,
        message: (error as any).normalized?.message || error.message,
        is404: (error as any).is404 ?? false,
        isPollingEndpoint: (error as any).isPollingEndpoint ?? false,
    } as const)),

  startQuest: (questId: string): Promise<ApiResponse<StartQuestResponse>> =>
    axiosClient
      .post<StartQuestResponse>(`/api/quests/${questId}/start`)
      .then(res => ({
        isSuccess: true,
        data: res.data,
      })),

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

  // ⭐ NEW: Submit coding activity
  submitCodingActivity: async (
    questId: string,
    stepId: string,
    activityId: string,
    payload: { code: string; language: string }
  ): Promise<ApiResponse<SubmitCodingActivityResponse>> => {
    try {
      const res = await axiosClient.post<SubmitCodingActivityResponse>(
        `/api/quests/${questId}/steps/${stepId}/activities/${activityId}/submit-code`,
        payload
      );
      return {
        isSuccess: true,
        data: res.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit code';
      return {
        isSuccess: false,
        data: null,
        message,
      };
    }
  },

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

  updateQuestProgress: (
    questId: string,
    status: 'Completed' | 'InProgress' | 'NotStarted' | 'Abandoned'
  ): Promise<ApiResponse<void>> =>
    axiosClient.post(`/api/quests/${questId}/progress`, { status }).then(res => ({
      isSuccess: true,
      data: undefined,
    })),

  getMyQuestProgress: (questId: string): Promise<ApiResponse<QuestProgress | null>> =>
    axiosClient.get<QuestProgress>(`/api/quests/${questId}/my-progress`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  getQuestProgress: (questId: string): Promise<ApiResponse<GetQuestProgressResponse>> =>
    axiosClient
      .get<GetQuestProgressResponse>(`/api/user-progress/quests/${questId}`)
      .then(res => ({
        isSuccess: true as const,
        data: res.data,
      }))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      })),

  getStepProgress: (questId: string, stepId: string): Promise<ApiResponse<GetStepProgressResponse>> =>
    axiosClient
      .get<GetStepProgressResponse>(`/api/user-progress/quests/${questId}/steps/${stepId}`)
      .then(res => ({
        isSuccess: true as const,
        data: res.data,
      }))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      })),

  getCompletedActivities: (questId: string, stepId: string): Promise<ApiResponse<GetCompletedActivitiesResponse>> =>
    axiosClient
      .get<GetCompletedActivitiesResponse>(`/api/user-progress/quests/${questId}/steps/${stepId}/activities`)
      .then(res => ({
        isSuccess: true as const,
        data: res.data,
      }))
      .catch(error => ({
        isSuccess: false,
        data: null,
        message: error.response?.data?.message || error.message
      })),
      
  adminListFeedback: (
    params: { subjectId?: string; questId?: string; unresolvedOnly?: boolean }
  ): Promise<ApiResponse<any[]>> =>
    axiosClient
      .get(`/api/admin/quests/feedback`, { params })
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
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit quiz';
      return {
        isSuccess: false,
        data: null,
        message,
      };
    }
  },

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

  adminGetQuestDetails: async (questId: string): Promise<ApiResponse<AdminQuestDetailsDto>> => {
    try {
      const res = await axiosClient.get<AdminQuestDetailsDto>(`/api/admin/quests/${questId}`);
      const data = res.data;
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

  adminUpdateQuestStepContent: async (
    questStepId: string,
    activities: any[]
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.put<any>(
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

  /**
   * Scans all Subjects and creates a Master Quest shell for any that are missing.
   */
  adminSyncMasterQuests: async (): Promise<ApiResponse<AdminSyncQuestsResponse>> => {
    try {
        const res = await axiosClient.post<AdminSyncQuestsResponse>('/api/admin/quests/sync-from-subjects');
        return {
            isSuccess: true as const,
            data: res.data,
        };
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || 'Failed to sync quests from subjects';
        return {
            isSuccess: false as const,
            data: null,
            message,
        };
    }
  },
};

export interface QuestStepActivityPayload {
  activityId: string;
  type: 'Reading' | 'KnowledgeCheck' | 'Quiz' | 'Coding';
  skillId: string;
  payload: any;
}

// ⭐ EXPORTED: QuestionPayload for use in edit dialog
export interface QuestionPayload {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  experiencePoints?: number;
}

export default questApi;