// roguelearn-web/src/types/admin-management.ts

/**
 * Feature: Admin Management
 * Purpose: Types for admin-specific relationship management (Class-Subject, Subject-Skill, Program-Subject).
 */

export interface SpecializationSubjectEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  isRequired: boolean;
}

export interface AddSpecializationRequest {
  classId: string;
  subjectId: string;
  semester: number;
  isRequired: boolean;
}

export interface AddSubjectToProgramRequest {
  subjectId: string;
}

// Note: Skill dependency types might be in skill-dependencies.ts, but if used solely for admin management payload structure:
export interface CreateSkillDependencyRequest {
  skillId: string;
  prerequisiteSkillId: string;
  relationshipType: 'Prerequisite' | 'Corequisite' | 'Recommended';
}

// ⭐ NEW: DTO for Subject-Skill Mappings returned by the backend
export interface SubjectSkillMappingDto {
  id: string;
  subjectId: string;
  skillId: string;
  skillName: string;
  relevanceWeight: number;
  createdAt: string;
}