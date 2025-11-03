import type { ApiResponse } from "./base/Api";
/**
 * Feature: Curriculum Import & Validation
 * Purpose: Import full curricula and individual subjects from raw text, and validate definitions.
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

/** Standard API response wrapping import results. */
export type ImportCurriculumCommandResponse = ApiResponse<ImportCurriculumCommandResponseData>;

/** Import a single subject from raw text. */
export interface ImportSubjectFromTextCommandRequest {
  rawText: string;
}

/** Response data containing subject import results and warnings. */
export interface ImportSubjectFromTextCommandResponseData {
  subjectId: string;
  code?: string;
  name?: string;
  warnings?: string[];
}

/** Standard API response wrapping subject import results. */
export type ImportSubjectFromTextCommandResponse = ApiResponse<ImportSubjectFromTextCommandResponseData>;

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

/** Standard API response wrapping validation results. */
export type ValidateCurriculumCommandResponse = ApiResponse<ValidateCurriculumCommandResponseData>;