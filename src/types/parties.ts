/**
 * Feature: Parties
 * Purpose: Collaborative study groups and teams, including membership, invitations, and shared resources.
 * Source: RogueLearn.User.Application Features/Parties (DTOs, Commands, Queries)
 */

/** Category of the party/group. */
export type PartyType = 'StudyGroup' | 'ProjectTeam' | 'PeerReview' | 'Casual' | 'Competition';
/** Role of a party member. */
export type PartyRole = 'Leader' | 'CoLeader' | 'Member';
/** Lifecycle status of a party invitation. */
export type InvitationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Cancelled';
/** Lifecycle status of a party member. */
export type MemberStatus = 'Active' | 'Inactive' | 'Suspended' | 'Left';

// DTOs
/** Party entity with core metadata. */
export interface PartyDto {
  id: string;
  name: string;
  description: string;
  partyType: PartyType;
  maxMembers: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string; // ISO timestamp
}

/** Membership record linking a user to a party with role and status. */
export interface PartyMemberDto {
  id: string;
  partyId: string;
  authUserId: string;
  role: PartyRole;
  status: MemberStatus;
  joinedAt: string; // ISO timestamp
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  level: number;
  experiencePoints: number;
  bio?: string | null;
}

/** Invitation sent from an inviter to an invitee to join a party. */
export interface PartyInvitationDto {
  id: string;
  partyId: string;
  inviterId: string;
  inviteeId: string;
  status: InvitationStatus;
  message?: string | null;
  expiresAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
}

/** Shared note/resource stored in the party stash. */
/** Shared note/resource stored in the party stash. */
export interface PartyStashItemDto {
  id: string;
  partyId: string;
  /** Optional provenance: original note id from Arsenal if shared */
  originalNoteId?: string | null;
  sharedByUserId: string;
  title: string;
  /** BlockNote document (raw blocks array), same shape as note content */
  content: any;
  tags?: string[] | null;
  sharedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Represents a target for an invitation, can be a user ID or an email. */
export interface InviteTarget {
  userId?: string | null;
  email?: string | null;
}

/** Payload for inviting a user to a party. */
export interface InviteMemberRequest {
  targets: InviteTarget[];
  message?: string | null;
  expiresAt?: string | null; // ISO timestamp
}

/** Payload to add a shared resource to the party stash. */
export interface AddPartyResourceRequest {
  title: string;
  /** BlockNote document (raw blocks array), same shape as note content */
  content: any;
  tags: string[];
  /** Optional provenance */
  originalNoteId?: string | null;
}

/** Payload to update an existing shared resource in the party stash. */
export interface UpdatePartyResourceRequest {
  title?: string;
  /** BlockNote document (raw blocks array), same shape as note content */
  content?: any;
  tags?: string[];
  /** Optional provenance */
  originalNoteId?: string | null;
}

// Queries
/** Response containing all parties visible to the requester. */
export type GetAllPartiesQueryResponse = PartyDto[];

/** Query payload to fetch a party by id. */
export interface GetPartyByIdQueryRequest { partyId: string }
export type GetPartyByIdQueryResponse = PartyDto | null;

/** Query payload to list members of a party. */
export interface GetPartyMembersQueryRequest { partyId: string }
export type GetPartyMembersQueryResponse = PartyMemberDto[];

/** Query payload to list party stash resources. */
export interface GetPartyResourcesQueryRequest { partyId: string }
export type GetPartyResourcesQueryResponse = PartyStashItemDto[];

/** Query payload to list pending invitations for a party. */
export interface GetPendingInvitationsQueryRequest { partyId: string }
export type GetPendingInvitationsQueryResponse = PartyInvitationDto[];

/** Query payload to list my pending invitations (invitee = current user). */
export type GetMyPendingInvitationsQueryResponse = PartyInvitationDto[];

/** Query payload to list roles for a specific party member. */
export interface GetPartyMemberRolesQueryRequest {
  partyId: string;
  memberAuthUserId: string;
}
export type GetPartyMemberRolesQueryResponse = PartyRole[];

// Commands
/** Command payload to create a new party. */
export interface CreatePartyCommandRequest {
  creatorAuthUserId: string;
  name: string;
  isPublic: boolean;
  maxMembers: number;
}
/** Response containing created party id and granted role. */
export interface CreatePartyResponse {
  partyId: string;
  roleGranted: string; // "PartyLeader"
}

/** Command payload to send a party invitation. */
export interface InviteMemberCommandRequest {
  partyId: string;
  inviterAuthUserId: string;
  inviteeAuthUserId: string;
  message?: string | null;
  expiresAt: string; // ISO timestamp
}
export type InviteMemberCommandResponse = PartyInvitationDto;

/** Command payload to assign a role to a party member. */
export interface AssignPartyRoleCommandRequest {
  partyId: string;
  memberAuthUserId: string;
  roleToAssign: PartyRole;
  actorAuthUserId: string;
  isAdminOverride?: boolean;
}

/** Command payload to revoke a role from a party member. */
export interface RevokePartyRoleCommandRequest {
  partyId: string;
  memberAuthUserId: string;
  roleToRevoke: PartyRole;
  actorAuthUserId: string;
  isAdminOverride?: boolean;
}

/** Command payload to add a shared resource to the party stash. */
export interface AddPartyResourceCommandRequest {
  partyId: string;
  sharedByUserId: string;
  title: string;
  content: Record<string, unknown>;
  tags: string[];
}
export type AddPartyResourceCommandResponse = PartyStashItemDto;

/** Command payload to accept a party invitation. */
export interface AcceptPartyInvitationCommandRequest {
  partyId: string;
  invitationId: string;
  authUserId: string;
}

/** Command payload to decline a party invitation. */
export interface DeclinePartyInvitationCommandRequest {
  partyId: string;
  invitationId: string;
  authUserId: string;
}

/** Command payload to configure party settings. */
export interface ConfigurePartySettingsCommandRequest {
  partyId: string;
  name: string;
  description: string;
  privacy: string;
  maxMembers: number;
}

/** Command payload to delete a party. */
export interface DeletePartyCommandRequest {
  partyId: string;
}

/** Command payload to leave a party. */
export interface LeavePartyCommandRequest {
  partyId: string;
  authUserId: string;
}

/** Command payload to remove a party member. */
export interface RemovePartyMemberCommandRequest {
  partyId: string;
  memberId: string;
  reason?: string;
}

/** Command payload to transfer party leadership. */
export interface TransferPartyLeadershipCommandRequest {
  partyId: string;
  toUserId: string;
}