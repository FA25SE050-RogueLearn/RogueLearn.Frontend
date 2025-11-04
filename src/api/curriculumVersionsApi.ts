// src/api/curriculumVersionsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  CurriculumVersionDto,
  CreateCurriculumVersionCommandRequest,
  CreateCurriculumVersionResponse,
  ActivateCurriculumVersionResponse,
} from '@/types/curriculum-versions';

const curriculumVersionsApi = {
  /** GET /api/admin/programs/{programId}/versions */
  getByProgram: (programId: string): Promise<ApiResponse<CurriculumVersionDto[]>> =>
    axiosClient.get<CurriculumVersionDto[]>(`/api/admin/programs/${programId}/versions`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/admin/programs/{programId}/versions */
  create: (programId: string, payload: Omit<CreateCurriculumVersionCommandRequest, 'programId'>): Promise<ApiResponse<CreateCurriculumVersionResponse>> =>
    axiosClient.post<CreateCurriculumVersionResponse>(`/api/admin/programs/${programId}/versions`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/admin/programs/{programId}/versions/{versionId}/activate */
  activate: (programId: string, versionId: string): Promise<ActivateCurriculumVersionResponse> =>
    axiosClient.post<void>(`/api/admin/programs/${programId}/versions/${versionId}/activate`).then(() => {}),
};

export default curriculumVersionsApi;