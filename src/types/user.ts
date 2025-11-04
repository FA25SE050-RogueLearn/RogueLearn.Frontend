// roguelearn-web/src/types/user.ts
/**
 * Represents the user profile data fetched from the User service.
 * This corresponds to the UserProfileDto from the backend.
 */
export interface UserProfile {
  id: string;
  authUserId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  level: number;
  experiencePoints: number;
  onboardingCompleted: boolean;
  createdAt: string;
  roles: string[];
  routeId?: string;
}

/**
 * NEW: Represents a user's progress in a single skill.
 * This corresponds to the UserSkillDto from the backend.
 */
export interface UserSkill {
    skillId: string;
    skillName: string;
    level: number;
    experiencePoints: number;
    lastUpdatedAt: string; // DateTimeOffset as a string
}