// roguelearn-web/src/types/user-skills.ts
/**
 * Feature: User Skills
 * Purpose: Manage and query user skills, including adding/removing and resetting progress.
 */

/** Lightweight representation of a user's skill including XP and level. */
export interface UserSkillDto {
  skillId: string; // The ID from the master 'skills' table.
  skillName: string;
  experiencePoints: number;
  level: number;
  lastUpdatedAt: string;
}

/** Command payload to add a new skill to a user. */
export interface AddUserSkillCommandRequest {
  skillName: string;
}
export type AddUserSkillResponse = UserSkillDto;

/** Command payload to remove a skill from a user. */
export interface RemoveUserSkillCommandRequest {
  skillName: string;
}

/** Command payload to reset progress for a user skill. */
export interface ResetUserSkillProgressCommandRequest {
  skillName: string;
  reason: string;
}

/** Response containing the list of user's skills. */
export interface GetUserSkillsResponse {
  skills: UserSkillDto[];
}

/** Response containing a single skill's details. */
export type GetUserSkillResponse = UserSkillDto;