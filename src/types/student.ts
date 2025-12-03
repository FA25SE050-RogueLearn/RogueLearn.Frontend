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

/** Response payload summarizing processing outcomes. */
export interface ProcessAcademicRecordResponse {
  isSuccess: boolean;
  message?: string | null;
  learningPathId: string;
  subjectsProcessed: number;
  calculatedGpa?: number | null;
  xpAwarded?: XpAwardedSummary | null;
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
  learningPathId: string | null;
  totalQuests: number;
  completedQuests: number;
  skillInitialization: SkillInitializationInfo;
  subjects: SubjectProgressDto[];
  chapters: ChapterProgressDto[];
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

export interface ChapterProgressDto {
  chapterId: string;
  title: string;
  sequence: number;
  status: string;
  totalQuests: number;
  completedQuests: number;
}