// roguelearn-web/src/api/adminContentApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { CurriculumProgram } from '@/types/curriculum';

// This type would represent the response from the import endpoints
// We'll define it based on the backend's CreateSubjectResponse and ImportCurriculumResponse
interface ImportResponse {
    id: string;
    programName?: string; // From curriculum import
    subjectName?: string; // From subject import
    // ... other relevant fields
}

const adminContentApi = {
  /**
   * Fetches all curriculum programs from the backend.
   * Corresponds to GET /api/admin/programs
   */
  getCurriculumPrograms: () =>
    // The backend returns the array directly, so we wrap it in an ApiResponse for consistency.
    axiosClient.get<CurriculumProgram[]>('/api/admin/programs').then(res => ({
        isSuccess: true,
        data: res.data
    }) as ApiResponse<CurriculumProgram[]>),

  /**
   * Imports a full curriculum from raw text.
   * Corresponds to POST /api/admin/curriculum
   */
  importCurriculum: (rawText: string) => {
    const formData = new FormData();
    formData.append('rawText', rawText);
    return axiosClient.post<ApiResponse<ImportResponse>>('/api/admin/curriculum', formData);
  },

  /**
   * Imports a single subject from raw text.
   * Corresponds to POST /api/admin/subjects/import-from-text
   */
  importSubject: (rawText: string) => {
    const formData = new FormData();
    formData.append('rawText', rawText);
    return axiosClient.post<ApiResponse<ImportResponse>>('/api/admin/subjects/import-from-text', formData);
  },

  /**
   * Validates raw curriculum text without importing.
   * Corresponds to POST /api/admin/curriculum/validate
   */
  validateCurriculum: (rawText: string) => {
    const formData = new FormData();
    formData.append('rawText', rawText);
    return axiosClient.post<ApiResponse<any>>('/api/admin/curriculum/validate', formData);
  }
};

export default adminContentApi;