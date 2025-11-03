// src/api/notesApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  NoteDto,
  CreateNoteCommandRequest,
  CreateNoteResponse,
  UpdateNoteCommandRequest,
  UpdateNoteResponse,
  DeleteNoteCommandRequest,
  GetMyNotesResponse,
  GetNoteByIdResponse,
  CreateNoteFromUploadCommandRequest,
  GetPublicNotesResponse,
} from '@/types/notes';
import {
  SuggestNoteTagsQueryRequest,
  SuggestNoteTagsResponse,
  SuggestNoteTagsFromUploadRequest,
  CommitNoteTagSelectionsCommandRequest,
  CommitNoteTagSelectionsResponse,
  CreateNoteWithAiTagsCommandRequest,
  CreateNoteWithAiTagsResponse,
} from '@/types/ai-tagging';

const notesApi = {
  /** GET /api/notes/me */
  getMyNotes: (): Promise<ApiResponse<GetMyNotesResponse>> =>
    axiosClient.get<NoteDto[]>(`/api/notes/me`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/notes/{id} */
  getById: (id: string): Promise<ApiResponse<GetNoteByIdResponse>> =>
    axiosClient.get<GetNoteByIdResponse>(`/api/notes/${id}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/notes */
  create: (payload: CreateNoteCommandRequest): Promise<ApiResponse<CreateNoteResponse>> =>
    axiosClient.post<CreateNoteResponse>('/api/notes', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/notes/{id} */
  update: (id: string, payload: Omit<UpdateNoteCommandRequest, 'id'>): Promise<ApiResponse<UpdateNoteResponse>> =>
    axiosClient.put<UpdateNoteResponse>(`/api/notes/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/notes/{id} */
  remove: (payload: DeleteNoteCommandRequest): Promise<void> =>
    axiosClient.delete<void>(`/api/notes/${payload.id}`, { data: { authUserId: payload.authUserId } }).then(() => {}),

  /** POST /api/notes/upload */
  createFromUpload: (payload: CreateNoteFromUploadCommandRequest): Promise<ApiResponse<CreateNoteResponse>> => {
    const formData = new FormData();
    formData.append('authUserId', payload.authUserId);
    formData.append('file', payload.file);
    if (payload.fileName) formData.append('fileName', payload.fileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    return axiosClient.post<CreateNoteResponse>('/api/notes/upload', formData).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },

  /** GET /api/notes/public */
  getPublicNotes: (search?: string): Promise<ApiResponse<GetPublicNotesResponse>> =>
    axiosClient.get<NoteDto[]>(`/api/notes/public`, { params: { search } }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  // --- AI Tagging ---
  /** POST /api/notes/ai/suggest */
  suggestTags: (payload: SuggestNoteTagsQueryRequest): Promise<ApiResponse<SuggestNoteTagsResponse>> =>
    axiosClient.post<SuggestNoteTagsResponse>('/api/notes/ai/suggest', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/notes/ai/suggest/upload (multipart) */
  suggestTagsFromUpload: (payload: SuggestNoteTagsFromUploadRequest): Promise<ApiResponse<SuggestNoteTagsResponse>> => {
    const formData = new FormData();
    formData.append('authUserId', payload.authUserId);
    const fileBlob = payload.fileContent instanceof Blob ? payload.fileContent : new Blob([payload.fileContent as any]);
    formData.append('file', fileBlob);
    if (payload.fileName) formData.append('fileName', payload.fileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    if (payload.maxTags != null) formData.append('maxTags', String(payload.maxTags));
    return axiosClient.post<SuggestNoteTagsResponse>('/api/notes/ai/suggest/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },

  /** POST /api/notes/ai/commit */
  commitTagSelections: (payload: CommitNoteTagSelectionsCommandRequest): Promise<ApiResponse<CommitNoteTagSelectionsResponse>> =>
    axiosClient.post<CommitNoteTagSelectionsResponse>('/api/notes/ai/commit', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/notes/ai/create-with-tags */
  createWithAiTagsFromText: (payload: Omit<CreateNoteWithAiTagsCommandRequest, 'fileContent' | 'fileName' | 'contentType'>): Promise<ApiResponse<CreateNoteWithAiTagsResponse>> =>
    axiosClient.post<CreateNoteWithAiTagsResponse>('/api/notes/ai/create-with-tags', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/notes/ai/create-with-tags/upload (multipart) */
  createWithAiTagsFromUpload: (payload: CreateNoteWithAiTagsCommandRequest): Promise<ApiResponse<CreateNoteWithAiTagsResponse>> => {
    const formData = new FormData();
    formData.append('authUserId', payload.authUserId);
    if (payload.title) formData.append('title', payload.title);
    if (payload.isPublic != null) formData.append('isPublic', String(payload.isPublic));
    if (payload.maxTags != null) formData.append('maxTags', String(payload.maxTags));
    if (payload.applySuggestions != null) formData.append('applySuggestions', String(payload.applySuggestions));
    if (payload.fileContent) {
      const fileBlob = payload.fileContent instanceof Blob ? payload.fileContent : new Blob([payload.fileContent as any]);
      formData.append('file', fileBlob);
    }
    if (payload.fileName) formData.append('fileName', payload.fileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    return axiosClient.post<CreateNoteWithAiTagsResponse>('/api/notes/ai/create-with-tags/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },
};

export default notesApi;