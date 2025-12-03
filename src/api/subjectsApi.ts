// roguelearn-web/src/api/subjectsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  Subject,
  CreateSubjectCommandRequest,
  CreateSubjectResponse,
  UpdateSubjectCommandRequest,
  UpdateSubjectResponse,
  GetSubjectByIdResponse,
  PaginatedSubjectsResponse,
} from '@/types/subjects';
import { ImportSubjectFromTextCommandResponse } from '@/types/curriculum-import';

const subjectsApi = {
  // =================================================================
  // SUBJECTS (SubjectsController)
  // =================================================================
  
  /** GET /api/admin/subjects */
  getAll: (page: number = 1, pageSize: number = 100): Promise<ApiResponse<PaginatedSubjectsResponse>> =>
    axiosClient.get<PaginatedSubjectsResponse>('/api/admin/subjects', {
      params: { page, pageSize },
    }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/admin/subjects/{id} */
  getById: (id: string): Promise<ApiResponse<GetSubjectByIdResponse>> =>
    axiosClient.get<Subject>(`/api/admin/subjects/${id}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/admin/subjects */
  create: (payload: CreateSubjectCommandRequest): Promise<ApiResponse<CreateSubjectResponse>> =>
    axiosClient.post<CreateSubjectResponse>('/api/admin/subjects', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/admin/subjects/{id} */
  update: (id: string, payload: Omit<UpdateSubjectCommandRequest, 'id'>): Promise<ApiResponse<UpdateSubjectResponse>> =>
    axiosClient.put<UpdateSubjectResponse>(`/api/admin/subjects/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/subjects/{id} */
  remove: (id: string): Promise<void> => axiosClient.delete(`/api/admin/subjects/${id}`).then(() => {}),

  /**
   * POST /api/admin/subjects/import-from-text
   * Imports a single subject's syllabus content from raw text.
   */
  importFromText: (rawText: string): Promise<ApiResponse<ImportSubjectFromTextCommandResponse>> => {
    const formData = new FormData();
    formData.append('rawText', rawText);
    return axiosClient.post<ImportSubjectFromTextCommandResponse>('/api/admin/subjects/import-from-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => ({
        isSuccess: true,
        data: res.data,
    }));
  },
};

export default subjectsApi;