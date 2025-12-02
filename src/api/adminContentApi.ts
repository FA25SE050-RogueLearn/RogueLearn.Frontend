// roguelearn-web/src/api/adminContentApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
import { CurriculumProgramDto } from "@/types/curriculum-programs";
import {
  Subject,
  SyllabusContent,
  PaginatedSubjectsResponse,
} from "@/types/subjects";
import { WeeklyModuleContent } from "@/types/quest";

const adminContentApi = {
  // =================================================================
  // CURRICULUM PROGRAMS (CurriculumProgramsAdminController)
  // =================================================================

  getCurriculumPrograms: (): Promise<ApiResponse<CurriculumProgramDto[]>> =>
    axiosClient
      .get<CurriculumProgramDto[]>("/api/admin/programs")
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  // =================================================================
  // SUBJECTS (SubjectsController)
  // =================================================================
  getSubjects: (): Promise<ApiResponse<Subject[]>> =>
    axiosClient.get<Subject[]>("/api/admin/subjects").then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  getSubjectsPaged: (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedSubjectsResponse>> =>
    axiosClient
      .get<PaginatedSubjectsResponse>("/api/admin/subjects", { params })
      .then((res) => ({
        isSuccess: true as const,
        data: res.data,
      }))
      .catch((error) => ({
        isSuccess: false as const,
        data: null,
        message: error.response?.data?.message || error.message,
      })),

  // =================================================================
  // SUBJECTS CONTENT EDITOR (SubjectContentEditorController)
  // =================================================================

  getSubjectContent: (
    subjectId: string
  ): Promise<ApiResponse<SyllabusContent>> =>
    axiosClient
      .get<SyllabusContent>(`/api/admin/subjects/${subjectId}/content`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  updateSubjectContent: (
    subjectId: string,
    content: SyllabusContent
  ): Promise<ApiResponse<SyllabusContent>> =>
    axiosClient
      .put<SyllabusContent>(`/api/admin/subjects/${subjectId}/content`, content)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** GET /api/admin/quest-steps/{questStepId}/content - Get quest step content for admin review */
  getQuestStepContent: (
    questStepId: string
  ): Promise<ApiResponse<WeeklyModuleContent>> =>
    axiosClient
      .get<WeeklyModuleContent>(`/api/admin/quest-steps/${questStepId}/content`)
      .then((res) => ({
        isSuccess: true as const,
        data: res.data,
      }))
      .catch((error) => ({
        isSuccess: false as const,
        data: null,
        message: error.response?.data?.message || error.message,
      })),
};

export default adminContentApi;
