/**
 * Feature: Syllabus
 * Purpose: Represent syllabus version metadata used within curriculum features.
 */
export interface SyllabusVersionDetailsDto {
  id: string;
  versionNumber: number;
  effectiveDate: string; // DateOnly
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  hasContent: boolean;
}

/** Lightweight syllabus version DTO for listings */
export interface SyllabusVersionDto {
  id: string;
  subjectId: string;
  versionNumber: number;
  effectiveDate: string; // DateOnly
  isActive: boolean;
  createdAt: string;
}

/** Command payload to create a new syllabus version */
export interface CreateSyllabusVersionCommandRequest {
  subjectId: string;
  versionNumber: number;
  effectiveDate: string; // DateOnly (YYYY-MM-DD)
  isActive?: boolean;
}

/** Response payload after creating a syllabus version */
export interface CreateSyllabusVersionResponse extends SyllabusVersionDto {}

/** Command payload to update an existing syllabus version */
export interface UpdateSyllabusVersionCommandRequest {
  id: string;
  versionNumber: number;
  effectiveDate: string; // DateOnly
  isActive?: boolean;
}

/** Response payload after updating a syllabus version */
export interface UpdateSyllabusVersionResponse extends SyllabusVersionDto {}

/** Response payload after deleting a syllabus version */
export type DeleteSyllabusVersionResponse = void;

/** Response for fetching syllabus versions by subject */
export type GetSyllabusVersionsBySubjectResponse = SyllabusVersionDto[];

/** Response payload for fetching syllabus content by version id */
export interface GetSyllabusContentByIdResponse {
  id?: string;
  content: string;
}