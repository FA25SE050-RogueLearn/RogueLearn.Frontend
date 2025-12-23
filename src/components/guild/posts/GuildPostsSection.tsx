"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scroll, Edit, Trash2, Save, X, Heart, MessageSquare, Pin, Share2, MoreHorizontal, ArrowRight } from "lucide-react";
import Image from "next/image";
import guildPostsApi from "@/api/guildPostsApi";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildPostDto } from "@/types/guild-posts";
import type { GuildRole, GuildMemberDto } from "@/types/guilds";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

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
  const [tags, setTags] = useState("");
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [createPreviewUrls, setCreatePreviewUrls] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
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
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

  const reload = () => {
    if (!guildId) return;
    setLoading(true);
    guildPostsApi
      .getByGuild(guildId, { size: 50 })
      .then((res) => {
        const data = res.data ?? [];
        // Sort by pinned first, then by date descending
        data.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setPosts(data);
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

  const pageCount = useMemo(() => Math.max(1, Math.ceil((posts.length || 0) / pageSize)), [posts.length]);
  const safePage = useMemo(() => Math.min(Math.max(1, page), pageCount), [page, pageCount]);
  const pagedPosts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return posts.slice(start, end);
  }, [posts, safePage]);

  const pinnedPosts = useMemo(() => posts.filter((p) => p.isPinned), [posts]);

  const scrollToPost = (id: string) => {
    const el = document.getElementById(`post-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setExpandedPostId(id);
    }
  };

  const handleCreate = async () => {
    if (!guildId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const parsedTags = tags.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
      const res = createFiles.length
        ? await guildPostsApi.createForm(guildId, { title, content, tags: parsedTags }, createFiles)
        : await guildPostsApi.create(guildId, { title, content, tags: parsedTags });
      const newPostId = res.data?.postId;
      setTitle("");
      setContent("");
      setTags("");
      setCreateFiles([]);
      setCreatePreviewUrls([]);
      reload();
      setCreateOpen(false);
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSelectFiles = (files: FileList | null) => {
    const raw = files ? Array.from(files) : [];
    const validFiles: File[] = [];
    let hasLargeFile = false;

    for (const f of raw) {
      if (!(f.type || '').startsWith('image/')) continue;
      if (f.size > 10 * 1024 * 1024) {
        hasLargeFile = true;
        continue;
      }
      validFiles.push(f);
    }

    if (hasLargeFile) {
      toast.error("Images larger than 10MB are not allowed.");
    }

    setCreateFiles(validFiles);
    const previews: string[] = [];
    for (const f of validFiles) {
      try { previews.push(URL.createObjectURL(f)); } catch {}
    }
    setCreatePreviewUrls(previews);
  };

  const handleEditSelectFiles = (files: FileList | null) => {
    const raw = files ? Array.from(files) : [];
    const validFiles: File[] = [];
    let hasLargeFile = false;

    for (const f of raw) {
      if (!(f.type || '').startsWith('image/')) continue;
      if (f.size > 10 * 1024 * 1024) {
        hasLargeFile = true;
        continue;
      }
      validFiles.push(f);
    }

    if (hasLargeFile) {
      toast.error("Images larger than 10MB are not allowed.");
    }

    setEditFiles(validFiles);
    const previews: string[] = [];
    for (const f of validFiles) {
      try { previews.push(URL.createObjectURL(f)); } catch {}
    }
    setEditPreviewUrls(previews);
  };

  const startEdit = (post: GuildPostDto) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTags((post.tags ?? []).join(", "));
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
    setEditTags("");
    setEditFiles([]);
    setEditPreviewUrls([]);
    setEditExistingImages([]);
    setEditRemoveMap({});
  };

  const saveEdit = async () => {
    if (!guildId || !editingPostId) return;
    try {
      const keptImages = editExistingImages.filter((src) => !editRemoveMap[src]);
      const parsedTags = editTags.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
      await guildPostsApi.edit(guildId, editingPostId, { 
        title: editTitle, 
        content: editContent, 
        tags: parsedTags,
        attachments: { images: keptImages } as any 
      });
      if (editFiles.length) {
        await guildPostsApi.uploadImages(guildId, editingPostId, editFiles);
      }
      cancelEdit();
      reload();
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to edit post.");
    }
  };

  const removePost = async (postId: string) => {
    if (!guildId) return;
    try {
      await guildPostsApi.remove({ guildId, postId });
      reload();
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to delete post.");
    }
  };

  const isMember = myRole !== null;
  const canManagePosts = myRole === "GuildMaster";
  const canInteract = !!myRole;

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

  const pinPost = async (postId: string) => {
    try {
      await guildPostsApi.pin({ guildId, postId });
      toast.success("Post pinned");
      reload();
    } catch {
      toast.error("Failed to pin post");
    }
  };

  const unpinPost = async (postId: string) => {
    try {
      await guildPostsApi.unpin({ guildId, postId });
      toast.success("Post unpinned");
      reload();
    } catch {
      toast.error("Failed to unpin post");
    }
  };
  const toggleAnnouncement = async (post: GuildPostDto) => {
    if (!canManagePosts) return;
    const id = post.id;
    try {
      if (post.isAnnouncement) {
        await guildPostsApi.unsetAnnouncement(guildId, id);
      } else {
        await guildPostsApi.setAnnouncement(guildId, id);
      }
      reload();
    } catch {}
  };

  const handleSelectFiles = (postId: string, files: FileList | null) => {
    const raw = files ? Array.from(files) : [];
    const validFiles: File[] = [];
    let hasLargeFile = false;

    for (const f of raw) {
      if (f.size > 10 * 1024 * 1024) {
        hasLargeFile = true;
        continue;
      }
      validFiles.push(f);
    }

    if (hasLargeFile) {
      toast.error("Images larger than 10MB are not allowed.");
    }

    setPendingUploadsMap((prev) => ({ ...prev, [postId]: validFiles }));
    const previews: string[] = [];
    for (const f of validFiles) {
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
        toast.success("Link copied");
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
      {/* Pinned Posts Section */}
      {pinnedPosts.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-[#f5c16c]">
            <Pin className="h-4 w-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Pinned Posts</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedPosts.map((post) => {
              const coverImage = (() => {
                const att = post.attachments as any;
                if (att?.images && Array.isArray(att.images) && att.images.length > 0) {
                  const first = att.images[0];
                  return typeof first === 'string' ? first : first.url;
                }
                return null;
              })();

              return (
                <div
                  key={post.id}
                  onClick={() => scrollToPost(post.id)}
                  className="group cursor-pointer flex flex-col overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-[#1a0a08] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#f5c16c]/40 hover:shadow-[0_10px_30px_rgba(245,193,108,0.1)]"
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/50">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f5c16c]/10 via-[#2d1810] to-black flex items-center justify-center">
                        <Pin className="h-12 w-12 text-[#f5c16c]/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 rounded bg-[#f5c16c] px-2 py-1 text-[10px] font-bold text-black uppercase tracking-wider">
                      Pinned
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#f5c16c]/80">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    
                    <h3 className="mb-3 text-xl font-bold leading-tight text-white group-hover:text-[#f5c16c] transition-colors">
                      {post.title}
                    </h3>

                    <div className="mb-6 flex-1 text-sm text-white/60 line-clamp-3">
                      <ReactMarkdown
                         components={{
                           p: ({node, ...props}) => <p className="mb-1" {...props} />,
                           a: ({node, ...props}) => <span {...props} />,
                           img: () => null,
                           h1: ({node, ...props}) => <strong {...props} />,
                           h2: ({node, ...props}) => <strong {...props} />,
                           h3: ({node, ...props}) => <strong {...props} />,
                         }}
                      >
                         {post.content}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#f5c16c] group-hover:underline">
                      <div className="rounded-full border border-[#f5c16c] p-1">
                         <ArrowRight className="h-3 w-3" />
                      </div>
                      Find out more
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {canManagePosts ? (
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
                  <label className="text-sm font-medium text-[#f5c16c]/80">Tags (separated by space or comma)</label>
                  <Input
                    placeholder="e.g. #update #event #general"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#f5c16c]/80">Content</label>
                  <Textarea
                    placeholder="Share your thoughts with the guild... (Markdown supported)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
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
              <p className="text-sm text-white/60">You must be a guild member to interact with posts.</p>
            ) : (
              <p className="text-sm text-white/60">Members can comment and like posts; post management is reserved for the Guild Master.</p>
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
          {pagedPosts.map((post) => (
            <Card key={post.id} id={`post-${post.id}`} className={POST_CARD_CLASS}>
              {/* Texture overlay */}
              <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              
              <CardHeader className="relative border-b border-[#f5c16c]/10">
                {editingPostId === post.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
                      placeholder="Title"
                    />
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
                      placeholder="Tags"
                    />
                  </div>
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
                          {post.isLocked && <div className="hidden" />} {/* Hidden lock icon */}
                          {(post.isAnnouncement || (Array.isArray(post.tags) ? post.tags : []).includes("announcement")) && <Scroll className="h-3.5 w-3.5 text-emerald-300" />}
                        </div>
                        <div className="text-[11px] text-white/60">{new Date(post.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleExpand(post)} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        {expandedPostId === post.id ? "Hide" : "Comments"}
                      </Button>
                      {canManagePosts ? (
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
                            {/* Lock options removed */}
                            <DropdownMenuItem onClick={() => toggleAnnouncement(post)} className="text-white/80">
                              <Scroll className="h-4 w-4" /> {(post.isAnnouncement || post.tags?.includes('announcement')) ? "Unset Announcement" : "Set as Announcement"}
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
                      className="min-h-[200px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
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
                    <div className="text-sm leading-relaxed text-white/70 markdown-content">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-2 mb-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-2 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold mt-2 mb-1" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#f5c16c]/50 pl-2 italic my-2 text-white/60" {...props} />,
                          a: ({node, ...props}) => <a className="text-[#f5c16c] hover:underline" {...props} />,
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>
                    </div>
                    {/* Tags Display */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs text-[#f5c16c] bg-[#f5c16c]/10 px-2 py-0.5 rounded-full">
                            #{tag.startsWith("#") ? tag.slice(1) : tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const att: any = post.attachments as any;
                      const imgs: any[] = Array.isArray(att?.images) ? att.images : [];
                      return imgs.length ? (
                        <div className="flex flex-wrap gap-4 mt-4">
                          {imgs.map((img, i) => {
                            const src = typeof img === "string" ? img : (img?.url ?? "");
                            if (!src) return null;
                            return (
                              <div 
                                key={src + i} 
                                className="relative overflow-hidden rounded-xl border-2 border-[#f5c16c]/30 bg-black/50 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,193,108,0.2)]"
                              >
                                <img 
                                  src={src} 
                                  alt={post.title} 
                                  className="max-h-[500px] w-auto max-w-full object-contain"
                                  loading="lazy"
                                />
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
                      {canManagePosts ? (
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
                            const canDelete = canEdit || canManagePosts;
                            const isDeleted = !!c.isDeleted;
                            const children = (commentsMap[post.id] ?? []).filter((cc) => cc.parentCommentId === c.id);
                            const display = (c.authorUsername ?? "").trim() || (c.authorEmail ?? "").trim() || c.authorId;
                            const initials = ((display.match(/\b\w/g) || []).slice(0, 2).join("") || display.charAt(0)).toUpperCase();
                            return (
                              <div key={c.id} className="rounded border border-white/10 bg-white/5 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 rounded-lg border border-[#f5c16c]/30">
                                      <AvatarImage className="object-cover" src={c.authorProfileImageUrl ?? undefined} alt={display} />
                                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#d23187] to-[#f5c16c] text-white text-xs font-bold">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col leading-tight">
                                      <span className="text-sm font-medium text-white">{display}</span>
                                      <span className="text-xs text-white/60">{new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                  </div>
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
                                  <div className="text-sm text-white/50 italic">Comment deleted</div>
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
                                        <div className="flex items-center gap-2">
                                          {(() => {
                                            const childDisplay = (child.authorUsername ?? "").trim() || (child.authorEmail ?? "").trim() || child.authorId;
                                            const childInitials = ((childDisplay.match(/\b\w/g) || []).slice(0, 2).join("") || childDisplay.charAt(0)).toUpperCase();
                                            return (
                                              <>
                                                <Avatar className="h-7 w-7 rounded-lg border border-[#f5c16c]/30">
                                                  <AvatarImage src={child.authorProfileImageUrl ?? undefined} alt={childDisplay} />
                                                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#d23187] to-[#f5c16c] text-white text-[10px] font-bold">{childInitials}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col leading-tight">
                                                  <span className="text-xs font-medium text-white">{childDisplay}</span>
                                                  <span className="text-[10px] text-white/60">{new Date(child.createdAt).toLocaleString()}</span>
                                                </div>
                                              </>
                                            );
                                          })()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {!child.isDeleted && (
                                            <>
                                              <Button size="sm" variant="outline" onClick={() => setCommentLikedMap((prev) => ({ ...prev, [child.id]: !prev[child.id] }))} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
                                                <Heart className="mr-1.5 h-3.5 w-3.5" /> {(commentLikeCountMap[child.id] ?? 0) + (commentLikedMap[child.id] ? 1 : 0)}
                                              </Button>
                                              {((!!myAuthUserId && child.authorId === myAuthUserId) || canManagePosts) && (
                                                <Button size="sm" variant="destructive" onClick={async () => { try { await guildPostsApi.deleteComment(guildId, post.id, child.id); const res = await guildPostsApi.getComments(guildId, post.id, { page: 1, size: 50, sort: "asc" }); setCommentsMap((prev) => ({ ...prev, [post.id]: res.data ?? [] })); setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, commentCount: (res.data ?? []).length } : p))); } catch {} }} className="bg-rose-600 hover:bg-rose-700">
                                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                                                </Button>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {child.isDeleted ? (
                                        <div className="text-sm text-white/50 italic">Comment deleted</div>
                                      ) : (
                                        <p className="text-sm text-white/80 whitespace-pre-wrap">{child.content}</p>
                                      )}
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
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-white/70">
              <span>Showing {(safePage - 1) * pageSize + 1}–{Math.min(posts.length, safePage * pageSize)} of {posts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={`border-[#f5c16c]/30 ${safePage===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</Button>
              <span className="text-xs text-white/70">Page {safePage} of {pageCount}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className={`border-[#f5c16c]/30 ${safePage===pageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
