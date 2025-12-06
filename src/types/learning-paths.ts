/**
 * Feature: Learning Paths
 * Purpose: Represent the user's learning path, chapters, and summary data; include commands for gap analysis and forging paths.
 * Mapping rules:
 * - Guid -> string
 * - DateTimeOffset -> string (ISO 8601)
 * - List<T> -> T[]
 */

/** Learning path DTO returned by queries. */
export interface LearningPathDto {
  id: string;
  name: string;
  description: string;
  chapters: QuestChapterDto[];
  completionPercentage: number;
}

/** Chapter within a learning path containing quest summaries. */
export interface QuestChapterDto {
  id: string;
  title: string;
  sequence: number;
  status: string; // backend uses string status; if enum becomes available, update this type
  quests: QuestSummaryDto[];
}

/** Summary of a quest within a chapter. */
export interface QuestSummaryDto {
  id: string;
  title: string;
  status: string; // backend uses string status
  sequenceOrder: number;
  learningPathId: string;
  chapterId: string;
  subjectId?: string;              // Subject ID for fetching related skills
  // Difficulty indicator based on academic performance
  subjectCode?: string;
  subjectGrade?: string;           // e.g., "8.5" or null
  subjectStatus?: string;          // "Passed", "NotPassed", "Studying"
  expectedDifficulty?: 'Challenging' | 'Standard' | 'Supportive' | 'Adaptive';
  difficultyReason?: string;       // e.g., "High score (8.5) - advanced content"
}

// Queries
/** Query payload to fetch the current user's learning path. */
export interface GetMyLearningPathQueryRequest {
  authUserId: string;
}
export type GetMyLearningPathResponse = LearningPathDto | null;

// Commands
/** Parsed academic record used as input for learning gap analysis. */
export interface FapRecordData {
  gpa?: number | null;
  subjects: FapSubjectData[];
}

/** Subject record in the parsed academic data. */
export interface FapSubjectData {
  subjectCode: string;
  status: string;
  mark?: number | null;
}

/** Result of analyzing the user's learning gap. */
export interface GapAnalysisResponse {
  recommendedFocus: string;
  highestPrioritySubject: string;
  reason: string;
  forgingPayload: ForgingPayload;
}

/** Payload used to forge a learning path based on gap analysis. */
export interface ForgingPayload {
  subjectGaps: string[];
}

/** Learning path created as a result of forging process. */
export interface ForgedLearningPath {
  id: string;
  name: string;
  description: string;
}

/** Command payload to analyze learning gaps from a verified record. */
export interface AnalyzeLearningGapCommandRequest {
  authUserId: string; // JSON-ignored on backend, but required for routing; keep in request for client clarity
  verifiedRecord: FapRecordData;
}
export type AnalyzeLearningGapResponse = GapAnalysisResponse;

/** Command payload to forge a learning path from a previously analyzed payload. */
export interface ForgeLearningPathCommandRequest {
  authUserId: string; // JSON-ignored on backend; include in client request typing
  forgingPayload: ForgingPayload;
}
export type ForgeLearningPathResponse = ForgedLearningPath;

/** Command payload to delete a learning path by id. */
export interface DeleteLearningPathCommandRequest {
  id: string;
}
export type DeleteLearningPathResponse = void;