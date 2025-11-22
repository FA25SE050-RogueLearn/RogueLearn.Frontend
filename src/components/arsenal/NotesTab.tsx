"use client";

import { useEffect, useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import { useRouter } from "next/navigation";
import notesApi from "@/api/notesApi";
import tagsApi from "@/api/tagsApi";
import { NoteDto } from "@/types/notes";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, MoreVertical, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
        setMyTags(Array.isArray(incoming) ? incoming : []);
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
          <Input placeholder="Search notes..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full max-w-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-notes" className="text-xs text-[#f5c16c]/80">Sort</Label>
          <select id="sort-notes" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-md border border-[#f5c16c]/20 bg-black/40 p-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-1 focus:ring-[#f5c16c]/30">
            <option value="updatedAt_desc">Updated (newest)</option>
            <option value="title_asc">Title (A–Z)</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={viewMode === "grid" ? "default" : "secondary"} size="icon" onClick={() => setViewMode("grid")} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "secondary"} size="icon" onClick={() => setViewMode("list")} aria-label="List view">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/12 bg-black/20 min-h-[80vh] grid grid-cols-[280px_1fr]">
        <div className="border-r border-white/10 p-3 space-y-3">
          <Button onClick={openNewNote} className="w-full bg-linear-to-r from-[#f5c16c] to-[#d4a855] text-black">
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
          <Accordion type="single" collapsible defaultValue="group-all">
            <AccordionItem value="group-all">
              <AccordionTrigger onClick={() => setActiveGroup("all")}>All Notes</AccordionTrigger>
              <AccordionContent onDragOver={(e) => e.preventDefault()}>
                <div className="text-xs text-foreground/60">Drop here to keep current tags.</div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-recent">
              <AccordionTrigger onClick={() => setActiveGroup("recent")}>Recently Edited</AccordionTrigger>
              <AccordionContent onDragOver={(e) => e.preventDefault()}>
                <div className="text-xs text-foreground/60">Sorted by update time.</div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="group-untagged">
              <AccordionTrigger onClick={() => setActiveGroup("untagged")}>Untagged</AccordionTrigger>
              <AccordionContent onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropToUntagged(e)}>
                <div className="text-xs text-foreground/60">Drop note to remove all tags.</div>
              </AccordionContent>
            </AccordionItem>
            {myTags.map((t) => (
              <AccordionItem key={t.id} value={`tag-${t.id}`}>
                <AccordionTrigger onClick={() => setActiveGroup(t.id)}>{t.name}</AccordionTrigger>
                <AccordionContent onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropToTag(t.id, e)}>
                  <div className="text-xs text-foreground/60">Drop note to assign this tag.</div>
                  <div className="mt-2 space-y-1">
                    {notes.filter(n => Array.isArray(n.tagIds) && n.tagIds.includes(t.id)).slice(0, 6).map(n => (
                      <button key={n.id} className="w-full truncate text-left text-xs text-white/80 hover:text-white" onClick={() => setActiveGroup(t.id)} aria-label={`Show ${t.name} notes`}>{n.title}</button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
          <div className="h-[80vh] overflow-y-auto p-4 pb-24" role="list" aria-label="Notes grid">
            <div
              className="mb-4 rounded-xl border border-dashed border-[#f5c16c]/40 bg-[#0c0508]/60 p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropFiles}
            >
              <div className="text-sm text-foreground/70">Drop files here to create notes</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <input
                  id={fileInputId}
                  type="file"
                  multiple
                  accept=".txt,.md,.pdf,.doc,.docx,.pptx,.ppt"
                  className="hidden"
                  onChange={onFileSelected}
                />
                <Button variant="secondary" onClick={onClickUpload} disabled={uploading}>
                  {uploading ? "Processing..." : "Choose files"}
                </Button>
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
                  >
                    <CardHeader className="relative z-10 flex flex-row items-center justify-between border-b border-white/10 py-3 px-4">
                      <CardTitle className="text-base font-semibold text-white">{note.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {note.isPublic && (
                            <span className="rounded-full border border-green-500/40 bg-green-500/15 px-2 py-0.5 text-xs text-green-300">Public</span>
                          )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More actions" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditNote(note.id); }}>Open</DropdownMenuItem>
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
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="flex items-start gap-4 overflow-hidden rounded-[16px] border border-white/12 bg-linear-to-br from-[#361c15]/86 via-[#1f0d12]/92 to-[#0c0508]/97 p-4"
                    role="listitem"
                    tabIndex={0}
                    onClick={() => openEditNote(note.id)}
                    onKeyDown={(e) => {
                      if ((e as any).key === "Enter") openEditNote(note.id)
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-white">{note.title}</div>
                        <div className="flex items-center gap-2">
                          {note.isPublic && (
                            <span className="rounded-full border border-green-500/40 bg-green-500/15 px-2 py-0.5 text-xs text-green-300">
                              Public
                            </span>
                          )}
                          <span className="text-xs text-foreground/60">{new Date(note.updatedAt).toLocaleDateString()}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="More actions" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditNote(note.id); }}>Open</DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                        {extractNotePreview(note.content as any) || "No content"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}