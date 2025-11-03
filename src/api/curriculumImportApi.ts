// src/api/curriculumImportApi.ts
import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/base/Api';
import {
  ImportCurriculumCommandRequest,
  ImportCurriculumCommandResponse,
  ImportSubjectFromTextCommandRequest,
  ImportSubjectFromTextCommandResponse,
  ValidateCurriculumCommandRequest,
  ValidateCurriculumCommandResponse,
} from '@/types/curriculum-import';

const curriculumImportApi = {
  /** POST /api/admin/curriculum */
  importCurriculum: (payload: ImportCurriculumCommandRequest): Promise<ApiResponse<ImportCurriculumCommandResponse>> => {
    const formData = new FormData();
    formData.append('rawText', payload.rawText);
    if (payload.programId) formData.append('programId', payload.programId);
    return axiosClient
      .post<ImportCurriculumCommandResponse>('/api/admin/curriculum', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => ({ isSuccess: true, data: res.data }));
  },

  /** POST /api/admin/subjects/import-from-text */
  importSubjectFromText: (payload: ImportSubjectFromTextCommandRequest): Promise<ApiResponse<ImportSubjectFromTextCommandResponse>> => {
    const formData = new FormData();
    formData.append('rawText', payload.rawText);
    return axiosClient
      .post<ImportSubjectFromTextCommandResponse>('/api/admin/subjects/import-from-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => ({ isSuccess: true, data: res.data }));
  },

  /** POST /api/admin/curriculum/validate */
  validateCurriculum: (payload: ValidateCurriculumCommandRequest): Promise<ApiResponse<ValidateCurriculumCommandResponse>> => {
    const formData = new FormData();
    formData.append('rawText', payload.rawText);
    return axiosClient
      .post<ValidateCurriculumCommandResponse>('/api/admin/curriculum/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => ({ isSuccess: true, data: res.data }));
  },
};

export default curriculumImportApi;