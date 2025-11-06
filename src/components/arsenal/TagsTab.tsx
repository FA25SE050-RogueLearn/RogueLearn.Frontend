"use client";

import { useEffect, useMemo, useState } from "react";
import tagsApi from "@/api/tagsApi";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function TagsTab() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await tagsApi.getMyTags();
      // Defensive: ensure we always set an array
      if (res.isSuccess) {
        const incoming = (res.data as any)?.tags;
        setTags(Array.isArray(incoming) ? incoming : []);
      }
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Input placeholder="Search tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-sm text-foreground/70">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-foreground/70">No tags found.</p>
        ) : (
          filtered.map((tag) => (
            <Card key={tag.id} className="rounded-[20px] border border-white/12 bg-gradient-to-br from-[#1f0d12]/92 to-[#0c0508]/97">
              <CardHeader>
                <CardTitle className="text-white">{tag.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground/60">Tag ID: {tag.id}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-white/12 bg-black/20 p-4">
        <Label htmlFor="new-tag" className="mb-2 block">Create Tag</Label>
        <div className="flex gap-2">
          <Input id="new-tag" placeholder="e.g. Algorithms" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={createTag}>Add</Button>
        </div>
      </div>
    </div>
  );
}