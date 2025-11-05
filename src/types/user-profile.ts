// roguelearn-web/src/types/user-profile.ts
/**
 * Feature: User Profiles
 * Source: RogueLearn.User.Application Features/UserProfiles
 * Purpose: Mirror backend DTOs and commands for user profile management and queries.
 * Mapping:
 * - Guid -> string (UUID)
 * - DateTimeOffset -> string (ISO timestamp)
 * - List<T> -> T[]
 * - Nullable reference types -> `string | null` or appropriate union
 * - byte[] -> ArrayBuffer/Uint8Array or base64 string on the frontend
 */

/** User profile as returned from queries. */
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
  // MODIFICATION: Add the missing properties required by the onboarding flow.
  classId?: string | null;
  routeId?: string | null;
}

/** Command to record a newly registered/authenticated user in the system. */
export interface LogNewUserCommand {
  authUserId: string;
  email?: string | null;
  username?: string | null;
}

/** Command to update profile fields for the current authenticated user. */
export interface UpdateMyProfileCommand {
  authUserId: string;
  // Allowed fields
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  preferencesJson?: string | null; // JSON string
  // Optional uploaded image (when using multipart/form-data)
  // You can send this as base64 string or ArrayBuffer/Uint8Array depending on your uploader
  profileImageBytes?: ArrayBuffer | Uint8Array | string;
  profileImageContentType?: string | null;
  profileImageFileName?: string | null;
}

/** Query to fetch all user profiles (admin-only or appropriate access). */
export type GetAllUserProfilesQuery = Record<string, never>; // no payload

export interface GetAllUserProfilesResponse {
  userProfiles: UserProfileDto[];
}

/** Query to fetch a user profile by auth identifier. */
export interface GetUserProfileByAuthIdQuery {
  authId: string;
}

export type GetUserProfileByAuthIdResponse = UserProfileDto | null;