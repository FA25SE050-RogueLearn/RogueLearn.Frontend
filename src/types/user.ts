// roguelearn-web/src/types/user.ts
/**
 * NEW: Represents a user's progress in a single skill.
 * This corresponds to the UserSkillDto from the backend.
 */
export interface UserSkill {
    skillName: string;
    level: number;
    experiencePoints: number;
    lastUpdatedAt: string; // DateTimeOffset as a string
}