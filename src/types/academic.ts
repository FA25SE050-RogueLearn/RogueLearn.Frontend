/**
 * Feature: Academic Processing
 * Purpose: Types related to processing student academic records and tracking progress.
 */

/**
 * Represents the structured data extracted from the FAP HTML.
 * This is the primary output of the FapExtractionPlugin.
 */
export interface FapRecordData {
  gpa: number | null;
  subjects: FapSubjectData[];
}

export interface FapSubjectData {
  subjectCode: string;
  status: 'Passed' | 'Failed' | 'Studying' | string;
  mark: number | null;
  semester: number;
  academicYear: string;
}

/**
 * Represents the response from the command that processes the academic record,
 * syncs the gradebook, and initiates the learning path generation.
 */
export interface ProcessAcademicRecordResponse {
  isSuccess: boolean;
  message: string;
  learningPathId: string; // Guid of the generated or updated learning path
  subjectsProcessed: number;
  calculatedGpa: number;
}

/**
 * Represents the user's progress for a specific quest, including the status of each step.
 * Corresponds to GetUserProgressForQuestResponse from the backend.
 */
export interface UserQuestProgress {
  questId: string;
  questStatus: 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned';
  stepStatuses: Record<string, 'NotStarted' | 'InProgress' | 'Completed' | 'Skipped'>;
}