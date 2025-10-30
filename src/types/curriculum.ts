// roguelearn-web/src/types/curriculum.ts
/**
 * Represents a full Curriculum Program.
 * Derived from the backend CurriculumProgram.cs entity.
 */
export interface CurriculumProgram {
  id: string; // Guid
  programName: string;
  programCode: string;
  description: string | null;
  degreeLevel: 'Associate' | 'Bachelor' | 'Master' | 'Doctorate';
  totalCredits: number | null;
  durationYears: number | null;
  createdAt: string; // DateTimeOffset
  updatedAt: string; // DateTimeOffset
}

/**
 * Represents a version of a curriculum.
 * Derived from the backend CurriculumVersion.cs entity.
 */
export interface CurriculumVersion {
  id: string; // Guid
  programId: string; // Guid
  versionCode: string;
  effectiveYear: number;
  isActive: boolean;
  description: string | null;
  createdAt: string; // DateTimeOffset
}

/**
 * Represents a single academic subject.
 * Derived from the backend Subject.cs entity.
 */
export interface Subject {
  id: string; // Guid
  subjectCode: string;
  subjectName: string;
  credits: number;
  description: string | null;
  createdAt: string; // DateTimeOffset
  updatedAt: string; // DateTimeOffset
}

/**
 * Represents the placement of a subject within a curriculum version.
 * Derived from the backend CurriculumStructure.cs entity.
 */
export interface CurriculumStructure {
  id: string; // Guid
  curriculumVersionId: string; // Guid
  subjectId: string; // Guid
  semester: number;
  isMandatory: boolean;
  prerequisiteSubjectIds: string[] | null; // Guid[]
  prerequisitesText: string | null;
  createdAt: string; // DateTimeOffset
}