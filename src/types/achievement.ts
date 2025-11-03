/**
 * Feature: Achievements
 * Purpose: Define achievement catalog and user-earned achievements, with create/update/delete and award/revoke operations.
 * Mapping notes: Guid->string, DateTimeOffset->ISO string, List<T>->T[]
 */

/** Catalog entry describing an achievement. */
export interface AchievementDto {
  id: string;
  key: string;
  name: string;
  description: string;
  ruleType?: string | null;
  ruleConfig?: string | null;
  category?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  version: number;
  isActive: boolean;
  sourceService: string;
}

/** Achievement earned by a user with timestamp and optional context. */
export interface UserAchievementDto {
  achievementId: string;
  key: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  sourceService: string;
  earnedAt: string; // ISO string
  context?: string | null;
}

// Commands
/** Command payload to create a new achievement in the catalog. */
export interface CreateAchievementCommand {
  key: string;
  name: string;
  description: string;
  ruleType?: string | null;
  ruleConfig?: string | null;
  category?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  version?: number; // default 1 on backend
  isActive?: boolean; // default true on backend
  sourceService: string;
}

/** Response containing the created achievement entry. */
export interface CreateAchievementResponse {
  id: string;
  key: string;
  name: string;
  description: string;
  ruleType?: string | null;
  ruleConfig?: string | null;
  category?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  version: number;
  isActive: boolean;
  sourceService: string;
}

/** Command payload to update an existing achievement. */
export interface UpdateAchievementCommand {
  id: string;
  key: string;
  name: string;
  description: string;
  ruleType?: string | null;
  ruleConfig?: string | null;
  category?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  version?: number;
  isActive?: boolean;
  sourceService: string;
}

/** Response containing the updated achievement entry. */
export interface UpdateAchievementResponse {
  id: string;
  key: string;
  name: string;
  description: string;
  ruleType?: string | null;
  ruleConfig?: string | null;
  category?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  version: number;
  isActive: boolean;
  sourceService: string;
}

/** Command payload to delete an achievement by id. */
export interface DeleteAchievementCommand {
  id: string;
}

/** Command payload to award an achievement to a user. */
export interface AwardAchievementToUserCommand {
  userId: string;
  achievementId: string;
  context?: string | null;
}

/** Command payload to revoke an achievement from a user. */
export interface RevokeAchievementFromUserCommand {
  userId: string;
  achievementId: string;
}

// Queries
export type GetAllAchievementsQuery = Record<string, never>;

/** Response containing all catalog achievements. */
export interface GetAllAchievementsResponse {
  achievements: AchievementDto[];
}

/** Query payload to list achievements earned by a user. */
export interface GetUserAchievementsByAuthIdQuery {
  authUserId: string;
}

/** Response containing achievements earned by the user. */
export interface GetUserAchievementsByAuthIdResponse {
  achievements: UserAchievementDto[];
}