// roguelearn-web/src/types/user-profile.ts
/**
 * Feature: User Profiles
 * Source: RogueLearn.User.Application Features/UserProfiles
 * Purpose: Mirror backend DTOs and commands for user profile management and queries.
 */

/** User profile as returned from queries, including all necessary IDs for context. */
export interface UserProfileDto {
  id: string;
  authUserId: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  level: number;
  experiencePoints: number;
  onboardingCompleted: boolean;
  createdAt: string; // ISO string
  profileImageUrl?: string | null;
  bio?: string | null;
  preferencesJson?: string | null; // JSON string for preferences
  roles: string[];
  classId?: string | null; // The selected specialization/career class
  routeId?: string | null; // The selected academic route/curriculum program
}

/** Command to update profile fields for the current authenticated user. */
export interface UpdateMyProfileCommand {
  // Only fields that can be updated are included.
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  preferencesJson?: string | null;
}

// Admin-related types
export interface GetAllUserProfilesResponse {
  userProfiles: UserProfileDto[];
}
export type GetUserProfileByAuthIdResponse = UserProfileDto | null;