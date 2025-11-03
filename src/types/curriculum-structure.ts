import type { SyllabusVersionDetailsDto } from "./syllabus";
/**
 * Feature: Curriculum Structure
 * Purpose: Represent subject placements and prerequisites within a curriculum version.
 */

/** Structure entry linking a subject to a curriculum version and term. */
export interface CurriculumStructureDto {
  id: string;
  curriculumVersionId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  termNumber: number;
  isMandatory: boolean;
  prerequisiteSubjectIds?: string[] | null;
  prerequisitesText?: string | null;
  createdAt: string;
}

/** Query payload to fetch curriculum structure entries by version id. */
export interface GetCurriculumStructureByVersionQueryRequest {
  curriculumVersionId: string;
}
export type GetCurriculumStructureByVersionResponse = CurriculumStructureDto[];

/** Command payload to update structure and prerequisites for a subject entry. */
export interface UpdateCurriculumStructureCommandRequest {
  id: string;
  termNumber: number;
  isMandatory: boolean;
  prerequisiteSubjectIds?: string[] | null;
  prerequisitesText?: string | null;
}

/** Response payload after updating a curriculum structure entry. */
export interface UpdateCurriculumStructureResponse {
  id: string;
  curriculumVersionId: string;
  subjectId: string;
  termNumber: number;
  isMandatory: boolean;
  prerequisiteSubjectIds?: string[] | null;
  prerequisitesText?: string | null;
  createdAt: string;
}

/** Analysis of subject coverage and syllabus content. */
export interface SubjectAnalysisDto {
  totalSyllabusVersions: number;
  activeSyllabusVersions: number;
  hasAnySyllabus: boolean;
  hasActiveSyllabus: boolean;
  hasContentInLatestVersion: boolean;
  status: string; // "Complete", "Missing", "Incomplete"
}

/** Detailed subject view including syllabus version details and analysis. */
export interface CurriculumSubjectDetailsDto {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string | null;
  termNumber: number;
  isMandatory: boolean;
  prerequisiteSubjectIds?: string[] | null;
  prerequisitesText?: string | null;
  syllabusVersions: SyllabusVersionDetailsDto[];
  analysis: SubjectAnalysisDto;
}