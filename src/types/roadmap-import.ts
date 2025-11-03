import type { ApiResponse } from "./base/Api";
/**
 * Feature: Learning Roadmap Import & Validation
 * Purpose: Command/response payloads for importing and validating learning roadmaps from raw text or structured definitions.
 */

/** Import a learning roadmap from raw text or structured data. */
export interface ImportRoadmapCommandRequest {
  rawText: string;
  programId?: string;
  curriculumVersionId?: string;
}

/** Response data containing import results and warnings. */
export interface ImportRoadmapCommandResponseData {
  roadmapId: string;
  nodesImported?: number;
  edgesImported?: number;
  warnings?: string[];
}

/** Standard API response wrapping import results. */
export type ImportRoadmapCommandResponse = ApiResponse<ImportRoadmapCommandResponseData>;

/** Validate a roadmap definition before import. */
export interface ValidateRoadmapCommandRequest {
  rawText: string;
}

/** Validation outcome and any errors or warnings detected. */
export interface ValidateRoadmapCommandResponseData {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/** Standard API response wrapping validation results. */
export type ValidateRoadmapCommandResponse = ApiResponse<ValidateRoadmapCommandResponseData>;