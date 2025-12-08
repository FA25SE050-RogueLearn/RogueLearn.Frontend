/**
 * Feature: Guilds
 * Source: RogueLearn.User.Application Features/Guilds
 * Purpose: Manage user guilds, membership, roles, invitations, and dashboard queries.
 */

/** Allowed guild member roles. */
export type GuildRole = 'GuildMaster' | 'Member';
/** Member lifecycle status within a guild. */
export type MemberStatus = 'Active' | 'Inactive' | 'Suspended' | 'Left';
/** Status of a guild invitation. */
export type InvitationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';
/** Status of a request to join a guild. */
export type GuildJoinRequestStatus = 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';

/** Guild details used by list/detail views and dashboard. */
export interface GuildDto {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  isLecturerGuild: boolean;
  maxMembers: number;
  createdBy: string;
  createdAt: string; // ISO timestamp
  memberCount: number;
}

/** Full guild details for global leaderboard and admin views. */
export interface GuildFullDto {
  id: string;
  name: string;
  description: string;
  guildType: string;
  maxMembers: number;
  currentMemberCount: number;
  meritPoints: number;
  isPublic: boolean;
  isLecturerGuild: boolean;
  requiresApproval: boolean;
  bannerImageUrl?: string | null;
  createdBy: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Member record in a guild including role and status. */
export interface GuildMemberDto {
  memberId: string;
  guildId: string;
  authUserId: string;
  role: GuildRole;
  joinedAt: string; // ISO timestamp
  leftAt?: string | null; // ISO timestamp
  status: MemberStatus;
  contributionPoints: number;
  rankWithinGuild?: number | null;
  // Enriched user profile fields (optional, may not be present on some endpoints)
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  level?: number | null;
  experiencePoints?: number | null;
  bio?: string | null;
}

/** Invitation record to join a guild; includes legacy and expanded fields for queries. */
export interface GuildInvitationDto {
  // Legacy fields
  id: string;
  guildId: string;
  inviteeId: string;
  message?: string | null;
  expiresAt: string; // ISO timestamp

