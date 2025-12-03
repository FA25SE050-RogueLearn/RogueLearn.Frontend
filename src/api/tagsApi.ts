// src/api/tagsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  CreateTagCommandRequest,
  CreateTagResponse,
  GetMyTagsResponse,
  AttachTagToNoteCommandRequest,
  AttachTagToNoteResponse,
  RemoveTagFromNoteCommandRequest,
  GetTagsForNoteResponse,
  CreateTagAndAttachToNoteCommandRequest,
  CreateTagAndAttachToNoteResponse,
  UpdateTagCommandRequest,
  UpdateTagResponse,
} from '@/types/tags';

const tagsApi = {
  // =================================================================
  // TAGS (TagsController)
  // =================================================================

  /** GET /api/tags/me */
  getMyTags: (): Promise<ApiResponse<GetMyTagsResponse>> =>
    axiosClient.get<GetMyTagsResponse>(`/api/tags/me`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/tags */
  create: (payload: CreateTagCommandRequest): Promise<ApiResponse<CreateTagResponse>> =>
    axiosClient.post<CreateTagResponse>('/api/tags', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/notes/{noteId}/tags/attach */
  attachToNote: (payload: AttachTagToNoteCommandRequest): Promise<ApiResponse<AttachTagToNoteResponse>> =>
    axiosClient.post<AttachTagToNoteResponse>(
      `/api/notes/${payload.noteId}/tags/attach`,
      JSON.stringify(payload.tagId),
      { headers: { 'Content-Type': 'application/json' } }
    ).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/notes/{noteId}/tags/{tagId} */
  removeFromNote: (payload: RemoveTagFromNoteCommandRequest): Promise<void> =>
    axiosClient.delete<void>(`/api/notes/${payload.noteId}/tags/${payload.tagId}`, { data: { authUserId: payload.authUserId } }).then(() => {}),

  /** DELETE /api/tags/{tagId} */
  deleteTag: (tagId: string): Promise<void> =>
    axiosClient.delete<void>(`/api/tags/${tagId}`).then(() => {}),

  /** GET /api/notes/{noteId}/tags */
  getTagsForNote: (noteId: string): Promise<ApiResponse<GetTagsForNoteResponse>> =>
    axiosClient.get<GetTagsForNoteResponse>(`/api/notes/${noteId}/tags`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/notes/{noteId}/tags/create-and-attach */
  createAndAttach: (payload: CreateTagAndAttachToNoteCommandRequest): Promise<ApiResponse<CreateTagAndAttachToNoteResponse>> =>
    axiosClient.post<CreateTagAndAttachToNoteResponse>(`/api/notes/${payload.noteId}/tags/create-and-attach`, {
      authUserId: payload.authUserId,
      name: payload.name,
    }).then(res => ({ isSuccess: true, data: res.data })),

  /** PUT /api/tags/{id} */
  update: (id: string, payload: UpdateTagCommandRequest): Promise<ApiResponse<UpdateTagResponse>> =>
    axiosClient.put<UpdateTagResponse>(`/api/tags/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
};

export default tagsApi;