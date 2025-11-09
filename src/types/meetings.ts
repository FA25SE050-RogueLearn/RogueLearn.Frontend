/**
 * Feature: Meetings Management
 * Purpose: Frontend DTOs aligned with RogueLearn.User Meetings backend contracts.
 * Notes:
 * - These interfaces map to the backend C# DTOs with ASP.NET Core's default
 *   camelCase JSON serialization.
 */

export interface MeetingDto {
  /** Backend: Guid MeetingId */
  meetingId?: string;
  /** Backend: Guid OrganizerId */
  organizerId: string;
  /** Backend: Guid PartyId (required) */
  partyId: string;
  /** Backend: string Title (required) */
  title: string;
  /** Backend: DateTimeOffset ScheduledStartTime */
  scheduledStartTime: string; // ISO timestamp
  /** Backend: DateTimeOffset ScheduledEndTime */
  scheduledEndTime: string; // ISO timestamp
  meetingLink: string;
  /** Backend: DateTimeOffset? ActualStartTime */
  actualStartTime?: string | null; // ISO timestamp
  /** Backend: DateTimeOffset? ActualEndTime */
  actualEndTime?: string | null; // ISO timestamp
}

export interface MeetingParticipantDto {
  /** Backend: Guid ParticipantId */
  participantId?: string;
  /** Backend: Guid MeetingId */
  meetingId?: string;
  /** Backend: Guid UserId */
  userId?: string;
  /** Backend: string RoleInMeeting (defaults to "participant") */
  roleInMeeting?: string;
  /** Backend: DateTimeOffset? JoinTime */
  joinTime?: string | null; // ISO timestamp
  /** Backend: DateTimeOffset? LeaveTime */
  leaveTime?: string | null; // ISO timestamp
  /** Client-only convenience: Google Meet display name (not persisted by backend) */
  displayName?: string;
  /** Client-only convenience: signedin | anonymous | phone (not persisted by backend) */
  type?: "signedin" | "anonymous" | "phone";
}

export type ArtifactType = "recording" | "transcript" | "notes";

export interface ArtifactInputDto {
  /** Backend: string ArtifactType */
  artifactType: ArtifactType;
  /** Backend: string Url */
  url: string;
  /** Client-only convenience metadata for Google Meet */
  state?: string | null;
  exportUri?: string | null;
  driveFileId?: string | null;
  docsDocumentId?: string | null;
}

export interface MeetingDetailsDto {
  meeting: MeetingDto;
  participants: MeetingParticipantDto[];
  /** Backend: string? SummaryText */
  summaryText?: string | null;
}