// src/api/guildsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  GuildDto,
  GuildFullDto,
  GuildMemberDto,
  GuildInvitationDto,
  GuildDashboardDto,
  GuildJoinRequestDto,
  GuildRole,
  CreateGuildCommandRequest,
  CreateGuildResponse,
  ConfigureGuildSettingsCommandRequest,
  InviteGuildMembersResponse,
  ApplyGuildJoinRequestRequest,
  AssignGuildRoleCommandRequest,
  RevokeGuildRoleCommandRequest,
  RemoveGuildMemberCommandRequest,
  TransferGuildLeadershipCommandRequest,
  InviteGuildMembersRequest,
  ListAllPublicGuildsQueryRequest,
  GetAllGuildsFullQueryResponse,
} from '@/types/guilds';

const guildsApi = {
  /** GET /api/guilds */
  listAllPublic: (params: ListAllPublicGuildsQueryRequest): Promise<ApiResponse<GuildDto[]>> =>
    axiosClient.get<GuildDto[]>('/api/guilds', { params }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/full */
  listAllFull: (): Promise<ApiResponse<GetAllGuildsFullQueryResponse>> =>
    axiosClient.get<GuildFullDto[]>('/api/guilds/full').then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId} */
  getById: (guildId: string): Promise<ApiResponse<GuildDto>> =>
    axiosClient.get<GuildDto>(`/api/guilds/${guildId}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/members */
  getMembers: (guildId: string): Promise<ApiResponse<GuildMemberDto[]>> =>
    axiosClient.get<GuildMemberDto[]>(`/api/guilds/${guildId}/members`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/invitations */
  getInvitations: (guildId: string): Promise<ApiResponse<GuildInvitationDto[]>> =>
    axiosClient.get<GuildInvitationDto[]>(`/api/guilds/${guildId}/invitations`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/dashboard */
  getDashboard: (guildId: string): Promise<ApiResponse<GuildDashboardDto>> =>
    axiosClient.get<GuildDashboardDto>(`/api/guilds/${guildId}/dashboard`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/members/{memberAuthUserId}/roles */
  getMemberRoles: (guildId: string, memberAuthUserId: string): Promise<ApiResponse<GuildRole[]>> =>
    axiosClient.get<GuildRole[]>(`/api/guilds/${guildId}/members/${memberAuthUserId}/roles`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/join-requests */
  getJoinRequests: (guildId: string, pendingOnly = true): Promise<ApiResponse<GuildJoinRequestDto[]>> =>
    axiosClient.get<GuildJoinRequestDto[]>(`/api/guilds/${guildId}/join-requests`, { params: { pendingOnly } }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/join-requests/me */
  getMyJoinRequests: (pendingOnly = true): Promise<ApiResponse<GuildJoinRequestDto[]>> =>
    axiosClient.get<GuildJoinRequestDto[]>(`/api/guilds/join-requests/me`, { params: { pendingOnly } }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/me */
  getMyGuild: (): Promise<ApiResponse<GuildDto | null>> =>
    axiosClient.get<GuildDto | null>(`/api/guilds/me`).then(res => ({
      isSuccess: true,
      // Backend may return 204 No Content when user is not in a guild
      data: (res.status === 204 || res.data == null) ? null : res.data,
    })),

  /** POST /api/guilds */
  create: (payload: CreateGuildCommandRequest): Promise<ApiResponse<CreateGuildResponse>> =>
    axiosClient.post<CreateGuildResponse>('/api/guilds', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/guilds/{guildId}/settings */
  configureSettings: (guildId: string, payload: Omit<ConfigureGuildSettingsCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.put<void>(`/api/guilds/${guildId}/settings`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/invite */
  invite: (guildId: string, payload: InviteGuildMembersRequest): Promise<ApiResponse<InviteGuildMembersResponse>> =>
    axiosClient.post<InviteGuildMembersResponse>(`/api/guilds/${guildId}/invite`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/guilds/{guildId}/invitations/{invitationId}/accept */
  acceptInvitation: (guildId: string, invitationId: string): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/invitations/${invitationId}/accept`).then(() => {}),

  /** POST /api/guilds/{guildId}/invitations/{invitationId}/decline */
  declineInvitation: (guildId: string, invitationId: string): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/invitations/${invitationId}/decline`).then(() => {}),

  /** POST /api/guilds/{guildId}/join-requests/apply */
  applyToJoin: (guildId: string, payload: ApplyGuildJoinRequestRequest): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/join-requests/apply`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/join-requests/{requestId}/approve */
  approveJoinRequest: (guildId: string, requestId: string): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/join-requests/${requestId}/approve`).then(() => {}),

  /** POST /api/guilds/{guildId}/join-requests/{requestId}/decline */
  declineJoinRequest: (guildId: string, requestId: string): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/join-requests/${requestId}/decline`).then(() => {}),

  /** POST /api/guilds/{guildId}/members/{memberAuthUserId}/roles/assign */
  assignRole: (guildId: string, memberAuthUserId: string, role: GuildRole): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/members/${memberAuthUserId}/roles/assign`, { role }).then(() => {}),

  /** POST /api/guilds/{guildId}/members/{memberAuthUserId}/roles/revoke */
  revokeRole: (guildId: string, memberAuthUserId: string, role: GuildRole): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/members/${memberAuthUserId}/roles/revoke`, { role }).then(() => {}),

  /** POST /api/guilds/{guildId}/members/{memberId}/remove */
  removeMember: (guildId: string, memberId: string, payload: { reason?: string | null }): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/members/${memberId}/remove`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/transfer-leadership */
  transferLeadership: (guildId: string, payload: Omit<TransferGuildLeadershipCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/transfer-leadership`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/leave */
  leaveGuild: (guildId: string): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/leave`).then(() => {}),

  /** DELETE /api/guilds/{guildId} */
  deleteGuild: (guildId: string): Promise<void> =>
    axiosClient.delete<void>(`/api/guilds/${guildId}`).then(() => {}),
};

export default guildsApi;