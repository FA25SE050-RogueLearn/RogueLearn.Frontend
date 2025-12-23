/**
 * Feature: Guild Posts
 * Purpose: Manage posts within guilds including authoring, moderation, and queries.
 * Mapping Rules:
 * - Guid -> string
 * - DateTimeOffset -> string (ISO 8601)
 * - IEnumerable<T> -> T[]
 * - Dictionary<string, object> -> Record<string, unknown>
 */

/** Moderation status of a guild post. */
export type GuildPostStatus = 'published' | 'pending' | 'rejected';

/** Guild post DTO used in listings and detail views. */
export interface GuildPostDto {
  id: string;
  guildId: string;
  authorId: string;
  title: string;
  content: string;
  tags?: string[] | null;
  attachments?: Record<string, unknown> | null;
  isPinned: boolean;
  isAnnouncement?: boolean;
  isLocked: boolean;
  status: GuildPostStatus;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  commentCount?: number;
  reactionCounts?: Record<string, number> | null;
}

/** Request model for creating a guild post. */
export interface CreateGuildPostRequest {
  title: string;
  content: string;
  tags?: string[] | null;
  attachments?: Record<string, unknown> | null;
  images?: GuildPostImageDto[] | null;
}

/** Command payload to create a guild post. */
export interface CreateGuildPostCommandRequest {
  guildId: string;
  request: CreateGuildPostRequest;
}

/** Response containing the created post id. */
export interface CreateGuildPostResponse {
  postId: string;
}

/** Request model to edit an existing guild post. */
export interface EditGuildPostRequest {
  title: string;
  content: string;
  tags?: string[] | null;
  attachments?: Record<string, unknown> | null;
  images?: GuildPostImageDto[] | null;
}

/** Command payload to edit a guild post. */
export interface EditGuildPostCommandRequest {
  guildId: string;
  postId: string;
  request: EditGuildPostRequest;
}
export type EditGuildPostResponse = void;

/** Command payload to delete a guild post. */
export interface DeleteGuildPostCommandRequest {
  guildId: string;
  postId: string;
}
export type DeleteGuildPostResponse = void;

/** Command payload to pin a guild post. */
export interface PinGuildPostCommandRequest {
  guildId: string;
  postId: string;
}
export type PinGuildPostResponse = void;

/** Command payload to unpin a guild post. */
export interface UnpinGuildPostCommandRequest {
  guildId: string;
  postId: string;
}
export type UnpinGuildPostResponse = void;

/** Command payload to lock a guild post. */
export interface LockGuildPostCommandRequest {
  guildId: string;
  postId: string;
}
export type LockGuildPostResponse = void;

/** Command payload to unlock a guild post. */
export interface UnlockGuildPostCommandRequest {
  guildId: string;
  postId: string;
}
export type UnlockGuildPostResponse = void;

/** Command payload to approve a pending guild post. */
export interface ApproveGuildPostCommandRequest {
  guildId: string;
  postId: string;
  note?: string | null;
}
export type ApproveGuildPostResponse = void;

/** Command payload to reject a pending guild post. */
export interface RejectGuildPostCommandRequest {
  guildId: string;
  postId: string;
  reason?: string | null;
}
export type RejectGuildPostResponse = void;

// Queries
/** Query payload to list guild posts with optional filters. */
export interface GetGuildPostsQueryRequest {
  guildId: string;
  tag?: string | null;
  authorId?: string | null;
  pinned?: boolean | null;
  search?: string | null;
  page?: number;
  size?: number;
}
export type GetGuildPostsResponse = GuildPostDto[];

/** Query payload to fetch a single guild post by id. */
export interface GetGuildPostByIdQueryRequest {
  guildId: string;
  postId: string;
}
export type GetGuildPostByIdResponse = GuildPostDto | null;

/** Query payload to fetch pinned guild posts. */
export interface GetPinnedGuildPostsQueryRequest {
  guildId: string;
}
export type GetPinnedGuildPostsResponse = GuildPostDto[];

export interface GuildPostCommentDto {
  id: string;
  guildId: string;
  postId: string;
  parentCommentId?: string | null;
  authorId: string;
  authorUsername?: string | null;
  authorEmail?: string | null;
  authorProfileImageUrl?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface CreateGuildPostCommentRequest {
  content: string;
  parentCommentId?: string | null;
}

export interface CreateGuildPostCommentResponse {
  commentId: string;
}

export interface EditGuildPostCommentRequest {
  content: string;
}

export interface GetGuildPostCommentsQueryRequest {
  guildId: string;
  postId: string;
  page?: number;
  size?: number;
  sort?: string | null;
}
export type GetGuildPostCommentsResponse = GuildPostCommentDto[];

export type LikeGuildPostResponse = void;
export type UnlikeGuildPostResponse = void;

export interface ForceDeleteGuildPostCommandRequest {
  guildId: string;
  postId: string;
}
export type ForceDeleteGuildPostResponse = void;

export interface ForceDeleteGuildPostCommentCommandRequest {
  guildId: string;
  postId: string;
  commentId: string;
}
export type ForceDeleteGuildPostCommentResponse = void;

/** Guild post image DTO */
export interface GuildPostImageDto {
  id?: string;
  url?: string;
  fileName?: string;
  contentType?: string;
}

/** Response after uploading images to a post */
export interface UploadGuildPostImagesResponse {
  images: GuildPostImageDto[];
}
