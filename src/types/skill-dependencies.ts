/**
 * Feature: Skill Dependencies
 * Source: RogueLearn.User.Application Features/SkillDependencies
 * Purpose: Mirror backend DTOs and commands for managing relationships between skills.
 * Mapping:
 * - Guid -> string (UUID)
 * - DateTimeOffset -> string (ISO timestamp)
 */

/** Relationship nature between two skills. */
export type SkillRelationshipType = 'Prerequisite' | 'Corequisite' | 'Recommended';

/**
 * A relationship between a skill and another skill it depends on.
 * Represents the stored dependency record returned by queries.
 */
export interface SkillDependencyDto {
  id: string;
  skillId: string;
  prerequisiteSkillId: string;
  relationshipType: SkillRelationshipType;
  createdAt: string;
}

// Commands
/** Command payload to add a new dependency relationship to a skill. */
export interface AddSkillDependencyCommandRequest {
  skillId: string;
  prerequisiteSkillId: string;
  relationshipType?: SkillRelationshipType | null;
}

/** Response returned after successfully adding a dependency. */
export interface AddSkillDependencyResponse {
  id: string;
  skillId: string;
  prerequisiteSkillId: string;
  relationshipType: SkillRelationshipType;
  createdAt: string;
}

/** Command payload to remove an existing dependency from a skill. */
export interface RemoveSkillDependencyCommandRequest {
  skillId: string;
  prerequisiteSkillId: string;
}
export type RemoveSkillDependencyResponse = void;

// Query
/** Query to retrieve all dependencies for a given skill. */
export interface GetSkillDependenciesQueryRequest {
  skillId: string;
}

/** Response with the list of dependencies for a skill. */
export interface GetSkillDependenciesResponse {
  dependencies: SkillDependencyDto[];
}