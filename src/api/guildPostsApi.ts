// src/api/guildPostsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  GuildPostDto,
  CreateGuildPostRequest,
  CreateGuildPostResponse,
  EditGuildPostRequest,
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
  CreateGuildPostCommentRequest,
  CreateGuildPostCommentResponse,
  EditGuildPostCommentRequest,
  GuildPostCommentDto,
  GetGuildPostCommentsQueryRequest,
  GetGuildPostCommentsResponse,
  LikeGuildPostResponse,
  UnlikeGuildPostResponse,
  ForceDeleteGuildPostCommandRequest,
  ForceDeleteGuildPostResponse,
  ForceDeleteGuildPostCommentCommandRequest,
  ForceDeleteGuildPostCommentResponse,
  GetGuildPostsQueryRequest,
  UploadGuildPostImagesResponse,
} from '@/types/guild-posts';

const guildPostsApi = {
  /** GET /api/guilds/{guildId}/posts */
  getByGuild: (guildId: string, params?: Omit<GetGuildPostsQueryRequest, 'guildId'>): Promise<ApiResponse<GuildPostDto[]>> =>
    axiosClient.get<GuildPostDto[]>(`/api/guilds/${guildId}/posts`, { params }).then(res => ({
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
  create: (guildId: string, request: CreateGuildPostRequest): Promise<ApiResponse<CreateGuildPostResponse>> =>
    axiosClient.post<CreateGuildPostResponse>(`/api/guilds/${guildId}/posts`, request).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/guilds/{guildId}/posts (multipart/form-data) */
  createForm: (
    guildId: string,
    request: { title: string; content: string; tags?: string[] | null },
    files: File[]
  ): Promise<ApiResponse<CreateGuildPostResponse>> => {
    const form = new FormData();
    form.append('title', request.title);
    form.append('content', request.content);
    for (const t of request.tags ?? []) form.append('tags', t);
    for (const f of files) form.append('files', f);
    return axiosClient.post<CreateGuildPostResponse>(`/api/guilds/${guildId}/posts/form`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => ({ isSuccess: true, data: res.data }));
  },

  /** PUT /api/guilds/{guildId}/posts/{postId} */
  edit: (guildId: string, postId: string, request: EditGuildPostRequest): Promise<EditGuildPostResponse> =>
    axiosClient.put<void>(`/api/guilds/${guildId}/posts/${postId}`, request).then(() => {}),

  /** PUT /api/guilds/{guildId}/posts/{postId} (multipart/form-data) */
  editForm: (
    guildId: string,
    postId: string,
    request: { title: string; content: string; tags?: string[] | null },
    files: File[]
  ): Promise<void> => {
    const form = new FormData();
    form.append('title', request.title);
    form.append('content', request.content);
    for (const t of request.tags ?? []) form.append('tags', t);
    for (const f of files) form.append('files', f);
    return axiosClient.put<void>(`/api/guilds/${guildId}/posts/${postId}/form`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(() => {});
  },

  /** DELETE /api/guilds/{guildId}/posts/{postId} */
  remove: (payload: DeleteGuildPostCommandRequest): Promise<DeleteGuildPostResponse> =>
    axiosClient.delete<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}`).then(() => {}),

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
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/approve`, payload.note ?? null).then(() => {}),

  /** POST /api/guilds/{guildId}/posts/{postId}/reject */
  reject: (payload: RejectGuildPostCommandRequest): Promise<RejectGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${payload.guildId}/posts/${payload.postId}/reject`, payload.reason ?? null).then(() => {}),

  createComment: (guildId: string, postId: string, payload: CreateGuildPostCommentRequest): Promise<ApiResponse<CreateGuildPostCommentResponse>> =>
    axiosClient.post<CreateGuildPostCommentResponse>(`/api/guilds/${guildId}/posts/${postId}/comments`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  editComment: (guildId: string, postId: string, commentId: string, payload: EditGuildPostCommentRequest): Promise<void> =>
    axiosClient.put<void>(`/api/guilds/${guildId}/posts/${postId}/comments/${commentId}`, payload).then(() => {}),

  deleteComment: (guildId: string, postId: string, commentId: string): Promise<void> =>
    axiosClient.delete<void>(`/api/guilds/${guildId}/posts/${postId}/comments/${commentId}`).then(() => {}),

  getComments: (guildId: string, postId: string, params?: Omit<GetGuildPostCommentsQueryRequest, 'guildId' | 'postId'>): Promise<ApiResponse<GetGuildPostCommentsResponse>> =>
    axiosClient.get<GuildPostCommentDto[]>(`/api/guilds/${guildId}/posts/${postId}/comments`, { params }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  like: (guildId: string, postId: string): Promise<LikeGuildPostResponse> =>
    axiosClient.post<void>(`/api/guilds/${guildId}/posts/${postId}/like`).then(() => {}),

  unlike: (guildId: string, postId: string): Promise<UnlikeGuildPostResponse> =>
    axiosClient.delete<void>(`/api/guilds/${guildId}/posts/${postId}/like`).then(() => {}),

  forceDelete: (payload: ForceDeleteGuildPostCommandRequest): Promise<ForceDeleteGuildPostResponse> =>
    axiosClient.delete<void>(`/api/admin/guilds/${payload.guildId}/posts/${payload.postId}`).then(() => {}),

  forceDeleteComment: (payload: ForceDeleteGuildPostCommentCommandRequest): Promise<ForceDeleteGuildPostCommentResponse> =>
    axiosClient.delete<void>(`/api/admin/guilds/${payload.guildId}/posts/${payload.postId}/comments/${payload.commentId}`).then(() => {}),

  uploadImages: (guildId: string, postId: string, files: File[]): Promise<ApiResponse<UploadGuildPostImagesResponse>> => {
    const form = new FormData();
    for (const f of files) {
      form.append('files', f);
    }
    return axiosClient.post<UploadGuildPostImagesResponse>(`/api/guilds/${guildId}/posts/${postId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => ({ isSuccess: true, data: res.data }));
  },
};

export default guildPostsApi;