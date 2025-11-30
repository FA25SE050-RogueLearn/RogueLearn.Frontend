// roguelearn-web/src/types/subjects.ts
/**
 * Feature: Subjects
 * Purpose: Represents a single academic subject, now the source of truth for syllabus content.
 * This replaces the old, separate syllabus versioning system.
 */

/** Subject entity used across curriculum and academic features. */
export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  content?: SyllabusContent | null; // The syllabus is now embedded content
  semester?: number;
  prerequisiteSubjectIds?: string[];
}

/**
 * Detailed structure of the syllabus content, stored as JSONB in the `subjects` table.
 * Based on the sample `subject.json` provided.
 */
export interface SyllabusContent {
  courseDescription?: string;
  courseLearningOutcomes?: CourseLearningOutcome[];
  sessionSchedule?: SyllabusSession[];
  assessments?: AssessmentItem[];
  requiredTexts?: string[];
  recommendedTexts?: string[];
  gradingPolicy?: string;
  attendancePolicy?: string;
}

export interface SyllabusSession {
  sessionNumber: number;
  topic: string;
  activities: string[];
  readings: string[];
  constructiveQuestions: ConstructiveQuestion[];
  mappedSkills: string[];
}

export interface AssessmentItem {
  type: string;
  weightPercentage: number;
  description: string;
}
export interface ConstructiveQuestion {
  question: string;
  sessionNumber?: number;
}
export interface CourseLearningOutcome {
  id: string;
  details: string;
}

/** Command payload to create a subject. */
export interface CreateSubjectCommandRequest {
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
}
export type CreateSubjectResponse = Subject;

/** Command payload to update a subject. */
export interface UpdateSubjectCommandRequest {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
}
export type UpdateSubjectResponse = Subject;

export type GetAllSubjectsResponse = Subject[];
export type GetSubjectByIdResponse = Subject;

export interface PaginatedSubjectsResponse {
  items: Subject[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
