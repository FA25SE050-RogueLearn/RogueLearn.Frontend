// roguelearn-web/src/services/profileService.ts
import { userApiClient } from "@/lib/api";
import { UserProfile } from "@/types/user";

/**
 * Fetches the profile of the currently authenticated user.
 * Corresponds to GET /api/profiles/me in the User service.
 * @returns A promise that resolves to the user's profile object, or null if not found.
 */
export const getMyProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await userApiClient.get<UserProfile>("/api/profiles/me");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user profile:", error);
    // Return null if there's an error (e.g., 404 if profile doesn't exist yet)
    return null;
  }
};