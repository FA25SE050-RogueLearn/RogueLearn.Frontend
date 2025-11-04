/**
 * Represents a full Curriculum Program, such as "Bachelor of Software Engineering".
 * Corresponds to the backend CurriculumProgram.cs entity.
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
 * Represents a specific version of a curriculum, e.g., "K18A".
 * Corresponds to the backend CurriculumVersion.cs entity.
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
 * Represents a single academic subject, e.g., "PRJ301".
 * Corresponds to the backend Subject.cs entity.
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
 * Represents the placement of a subject within a curriculum version, defining its semester.
 * Corresponds to the backend CurriculumStructure.cs entity.
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

/**
 * Represents a version of a syllabus for a subject.
 * Corresponds to the backend SyllabusVersion.cs entity.
 */
export interface SyllabusVersion {
    id: string; // Guid
    subjectId: string; // Guid
    versionNumber: number;
    content: string; // This will be a JSON string
    effectiveDate: string; // Format: "YYYY-MM-DD"
    isActive: boolean;
    createdBy: string | null; // Guid
    createdAt: string; // DateTimeOffset
}