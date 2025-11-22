/**
 * Feature: Meetings Management
 * Purpose: Frontend DTOs aligned with RogueLearn.User Meetings backend contracts.
 * Notes:
 * - These interfaces map to the backend C# DTOs with ASP.NET Core's default
 *   camelCase JSON serialization.
 */

export enum MeetingStatus {
  Scheduled = 'Scheduled',
  Active = 'Active',
  EndedProcessing = 'EndedProcessing',
  Completed = 'Completed'
}

export interface MeetingDto {
  meetingId?: string;
  organizerId: string;
  partyId: string | null;
  guildId?: string | null;
  title: string;
  scheduledStartTime: string; // ISO timestamp
  scheduledEndTime: string; // ISO timestamp
  meetingLink: string;
  actualStartTime?: string | null; // ISO timestamp
  actualEndTime?: string | null; // ISO timestamp
  meetingCode?: string;
  spaceName?: string;
  status?: MeetingStatus;
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