// src/api/syllabusVersionsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  SyllabusVersionDto,
  CreateSyllabusVersionCommandRequest,
  CreateSyllabusVersionResponse,
  UpdateSyllabusVersionCommandRequest,
  UpdateSyllabusVersionResponse,
  GetSyllabusContentByIdResponse,
} from '@/types/syllabus';

const syllabusVersionsApi = {
  /** GET /api/admin/syllabus-versions/subject/{subjectId} */
  getBySubject: (subjectId: string): Promise<ApiResponse<SyllabusVersionDto[]>> =>
    axiosClient.get<SyllabusVersionDto[]>(`/api/admin/syllabus-versions/subject/${subjectId}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/admin/syllabus-versions */
  create: (payload: CreateSyllabusVersionCommandRequest): Promise<ApiResponse<CreateSyllabusVersionResponse>> =>
    axiosClient.post<CreateSyllabusVersionResponse>('/api/admin/syllabus-versions', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/admin/syllabus-versions/{id} */
  update: (id: string, payload: Omit<UpdateSyllabusVersionCommandRequest, 'id'>): Promise<ApiResponse<UpdateSyllabusVersionResponse>> =>
    axiosClient.put<UpdateSyllabusVersionResponse>(`/api/admin/syllabus-versions/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/syllabus-versions/{id} */
  remove: (id: string): Promise<void> => axiosClient.delete(`/api/admin/syllabus-versions/${id}`).then(() => {}),

  /** GET /api/admin/syllabus-versions/{id}/content */
  getContentById: (id: string): Promise<ApiResponse<GetSyllabusContentByIdResponse>> =>
    axiosClient.get<GetSyllabusContentByIdResponse>(`/api/admin/syllabus-versions/${id}/content`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
};

export default syllabusVersionsApi;