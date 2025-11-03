/**
 * Backward-compatible alias for user profile types.
 * This file exists to satisfy imports of `@/types/user` in legacy components.
 * Prefer importing from `@/types/user-profile` directly in new code.
 */
export type { UserProfileDto as UserProfile } from "./user-profile";