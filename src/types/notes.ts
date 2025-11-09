/**
 * Feature: Notes
 * Source: RogueLearn.User.Application Features/Notes
 * Purpose: Manage personal/public notes, CRUD operations, uploads, and queries with tags/skills/quests relations.
 */

/** Note DTO used in list/detail views and queries. */
export interface NoteDto {
  id: string;
  authUserId: string;
  title: string;
  content?: string | null;
  isPublic: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  tagIds: string[];
  skillIds: string[];
  questIds: string[];
}

/** Command payload to create a note. */
export interface CreateNoteCommandRequest {
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
  title: string;
  content?: string | null;
  isPublic?: boolean; // default false
  tagIds?: string[] | null;
  skillIds?: string[] | null;
  questIds?: string[] | null;
}

/** Response payload after creating a note. */
export interface CreateNoteResponse {
  id: string;
  authUserId: string;
  title: string;
  content?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Command payload to update an existing note. */
export interface UpdateNoteCommandRequest {
  id: string;
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
  title: string;
  content?: string | null;
  isPublic?: boolean; // default false
  tagIds?: string[] | null;
  skillIds?: string[] | null;
  questIds?: string[] | null;
}

/** Response payload after updating a note. */
export interface UpdateNoteResponse {
  id: string;
  authUserId: string;
  title: string;
  content?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Command payload to delete a note. */
export interface DeleteNoteCommandRequest {
  id: string;
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
}

/** Command payload to create a note from an uploaded file. */
export interface CreateNoteFromUploadCommandRequest {
  // Server derives authUserId from the authenticated user; frontend should omit for uploads.
  authUserId?: string;
  file: File | Blob; // Frontend representation of the Stream
  fileName?: string;
  contentType?: string;
}

// Queries
/** Query payload to list notes for the authenticated user. */
export interface GetMyNotesQueryRequest {
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
  search?: string;
}

/** Response payload for listing current user's notes. */
export type GetMyNotesResponse = NoteDto[];

/** Query payload to fetch a note by identifier. */
export interface GetNoteByIdQueryRequest {
  id: string;
}

/** Response payload for fetching a note by identifier. */
export type GetNoteByIdResponse = NoteDto | null;

/** Query payload to list public notes. */
export interface GetPublicNotesQueryRequest {
  search?: string;
}

/** Response payload for listing public notes. */
export type GetPublicNotesResponse = NoteDto[];