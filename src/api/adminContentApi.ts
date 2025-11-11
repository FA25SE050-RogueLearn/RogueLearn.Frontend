// roguelearn-web/src/api/adminContentApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { CurriculumProgramDto } from '@/types/curriculum-programs';
// REMOVED: Obsolete imports
// import { CurriculumVersionDto } from '@/types/curriculum-versions';
// import { Subject } from '@/types/subjects';

const adminContentApi = {
  getCurriculumPrograms: (): Promise<ApiResponse<CurriculumProgramDto[]>> =>
    axiosClient.get<CurriculumProgramDto[]>('/api/admin/programs').then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  // REMOVED: getCurriculumVersions is obsolete as versions are no longer a separate entity.

  // REMOVED: importCurriculum and importSubject are now consolidated in curriculumImportApi.

  // REMOVED: createSyllabusVersion is obsolete. Syllabus content is now part of the Subject.
};

export default adminContentApi;