// roguelearn-web/src/api/adminContentApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { CurriculumProgramDto } from '@/types/curriculum-programs';
import { Subject, SyllabusContent } from '@/types/subjects';
// REMOVED: Obsolete imports
// import { CurriculumVersionDto } from '@/types/curriculum-versions';
// import { Subject } from '@/types/subjects';

const adminContentApi = {
  getCurriculumPrograms: (): Promise<ApiResponse<CurriculumProgramDto[]>> =>
    axiosClient.get<CurriculumProgramDto[]>('/api/admin/programs').then(res => ({
      isSuccess: true,
      data: res.data,
    })),
// SUBJECT CONTENT EDITOR ENDPOINTS
getSubjects: (): Promise<ApiResponse<Subject[]>> =>
  axiosClient.get<Subject[]>('/api/admin/subjects').then(res => ({
    isSuccess: true,
    data: res.data,
  })),

getSubjectContent: (subjectId: string): Promise<ApiResponse<SyllabusContent>> =>
  axiosClient.get<SyllabusContent>(`/api/admin/subjects/${subjectId}/content`).then(res => ({
    isSuccess: true,
    data: res.data,
  })),

updateSubjectContent: (subjectId: string, content: SyllabusContent): Promise<ApiResponse<SyllabusContent>> =>
  axiosClient.put<SyllabusContent>(`/api/admin/subjects/${subjectId}/content`, content).then(res => ({
    isSuccess: true,
    data: res.data,
  })),

};

export default adminContentApi;