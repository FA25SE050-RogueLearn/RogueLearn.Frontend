// roguelearn-web/src/types/student.ts
/**
 * Feature: Student Academic Processing
 * Purpose: Types for end-to-end academic record processing (parse, analyze, forge learning path).
 * Backend Reference: Student/Commands/ProcessAcademicRecord and Student/Queries/GetAcademicStatus
 */

/** Command to process a raw academic record and generate learning path content. */
export interface ProcessAcademicRecordCommandRequest {
  authUserId: string; // JSON-ignored on backend; included for client clarity
  fapHtmlContent: string;
  curriculumVersionId: string;
}

/** Response payload summarizing processing outcomes. */
export interface ProcessAcademicRecordResponse {
  isSuccess: boolean;
  message?: string | null;
  learningPathId?: string | null;
  subjectsProcessed: number;
  questsGenerated: number;
  calculatedGpa?: number | null;
}

export interface InitializeUserSkillsResponse {
    isSuccess: boolean;
    message: string;
    totalSkillsExtracted: number;
    skillsInitialized: number;
    skillsSkipped: number;
    missingFromCatalog: string[];
}

// ADDED: New interfaces for the establish skill dependencies endpoint.
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

// NEW: Added types for the GetAcademicStatus endpoint response.
export interface GetAcademicStatusResponse {
    enrollmentId: string | null;
    curriculumVersionId: string | null;
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