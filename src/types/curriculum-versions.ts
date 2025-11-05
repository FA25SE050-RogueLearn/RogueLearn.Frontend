import type { CurriculumSubjectDetailsDto } from "./curriculum-structure";
/**
 * Feature: Curriculum Versions
 * Purpose: Represent versions of a curriculum program and associated analysis.
 */

/** Version DTO used in program listings and selection. */
export interface CurriculumVersionDto {
  id: string;
  programId: string;
  versionCode: string;
  effectiveYear: number;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
}

/** Command payload to create a new curriculum version for a program. */
export interface CreateCurriculumVersionCommandRequest {
  programId: string;
  versionCode: string;
  effectiveYear: number;
  isActive?: boolean; // default true
  description?: string | null;
}

/** Response payload after creating a curriculum version. */
export interface CreateCurriculumVersionResponse {
  id: string;
  programId: string;
  versionCode: string;
  effectiveYear: number;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
}

/** Command payload to activate a curriculum version. */
export interface ActivateCurriculumVersionCommandRequest {
  curriculumVersionId: string;
  effectiveYear: number;
  activatedBy?: string | null;
  notes?: string | null;
}
export type ActivateCurriculumVersionResponse = void;

/** Query payload to list versions for a given program id. */
export interface GetCurriculumVersionsByProgramQueryRequest {
  programId: string;
}
export type GetCurriculumVersionsByProgramResponse = CurriculumVersionDto[];

/** Query payload to fetch version details including subjects and analysis. */
export interface GetCurriculumVersionDetailsQueryRequest {
  curriculumVersionId: string;
}
/** Aggregated metrics for a curriculum version. */
export interface CurriculumVersionAnalysisDto {
  totalSubjects: number;
  mandatorySubjects: number;
  electiveSubjects: number;
  subjectsWithSyllabus: number;
  subjectsWithoutSyllabus: number;
  totalSyllabusVersions: number;
  syllabusCompletionPercentage: number;
  missingContentSubjects: string[];
}

/** Detailed view of a curriculum version including subjects and analysis. */
export interface CurriculumVersionDetailsDto {
  id: string;
  versionCode: string;
  effectiveYear: number;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
  subjects: CurriculumSubjectDetailsDto[];
  analysis: CurriculumVersionAnalysisDto;
}

/** Response payload containing version details. */
export type GetCurriculumVersionDetailsResponse = CurriculumVersionDetailsDto;