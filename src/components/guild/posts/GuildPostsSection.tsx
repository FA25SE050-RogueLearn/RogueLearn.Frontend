"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import guildPostsApi from "@/api/guildPostsApi";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildPostDto } from "@/types/guild-posts";
import type { GuildRole } from "@/types/guilds";

interface GuildPostsSectionProps {
  guildId: string;
}

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
        <Card className="rounded-2xl border-white/12 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Create a Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Write your post..." value={content} onChange={(e) => setContent(e.target.value)} />
            <Button onClick={handleCreate} disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? "Posting..." : "Post"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-white/12 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            {myRole === null ? (
              <div>You must be a guild member to create posts.</div>
            ) : (
              <div>Members can view posts but cannot create or manage posts.</div>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-white/12 bg-white/5">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-foreground/60">No posts yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-[28px] border-white/12 bg-gradient-to-br from-[#381c12]/86 via-[#200e11]/93 to-[#0d0508]/97">
              <CardHeader>
                {editingPostId === post.id ? (
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                ) : (
                  <CardTitle className="text-white">{post.title}</CardTitle>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {editingPostId === post.id ? (
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                ) : (
                  <p className="text-sm text-foreground/70">{post.content}</p>
                )}
                <div className="flex items-center gap-3">
                  {editingPostId === post.id ? (
                    <>
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      {myRole && myRole !== "Member" && myRole !== "Recruit" ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(post)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => removePost(post.id)}>Delete</Button>
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