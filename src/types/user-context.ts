/**
 * Feature: User Context
 * Purpose: Aggregate user details, roles, class/enrollment info, and skills for dashboard and feature gating.
 * Mapping rules:
 * - Guid -> string (UUID)
 * - DateTimeOffset -> string (ISO 8601 timestamp)
 * - DateOnly -> string (YYYY-MM-DD)
 * - List<T> -> T[]
 */

/** Consolidated view of a user's profile, roles, class enrollment, and skills. */
export interface UserContextDto {
  authUserId: string;
  username: string;
  email: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  // Raw JSON string for preferences; null means not set
  preferencesJson?: string | null;

  roles: string[];

  class?: ClassSummaryDto | null;
  enrollment?: CurriculumEnrollmentDto | null;

  skills: SkillSummaryDto;
  achievementsCount: number;
}

/** Summary information about the user's selected class/roadmap. */
export interface ClassSummaryDto {
  id: string;
  name: string;
  roadmapUrl?: string | null;
  difficultyLevel: number;
  skillFocusAreas?: string[] | null;
}

/** Enrollment details for the user's curriculum version and status. */
export interface CurriculumEnrollmentDto {
  versionId: string;
  versionCode: string;
  effectiveYear: number;
  status: string;
  enrollmentDate: string; // DateOnly
  expectedGraduationDate?: string | null; // DateOnly
}

/** Aggregated skill metrics for the user. */
export interface SkillSummaryDto {
  totalSkills: number;
  totalExperiencePoints: number;
  highestLevel: number;
  averageLevel: number;
  topSkills: UserSkillDto[];
}

/** Lightweight representation of a user's skill with level and XP. */
export interface UserSkillDto {
  skillName: string;
  level: number;
  experiencePoints: number;
  lastUpdatedAt: string; // DateTimeOffset
}

// ===== Query =====
/** Query payload to fetch user context by auth id. */
export interface GetUserContextByAuthIdQueryRequest {
  authId: string;
}

/** Response containing the consolidated user context or null if not found. */
export type GetUserContextByAuthIdResponse = UserContextDto | null;