"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Scroll, Edit, Trash2, Save, X } from "lucide-react";
import guildPostsApi from "@/api/guildPostsApi";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildPostDto } from "@/types/guild-posts";
import type { GuildRole } from "@/types/guilds";

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
  const [submitting, setSubmitting] = useState(false);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GuildRole | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

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
      .then(([profileRes, members]) => {
        const authId = profileRes.data?.authUserId ?? null;
        setMyAuthUserId(authId);
        if (authId) {
          const me = members.find((m: any) => m.authUserId === authId);
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
      await guildPostsApi.create({ guildId, authorAuthUserId: myAuthUserId ?? "", request: { title, content } });
      setTitle("");
      setContent("");
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (post: GuildPostDto) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  const saveEdit = async () => {
    if (!guildId || !editingPostId) return;
    try {
      await guildPostsApi.edit({ guildId, postId: editingPostId, authorAuthUserId: myAuthUserId ?? "", request: { title: editTitle, content: editContent } });
      cancelEdit();
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to edit post.");
    }
  };

  const removePost = async (postId: string) => {
    if (!guildId || !myAuthUserId) {
      alert("Missing auth; cannot delete.");
      return;
    }
    try {
      await guildPostsApi.remove({ guildId, postId, requesterAuthUserId: myAuthUserId, force: false });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {myRole && myRole !== "Member" && myRole !== "Recruit" ? (
        <Card className={CREATE_CARD_CLASS}>
          {/* Texture overlay */}
          <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          
          <CardHeader className="relative border-b border-[#f5c16c]/20">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-3">
                <Scroll className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <CardTitle className="text-xl text-[#f5c16c]">Create Guild Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-6">
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
                className="min-h-[120px] border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
              />
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={submitting || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
            >
              <Scroll className="mr-2 h-4 w-4" />
              {submitting ? "Posting..." : "Publish Post"}
            </Button>
          </CardContent>
        </Card>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <CardTitle className="text-lg text-[#f5c16c]">{post.title}</CardTitle>
                )}
              </CardHeader>
              <CardContent className="relative space-y-4 pt-4">
                {editingPostId === post.id ? (
                  <Textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50"
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-white/70">{post.content}</p>
                )}
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}