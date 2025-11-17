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
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2 } from "lucide-react";
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
  const [sort, setSort] = useState<SortMode>("updatedAt_desc");
  const [filterTagId, setFilterTagId] = useState<string>("");
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthUserId(data.user?.id ?? null);
    });
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await notesApi.getMyNotes();
      if (res.isSuccess) setNotes(res.data);
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

  const filteredNotes = useMemo(() => {
    let base = notes;
    if (search) {
      const q = search.toLowerCase();
      base = base.filter(n => {
        const preview = extractNotePreview(n.content as any).toLowerCase();
        return n.title.toLowerCase().includes(q) || preview.includes(q);
      });
    }
    if (filterTagId) {
      base = base.filter(n => Array.isArray(n.tagIds) && n.tagIds.includes(filterTagId));
    }
    base = [...base];
    if (sort === "updatedAt_desc") {
      base.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      base.sort((a, b) => a.title.localeCompare(b.title));
    }
    return base;
  }, [notes, search, filterTagId, sort]);

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
        const noteId = res.data.noteId;
        await fetchNotes();
        router.push(`/arsenal/${noteId}`);
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
        const created = res.data;
        await fetchNotes();
        router.push(`/arsenal/${created.id}`);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm border-[#f5c16c]/20 bg-black/40 focus-visible:border-[#f5c16c] focus-visible:ring-[#f5c16c]/30" />
        <div className="flex items-center gap-2">
          <Label htmlFor="tag-filter" className="text-xs text-[#f5c16c]/80">Tag</Label>
          <select id="tag-filter" value={filterTagId} onChange={(e) => setFilterTagId(e.target.value)} className="rounded-md border border-[#f5c16c]/20 bg-black/40 p-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-1 focus:ring-[#f5c16c]/30">
            <option value="">All</option>
            {myTags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-notes" className="text-xs text-[#f5c16c]/80">Sort</Label>
          <select id="sort-notes" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="rounded-md border border-[#f5c16c]/20 bg-black/40 p-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-1 focus:ring-[#f5c16c]/30">
            <option value="updatedAt_desc">Updated (newest)</option>
            <option value="title_asc">Title (A–Z)</option>
          </select>
        </div>
        <input id={fileInputId} type="file" accept=".txt,.md,.pdf,.doc,.docx,.pptx,.ppt" className="hidden" onChange={onFileSelected} />
        <Button variant="secondary" onClick={onClickUpload} disabled={uploading} className="border-[#f5c16c]/20 bg-black/40 hover:border-[#f5c16c]/40 hover:bg-black/60">
          {uploading ? "Uploading..." : "Upload file"}
        </Button>
        <Button onClick={openNewNote} className="ml-auto bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]">
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-sm text-foreground/70">Loading...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-[#f5c16c]/20 bg-black/40 p-8 text-center">
            <p className="mb-3 text-sm text-white/70">No notes found.</p>
            <Button onClick={openNewNote} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]"><Plus className="mr-2 h-4 w-4" /> Create your first note</Button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                  backgroundSize: "100px",
                  backgroundBlendMode: "overlay",
                }}
              />
              <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-4">
                <CardTitle className="text-lg font-semibold text-[#f5c16c]">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-1 flex-col gap-4 p-5">
                <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{extractNotePreview(note.content as any) || "No content"}</p>
                {Array.isArray(note.tagIds) && note.tagIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {note.tagIds.map((tid) => {
                      const t = tagIndex.get(tid);
                      const label = t?.name ?? "Unknown";
                      return (
                        <span key={`${note.id}-${tid}`} className="rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/10 px-2 py-1 text-xs text-[#f5c16c]">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter className="relative z-10 flex items-center gap-2 border-t border-[#f5c16c]/20 p-4">
                <Button size="sm" variant="secondary" onClick={() => openEditNote(note.id)} className="border-[#f5c16c]/20 bg-black/40 hover:border-[#f5c16c]/40 hover:bg-black/60">Open</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)} className="bg-rose-600 hover:bg-rose-700">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}