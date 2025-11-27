"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scroll, Edit, Trash2, Save, X, Heart, MessageSquare, Pin, Lock, Unlock, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import guildPostsApi from "@/api/guildPostsApi";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildPostDto } from "@/types/guild-posts";
import type { GuildRole, GuildMemberDto } from "@/types/guilds";

interface GuildPostsSectionProps {
  guildId: string;
}

// RPG Design Constants
const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const POST_CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/90 via-[#1a0a08]/95 to-black/98 shadow-lg transition-all duration-300 hover:border-[#f5c16c]/40 hover:shadow-[0_0_30px_rgba(245,193,108,0.15)]";

const CREATE_CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function GuildPostsSection({ guildId }: GuildPostsSectionProps) {
  const [posts, setPosts] = useState<GuildPostDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [createPreviewUrls, setCreatePreviewUrls] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviewUrls, setEditPreviewUrls] = useState<string[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editRemoveMap, setEditRemoveMap] = useState<Record<string, boolean>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [composeMap, setComposeMap] = useState<Record<string, string>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentsLoadingMap, setCommentsLoadingMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [pendingUploadsMap, setPendingUploadsMap] = useState<Record<string, File[]>>({});
  const [previewUrlsMap, setPreviewUrlsMap] = useState<Record<string, string[]>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [members, setMembers] = useState<GuildMemberDto[]>([]);
  const [commentLikedMap, setCommentLikedMap] = useState<Record<string, boolean>>({});
  const [commentLikeCountMap, setCommentLikeCountMap] = useState<Record<string, number>>({});

  const reload = () => {
    if (!guildId) return;
    setLoading(true);
    guildPostsApi
      .getByGuild(guildId)
      .then((res) => {
        setPosts(res.data ?? []);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch posts", err);
        setError("Failed to load posts.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    Promise.all([
      profileApi.getMyProfile(),
      guildsApi
        .getMembers(guildId)
        .then((res) => res.data ?? [])
        .catch(() => []),
    ])
      .then(([profileRes, loadedMembers]) => {
        const authId = profileRes.data?.authUserId ?? null;
        setMyAuthUserId(authId);
        setMembers(Array.isArray(loadedMembers) ? loadedMembers as GuildMemberDto[] : []);
        if (authId) {
          const me = (loadedMembers as GuildMemberDto[]).find((m) => m.authUserId === authId);
          setMyRole((me?.role as GuildRole) ?? null);
        } else {
          setMyRole(null);
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, [guildId]);

  const handleCreate = async () => {
    if (!guildId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = createFiles.length
        ? await guildPostsApi.createForm(guildId, { title, content }, createFiles)
        : await guildPostsApi.create(guildId, { title, content });
      const newPostId = res.data?.postId;
      setTitle("");
      setContent("");
      setCreateFiles([]);
      setCreatePreviewUrls([]);
      reload();
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSelectFiles = (files: FileList | null) => {
    const arr = (files ? Array.from(files) : []).filter((f) => (f.type || '').startsWith('image/'));
    setCreateFiles(arr);
    const previews: string[] = [];
    for (const f of arr) {
      try { previews.push(URL.createObjectURL(f)); } catch {}
    }
    setCreatePreviewUrls(previews);
  };

  const handleEditSelectFiles = (files: FileList | null) => {
    const arr = (files ? Array.from(files) : []).filter((f) => (f.type || '').startsWith('image/'));
    setEditFiles(arr);
    const previews: string[] = [];
    for (const f of arr) {
      try { previews.push(URL.createObjectURL(f)); } catch {}
    }
    setEditPreviewUrls(previews);
  };

  const startEdit = (post: GuildPostDto) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    try {
      const att: any = post.attachments as any;
      const imgs: any[] = Array.isArray(att?.images) ? att.images : [];
      const normalized = imgs.map((img) => (typeof img === "string" ? img : (img?.url ?? ""))).filter(Boolean);
      setEditExistingImages(normalized);
      setEditRemoveMap({});
    } catch {
      setEditExistingImages([]);
      setEditRemoveMap({});
    }
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
    setEditFiles([]);
    setEditPreviewUrls([]);
    setEditExistingImages([]);
    setEditRemoveMap({});
  };

  const saveEdit = async () => {
    if (!guildId || !editingPostId) return;
    try {
      const keptImages = editExistingImages.filter((src) => !editRemoveMap[src]);
      await guildPostsApi.edit(guildId, editingPostId, { title: editTitle, content: editContent, attachments: { images: keptImages } as any });
      if (editFiles.length) {
        await guildPostsApi.uploadImages(guildId, editingPostId, editFiles);
      }
      cancelEdit();
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to edit post.");
    }
  };

  const removePost = async (postId: string) => {
    if (!guildId) return;
    try {
      await guildPostsApi.remove({ guildId, postId });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  const isMember = myRole !== null;
  const canInteract = !!myRole && myRole !== "Member" && myRole !== "Recruit";

  const toggleExpand = async (post: GuildPostDto) => {
    const id = post.id;
    const next = expandedPostId === id ? null : id;
    setExpandedPostId(next);
    if (next) {
      const key = myAuthUserId ? `${myAuthUserId}:${id}:liked` : null;
      const initialLike = typeof likeCountMap[id] === "number" ? likeCountMap[id] : (post.likeCount ?? 0);
      setLikeCountMap((prev) => ({ ...prev, [id]: initialLike }));
      if (key) {
        try {
          const stored = sessionStorage.getItem(key);
          setLikedMap((prev) => ({ ...prev, [id]: stored === "1" }));
        } catch {}
      }
      if (!commentsMap[id] && !commentsLoadingMap[id]) {
        setCommentsLoadingMap((prev) => ({ ...prev, [id]: true }));
        try {
          const res = await guildPostsApi.getComments(guildId, id, { page: 1, size: 50, sort: "asc" });
          setCommentsMap((prev) => ({ ...prev, [id]: res.data ?? [] }));
        } catch {
          setCommentsMap((prev) => ({ ...prev, [id]: [] }));
        } finally {
          setCommentsLoadingMap((prev) => ({ ...prev, [id]: false }));
        }
      }
    }
  };

  const handleLikeToggle = async (post: GuildPostDto) => {
    if (!canInteract || post.isLocked) return;
    const id = post.id;
    const prevLiked = !!likedMap[id];
    const prevCount = likeCountMap[id] ?? post.likeCount ?? 0;
    setLikedMap((prev) => ({ ...prev, [id]: !prevLiked }));
    const nextCount = prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1;
    setLikeCountMap((prev) => ({ ...prev, [id]: nextCount }));
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likeCount: nextCount } : p)));
    try {
      if (!prevLiked) {
        await guildPostsApi.like(guildId, id);
      } else {
        await guildPostsApi.unlike(guildId, id);
      }
      const key = myAuthUserId ? `${myAuthUserId}:${id}:liked` : null;
      if (key) {
        try { sessionStorage.setItem(key, !prevLiked ? "1" : "0"); } catch {}
      }
    } catch {
      setLikedMap((prev) => ({ ...prev, [id]: prevLiked }));
      setLikeCountMap((prev) => ({ ...prev, [id]: prevCount }));
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likeCount: prevCount } : p)));
    }
  };

  const submitComment = async (post: GuildPostDto) => {
    if (!canInteract || post.isLocked) return;
    const id = post.id;
    const text = (composeMap[id] ?? "").trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await guildPostsApi.createComment(guildId, id, { content: text });
      const res = await guildPostsApi.getComments(guildId, id, { page: 1, size: 50, sort: "asc" });
      setCommentsMap((prev) => ({ ...prev, [id]: res.data ?? [] }));
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, commentCount: (res.data ?? []).length } : p)));
      setComposeMap((prev) => ({ ...prev, [id]: "" }));
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (post: GuildPostDto, parentId: string) => {
    if (!canInteract || post.isLocked) return;
    const id = post.id;
    const text = (replyMap[parentId] ?? "").trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await guildPostsApi.createComment(guildId, id, { content: text, parentCommentId: parentId });
      const res = await guildPostsApi.getComments(guildId, id, { page: 1, size: 50, sort: "asc" });
      setCommentsMap((prev) => ({ ...prev, [id]: res.data ?? [] }));
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, commentCount: (res.data ?? []).length } : p)));
      setReplyMap((prev) => ({ ...prev, [parentId]: "" }));
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const pinPost = async (postId: string) => { try { await guildPostsApi.pin({ guildId, postId }); reload(); } catch {} };
  const unpinPost = async (postId: string) => { try { await guildPostsApi.unpin({ guildId, postId }); reload(); } catch {} };
  const lockPost = async (postId: string) => { try { await guildPostsApi.lock({ guildId, postId }); reload(); } catch {} };
  const unlockPost = async (postId: string) => { try { await guildPostsApi.unlock({ guildId, postId }); reload(); } catch {} };
  const toggleAnnouncement = async (post: GuildPostDto) => {
    if (!myAuthUserId) return;
    const id = post.id;
    const tags = Array.from(new Set([...(post.tags ?? [])]));
    const has = tags.includes("announcement");
    const nextTags = has ? tags.filter((t) => t !== "announcement") : [...tags, "announcement"];
    try {
      await guildPostsApi.edit(guildId, id, { title: post.title, content: post.content, tags: nextTags });
      reload();
    } catch {}
  };

  const handleSelectFiles = (postId: string, files: FileList | null) => {
    const arr = files ? Array.from(files) : [];
    setPendingUploadsMap((prev) => ({ ...prev, [postId]: arr }));
    const previews: string[] = [];
    for (const f of arr) {
      try { previews.push(URL.createObjectURL(f)); } catch {}
    }
    setPreviewUrlsMap((prev) => ({ ...prev, [postId]: previews }));
  };

  const uploadImages = async (postId: string) => {
    const files = pendingUploadsMap[postId] ?? [];
    if (!files.length) return;
    setUploadingMap((prev) => ({ ...prev, [postId]: true }));
    try {
      await guildPostsApi.uploadImages(guildId, postId, files);
      setPendingUploadsMap((prev) => ({ ...prev, [postId]: [] }));
      setPreviewUrlsMap((prev) => ({ ...prev, [postId]: [] }));
      reload();
    } catch {}
    finally {
      setUploadingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const getMemberByAuthId = (authId?: string | null): GuildMemberDto | undefined => {
    if (!authId) return undefined;
    return members.find((m) => m.authUserId === authId);
  };

  const getMemberDisplayName = (m?: GuildMemberDto | null): string | undefined => {
    if (!m) return undefined;
    const username = (m.username ?? "").trim();
    if (username) return username;
    const full = `${(m.firstName ?? "").trim()} ${(m.lastName ?? "").trim()}`.trim();
    if (full) return full;
    const email = (m.email ?? "").trim();
    return email || undefined;
  };

  const sharePost = (post: GuildPostDto) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/community/guilds/${guildId}#posts` : `https://roguelearn.app/community/guilds/${guildId}#posts`;
    const title = post.title;
    const text = post.content;
    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      } catch {}
    };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        (navigator as any).share({ title, text, url }).catch(() => doCopy());
      } else {
        doCopy();
      }
    } catch {
      doCopy();
    }
  };

  return (
    <div className="w-full space-y-6">
      {myRole && myRole !== "Member" && myRole !== "Recruit" ? (
        <div className="flex justify-end">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]">
                <Scroll className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl border-[#f5c16c]/30 bg-[#1a0e0d]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Create Guild Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#f5c16c]/80">Title</label>
                  <Input
                    placeholder="Enter post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#f5c16c]/80">Content</label>
                  <Textarea
                    placeholder="Share your thoughts with the guild..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[140px] border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
                  />
                </div>
                <div className="space-y-2">
                  <input id="create-files" type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleCreateSelectFiles(e.target.files)} />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => document.getElementById("create-files")?.click()} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                      Upload Images
                    </Button>
                  </div>
                  {createPreviewUrls.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {createPreviewUrls.map((src, i) => (
                        <div key={src + i} className="relative h-28 sm:h-32 lg:h-36 w-full overflow-hidden rounded border border-white/10">
                          <Image src={src} alt="preview" fill style={{ objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreate} disabled={submitting || !title.trim() || !content.trim()} className="bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50">
                    <Scroll className="mr-2 h-4 w-4" />
                    {submitting ? "Posting..." : "Publish Post"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Card className={CREATE_CARD_CLASS}>
          {/* Texture overlay */}
          <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          
          <CardHeader className="relative border-b border-[#f5c16c]/20">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-3">
                <Scroll className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <CardTitle className="text-xl text-[#f5c16c]">Guild Posts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-6">
            {myRole === null ? (
              <p className="text-sm text-white/60">You must be a guild member to create posts.</p>
            ) : (
              <p className="text-sm text-white/60">Members can view posts but cannot create or manage posts.</p>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={POST_CARD_CLASS}>
              <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative">
                <Skeleton className="h-6 w-48 bg-white/10" />
              </CardHeader>
              <CardContent className="relative space-y-2">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-2/3 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-[#f5c16c]/20 bg-[#f5c16c]/5 p-8 text-center">
          <Scroll className="mx-auto mb-3 h-12 w-12 text-[#f5c16c]/40" />
          <p className="text-sm text-white/60">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className={POST_CARD_CLASS}>
              {/* Texture overlay */}
              <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              
              <CardHeader className="relative border-b border-[#f5c16c]/10">
                {editingPostId === post.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getMemberByAuthId(post.authorId)?.profileImageUrl ?? undefined} alt={getMemberDisplayName(getMemberByAuthId(post.authorId)) ?? ""} />
                        <AvatarFallback>{(getMemberDisplayName(getMemberByAuthId(post.authorId)) ?? "").slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base text-white">{getMemberDisplayName(getMemberByAuthId(post.authorId)) ?? "Member"}</CardTitle>
                          {post.isPinned && <Pin className="h-3.5 w-3.5 text-amber-300" />}
                          {post.isLocked && <Lock className="h-3.5 w-3.5 text-white/70" />}
                          {(Array.isArray(post.tags) ? post.tags : []).includes("announcement") && <Scroll className="h-3.5 w-3.5 text-emerald-300" />}
                        </div>
                        <div className="text-[11px] text-white/60">{new Date(post.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleExpand(post)} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        {expandedPostId === post.id ? "Hide" : "Comments"}
                      </Button>
                      {myRole && (myRole === "GuildMaster" || myRole === "Officer") ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1a0a08] border-[#f5c16c]/20">
                            {post.isPinned ? (
                              <DropdownMenuItem onClick={() => unpinPost(post.id)} className="text-white/80">
                                <Pin className="h-4 w-4" /> Unpin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => pinPost(post.id)} className="text-white/80">
                                <Pin className="h-4 w-4" /> Pin
                              </DropdownMenuItem>
                            )}
                            {post.isLocked ? (
                              <DropdownMenuItem onClick={() => unlockPost(post.id)} className="text-white/80">
                                <Unlock className="h-4 w-4" /> Unlock
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => lockPost(post.id)} className="text-white/80">
                                <Lock className="h-4 w-4" /> Lock
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toggleAnnouncement(post)} className="text-white/80">
                              <Scroll className="h-4 w-4" /> Announcement
                            </DropdownMenuItem>
                            
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="relative space-y-4 pt-4">
                {editingPostId === post.id ? (
                  <>
                    <Textarea 
                      value={editContent} 
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
                    />
                    {(() => {
                      const imgs = editExistingImages;
                      return imgs.length ? (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {imgs.map((src, i) => (
                              <div key={src + i} className="relative h-28 sm:h-32 lg:h-36 w-full overflow-hidden rounded border border-white/10">
                                {src ? <Image src={src} alt="existing" fill style={{ objectFit: "cover" }} /> : null}
                                <button
                                  type="button"
                                  onClick={() => setEditRemoveMap((prev) => ({ ...prev, [src]: !prev[src] }))}
                                  className={`absolute top-2 right-2 rounded px-2 py-1 text-xs ${editRemoveMap[src] ? 'bg-rose-600 text-white' : 'bg-black/60 text-white'}`}
                                  aria-pressed={!!editRemoveMap[src]}
                                >
                                  {editRemoveMap[src] ? 'Will Remove' : 'Remove'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    <div className="mt-3 space-y-2">
                      <input id={`edit-files-${post.id}`} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleEditSelectFiles(e.target.files)} />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => document.getElementById(`edit-files-${post.id}`)?.click()} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                          Upload Images
                        </Button>
                      </div>
                      {editPreviewUrls.length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {editPreviewUrls.map((src, i) => (
                            <div key={src + i} className="relative h-28 sm:h-32 lg:h-36 w-full overflow-hidden rounded border border-white/10">
                              <Image src={src} alt="preview" fill style={{ objectFit: "cover" }} />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-white">{post.title}</p>
                    <p className="text-sm leading-relaxed text-white/70">{post.content}</p>
                    {(() => {
                      const att: any = post.attachments as any;
                      const imgs: any[] = Array.isArray(att?.images) ? att.images : [];
                      return imgs.length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {imgs.map((img, i) => {
                            const src = typeof img === "string" ? img : (img?.url ?? "");
                            return (
                              <div key={src + i} className="relative h-40 w-full overflow-hidden rounded border border-white/10">
                                {src ? <Image src={src} alt={post.title} fill style={{ objectFit: "cover" }} /> : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null;
                    })()}
                  </>
                )}
                <div className="flex items-center gap-4 pt-1 text-white/70">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{(expandedPostId === post.id ? likeCountMap[post.id] : post.likeCount) ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{(expandedPostId === post.id ? (commentsMap[post.id]?.length ?? 0) : post.commentCount) ?? 0}</span>
                  </div>
                  <div className="ml-auto">
                    <Button size="sm" variant="outline" onClick={() => sharePost(post)} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                      <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {editingPostId === post.id ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={saveEdit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEdit}
                        className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {myRole && myRole !== "Member" && myRole !== "Recruit" ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEdit(post)}
                            className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => removePost(post.id)}
                            className="bg-rose-600 hover:bg-rose-700"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </>
                      ) : null}
                      <Button 
                        size="sm" 
                        onClick={() => handleLikeToggle(post)}
                        disabled={!canInteract || post.isLocked}
                        className={`${likedMap[post.id] ? "bg-rose-600 hover:bg-rose-700" : "bg-linear-to-r from-[#f5c16c] to-[#d4a855] hover:from-[#d4a855] hover:to-[#f5c16c]"} text-black font-medium`}
                      >
                        <Heart className="mr-1.5 h-3.5 w-3.5" />
                        {likedMap[post.id] ? "Unlike" : "Like"}
                      </Button>
                    </>
                  )}
                </div>
                {expandedPostId === post.id ? (
                  <div className="mt-4 space-y-3">
                    {previewUrlsMap[post.id]?.length ? (
                      <div className="grid grid-cols-3 gap-2">
                        {previewUrlsMap[post.id].map((src, i) => (
                          <div key={src + i} className="relative h-24 w-full overflow-hidden rounded border border-white/10">
                            <Image src={src} alt="preview" fill style={{ objectFit: "cover" }} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <Textarea 
                      value={composeMap[post.id] ?? ""}
                      onChange={(e) => setComposeMap((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      disabled={!canInteract || post.isLocked}
                      className="min-h-[80px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
                      placeholder={post.isLocked ? "This post is locked." : !canInteract ? "Insufficient role to comment." : "Write a comment..."}
                    />
                    <Button 
                      onClick={() => submitComment(post)}
                      disabled={submitting || !(composeMap[post.id] ?? "").trim() || !canInteract || post.isLocked}
                      className="bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
                    >
                      Post Comment
                    </Button>
                    {commentsLoadingMap[post.id] ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full bg-white/10" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(commentsMap[post.id] ?? []).length === 0 ? (
                          <div className="text-sm text-white/60">No comments yet.</div>
                        ) : (
                          (commentsMap[post.id] ?? []).filter((c) => !c.parentCommentId).map((c) => {
                            const canEdit = !!myAuthUserId && c.authorId === myAuthUserId;
                            const canDelete = canEdit || (myRole === "GuildMaster" || myRole === "Officer");
                            const isDeleted = !!c.isDeleted;
                            const children = (commentsMap[post.id] ?? []).filter((cc) => cc.parentCommentId === c.id);
                            return (
                              <div key={c.id} className="rounded border border-white/10 bg-white/5 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-white/60">{new Date(c.createdAt).toLocaleString()}</div>
                                  {!isDeleted && (
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setCommentLikedMap((prev) => ({ ...prev, [c.id]: !prev[c.id] }))} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                        <Heart className="mr-1.5 h-3.5 w-3.5" /> {(commentLikeCountMap[c.id] ?? 0) + (commentLikedMap[c.id] ? 1 : 0)}
                                      </Button>
                                      {canEdit && (
                                        <Button size="sm" variant="outline" onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content ?? ""); }} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                          <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                                        </Button>
                                      )}
                                      {canDelete && (
                                        <Button size="sm" variant="destructive" onClick={async () => { try { await guildPostsApi.deleteComment(guildId, post.id, c.id); const res = await guildPostsApi.getComments(guildId, post.id, { page: 1, size: 50, sort: "asc" }); setCommentsMap((prev) => ({ ...prev, [post.id]: res.data ?? [] })); setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, commentCount: (res.data ?? []).length } : p))); } catch {} }} className="bg-rose-600 hover:bg-rose-700">
                                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {isDeleted ? (
                                  <div className="text-sm text-white/50 italic">Comment removed</div>
                                ) : editingCommentId === c.id ? (
                                  <div className="space-y-2">
                                    <Textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="min-h-[60px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50" />
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" onClick={async () => { try { await guildPostsApi.editComment(guildId, post.id, c.id, { content: editCommentText }); setEditingCommentId(null); const res = await guildPostsApi.getComments(guildId, post.id, { page: 1, size: 50, sort: "asc" }); setCommentsMap((prev) => ({ ...prev, [post.id]: res.data ?? [] })); } catch {} }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => { setEditingCommentId(null); setEditCommentText(""); }} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                        <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{c.content}</p>
                                )}
                                <div className="mt-3 space-y-2 ml-4 border-l-2 border-white/10 pl-3">
                                  {children.map((child) => (
                                    <div key={child.id} className="rounded border border-white/10 bg-white/5 p-2">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs text-white/60">{new Date(child.createdAt).toLocaleString()}</div>
                                        <div className="flex items-center gap-2">
                                          <Button size="sm" variant="outline" onClick={() => setCommentLikedMap((prev) => ({ ...prev, [child.id]: !prev[child.id] }))} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                            <Heart className="mr-1.5 h-3.5 w-3.5" /> {(commentLikeCountMap[child.id] ?? 0) + (commentLikedMap[child.id] ? 1 : 0)}
                                          </Button>
                                          {((!!myAuthUserId && child.authorId === myAuthUserId) || (myRole === "GuildMaster" || myRole === "Officer")) && (
                                            <Button size="sm" variant="destructive" onClick={async () => { try { await guildPostsApi.deleteComment(guildId, post.id, child.id); const res = await guildPostsApi.getComments(guildId, post.id, { page: 1, size: 50, sort: "asc" }); setCommentsMap((prev) => ({ ...prev, [post.id]: res.data ?? [] })); setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, commentCount: (res.data ?? []).length } : p))); } catch {} }} className="bg-rose-600 hover:bg-rose-700">
                                              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-sm text-white/80 whitespace-pre-wrap">{child.content}</p>
                                    </div>
                                  ))}
                                  <div className="space-y-2">
                                    <Textarea value={replyMap[c.id] ?? ""} onChange={(e) => setReplyMap((prev) => ({ ...prev, [c.id]: e.target.value }))} disabled={!canInteract || post.isLocked} className="min-h-[60px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50" placeholder={post.isLocked ? "This post is locked." : !canInteract ? "Insufficient role to comment." : "Write a reply..."} />
                                    <Button size="sm" onClick={() => submitReply(post, c.id)} disabled={submitting || !(replyMap[c.id] ?? "").trim() || !canInteract || post.isLocked} className="bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50">Reply</Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}