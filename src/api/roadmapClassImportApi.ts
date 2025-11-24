// src/api/roadmapClassImportApi.ts
import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/base/Api';
import {
  ImportRoadmapCommandRequest,
  ImportRoadmapCommandResponse,
  ValidateRoadmapCommandRequest,
  ValidateRoadmapCommandResponse,
} from '@/types/roadmap-import';

const roadmapClassImportApi = {
  /** POST /api/admin/classes/{classId}/roadmap/import */
  importRoadmap: (classId: string, payload: ImportRoadmapCommandRequest): Promise<ApiResponse<ImportRoadmapCommandResponse>> => {
    const formData = new FormData();
    formData.append('rawText', payload.rawText);
    if (payload.programId) formData.append('programId', payload.programId);
    return axiosClient
      .post<ImportRoadmapCommandResponse>(`/api/admin/classes/${classId}/roadmap/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => ({ isSuccess: true, data: res.data }));
  },

  /** POST /api/admin/classes/{classId}/roadmap/validate */
  validateRoadmap: (classId: string, payload: ValidateRoadmapCommandRequest): Promise<ApiResponse<ValidateRoadmapCommandResponse>> => {
    const formData = new FormData();
    formData.append('rawText', payload.rawText);
    return axiosClient
      .post<ValidateRoadmapCommandResponse>(`/api/admin/classes/${classId}/roadmap/validate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => ({ isSuccess: true, data: res.data }));
  },
};

export default roadmapClassImportApi;