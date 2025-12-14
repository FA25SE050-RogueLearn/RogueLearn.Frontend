// roguelearn-web/src/api/studentCurriculumApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
import { StudentSubjectDto } from "@/types/student-curriculum";

const studentCurriculumApi = {
  // =================================================================
  // STUDENT CURRICULUM (StudentCurriculumController)
  // =================================================================

  /** 
   * GET /api/student/programs/{programId}/subjects 
   * Gets subjects for a curriculum program (public/student accessible)
   */
  getProgramSubjects: (programId: string): Promise<ApiResponse<StudentSubjectDto[]>> =>
    axiosClient
      .get<StudentSubjectDto[]>(`/api/student/programs/${programId}/subjects`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** 
   * GET /api/student/classes/{classId}/subjects 
   * Gets specialization subjects for a class (public/student accessible)
   */
  getClassSubjects: (classId: string): Promise<ApiResponse<StudentSubjectDto[]>> =>
    axiosClient
      .get<StudentSubjectDto[]>(`/api/student/classes/${classId}/subjects`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),
};

export default studentCurriculumApi;