// src/api/curriculumProgramsApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
import {
  CurriculumProgramDto,
  CurriculumProgramDetailsResponse,
  CreateCurriculumProgramCommandRequest,
  CreateCurriculumProgramResponse,
  UpdateCurriculumProgramCommandRequest,
  UpdateCurriculumProgramResponse,
} from "@/types/curriculum-programs";
import { Subject } from "@/types/subjects";

const curriculumProgramsApi = {
  // =================================================================
  // CURRICULUM PROGRAMS (CurriculumProgramsController)
  // =================================================================

  /** GET /api/admin/programs */
  getAll: (): Promise<ApiResponse<CurriculumProgramDto[]>> =>
    axiosClient
      .get<CurriculumProgramDto[]>("/api/admin/programs")
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** GET /api/admin/programs/{id} */
  getById: (id: string): Promise<ApiResponse<CurriculumProgramDto>> =>
    axiosClient
      .get<CurriculumProgramDto>(`/api/admin/programs/${id}`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** GET /api/admin/programs/{id}/details */
  getDetails: (
    id: string
  ): Promise<ApiResponse<CurriculumProgramDetailsResponse>> =>
    axiosClient
      .get<CurriculumProgramDetailsResponse>(
        `/api/admin/programs/${id}/details`
      )
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** POST /api/admin/programs */
  create: (
    payload: CreateCurriculumProgramCommandRequest
  ): Promise<ApiResponse<CreateCurriculumProgramResponse>> =>
    axiosClient
      .post<CreateCurriculumProgramResponse>("/api/admin/programs", payload)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** PUT /api/admin/programs/{id} */
  update: (
    id: string,
    payload: Omit<UpdateCurriculumProgramCommandRequest, "id">
  ): Promise<ApiResponse<UpdateCurriculumProgramResponse>> =>
    axiosClient
      .put<UpdateCurriculumProgramResponse>(`/api/admin/programs/${id}`, {
        ...payload,
      })
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** DELETE /api/admin/programs/{id} */
  remove: (id: string): Promise<void> =>
    axiosClient.delete(`/api/admin/programs/${id}`).then(() => {}),

  /** GET /api/admin/programs/{programId}/subjects */
  getProgramSubjects: (programId: string): Promise<ApiResponse<Subject[]>> =>
    axiosClient
      .get<Subject[]>(`/api/admin/programs/${programId}/subjects`)
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

export default curriculumProgramsApi;
