"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageSquare, Edit, Trash2, Save, X, Lock } from "lucide-react";
import guildPostsApi from "@/api/guildPostsApi";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildPostDto, GuildPostCommentDto } from "@/types/guild-posts";
import type { GuildMemberDto, GuildRole } from "@/types/guilds";

type Props = { guildId: string; postId: string };

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const WRAP_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/90 via-[#1a0a08]/95 to-black/98 shadow-lg";

export function PostDetailView({ guildId, postId }: Props) {
  const [post, setPost] = useState<GuildPostDto | null>(null);
  const [comments, setComments] = useState<GuildPostCommentDto[]>([]);
  const [loadingPost, setLoadingPost] = useState<boolean>(true);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [composeText, setComposeText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<GuildMemberDto[]>([]);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const commentListRef = useRef<HTMLDivElement | null>(null);

  const isMember = useMemo(() => {
    if (!myAuthUserId) return false;
    return members.some((m) => m.authUserId === myAuthUserId);
  }, [members, myAuthUserId]);

  const likeKey = useMemo(() => (myAuthUserId ? `${myAuthUserId}:${postId}:liked` : null), [myAuthUserId, postId]);

  const reloadPost = async () => {
    setLoadingPost(true);
    try {
      const res = await guildPostsApi.getById(guildId, postId);
      const p = res.data ?? null;
      setPost(p);
      const initialCount = p?.likeCount ?? 0;
      setLikeCount(initialCount);
      if (likeKey) {
        try {
          const stored = sessionStorage.getItem(likeKey);
          setLiked(stored === "1");
        } catch {}
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load post.");
      setPost(null);
    } finally {
      setLoadingPost(false);
    }
  };

  const reloadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await guildPostsApi.getComments(guildId, postId, { page: 1, size: 50, sort: "asc" });
      setComments((res.data ?? []).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load comments.");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.allSettled([
        reloadPost(),
        reloadComments(),
        guildsApi.getMembers(guildId),
        profileApi.getMyProfile(),
      ]).then((results) => {
        if (cancelled) return;
        const membersRes = results[2] as any;
        const profRes = results[3] as any;
        const ms: GuildMemberDto[] = membersRes?.value?.data ?? [];
        setMembers(ms);
        const authId = profRes?.value?.data?.authUserId ?? null;
        setMyAuthUserId(authId);
        const me = ms.find((m) => m.authUserId === authId);
        setMyRole((me?.role as GuildRole) ?? null);
      });
    })();
    return () => {
      cancelled = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId, postId]);

  const disabledForLock = !!post?.isLocked;

  const handleLikeToggle = async () => {
    if (!isMember || disabledForLock) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    try {
      if (!prevLiked) {
        await guildPostsApi.like(guildId, postId);
      } else {
        await guildPostsApi.unlike(guildId, postId);
      }
      if (likeKey) {
        try { sessionStorage.setItem(likeKey, !prevLiked ? "1" : "0"); } catch {}
      }
    } catch (e: any) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const submitComment = async () => {
    if (!composeText.trim() || !isMember || disabledForLock) return;
    setSubmitting(true);
    try {
      const res = await guildPostsApi.createComment(guildId, postId, { content: composeText.trim() });
      const newId = res.data?.commentId;
      setComposeText("");
      await reloadComments();
      if (newId && commentListRef.current) {
        try {
          const el = commentListRef.current.querySelector(`[data-comment-id="${newId}"]`) as HTMLElement | null;
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {}
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c: GuildPostCommentDto) => {
    setEditingId(c.id);
    setEditText(c.content ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId || disabledForLock) return;
    try {
      await guildPostsApi.editComment(guildId, postId, editingId, { content: editText });
      cancelEdit();
      await reloadComments();
    } catch (e: any) {
      setError(e?.message ?? "Failed to edit comment.");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (disabledForLock) return;
    try {
      await guildPostsApi.deleteComment(guildId, postId, commentId);
      await reloadComments();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete comment.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className={WRAP_CLASS} aria-labelledby="post-title" role="article">
        <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
        <CardHeader className="relative border-b border-[#f5c16c]/20">
          {loadingPost ? (
            <Skeleton className="h-6 w-48 bg-white/10" />
          ) : post ? (
            <div className="flex items-center gap-3">
              {post.isLocked && <Lock className="h-5 w-5 text-white/60" aria-label="Post Locked" />}
              <CardTitle id="post-title" className="text-xl text-[#f5c16c]">{post.title}</CardTitle>
            </div>
          ) : (
            <div className="text-sm text-rose-400">{error ?? "Post not found."}</div>
          )}
        </CardHeader>
        <CardContent className="relative space-y-3 pt-6">
          {loadingPost ? (
            <Skeleton className="h-20 w-full bg-white/10" />
          ) : (
            <p className="text-sm leading-relaxed text-white/80">{post?.content}</p>
          )}
          <div className="flex items-center gap-4" role="group" aria-label="Reactions">
            <Button
              onClick={handleLikeToggle}
              disabled={!isMember || disabledForLock}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              className={`flex items-center gap-2 ${liked ? "bg-rose-600 hover:bg-rose-700" : "bg-[#f5c16c] hover:bg-[#d4a855]"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "text-white" : "text-black"}`} />
              <span className={liked ? "text-white" : "text-black"}>{likeCount}</span>
            </Button>
            <div className="flex items-center gap-2 text-white/70" aria-label="Comments count">
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={WRAP_CLASS} aria-labelledby="comments-title" role="region">
        <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
        <CardHeader className="relative border-b border-[#f5c16c]/20">
          <CardTitle id="comments-title" className="text-lg text-[#f5c16c]">Comments</CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#f5c16c]/80">Add a comment</label>
            <Textarea
              aria-label="Add a comment"
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              disabled={!isMember || disabledForLock}
              className="min-h-[100px] border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
              placeholder={disabledForLock ? "This post is locked." : !isMember ? "Join the guild to comment." : "Write your thoughts..."}
            />
            <Button
              onClick={submitComment}
              disabled={submitting || !composeText.trim() || !isMember || disabledForLock}
              className="bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
            >
              Post Comment
            </Button>
          </div>

          <div ref={commentListRef} role="list" aria-label="Comments list" className="space-y-3">
            {loadingComments ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-white/10" />
                ))}
              </>
            ) : comments.length === 0 ? (
              <div className="text-sm text-white/60">No comments yet.</div>
            ) : (
              comments.map((c) => {
                const canEdit = !!myAuthUserId && c.authorId === myAuthUserId;
                const isDeleted = !!c.isDeleted;
                return (
                  <div key={c.id} data-comment-id={c.id} role="listitem" className="rounded border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/60">{new Date(c.createdAt).toLocaleString()}</div>
                      {canEdit && !isDeleted && (
                        <div className="flex items-center gap-2">
                          {editingId === c.id ? (
                            <>
                              <Button size="sm" onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEdit(c)} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteComment(c.id)} className="bg-rose-600 hover:bg-rose-700">
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {isDeleted ? (
                      <div className="text-sm text-white/50 italic">Comment removed</div>
                    ) : editingId === c.id ? (
                      <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="mt-2 min-h-[80px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50" />
                    ) : (
                      <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{c.content}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}