  // Expanded fields for queries
  invitationId: string;
  inviterAuthUserId: string;
  targetUserId?: string | null;
  targetEmail?: string | null;
  status: InvitationStatus;
  createdAt: string; // ISO timestamp
  respondedAt?: string | null; // ISO timestamp
  guildName: string;
  inviteeName: string;
}

/** Join request record for a user applying to a guild. */
export interface GuildJoinRequestDto {
  id: string;
  guildId: string;
  requesterId: string;
  status: GuildJoinRequestStatus;
  message?: string | null;
  createdAt: string; // ISO timestamp
  respondedAt?: string | null; // ISO timestamp
  expiresAt?: string | null; // ISO timestamp
  requesterName: string;
}

/** Aggregated dashboard stats for a guild. */
export interface GuildDashboardDto {
  guildId: string;
  name: string;
  activeMemberCount: number;
  pendingInvitationCount: number;
  acceptedInvitationCount: number;
  maxMembers: number;
}

/** Target for invitations: can be a user id or an email address. */
export interface InviteTarget {
  userId?: string | null;
  email?: string | null;
}

export interface InviteGuildMembersRequest {
  targets: InviteTarget[];
  message?: string | null;
}

/** Request payload to apply to join a guild. */
export interface ApplyGuildJoinRequestRequest {
  message?: string | null;
}

// Queries
/** Query payload to fetch a guild by id. */
export type GetGuildByIdQueryRequest = { guildId: string }
export type GetGuildByIdQueryResponse = GuildDto;

/** Query payload to fetch all public guilds. */
export interface ListAllPublicGuildsQueryRequest {
  search?: string;
  page?: number;
  pageSize?: number;
}
export type ListAllPublicGuildsQueryResponse = GuildDto[];

/** Response payload to fetch all guilds with full details. */
export type GetAllGuildsFullQueryResponse = GuildFullDto[];

/** Query payload to fetch members of a guild. */
export interface GetGuildMembersQueryRequest { guildId: string }
export type GetGuildMembersQueryResponse = GuildMemberDto[];

/** Query payload to fetch join requests for a guild. */
export interface GetGuildJoinRequestsQueryRequest {
  guildId: string;
  pendingOnly?: boolean;
}
export type GetGuildJoinRequestsQueryResponse = GuildJoinRequestDto[];

/** Query payload to fetch invitations for a guild. */
export interface GetGuildInvitationsQueryRequest { guildId:string }
export type GetGuildInvitationsQueryResponse = GuildInvitationDto[];

/** Query payload to fetch dashboard stats for a guild. */
export interface GetGuildDashboardQueryRequest { guildId: string }
export type GetGuildDashboardQueryResponse = GuildDashboardDto;

/** Query payload to fetch roles assigned to a member in a guild. */
export interface GetGuildMemberRolesQueryRequest {
  guildId: string;
  memberAuthUserId: string;
}
export type GetGuildMemberRolesQueryResponse = GuildRole[];

/** Query payload to fetch the guild associated with the current user. */
export interface GetMyGuildQueryRequest { authUserId: string }
export type GetMyGuildQueryResponse = GuildDto | null;

/** Query payload to fetch the current user's pending join requests. */
export interface GetMyJoinRequestsQueryRequest {
  pendingOnly?: boolean;
}
export type GetMyJoinRequestsQueryResponse = GuildJoinRequestDto[];

// Commands
/** Command payload to create a new guild. */
export interface CreateGuildCommandRequest {
  creatorAuthUserId: string;
  name: string;
  description: string;
  privacy: 'public' | 'invite_only';
  maxMembers: number;
}
export interface CreateGuildResponse {
  guildId: string;
  roleGranted: string; // "GuildMaster"
  guild: GuildDto;
}

/** Command payload to update guild settings. */
export interface ConfigureGuildSettingsCommandRequest {
  guildId: string;
  name: string;
  description: string;
  privacy: 'public' | 'invite_only';
  maxMembers: number;
}

/** Command payload to invite one or more targets to a guild. */
export interface InviteGuildMembersCommandRequest {
  guildId: string;
  inviterAuthUserId: string;
  targets: InviteTarget[];
  message?: string | null;
}
export interface InviteGuildMembersResponse { invitationIds: string[] }

/** Command payload to accept an invitation to a guild. */
export interface AcceptGuildInvitationCommandRequest {
  guildId: string;
  invitationId: string;
  authUserId: string;
}

/** Command payload to decline a guild invitation. */
export interface DeclineGuildInvitationCommandRequest {
  guildId: string;
  invitationId: string;
  authUserId: string;
}

/** Command payload to apply to join a guild. */
export interface ApplyGuildJoinRequestCommandRequest {
  guildId: string;
  authUserId: string;
  message?: string | null;
}

/** Command payload to approve a guild join request. */
export interface ApproveGuildJoinRequestCommandRequest {
  guildId: string;
  requestId: string;
  actorAuthUserId: string;
}

/** Command payload to decline a guild join request. */
export interface DeclineGuildJoinRequestCommandRequest {
  guildId: string;
  requestId: string;
  actorAuthUserId: string;
}

/** Command payload to assign a role within a guild to a member. */
export interface AssignGuildRoleCommandRequest {
  guildId: string;
  memberAuthUserId: string;
  roleToAssign: GuildRole;
  actorAuthUserId: string;
  isAdminOverride?: boolean;
}

/** Command payload to revoke a role within a guild from a member. */
export interface RevokeGuildRoleCommandRequest {
  guildId: string;
  memberAuthUserId: string;
  roleToRevoke: GuildRole;
  actorAuthUserId: string;
  isAdminOverride?: boolean;
}

/** Command payload to remove a member from a guild. */
export interface RemoveGuildMemberCommandRequest {
  guildId: string;
  memberId: string;
  reason?: string | null;
}

/** Command payload to transfer guild leadership to another user. */
export interface TransferGuildLeadershipCommandRequest {
  guildId: string;
  toUserId: string;
}

/** Command payload for a user to leave a guild. */
export interface LeaveGuildCommandRequest {
  guildId: string;
  authUserId: string;
}

/** Command payload to delete a guild. */
export interface DeleteGuildCommandRequest { guildId: string }