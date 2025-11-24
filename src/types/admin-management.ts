// roguelearn-web/src/types/admin-management.ts

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

export interface CreateSkillDependencyRequest {
  skillId: string;
  prerequisiteSkillId: string;
  relationshipType: 'Prerequisite' | 'Corequisite' | 'Recommended';
}

// ⭐ NEW: Helper for nested prereq
export interface MappingPrerequisiteDto {
  prerequisiteSkillId: string;
  prerequisiteSkillName: string;
}

// ⭐ UPDATED: DTO for Subject-Skill Mappings
export interface SubjectSkillMappingDto {
  id: string;
  subjectId: string;
  skillId: string;
  skillName: string;
  relevanceWeight: number;
  createdAt: string;
  // New field
  prerequisites: MappingPrerequisiteDto[];
}