"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import notesApi from "@/api/notesApi";
import tagsApi from "@/api/tagsApi";
import { NoteDto } from "@/types/notes";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter as UIDialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, MoreVertical, LayoutGrid, List, ChevronRight, ChevronDown, FolderTree, FileText, Pencil, Check, X, FilePlus, Info } from "lucide-react";
import { toast } from "sonner";

type SortMode = "updatedAt_desc" | "title_asc";

// Safely extract plain text preview from note content which may be:
// - a plain string
// - a JSON string representing BlockNote blocks
// - an array/object of blocks (in case backend returns JSON directly)
function extractNotePreview(content: unknown): string {
  if (content == null) return "";
  // If content is a plain string, try to parse JSON if applicable; otherwise return as-is
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractNotePreview(parsed);
      } catch {
        return content;
      }
    }
    return content;
  }

  // Helper to pull text from a BlockNote block's content array
  const pullTextFromBlockContent = (bc: any): string[] => {
    const out: string[] = [];
    if (typeof bc === "string") {
      out.push(bc);
    } else if (Array.isArray(bc)) {
      for (const n of bc) {
        if (typeof n === "string") {
          out.push(n);
        } else if (n && typeof n.text === "string") {
          out.push(n.text);
        } else if (n && typeof n.content === "string") {
          out.push(n.content);
        }
      }
    }
    return out;
  };

  // If content is an array of blocks (BlockNote document)
  if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const b of (content as any[]).slice(0, 5)) {
      const bc = (b as any)?.content;
      texts.push(...pullTextFromBlockContent(bc));
    }
    return texts.join(" ").trim();
  }

  // If content is an object, it might be { blocks: [...] } or a single block
  if (typeof content === "object") {
    const c: any = content as any;
    if (Array.isArray(c.blocks)) {
      return extractNotePreview(c.blocks);
    }
    if (Array.isArray(c.content)) {
      return pullTextFromBlockContent(c.content).join(" ").trim();
    }
    if (typeof c.content === "string") return c.content;
    return "";
  }

  return "";
}

