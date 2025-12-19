// src/api/meetingsApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "@/types/base/Api";
import {
  MeetingDto,
  MeetingDetailsDto,
  MeetingParticipantDto,
  ArtifactInputDto,
} from "@/types/meetings";

const meetingsApi = {
  // =================================================================
  // MEETINGS (MeetingsController)
  // =================================================================

  /** POST /api/meetings - Upsert a meeting (create or update basic metadata) */
  upsertMeeting: (payload: MeetingDto): Promise<ApiResponse<MeetingDto>> =>
    axiosClient.post<MeetingDto>(`/api/meetings`, payload).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/meetings/{meetingId}/participants - Upsert participants */
  upsertParticipants: (
    meetingId: string,
    participants: MeetingParticipantDto[]
  ): Promise<ApiResponse<MeetingParticipantDto[]>> =>
    axiosClient
      .post<MeetingParticipantDto[]>(
        `/api/meetings/${meetingId}/participants`,
        participants
      )
      .then((res) => ({ isSuccess: true, data: res.data })),

  /** POST /api/meetings/{meetingId}/artifacts - Process artifacts and summarize */
  processArtifactsAndSummarize: (
    meetingId: string,
    artifacts: ArtifactInputDto[],
    accessToken: string
  ): Promise<void> =>
    axiosClient
      .post(`/api/meetings/${meetingId}/artifacts`, {
        meetingId,
        artifacts,
        accessToken,
      })
      .then(() => {}),

  /** POST /api/meetings/{meetingId}/summary - Create or update summary */
  createOrUpdateSummary: (
    meetingId: string,
    content: string
  ): Promise<void> =>
    axiosClient
      .post(`/api/meetings/${meetingId}/summary`, { content })
      .then(() => {}),

  /** GET /api/meetings/{meetingId} - Get meeting details */
  getMeetingDetails: (
    meetingId: string
  ): Promise<ApiResponse<MeetingDetailsDto>> =>
    axiosClient
      .get<MeetingDetailsDto>(`/api/meetings/${meetingId}`)
      .then((res) => ({ isSuccess: true, data: res.data })),

  /** GET /api/meetings/party/{partyId} - Get meetings associated with a party */
  getPartyMeetings: (
    partyId: string
  ): Promise<ApiResponse<MeetingDto[]>> =>
    axiosClient
      .get<MeetingDto[]>(`/api/meetings/party/${partyId}`)
      .then((res) => ({ isSuccess: true, data: res.data })),

  getGuildMeetings: (
    guildId: string
  ): Promise<ApiResponse<MeetingDto[]>> =>
    axiosClient
      .get<MeetingDto[]>(`/api/meetings/guild/${guildId}`)
      .then((res) => ({ isSuccess: true, data: res.data })),
};

export default meetingsApi;