/**
 * Feature: Class Specialization Subjects
 * Purpose: DTOs and commands for managing specialization subjects within a class (admin-only operations).
 */

export interface SpecializationSubjectDto {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  isRequired: boolean;
  credits: number;
  semester?: number;
  createdAt: string;
}

/** Command payload to add a specialization subject to a class. */
export interface AddSpecializationSubjectCommandRequest {
  classId: string; // route param in API, included here for convenience
  subjectId: string;
  isRequired: boolean;
  credits: number;
  semester?: number;
}

/** Response when a specialization subject is added. */
export type AddSpecializationSubjectResponse = SpecializationSubjectDto;