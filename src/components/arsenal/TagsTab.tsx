"use client";

import { useEffect, useMemo, useState } from "react";
import tagsApi from "@/api/tagsApi";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter as UIDialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight, ChevronDown, FolderTree, Pencil, Trash2, Plus, Check, X } from "lucide-react";
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tagParent, setTagParent] = useState<Record<string, string | null>>({});
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

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
      const key = authUserId ? `tagsTree:${authUserId}` : `tagsTree:anonymous`;
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : {};
        setTagParent(parsed && typeof parsed === "object" ? parsed : {});
      } catch {}
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
    const list = (!search ? base : base.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [search, tags]);

  const hashColor = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue}, 60%, 60%)`;
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setParent = (childId: string, parentId: string | null) => {
    const key = authUserId ? `tagsTree:${authUserId}` : `tagsTree:anonymous`;
    setTagParent(prev => {
      const next = { ...prev, [childId]: parentId };
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isDescendant = (candidateParent: string, child: string): boolean => {
    let cur = tagParent[child] ?? null;
    const visited = new Set<string>();
    while (cur) {
      if (visited.has(cur)) break;
      if (cur === candidateParent) return true;
      visited.add(cur);
      cur = tagParent[cur] ?? null;
    }
    return false;
  };

  const onDragStartTag = (e: React.DragEvent, tagId: string) => {
    e.dataTransfer.setData("text/tag-id", tagId);
  };

  const onDropTag = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/tag-id");
    if (!draggedId || draggedId === targetId) return;
    if (isDescendant(draggedId, targetId)) return;
    setParent(draggedId, targetId);
  };

  const createTagInline = async () => {
    if (!authUserId) return;
    const nm = typeof window !== "undefined" ? window.prompt("New tag name") : "";
    const trimmed = (nm ?? "").trim();
    if (!trimmed) return;
    try {
      const res = await tagsApi.create({ authUserId, name: trimmed });
      if (res.isSuccess) {
        toast.success("Tag created");
        fetchTags();
      }
    } catch {}
  };

  const TagTree = ({ parentId }: { parentId: string | null }) => {
    const children = filtered.filter(t => (tagParent[t.id] ?? null) === parentId);
    return (
      <div className="space-y-1">
        {children.map(t => (
          <div key={t.id} className="group">
            <div
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-white hover:bg-white/5"
              draggable
              onDragStart={(e) => onDragStartTag(e, t.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropTag(e, t.id)}
              onClick={() => setSelectedTagId(t.id)}
            >
              <button
                className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); toggleExpand(t.id); }}
              >
                {expanded[t.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: hashColor(t.id) }} />
              {editingId === t.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 w-40"
                  autoFocus
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{t.name}</span>
              )}
              <div className="ml-auto hidden items-center gap-1 group-hover:flex">
                {editingId === t.id ? (
                  <>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => updateTag(t.id)} disabled={updatingId === t.id} aria-label="Save">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit} aria-label="Cancel">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); startEdit(t); }} aria-label="Rename">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setConfirmTagId(t.id); setConfirmOpen(true); }} disabled={deletingId === t.id} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {expanded[t.id] && (
              <div className="ml-6">
                <TagTree parentId={t.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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
        <div className="flex items-center justify-between gap-3">
          <Input placeholder="Search tags" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="max-w-sm" />
          <Button size="sm" variant="secondary" className="h-8 px-3" onClick={createTagInline}><Plus className="mr-1 h-3 w-3" /> New</Button>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/20 grid grid-cols-[300px_1fr]">
          <div className="border-r border-white/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <FolderTree className="h-4 w-4" />
              <span>Tags</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 animate-pulse rounded bg-white/5" />
                ))}
              </div>
            ) : (
              <TagTree parentId={null} />
            )}
          </div>
          <div className="p-4">
            <div className="rounded-xl border border-white/10 bg-black/20">
              <div className="grid grid-cols-[minmax(200px,1fr)_260px_140px] items-center border-b border-white/10 px-4 py-2 text-xs text-white/70">
                <div>Name</div>
                <div>Tag ID</div>
                <div className="text-right">Actions</div>
              </div>
              <div>
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-foreground/70">No tags found</div>
                ) : (
                  filtered.map(tag => (
                    <div key={tag.id} className="grid grid-cols-[minmax(200px,1fr)_260px_140px] items-center border-b border-white/5 px-4 text-sm">
                      <div className="flex items-center gap-2 py-2">
                        <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: hashColor(tag.id) }} />
                        <span className="truncate text-white">{tag.name}</span>
                      </div>
                      <div className="py-2 text-foreground/60">{tag.id}</div>
                      <div className="flex items-center justify-end gap-2 py-2">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(tag)} aria-label="Rename">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => { setConfirmTagId(tag.id); setConfirmOpen(true); }} disabled={deletingId === tag.id} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-6">
              <Label htmlFor="new-tag" className="mb-2 block text-[#f5c16c]">Create Tag</Label>
              <div className="flex gap-2">
                <Input id="new-tag" placeholder="e.g. Algorithms" value={name} onChange={(e) => setName(e.target.value)} className="border-[#f5c16c]/20 bg-black/40 focus-visible:border-[#f5c16c] focus-visible:ring-[#f5c16c]/30" />
                <Button onClick={createTag} className="bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]">Add</Button>
              </div>
            </div>
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
