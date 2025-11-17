"use client";

import { useEffect, useMemo, useState } from "react";
import tagsApi from "@/api/tagsApi";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function TagsTab() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await tagsApi.getMyTags();
      const list = Array.isArray(res.data?.tags) ? res.data.tags : [];
      setTags(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filtered = useMemo<Tag[]>(() => {
    const base = Array.isArray(tags) ? tags : [];
    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter((t) => t.name.toLowerCase().includes(q));
  }, [search, tags]);

  const createTag = async () => {
    if (!authUserId) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Tag name cannot be empty");
      return;
    }
    try {
      const res = await tagsApi.create({ authUserId, name: trimmed });
      if (res.isSuccess) {
        toast.success(`Created tag '${res.data.tag.name}'`);
        setName("");
        fetchTags();
      }
    } catch (e) {}
  };

  const deleteTag = async (tagId: string) => {
    const confirm = window.confirm("Delete this tag? This cannot be undone.");
    if (!confirm) return;
    try {
      setDeletingId(tagId);
      await tagsApi.deleteTag(tagId);
      toast.success("Tag deleted");
      fetchTags();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Input placeholder="Search tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm border-[#f5c16c]/20 bg-black/40 focus-visible:border-[#f5c16c] focus-visible:ring-[#f5c16c]/30" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-sm text-white/60">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-white/60">No tags found.</p>
        ) : (
          filtered.map((tag) => (
            <Card key={tag.id} className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                  backgroundSize: "100px",
                  backgroundBlendMode: "overlay",
                }}
              />
              <CardHeader className="relative z-10">
                <CardTitle className="text-[#f5c16c]">{tag.name}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-xs text-white/60">Tag ID: {tag.id}</p>
              </CardContent>
              <CardFooter className="relative z-10 flex items-center gap-2 border-t border-[#f5c16c]/20">
                <Button variant="destructive" size="sm" onClick={() => deleteTag(tag.id)} disabled={deletingId === tag.id} className="bg-rose-600 hover:bg-rose-700">
                  {deletingId === tag.id ? "Deleting..." : "Delete"}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-6">
        <Label htmlFor="new-tag" className="mb-2 block text-[#f5c16c]">Create Tag</Label>
        <div className="flex gap-2">
          <Input id="new-tag" placeholder="e.g. Algorithms" value={name} onChange={(e) => setName(e.target.value)} className="border-[#f5c16c]/20 bg-black/40 focus-visible:border-[#f5c16c] focus-visible:ring-[#f5c16c]/30" />
          <Button onClick={createTag} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]">Add</Button>
        </div>
      </div>
    </div>
  );
}