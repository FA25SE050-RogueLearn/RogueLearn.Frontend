/**
 * Feature: User Skills
 * Purpose: Manage and query user skills, including adding/removing and resetting progress.
 * Mapping rules:
 * - Guid -> string
 * - DateTimeOffset -> string (ISO 8601)
 */

/** Lightweight representation of a user's skill including XP and level. */
export interface UserSkillDto {
  skillName: string;
  experiencePoints: number;
  level: number;
  lastUpdatedAt: string;
}

// Commands
/** Command payload to add a new skill to a user. */
export interface AddUserSkillCommandRequest {
  authUserId: string;
  skillName: string;
}

/** Response payload after adding a user skill. */
export interface AddUserSkillResponse {
  id: string;
  authUserId: string;
  skillName: string;
  experiencePoints: number;
  level: number;
  lastUpdatedAt: string;
}

/** Command payload to remove a skill from a user. */
export interface RemoveUserSkillCommandRequest {
  authUserId: string;
  skillName: string;
}
export type RemoveUserSkillResponse = void;

/** Command payload to reset progress for a user skill. */
export interface ResetUserSkillProgressCommandRequest {
  authUserId: string;
  skillName: string;
  reason: string;
}
export type ResetUserSkillProgressResponse = void;

// Queries
/** Query payload to list all skills for a given user. */
export interface GetUserSkillsQueryRequest {
  authUserId: string;
}
/** Response containing the list of user's skills. */
export interface GetUserSkillsResponse {
  skills: UserSkillDto[];
}

/** Query payload to fetch a single skill for a given user. */
export interface GetUserSkillQueryRequest {
  authUserId: string;
  skillName: string;
}
/** Response containing a single skill details. */
export interface GetUserSkillResponse {
  skillName: string;
  experiencePoints: number;
  level: number;
  lastUpdatedAt: string;
}