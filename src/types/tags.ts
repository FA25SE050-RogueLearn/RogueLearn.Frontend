/**
 * Feature: Tags
 * Source: RogueLearn.User.Application Features/Tags
 * Purpose: Manage user-defined tags and their association with notes.
 * Mapping:
 * - Guid -> string (UUID)
 * - DateTimeOffset -> string (ISO timestamp)
 */

/** Tag entity used for categorizing notes and content. */
export interface Tag {
  id: string;
  name: string;
}

/** Command payload to create a tag. */
export interface CreateTagCommandRequest {
  authUserId: string;
  name: string;
}

/** Response payload containing the created tag. */
export interface CreateTagResponse {
  tag: Tag;
}

/** Query payload to list tags created/owned by the authenticated user. */
export interface GetMyTagsQueryRequest {
  authUserId: string;
  search?: string;
}

/** Response payload listing user's tags. */
export interface GetMyTagsResponse {
  tags: Tag[];
}

/** Command payload to attach a tag to a note. */
export interface AttachTagToNoteCommandRequest {
  authUserId: string;
  noteId: string;
  tagId: string;
}

/** Response payload after attaching a tag to a note. */
export interface AttachTagToNoteResponse {
  noteId: string;
  tag: Tag;
  alreadyAttached: boolean;
}

/** Command payload to remove a tag from a note. */
export interface RemoveTagFromNoteCommandRequest {
  authUserId: string;
  noteId: string;
  tagId: string;
}

/** Query payload to list tags attached to a specific note. */
export interface GetTagsForNoteQueryRequest {
  authUserId: string;
  noteId: string;
}

/** Response payload listing tags for a specific note. */
export interface GetTagsForNoteResponse {
  noteId: string;
  tags: Tag[];
}

/** Command payload to create a tag and immediately attach it to a note. */
export interface CreateTagAndAttachToNoteCommandRequest {
  authUserId: string;
  noteId: string;
  name: string;
}

/** Response payload after creating a tag and attaching it to a note. */
export interface CreateTagAndAttachToNoteResponse {
  noteId: string;
  tag: Tag;
  createdNewTag: boolean;
}