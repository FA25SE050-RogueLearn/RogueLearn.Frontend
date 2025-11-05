/**
 * Feature: Student Academic Processing
 * Purpose: Types for end-to-end academic record processing (parse, analyze, forge learning path).
 * Backend Reference: Student/Commands/ProcessAcademicRecord
 */

/** Command to process a raw academic record and generate learning path content. */
export interface ProcessAcademicRecordCommandRequest {
  authUserId: string; // JSON-ignored on backend; included for client clarity
  fapHtmlContent: string;
  curriculumVersionId: string;
}

/** Response payload summarizing processing outcomes. */
export interface ProcessAcademicRecordResponse {
  isSuccess: boolean;
  message?: string | null;
  learningPathId?: string | null;
  subjectsProcessed: number;
  questsGenerated: number;
  calculatedGpa?: number | null;
}