/**
 * Feature: Skills
 * Source: RogueLearn.User.Application Features/Skills
 * Purpose: Define commands and responses used to manage user-visible skills in the system.
 * Mapping Rules:
 * - Guid -> string
 * - DateTimeOffset -> string (ISO 8601)
 */

/** Represents a domain skill that can be tracked and assigned to users. */
export interface Skill {
  id: string;
  name: string;
  /** Optional domain or category grouping for the skill (e.g., "Frontend"). */
  domain?: string;
  tier: number;
  /** Optional human-readable description for the skill. */
  description?: string;
}

/** Command payload to create a new skill. */
export interface CreateSkillCommandRequest {
  name: string;
  domain?: string;
  tier: number;
  description?: string;
}

/** Command payload to update an existing skill. */
export interface UpdateSkillCommandRequest {
  id: string;
  name: string;
  domain?: string;
  tier: number;
  description?: string;
}

/** Command payload to delete a skill by identifier. */
export interface DeleteSkillCommandRequest {
  id: string;
}

/** Response model for querying all skills. */
export interface GetSkillsResponse {
  skills: Skill[];
}

/** Response model for querying a single skill by identifier. */
export interface GetSkillByIdResponse {
  id: string;
  name: string;
  domain?: string;
  tier: number;
  description?: string;
}