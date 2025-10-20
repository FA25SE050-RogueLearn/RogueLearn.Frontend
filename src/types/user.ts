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
}