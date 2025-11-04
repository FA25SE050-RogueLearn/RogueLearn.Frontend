// src/api/guildsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  GuildDto,
  GuildMemberDto,
  GuildInvitationDto,
  GuildDashboardDto,
  CreateGuildCommandRequest,
  CreateGuildResponse,
  ConfigureGuildSettingsCommandRequest,
  InviteGuildMembersCommandRequest,
  InviteGuildMembersResponse,
  AcceptGuildInvitationCommandRequest,
  AssignGuildRoleCommandRequest,
  RevokeGuildRoleCommandRequest,
  RemoveGuildMemberCommandRequest,
  TransferGuildLeadershipCommandRequest,
  LeaveGuildCommandRequest,
} from '@/types/guilds';

const guildsApi = {
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

  /** GET /api/guilds/me */
  getMyGuild: (): Promise<ApiResponse<GuildDto | null>> =>
    axiosClient.get<GuildDto | null>(`/api/guilds/me`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/guilds */
  create: (payload: CreateGuildCommandRequest): Promise<ApiResponse<CreateGuildResponse>> =>
    axiosClient.post<CreateGuildResponse>('/api/guilds', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/guilds/{guildId}/settings */
  configureSettings: (guildId: string, payload: Omit<ConfigureGuildSettingsCommandRequest, 'guildId'>): Promise<ApiResponse<GuildDto>> =>
    axiosClient.put<GuildDto>(`/api/guilds/${guildId}/settings`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/guilds/{guildId}/invite */
  inviteMembers: (guildId: string, payload: Omit<InviteGuildMembersCommandRequest, 'guildId'>): Promise<ApiResponse<InviteGuildMembersResponse>> =>
    axiosClient.post<InviteGuildMembersResponse>(`/api/guilds/${guildId}/invite`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/guilds/{guildId}/invitations/accept */
  acceptInvitation: (guildId: string, payload: Omit<AcceptGuildInvitationCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/invitations/accept`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/roles/assign */
  assignRole: (guildId: string, payload: Omit<AssignGuildRoleCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/roles/assign`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/roles/revoke */
  revokeRole: (guildId: string, payload: Omit<RevokeGuildRoleCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/roles/revoke`, payload).then(() => {}),

  /** DELETE /api/guilds/{guildId}/members */
  removeMember: (guildId: string, payload: Omit<RemoveGuildMemberCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.request<void>({ method: 'DELETE', url: `/api/guilds/${guildId}/members`, data: payload }).then(() => {}),

  /** POST /api/guilds/{guildId}/transfer-leadership */
  transferLeadership: (guildId: string, payload: Omit<TransferGuildLeadershipCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/transfer-leadership`, payload).then(() => {}),

  /** POST /api/guilds/{guildId}/leave */
  leaveGuild: (guildId: string, payload: Omit<LeaveGuildCommandRequest, 'guildId'>): Promise<void> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/leave`, payload).then(() => {}),

  /** DELETE /api/guilds/{guildId} */
  deleteGuild: (guildId: string): Promise<void> =>
    axiosClient.delete<void>(`/api/guilds/${guildId}`).then(() => {}),
};

export default guildsApi;