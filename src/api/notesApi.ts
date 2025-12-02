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
  // =================================================================
  // NOTES (NotesController)
  // =================================================================

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
    axiosClient.delete<void>(`/api/notes/${payload.id}`).then(() => {}),

  /** POST /api/notes/upload-and-create */
  createFromUpload: (payload: CreateNoteFromUploadCommandRequest): Promise<ApiResponse<CreateNoteResponse>> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.fileName) formData.append('fileName', payload.fileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    return axiosClient.post<CreateNoteResponse>('/api/notes/upload-and-create', formData).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },

  // --- AI Tagging ---
  /** POST /api/ai/tagging/suggest */
  suggestTags: async (payload: SuggestNoteTagsQueryRequest): Promise<ApiResponse<SuggestNoteTagsResponse>> => {
    const res = await axiosClient.post<SuggestNoteTagsResponse>('/api/ai/tagging/suggest', payload);
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/ai/tagging/suggest-upload (multipart) */
  suggestTagsFromUpload: async (payload: SuggestNoteTagsFromUploadRequest): Promise<ApiResponse<SuggestNoteTagsResponse>> => {
    const formData = new FormData();
    const fileBlob = payload.fileContent instanceof Blob ? payload.fileContent : new Blob([payload.fileContent as any]);
    formData.append('file', fileBlob);
    if (payload.fileName) formData.append('fileName', payload.fileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    if (payload.maxTags != null) formData.append('maxTags', String(payload.maxTags));
    const res = await axiosClient.post<SuggestNoteTagsResponse>('/api/ai/tagging/suggest-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/ai/tagging/commit */
  commitTagSelections: async (payload: CommitNoteTagSelectionsCommandRequest): Promise<ApiResponse<CommitNoteTagSelectionsResponse>> => {
    const res = await axiosClient.post<CommitNoteTagSelectionsResponse>('/api/ai/tagging/commit', payload);
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/notes/create-with-ai-tags */
  createWithAiTagsFromText: async (payload: Omit<CreateNoteWithAiTagsCommandRequest, 'fileContent' | 'fileName' | 'contentType'>): Promise<ApiResponse<CreateNoteWithAiTagsResponse>> => {
    const res = await axiosClient.post<CreateNoteWithAiTagsResponse>('/api/notes/create-with-ai-tags', payload);
    return { isSuccess: true, data: res.data };
  },

  /** POST /api/notes/create-with-ai-tags/upload (multipart) */
  createWithAiTagsFromUpload: async (payload: CreateNoteWithAiTagsCommandRequest): Promise<ApiResponse<CreateNoteWithAiTagsResponse>> => {
    const formData = new FormData();
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
    const res = await axiosClient.post<CreateNoteWithAiTagsResponse>('/api/notes/create-with-ai-tags/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return { isSuccess: true, data: res.data };
  },
};

export default notesApi;