export default function NotesTab() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [myTags, setMyTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortMode>("updatedAt_desc");
  const [filterTagId, setFilterTagId] = useState<string>("");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tagParent, setTagParent] = useState<Record<string, string | null>>({});
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTagId, setConfirmTagId] = useState<string | null>(null);
  const [noteEditingId, setNoteEditingId] = useState<string | null>(null);
  const [noteEditTitle, setNoteEditTitle] = useState("");
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthUserId(data.user?.id ?? null);
    });
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notesApi.getMyNotes();
      if (res.isSuccess) setNotes(res.data);
    } catch (e: any) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await tagsApi.getMyTags();
      if (res.isSuccess) {
        const incoming = (res.data as any)?.tags;
        const list = Array.isArray(incoming) ? incoming : [];
        setMyTags(list);
        const key = authUserId ? `tagsTree:${authUserId}` : `tagsTree:anonymous`;
        try {
          const raw = localStorage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : {};
          setTagParent(parsed && typeof parsed === "object" ? parsed : {});
        } catch {}
      }
    } catch (e) {
      // error toast handled by interceptor
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, []);

  useEffect(() => {
    const h = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(h);
  }, [searchInput]);

  const filteredNotes = useMemo(() => {
    let base = notes;
    if (search) {
      const q = search.toLowerCase();
      base = base.filter(n => {
        const preview = extractNotePreview(n.content as any).toLowerCase();
        return n.title.toLowerCase().includes(q) || preview.includes(q);
      });
    }
    if (activeGroup && activeGroup !== "all") {
      if (activeGroup === "recent") {
        base = [...base].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      } else if (activeGroup === "untagged") {
        base = base.filter(n => !Array.isArray(n.tagIds) || n.tagIds.length === 0);
      } else {
        base = base.filter(n => Array.isArray(n.tagIds) && n.tagIds.includes(activeGroup));
      }
    } else if (filterTagId) {
      base = base.filter(n => Array.isArray(n.tagIds) && n.tagIds.includes(filterTagId));
    }
    base = [...base];
    if (sort === "updatedAt_desc") {
      base.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      base.sort((a, b) => a.title.localeCompare(b.title));
    }
    return base;
  }, [notes, search, filterTagId, sort, activeGroup]);

  const tagIndex = useMemo(() => {
    const map = new Map<string, Tag>();
    for (const t of myTags) map.set(t.id, t);
    return map;
  }, [myTags]);

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

  const onDropNoteToTag = async (tagId: string, e: React.DragEvent) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/plain");
    if (!noteId || !authUserId) return;
    try {
      await tagsApi.attachToNote({ authUserId, noteId, tagId });
      await fetchNotes();
      toast.success("Assigned to tag");
    } catch {}
  };

  const startEditTag = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const cancelEditTag = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEditTag = async (tagId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Tag name cannot be empty");
      return;
    }
    const exists = myTags.some((t) => t.id !== tagId && t.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error("Tag with this name already exists");
      return;
    }
    try {
      setUpdatingId(tagId);
      await tagsApi.update(tagId, { authUserId: authUserId ?? "", name: trimmed });
      toast.success("Tag updated");
      cancelEditTag();
      await fetchTags();
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      setDeletingId(tagId);
      await tagsApi.deleteTag(tagId);
      toast.success("Tag deleted");
      await fetchTags();
    } finally {
      setDeletingId(null);
      setConfirmOpen(false);
      setConfirmTagId(null);
    }
  };

  const buildPath = (id: string | null) => {
    const path: string[] = [];
    let cur = id;
    const guard = new Set<string>();
    while (cur) {
      if (guard.has(cur)) break;
      guard.add(cur);
      path.unshift(cur);
      cur = tagParent[cur] ?? null;
    }
    return path;
  };

  const TagTree = ({ parentId }: { parentId: string | null }) => {
    const children = myTags
      .filter(t => (tagParent[t.id] ?? null) === parentId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
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
              onClick={() => { setActiveGroup(t.id); setSelectedTagId(t.id); }}
            >
              <button
                className="h-5 w-5 inline-flex items-center justify-center rounded hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); toggleExpand(t.id); }}
              >
                {expanded[t.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: hashColor(t.id) }} />
              {editingId === t.id ? (
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 w-40" />
              ) : (
                <span className="truncate">{t.name}</span>
              )}
              <div className="ml-auto hidden items-center gap-1 group-hover:flex">
                {editingId === t.id ? (
                  <>
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); saveEditTag(t.id); }} disabled={updatingId === t.id} aria-label="Save">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); cancelEditTag(); }} aria-label="Cancel">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); startEditTag(t); }} aria-label="Rename">
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
              <div className="ml-6" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDropNoteToTag(t.id, e)}>
                <div className="space-y-1">
                  {notes.filter(n => Array.isArray(n.tagIds) && n.tagIds.includes(t.id)).slice(0, 8).map(n => (
                    <button key={n.id} className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-white/80 hover:bg-white/5" onClick={() => openEditNote(n.id)} aria-label={`Open ${n.title}`}>
                      <span className="truncate">{n.title}</span>
                      <span className="text-foreground/60">{new Date(n.updatedAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                  {notes.filter(n => Array.isArray(n.tagIds) && n.tagIds.includes(t.id)).length === 0 && (
                    <div className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-foreground/60">No notes</div>
                  )}
                </div>
                <TagTree parentId={t.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Upload to create note with AI tags
  const [uploading, setUploading] = useState(false);
  const fileInputId = "notes-upload-input";
  const onClickUpload = () => {
    const el = document.getElementById(fileInputId) as HTMLInputElement | null;
    el?.click();
  };
  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUserId) return;
    setUploading(true);
    try {
      const res = await notesApi.createWithAiTagsFromUpload({ authUserId, fileContent: file, fileName: file.name, contentType: file.type, applySuggestions: true, maxTags: 8 });
      if (res.isSuccess) {
        toast.success("Created note from upload");
        await fetchNotes();
      }
    } finally {
      setUploading(false);
      e.target.value = ""; // reset
    }
  };

  const createTagInline = async () => {
    if (!authUserId) return;
    const name = typeof window !== "undefined" ? window.prompt("New tag name") : "";
    const trimmed = (name ?? "").trim();
    if (!trimmed) return;
    try {
      const res = await tagsApi.create({ authUserId, name: trimmed });
      if (res.isSuccess) {
        await fetchTags();
        toast.success("Tag created");
      }
    } catch {}
  };

  const openNewNote = async () => {
    if (!authUserId) {
      toast.error("Not authenticated");
      return;
    }
    try {
      // Initialize with a valid BlockNote document (single empty paragraph)
      const initialDoc = [
        { type: "paragraph", content: [{ type: "text", text: "", styles: {} }] },
      ];
      const res = await notesApi.create({
        authUserId,
        title: "Untitled note",
        content: JSON.stringify(initialDoc),
        isPublic: false,
      });
      if (res.isSuccess) {
        toast.success("New note created");
        await fetchNotes();
      }
    } catch (e) {}
  };

  const openEditNote = async (id: string) => {
    router.push(`/arsenal/${id}`);
  };

  const deleteNote = async (id: string) => {
    if (!authUserId) return;
    try {
      await notesApi.remove({ id, authUserId });
      toast.success("Note deleted");
      await fetchNotes();
    } catch (e) {}
  };

  const startRenameNote = (note: NoteDto) => {
    setNoteEditingId(note.id);
    setNoteEditTitle(note.title);
  };

  const cancelRenameNote = () => {
    setNoteEditingId(null);
    setNoteEditTitle("");
  };

  const saveRenameNote = async (noteId: string) => {
    const trimmed = noteEditTitle.trim();
    if (!authUserId) {
      toast.error("Not authenticated");
      return;
    }
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      setUpdatingNoteId(noteId);
      const res = await notesApi.update(noteId, { authUserId, title: trimmed });
      if (res.isSuccess) {
        toast.success("Title updated");
        cancelRenameNote();
        await fetchNotes();
      }
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const onDragStartNote = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData("text/plain", noteId);
  };

  const dropToTag = async (tagId: string, e: React.DragEvent) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/plain");
    if (!noteId || !authUserId) return;
    try {
      await tagsApi.attachToNote({ authUserId, noteId, tagId });
      toast.success("Moved to tag");
      await fetchNotes();
    } catch {}
  };

  const dropToUntagged = async (e: React.DragEvent) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/plain");
    if (!noteId || !authUserId) return;
    try {
      const target = notes.find(n => n.id === noteId);
      const existing = Array.isArray(target?.tagIds) ? target!.tagIds : [];
      for (const tid of existing) {
        await tagsApi.removeFromNote({ authUserId, noteId, tagId: tid });
      }
      try { localStorage.setItem(`notesFolderPath:${noteId}`, JSON.stringify([])); } catch {}
      toast.success("Moved to Untagged");
      await fetchNotes();
    } catch {}
  };

  const total = filteredNotes.length;

  const handleDropFiles = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!authUserId) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const res = await notesApi.createWithAiTagsFromUpload({ authUserId, fileContent: file, fileName: file.name, contentType: file.type, applySuggestions: true, maxTags: 8 });
        if (res.isSuccess) {
          toast.success(`Created note from ${file.name}`);
        }
      }
      await fetchNotes();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <Input placeholder="Search notes" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full max-w-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-notes" className="text-xs text-[#f5c16c]/80">Sort</Label>
          <select id="sort-notes" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-md border border-[#f5c16c]/20 bg-black/40 p-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-1 focus:ring-[#f5c16c]/30">
            <option value="updatedAt_desc">Updated</option>
            <option value="title_asc">Title</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={viewMode === "list" ? "default" : "secondary"} size="icon" onClick={() => setViewMode("list")} aria-label="List view">
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "secondary"} size="icon" onClick={() => setViewMode("grid")} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="rounded-2xl border border-white/12 bg-black/20 min-h-[80vh] grid grid-cols-[300px_1fr]">
        <div className="border-r border-white/10 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <FolderTree className="h-4 w-4" />
              <span>Tags</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="secondary" className="h-7 px-2" onClick={createTagInline}>
                <Plus className="mr-1 h-3 w-3" />
                Tag
              </Button>
              <Button size="sm" variant="secondary" onClick={openNewNote} className="h-7 px-2">
                <Plus className="mr-1 h-3 w-3" />
                Note
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-white/10">
            <div className="p-2">
              <div className="mb-2 flex items-center gap-2">
                <button className="rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/5" onClick={() => { setActiveGroup("all"); setSelectedTagId(null); }}>All Notes</button>
                <button className="rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/5" onClick={() => setActiveGroup("recent")}>Recently Edited</button>
                <button className="rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/5" onClick={() => setActiveGroup("untagged")}>Untagged</button>
              </div>
              <TagTree parentId={null} />
            </div>
          </div>
          <div className="space-y-2">
            <Button onClick={openNewNote} className="w-full bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black">
              <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>
            <div className="rounded-md border border-white/10 px-3 py-2 text-xs text-foreground/60" onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropToUntagged(e)}>Drop note to remove all tags</div>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[220px] animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="mb-3 text-sm text-foreground/70">{error}</p>
            <Button variant="secondary" onClick={fetchNotes}>Retry</Button>
          </div>
        ) : total === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10" />
            <p className="mb-3 text-sm text-foreground/70">No scrolls found in this archive.</p>
            <Button onClick={openNewNote}><Plus className="mr-2 h-4 w-4" /> Create your first note</Button>
          </div>
        ) : (
          <div className="h-[80vh] overflow-y-auto p-4 pb-24">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-foreground/70">
                <span>All Notes</span>
                {selectedTagId && buildPath(selectedTagId).map((tid, i) => (
                  <span key={`${tid}-${i}`}> {">"} {tagIndex.get(tid)?.name ?? tid}</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === "list" ? "default" : "secondary"} size="icon" onClick={() => setViewMode("list")}> 
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "grid" ? "default" : "secondary"} size="icon" onClick={() => setViewMode("grid")}> 
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div
              className="mb-4 rounded-2xl border border-dashed border-[#f5c16c]/40 bg-[#0c0508]/60 p-6"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropFiles}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-[#f5c16c]/10 p-2">
                    <FilePlus className="h-5 w-5 text-[#f5c16c]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Create notes from files</div>
                    <div className="mt-1 text-xs text-foreground/70">Drag and drop documents to automatically create notes and apply AI-suggested tags.</div>
                    <div className="mt-1 text-xs text-foreground/60">Supported formats: .txt, .md, .pdf, .doc, .docx, .ppt, .pptx</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id={fileInputId} type="file" multiple accept=".txt,.md,.pdf,.doc,.docx,.pptx,.ppt" className="hidden" onChange={onFileSelected} />
                  <Button variant="secondary" onClick={onClickUpload} disabled={uploading}>{uploading ? "Processing..." : "Choose files"}</Button>
                </div>
              </div>
            </div>
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="flex flex-col overflow-hidden rounded-[20px] border border-white/12 bg-linear-to-br from-[#361c15]/86 via-[#1f0d12]/92 to-[#0c0508]/97"
                    role="listitem"
                    tabIndex={0}
                    onClick={() => openEditNote(note.id)}
                    onKeyDown={(e) => {
                      if ((e as any).key === "Enter") openEditNote(note.id)
                    }}
                    draggable
                    onDragStart={(e) => onDragStartNote(e, note.id)}
                    onContextMenu={(e) => { e.preventDefault(); setMenuOpenId(note.id); }}
                  >
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between border-b border-white/10 py-3 px-4">
                      {noteEditingId === note.id ? (
                        <div className="flex items-center gap-2">
                          <Input className="h-8 w-64" value={noteEditTitle} onChange={(e) => setNoteEditTitle(e.target.value)} />
                          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); saveRenameNote(note.id); }} disabled={updatingNoteId === note.id} aria-label="Save">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); cancelRenameNote(); }} aria-label="Cancel">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <CardTitle className="text-base font-semibold text-white">{note.title}</CardTitle>
                      )}
                        <div className="flex items-center gap-2">
                          {note.isPublic && (
                            <span className="rounded-full border border-green-500/40 bg-green-500/15 px-2 py-0.5 text-xs text-green-300">Public</span>
                          )}
                        <DropdownMenu open={menuOpenId === note.id} onOpenChange={(v) => setMenuOpenId(v ? note.id : null)}>
                          <DropdownMenuTrigger asChild>
                            <span className="sr-only" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startRenameNote(note); }}>Rename</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4">
                      <p className="text-sm leading-relaxed text-foreground/70">
                        {extractNotePreview(note.content as any) || "No content"}
                      </p>
                    </CardContent>
                    <CardFooter className="relative z-10 flex flex-wrap items-center gap-2 border-t border-white/10 p-3">
                      {Array.isArray(note.tagIds) && note.tagIds.length > 0 ? (
                        note.tagIds.map((tid) => {
                          const t = tagIndex.get(tid)
                          const label = t?.name ?? "Unknown"
                          return (
                            <span
                              key={`${note.id}-${tid}`}
                              className="rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-2 py-0.5 text-xs text-[#f5c16c]"
                            >
                              {label}
                            </span>
                          )
                        })
                      ) : (
                        <span className="text-xs text-foreground/50">No tags</span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-black/20">
                <div className="grid grid-cols-[minmax(200px,1fr)_240px_140px_140px] items-center border-b border-white/10 px-4 py-2 text-xs text-white/70">
                  <div>Name</div>
                  <div>Tags</div>
                  <div className="text-right">Created</div>
                  <div className="text-right">Last Edited</div>
                </div>
                <div>
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group grid grid-cols-[minmax(200px,1fr)_240px_140px_140px] items-center border-b border-white/5 px-4 text-sm hover:bg-white/5"
                      draggable
                      onDragStart={(e) => onDragStartNote(e, note.id)}
                      onContextMenu={(e) => { e.preventDefault(); setMenuOpenId(note.id); }}
                    >
                      {noteEditingId === note.id ? (
                        <div className="flex items-center gap-2 py-2">
                          <FileText className="h-4 w-4 text-white/70" />
                          <Input className="h-8 w-64" value={noteEditTitle} onChange={(e) => setNoteEditTitle(e.target.value)} />
                          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); saveRenameNote(note.id); }} disabled={updatingNoteId === note.id} aria-label="Save">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); cancelRenameNote(); }} aria-label="Cancel">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <button className="flex items-center gap-2 py-2 text-left" onClick={() => openEditNote(note.id)}>
                          <FileText className="h-4 w-4 text-white/70" />
                          <span className="truncate text-white">{note.title}</span>
                        </button>
                      )}
                      <div className="flex flex-wrap items-center gap-1 py-2">
                        {Array.isArray(note.tagIds) && note.tagIds.length > 0 ? (
                          note.tagIds.map((tid) => {
                            const t = tagIndex.get(tid);
                            const label = t?.name ?? "Unknown";
                            return (
                              <span key={`${note.id}-${tid}`} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hashColor(tid) }} />
                                {label}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-foreground/50">No tags</span>
                        )}
                      </div>
                      <div className="py-2 text-right text-foreground/60">{new Date(note.createdAt).toLocaleDateString()}</div>
                      <div className="relative py-2 text-right text-foreground/60">
                        {new Date(note.updatedAt).toLocaleDateString()}
                        <div className="absolute inset-y-0 right-2 flex items-center">
                          <DropdownMenu open={menuOpenId === note.id} onOpenChange={(v) => setMenuOpenId(v ? note.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <span className="sr-only" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startRenameNote(note); }}>Rename</DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tag</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <UIDialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmTagId && deleteTag(confirmTagId!)} disabled={deletingId === confirmTagId}>
              {deletingId === confirmTagId ? "Deleting..." : "Delete"}
            </Button>
          </UIDialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}