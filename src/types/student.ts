// roguelearn-web/src/types/student.ts
/**
 * Feature: Student Academic Processing & Status
 * Purpose: Types for academic record processing and status queries.
 * Backend Reference: Student/Commands/ProcessAcademicRecord, Student/Queries/GetAcademicStatus
 */

/** Command to process a raw academic record and generate learning path content. */
export interface ProcessAcademicRecordCommandRequest {
  fapHtmlContent: string;
  curriculumProgramId: string;
}

/** Individual skill XP award details. */
export interface SkillXpAward {
  skillId: string;
  skillName: string;
  xpAwarded: number;
  newTotalXp: number;
  newLevel: number;
  sourceSubjectCode: string;
  grade: string;
  tierDescription: string;
}

/** XP awards summary from academic record processing. */
export interface XpAwardedSummary {
  totalXp: number;
  skillsAffected: number;
  skillAwards: SkillXpAward[];
}

/** Personalized analysis report from academic data */
export interface AnalysisReport {
  studentPersona: string;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string;
}

/** Response payload summarizing processing outcomes. */
export interface ProcessAcademicRecordResponse {
  isSuccess: boolean;
  message?: string | null;
  learningPathId?: string | null;
  subjectsProcessed: number;
  questsGenerated: number;
  calculatedGpa?: number | null;
  xpAwarded?: XpAwardedSummary | null;
  analysisReport?: AnalysisReport | null;
}

/** Response from initializing skills based on the curriculum. */
export interface InitializeUserSkillsResponse {
  isSuccess: boolean;
  message: string;
  totalSkillsExtracted: number;
  skillsInitialized: number;
  skillsSkipped: number;
  missingFromCatalog: string[];
}

/** Response from establishing skill dependencies. */
export interface EstablishSkillDependenciesResponse {
  isSuccess: boolean;
  message: string;
  totalDependenciesCreated: number;
  totalDependenciesSkipped: number;
  dependencies: SkillDependencyInfo[];
}

export interface SkillDependencyInfo {
  skillName: string;
  prerequisiteSkillName: string;
  relationshipType: string;
}

/**
 * Comprehensive academic status for the authenticated user.
 * Corresponds to the `GetAcademicStatusResponse` DTO from the backend.
 */
export interface GetAcademicStatusResponse {
  enrollmentId: string | null;
  curriculumProgramName: string;
  currentGpa: number;
  totalSubjects: number;
  completedSubjects: number;
  inProgressSubjects: number;
  failedSubjects: number;
  totalQuests: number;
  completedQuests: number;
  skillInitialization: SkillInitializationInfo;
  subjects: SubjectProgressDto[];
}

export interface SkillInitializationInfo {
  isInitialized: boolean;
  totalSkills: number;
  lastInitializedAt: string | null; // ISO Date string
}

export interface SubjectProgressDto {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  status: string;
  grade: string | null;
  questId: string | null;
  questStatus: string | null;
}

/** Command to update the grade for a single subject. */
export interface UpdateSingleSubjectGradeRequest {
    subjectId: string;
    grade: number;
    status: string; // "Passed" or "Failed" typically, based on grade
}