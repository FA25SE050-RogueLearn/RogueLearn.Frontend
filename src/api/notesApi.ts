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
  /** POST /api/notes/ai/suggest (with backend route fallback) */
  suggestTags: async (payload: SuggestNoteTagsQueryRequest): Promise<ApiResponse<SuggestNoteTagsResponse>> => {
    const paths = ['/api/notes/ai/suggest', '/api/ai/tagging/suggest'];
    for (const p of paths) {
      try {
        const res = await axiosClient.post<SuggestNoteTagsResponse>(p, payload);
        return { isSuccess: true, data: res.data };
      } catch (err: any) {
        if (err?.response?.status === 404) {
          continue; // try next path
        }
        throw err;
      }
    }
    // If all fail, throw last error
    const res = await axiosClient.post<SuggestNoteTagsResponse>(paths[0], payload);
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/notes/ai/suggest/upload (multipart) with backend route fallback */
  suggestTagsFromUpload: async (payload: SuggestNoteTagsFromUploadRequest): Promise<ApiResponse<SuggestNoteTagsResponse>> => {
    const formData = new FormData();
    formData.append('authUserId', payload.authUserId);
    const fileBlob = payload.fileContent instanceof Blob ? payload.fileContent : new Blob([payload.fileContent as any]);
    formData.append('file', fileBlob);
    if (payload.fileName) formData.append('fileName', payload.fileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    if (payload.maxTags != null) formData.append('maxTags', String(payload.maxTags));
    const paths = ['/api/notes/ai/suggest/upload', '/api/ai/tagging/suggest-upload'];
    for (const p of paths) {
      try {
        const res = await axiosClient.post<SuggestNoteTagsResponse>(p, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return { isSuccess: true, data: res.data };
      } catch (err: any) {
        if (err?.response?.status === 404) continue;
        throw err;
      }
    }
    const res = await axiosClient.post<SuggestNoteTagsResponse>(paths[0], formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/notes/ai/commit (with backend route fallback) */
  commitTagSelections: async (payload: CommitNoteTagSelectionsCommandRequest): Promise<ApiResponse<CommitNoteTagSelectionsResponse>> => {
    const paths = ['/api/notes/ai/commit', '/api/ai/tagging/commit'];
    for (const p of paths) {
      try {
        const res = await axiosClient.post<CommitNoteTagSelectionsResponse>(p, payload);
        return { isSuccess: true, data: res.data };
      } catch (err: any) {
        if (err?.response?.status === 404) continue;
        throw err;
      }
    }
    const res = await axiosClient.post<CommitNoteTagSelectionsResponse>(paths[0], payload);
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/notes/ai/create-with-tags (with backend route fallback) */
  createWithAiTagsFromText: async (payload: Omit<CreateNoteWithAiTagsCommandRequest, 'fileContent' | 'fileName' | 'contentType'>): Promise<ApiResponse<CreateNoteWithAiTagsResponse>> => {
    const paths = ['/api/notes/ai/create-with-tags', '/api/notes/create-with-ai-tags'];
    for (const p of paths) {
      try {
        const res = await axiosClient.post<CreateNoteWithAiTagsResponse>(p, payload);
        return { isSuccess: true, data: res.data };
      } catch (err: any) {
        if (err?.response?.status === 404) continue;
        throw err;
      }
    }
    const res = await axiosClient.post<CreateNoteWithAiTagsResponse>(paths[0], payload);
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/notes/ai/create-with-tags/upload (multipart) with backend route fallback */
  createWithAiTagsFromUpload: async (payload: CreateNoteWithAiTagsCommandRequest): Promise<ApiResponse<CreateNoteWithAiTagsResponse>> => {
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
    const paths = ['/api/notes/ai/create-with-tags/upload', '/api/notes/create-with-ai-tags/upload'];
    for (const p of paths) {
      try {
        const res = await axiosClient.post<CreateNoteWithAiTagsResponse>(p, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return { isSuccess: true, data: res.data };
      } catch (err: any) {
        if (err?.response?.status === 404) continue;
        throw err;
      }
    }
    const res = await axiosClient.post<CreateNoteWithAiTagsResponse>(paths[0], formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return { isSuccess: true, data: res.data };
  },
};

export default notesApi;