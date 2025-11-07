/**
 * Feature: AI Tagging
 * Source: RogueLearn.User.Application (SuggestNoteTags*, CommitNoteTagSelections, CreateNoteWithAiTags)
 * Purpose: Support AI-assisted tag suggestions and combined note creation flows.
 */

/** Tag suggestion returned by AI, optionally matched to an existing tag. */
export interface TagSuggestion {
  label: string;
  confidence: number;
  reason?: string;
  matchedTagId?: string;
  matchedTagName?: string;
  isExisting: boolean;
}

/** Tag created as part of AI-assisted flows. */
export interface CreatedTag {
  id: string;
  name: string;
}

/** Query payload to suggest tags for a note or raw text. */
export interface SuggestNoteTagsQueryRequest {
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
  noteId?: string;
  rawText?: string;
  maxTags?: number; // default 10 on backend
}

/** Request payload to suggest tags for uploaded content. */
export interface SuggestNoteTagsFromUploadRequest {
  // Server derives authUserId from the authenticated user; frontend should omit for uploads.
  authUserId?: string;
  // Frontend will send file bytes via multipart; provide a File/Blob
  fileContent: Blob | File | ArrayBuffer | Uint8Array;
  contentType?: string;
  fileName?: string;
  maxTags?: number; // default 10 on backend
}

/** Response payload containing AI tag suggestions. */
export interface SuggestNoteTagsResponse {
  suggestions: TagSuggestion[];
}

/** Command payload to commit selected/created tags for a note. */
export interface CommitNoteTagSelectionsCommandRequest {
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
  noteId: string;
  selectedTagIds?: string[]; // IDs of existing tags selected by the user
  newTagNames?: string[]; // names of new tags to create and attach
}

/** Response payload after committing tag selections for a note. */
export interface CommitNoteTagSelectionsResponse {
  noteId: string;
  addedTagIds: string[];
  createdTags: CreatedTag[];
  totalTagsAssigned: number;
}

/** Command payload for combined note creation with AI tag suggestions. */
export interface CreateNoteWithAiTagsCommandRequest {
  // Server derives authUserId from the authenticated user; frontend may omit.
  authUserId?: string;
  title?: string;
  // Raw text path
  rawText?: string;
  // Upload path
  fileContent?: Blob | File | ArrayBuffer | Uint8Array;
  fileName?: string;
  contentType?: string;
  isPublic?: boolean; // default false
  maxTags?: number; // default 10
  applySuggestions?: boolean; // default true
}

/** Response payload for combined note creation with AI tag suggestions. */
export interface CreateNoteWithAiTagsResponse {
  noteId: string;
  title: string;
  suggestions: TagSuggestion[];
  appliedTagIds: string[];
  createdTags: CreatedTag[];
  totalTagsAssigned: number;
}