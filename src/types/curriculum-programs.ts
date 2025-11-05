import type { CurriculumVersionDetailsDto } from "./curriculum-versions";
/**
 * Feature: Curriculum Programs
 * Purpose: Define program metadata types and queries linking to curriculum versions and analyses.
 */

/** Academic degree levels supported by curriculum programs. */
export type DegreeLevel = "Associate" | "Bachelor" | "Master" | "Doctorate";

/** Program DTO used in listings and detail views. */
export interface CurriculumProgramDto {
  id: string;
  programName: string;
  programCode: string;
  description?: string | null;
  degreeLevel: DegreeLevel;
  totalCredits?: number | null;
  durationYears?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Command payload to create a curriculum program. */
export interface CreateCurriculumProgramCommandRequest {
  programName: string;
  programCode: string;
  description?: string | null;
  degreeLevel: DegreeLevel;
  totalCredits?: number | null;
  durationYears?: number | null;
}

/** Response payload after creating a curriculum program. */
export interface CreateCurriculumProgramResponse {
  id: string;
  programName: string;
  programCode: string;
  description?: string | null;
  degreeLevel: DegreeLevel;
  totalCredits?: number | null;
  durationYears?: number | null;
  createdAt: string;
}

/** Command payload to update an existing curriculum program. */
export interface UpdateCurriculumProgramCommandRequest {
  id: string;
  programName: string;
  programCode: string;
  description?: string | null;
  degreeLevel: DegreeLevel;
  totalCredits?: number | null;
  durationYears?: number | null;
}

/** Response payload after updating a curriculum program. */
export interface UpdateCurriculumProgramResponse {
  id: string;
  programName: string;
  programCode: string;
  description?: string | null;
  degreeLevel: DegreeLevel;
  totalCredits?: number | null;
  durationYears?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Command payload to delete a curriculum program. */
export interface DeleteCurriculumProgramCommandRequest {
  id: string;
}
export type DeleteCurriculumProgramResponse = void;

/** Query to list all curriculum programs. */
export interface GetAllCurriculumProgramsQueryRequest {}
export type GetAllCurriculumProgramsResponse = CurriculumProgramDto[];

/** Query payload to fetch a curriculum program by id. */
export interface GetCurriculumProgramByIdQueryRequest {
  id: string;
}
export type GetCurriculumProgramByIdResponse = CurriculumProgramDto;

/** Query payload to fetch program details including versions and analysis. */
export interface GetCurriculumProgramDetailsQueryRequest {
  programId?: string | null;
  versionId?: string | null;
}

/** Aggregated program-level analysis metrics. */
export interface CurriculumAnalysisDto {
  totalVersions: number;
  activeVersions: number;
  totalSubjects: number;
  subjectsWithSyllabus: number;
  subjectsWithoutSyllabus: number;
  totalSyllabusVersions: number;
  syllabusCompletionPercentage: number;
  missingContentSubjects: string[];
}

/** Combined program details with linked versions and analysis. */
export interface CurriculumProgramDetailsResponse {
  id: string;
  programName: string;
  programCode: string;
  description?: string | null;
  degreeLevel: DegreeLevel;
  totalCredits?: number | null;
  durationYears?: number | null;
  createdAt: string;
  updatedAt: string;
  curriculumVersions: CurriculumVersionDetailsDto[];
  analysis: CurriculumAnalysisDto;
}