// roguelearn-web/src/types/curriculum-import.ts
// Note: API modules wrap responses in ApiResponse; here we define raw payload shapes.
/**
 * Feature: Curriculum Import & Validation
 * Purpose: Command/response payloads for importing and validating learning roadmaps from raw text or structured definitions.
 */

/** Import Curriculum from raw text or structured data. */
export interface ImportCurriculumCommandRequest {
  rawText: string;
  programId?: string;
}

/** Response data containing import outcome and warnings. */
export interface ImportCurriculumCommandResponseData {
  programId: string;
  createdVersionId?: string;
  subjectCount?: number;
  warnings?: string[];
}

/** Raw payload returned after curriculum import. */
export type ImportCurriculumCommandResponse = ImportCurriculumCommandResponseData;

/** Import a single subject from raw text. */
export interface ImportSubjectFromTextCommandRequest {
  rawText: string;
  semester?: number;
}

/** Response data containing subject import results and warnings. */
export interface ImportSubjectFromTextCommandResponseData {
  jobId: string;
  status: string;
  message: string;
  // Legacy fields (may be null if async)
  subjectId?: string;
  code?: string;
  name?: string;
  warnings?: string[];
}

/** Raw payload returned after importing a single subject. */
export type ImportSubjectFromTextCommandResponse = ImportSubjectFromTextCommandResponseData;

/** Status of a background subject import job. */
export interface SubjectImportJobStatusResponse {
  jobId: string;
  status: 'Queued' | 'Processing' | 'Succeeded' | 'Failed' | 'Unknown';
  percent: number;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

/** Validate a curriculum definition before import. */
export interface ValidateCurriculumCommandRequest {
  rawText: string;
}

/** Validation outcome and any errors or warnings detected. */
export interface ValidateCurriculumCommandResponseData {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/** Raw payload returned after validating curriculum content. */
export type ValidateRoadmapCommandResponse = ValidateCurriculumCommandResponseData;