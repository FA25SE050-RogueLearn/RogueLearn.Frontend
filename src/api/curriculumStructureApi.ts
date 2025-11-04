// src/api/curriculumStructureApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  CurriculumStructureDto,
  AddSubjectToCurriculumCommandRequest,
  AddSubjectToCurriculumResponse,
  UpdateCurriculumStructureCommandRequest,
  UpdateCurriculumStructureResponse,
} from '@/types/curriculum-structure';

const curriculumStructureApi = {
  /** GET /api/admin/curriculum-structure/version/{versionId} */
  getByVersion: (versionId: string): Promise<ApiResponse<CurriculumStructureDto[]>> =>
    axiosClient.get<CurriculumStructureDto[]>(`/api/admin/curriculum-structure/version/${versionId}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/admin/curriculum-structure */
  addSubject: (payload: AddSubjectToCurriculumCommandRequest): Promise<ApiResponse<AddSubjectToCurriculumResponse>> =>
    axiosClient.post<AddSubjectToCurriculumResponse>('/api/admin/curriculum-structure', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/admin/curriculum-structure/{id} */
  updateEntry: (id: string, payload: Omit<UpdateCurriculumStructureCommandRequest, 'id'>): Promise<ApiResponse<UpdateCurriculumStructureResponse>> =>
    axiosClient.put<UpdateCurriculumStructureResponse>(`/api/admin/curriculum-structure/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/curriculum-structure/{id} */
  removeEntry: (id: string): Promise<void> => axiosClient.delete(`/api/admin/curriculum-structure/${id}`).then(() => {}),
};

export default curriculumStructureApi;