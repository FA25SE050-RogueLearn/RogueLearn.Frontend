// roguelearn-web/src/api/adminContentApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { CurriculumProgramDto } from '@/types/curriculum-programs';
import { CurriculumVersionDto } from '@/types/curriculum-versions';
import { Subject } from '@/types/subjects';

const adminContentApi = {
  getCurriculumPrograms: (): Promise<ApiResponse<CurriculumProgramDto[]>> =>
    axiosClient.get<CurriculumProgramDto[]>('/api/admin/programs').then(res => ({
        isSuccess: true,
        data: res.data
    })),

  // ADDED: New function to get versions for a specific program.
  getCurriculumVersions: (programId: string): Promise<ApiResponse<CurriculumVersionDto[]>> =>
    axiosClient.get<CurriculumVersionDto[]>(`/api/admin/programs/${programId}/versions`).then(res => ({
        isSuccess: true,
        data: res.data
    })),

  importCurriculum: (rawText: string): Promise<ApiResponse<any>> =>
    axiosClient.post('/api/admin/curriculum', { rawText }, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => ({
        isSuccess: true,
        data: res.data
    })),

  importSubject: (rawText: string): Promise<ApiResponse<any>> =>
    axiosClient.post('/api/admin/subjects/import-from-text', { rawText }, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => ({
        isSuccess: true,
        data: res.data
    })),

  createSyllabusVersion: (payload: {
    subjectId: string;
    versionNumber: number;
    effectiveDate: string;
    content: string;
    isActive: boolean;
  }): Promise<ApiResponse<any>> =>
    axiosClient.post('/api/admin/syllabus-versions', payload).then(res => ({
        isSuccess: true,
        data: res.data,
    })),

  getSubjects: (): Promise<ApiResponse<Subject[]>> =>
    axiosClient.get<Subject[]>('/api/admin/subjects').then(res => ({
        isSuccess: true,
        data: res.data,
    })),
};

export default adminContentApi;