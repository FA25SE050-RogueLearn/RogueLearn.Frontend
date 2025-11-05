/**
 * Feature: User Skill Rewards
 * Purpose: Query rewards and ingest XP events that update user skill progression.
 * Mapping rules:
 * - Guid -> string
 * - DateTimeOffset -> string (ISO 8601)
 */

/** Reward record resulting from an XP event tied to a skill. */
export interface UserSkillRewardDto {
  id: string;
  sourceService: string;
  sourceType: string;
  sourceId?: string | null;
  skillName: string;
  pointsAwarded: number;
  reason?: string | null;
  createdAt: string;
}

// Query
/** Query payload to list rewards for a user. */
export interface GetUserSkillRewardsQueryRequest {
  userId: string;
}
/** Response containing reward records for the user. */
export interface GetUserSkillRewardsResponse {
  rewards: UserSkillRewardDto[];
}

// Command
/** Command payload to ingest an XP event from a source system. */
export interface IngestXpEventCommandRequest {
  authUserId: string;
  // Source identifiers for idempotency and traceability
  sourceService: string;
  sourceType: string;
  sourceId?: string | null;

  // Skill & XP payload
  skillName: string;
  points: number;
  reason?: string | null;
  occurredAt?: string | null; // DateTimeOffset
}

/** Response summarizing the ingestion outcome and updated skill stats. */
export interface IngestXpEventResponse {
  processed: boolean;
  rewardId?: string | null;
  message?: string | null;
  // Optional summary
  skillName: string;
  newExperiencePoints: number;
  newLevel: number;
}