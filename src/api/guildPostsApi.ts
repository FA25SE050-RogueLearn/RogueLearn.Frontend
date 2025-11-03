// src/api/guildPostsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  GuildPostDto,
  CreateGuildPostCommandRequest,
  CreateGuildPostResponse,
  EditGuildPostCommandRequest,
  EditGuildPostResponse,
  DeleteGuildPostCommandRequest,
  DeleteGuildPostResponse,
  PinGuildPostCommandRequest,
  PinGuildPostResponse,
  UnpinGuildPostCommandRequest,
  UnpinGuildPostResponse,
  LockGuildPostCommandRequest,
  LockGuildPostResponse,
  UnlockGuildPostCommandRequest,
  UnlockGuildPostResponse,
  ApproveGuildPostCommandRequest,
  ApproveGuildPostResponse,
  RejectGuildPostCommandRequest,
  RejectGuildPostResponse,
} from '@/types/guild-posts';

const guildPostsApi = {
  /** GET /api/guilds/{guildId}/posts */
  getByGuild: (guildId: string): Promise<ApiResponse<GuildPostDto[]>> =>
    axiosClient.get<GuildPostDto[]>(`/api/guilds/${guildId}/posts`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/posts/pinned */
  getPinned: (guildId: string): Promise<ApiResponse<GuildPostDto[]>> =>
    axiosClient.get<GuildPostDto[]>(`/api/guilds/${guildId}/posts/pinned`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/guilds/{guildId}/posts/{postId} */
  getById: (guildId: string, postId: string): Promise<ApiResponse<GuildPostDto | null>> =>
    axiosClient.get<GuildPostDto | null>(`/api/guilds/${guildId}/posts/${postId}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/guilds/{guildId}/posts */
  create: (payload: CreateGuildPostCommandRequest): Promise<ApiResponse<CreateGuildPostResponse>> =>
    axiosClient.post<CreateGuildPostResponse>(`/api/guilds/${payload.guildId}/posts`, payload.request).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/guilds/{guildId}/posts/{postId} */
  edit: (payload: EditGuildPostCommandRequest): Promise<EditGuildPostResponse> =>
    axiosClient.put<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}`, payload.request).then(() => {}),

  /** DELETE /api/guilds/{guildId}/posts/{postId} */
  remove: (payload: DeleteGuildPostCommandRequest): Promise<DeleteGuildPostResponse> =>
    axiosClient.delete<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}`, { data: { requesterAuthUserId: payload.requesterAuthUserId, force: payload.force } }).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/pin */
  pin: (payload: PinGuildPostCommandRequest): Promise<PinGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/pin`).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/unpin */
  unpin: (payload: UnpinGuildPostCommandRequest): Promise<UnpinGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/unpin`).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/lock */
  lock: (payload: LockGuildPostCommandRequest): Promise<LockGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/lock`).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/unlock */
  unlock: (payload: UnlockGuildPostCommandRequest): Promise<UnlockGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/unlock`).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/approve */
  approve: (payload: ApproveGuildPostCommandRequest): Promise<ApproveGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/approve`, { note: payload.note }).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/reject */
  reject: (payload: RejectGuildPostCommandRequest): Promise<RejectGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/reject`, { reason: payload.reason }).then(() => {}),
};

export default guildPostsApi;