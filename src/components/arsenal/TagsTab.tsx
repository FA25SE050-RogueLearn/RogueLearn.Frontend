"use client";

import { useEffect, useMemo, useState } from "react";
import tagsApi from "@/api/tagsApi";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter as UIDialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function TagsTab() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTagId, setConfirmTagId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  useEffect(() => {
    const h = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(h);
  }, [searchInput]);

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
    try {
      setDeletingId(tagId);
      await tagsApi.deleteTag(tagId);
      toast.success("Tag deleted");
      fetchTags();
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setConfirmTagId(null);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const updateTag = async (tagId: string) => {
    if (!tagId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Tag name cannot be empty");
      return;
    }
    const exists = tags.some((t) => t.id !== tagId && t.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error("Tag with this name already exists");
      return;
    }
    try {
      setUpdatingId(tagId);
      await tagsApi.update(tagId, { authUserId: authUserId ?? "", name: trimmed });
      toast.success("Tag updated");
      cancelEdit();
      fetchTags();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Input placeholder="Search tags..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="max-w-sm" />
      </div>

      <div className="rounded-2xl border border-white/12 bg-black/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-white/90">Name</th>
              <th className="px-4 py-3 text-left text-white/70">ID</th>
              <th className="px-4 py-3 text-right text-white/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-block h-8 w-20 animate-pulse rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              : filtered.length === 0
              ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-foreground/70" colSpan={3}>No tags found.</td>
                  </tr>
                )
              : filtered.map((tag) => (
                  <tr key={tag.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">
                      {editingId === tag.id ? (
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-xs" />
                      ) : (
                        tag.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground/70">{tag.id}</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === tag.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => updateTag(tag.id)} disabled={updatingId === tag.id}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => startEdit(tag)}>Edit</Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { setConfirmTagId(tag.id); setConfirmOpen(true); }}
                            disabled={deletingId === tag.id}
                          >
                            {deletingId === tag.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-6">
        <Label htmlFor="new-tag" className="mb-2 block text-[#f5c16c]">Create Tag</Label>
        <div className="flex gap-2">
          <Input id="new-tag" placeholder="e.g. Algorithms" value={name} onChange={(e) => setName(e.target.value)} className="border-[#f5c16c]/20 bg-black/40 focus-visible:border-[#f5c16c] focus-visible:ring-[#f5c16c]/30" />
          <Button onClick={createTag} className="bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]">Add</Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tag</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <UIDialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmTagId && deleteTag(confirmTagId)} disabled={deletingId === confirmTagId}>
              {deletingId === confirmTagId ? "Deleting..." : "Delete"}
            </Button>
          </UIDialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}