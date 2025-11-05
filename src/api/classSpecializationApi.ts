import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  SpecializationSubjectDto,
  AddSpecializationSubjectCommandRequest,
  AddSpecializationSubjectResponse,
} from '@/types/class-specialization';

/**
 * API for managing class specialization subjects (Admin only)
 * Base route: /api/admin/classes/{classId}/specialization-subjects
 */
export const classSpecializationApi = {
  /**
   * Get all specialization subjects for a class
   */
  getSpecializationSubjects: async (classId: string): Promise<ApiResponse<SpecializationSubjectDto[]>> =>
    axiosClient
      .get<SpecializationSubjectDto[]>(`/api/admin/classes/${classId}/specialization-subjects`)
      .then(res => ({ isSuccess: true, data: res.data })),

  /**
   * Add a specialization subject to a class
   */
  addSpecializationSubject: async (
    payload: AddSpecializationSubjectCommandRequest
  ): Promise<ApiResponse<AddSpecializationSubjectResponse>> =>
    axiosClient
      .post<SpecializationSubjectDto>(`/api/admin/classes/${payload.classId}/specialization-subjects`, {
        subjectId: payload.subjectId,
        isRequired: payload.isRequired,
        credits: payload.credits,
        semester: payload.semester,
      })
      .then(res => ({ isSuccess: true, data: res.data })),

  /**
   * Remove a specialization subject from a class
   */
  removeSpecializationSubject: async (classId: string, subjectId: string): Promise<void> =>
    axiosClient
      .delete<void>(`/api/admin/classes/${classId}/specialization-subjects/${subjectId}`)
      .then(() => {})
};

export default classSpecializationApi;