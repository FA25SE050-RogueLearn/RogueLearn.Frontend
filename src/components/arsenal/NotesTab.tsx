"use client";

import { useEffect, useMemo, useState } from "react";
import notesApi from "@/api/notesApi";
import tagsApi from "@/api/tagsApi";
import { NoteDto } from "@/types/notes";
import { Tag } from "@/types/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

type EditorState = {
  id: string | null;
  title: string;
  content: string;
  isPublic: boolean;
};

export default function NotesTab() {
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [myTags, setMyTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>({ id: null, title: "", content: "", isPublic: false });
  const [saving, setSaving] = useState(false);
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
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter(n => n.title.toLowerCase().includes(q) || (n.content ?? "").toLowerCase().includes(q));
  }, [notes, search]);

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
        await openEditNote(noteId);
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
      const res = await notesApi.create({ authUserId, title: "Untitled note", content: "", isPublic: false });
      if (res.isSuccess) {
        const created = res.data;
        setEditor({ id: created.id, title: created.title, content: created.content ?? "", isPublic: created.isPublic });
        setEditorOpen(true);
        await fetchNotes();
      }
    } catch (e) {}
  };

  const openEditNote = async (id: string) => {
    try {
      const res = await notesApi.getById(id);
      if (res.isSuccess && res.data) {
        const n = res.data;
        setEditor({ id: n.id, title: n.title, content: n.content ?? "", isPublic: n.isPublic });
        setEditorOpen(true);
      }
    } catch (e) {}
  };

  const deleteNote = async (id: string) => {
    if (!authUserId) return;
    try {
      await notesApi.remove({ id, authUserId });
      toast.success("Note deleted");
      await fetchNotes();
    } catch (e) {}
  };

  // Simple debounced autosave
  useEffect(() => {
    if (!editor.id || !authUserId) return;
    const handle = setTimeout(async () => {
      setSaving(true);
      try {
        await notesApi.update(editor.id!, { authUserId, title: editor.title, content: editor.content, isPublic: editor.isPublic });
      } finally {
        setSaving(false);
      }
    }, 600);
    return () => clearTimeout(handle);
  }, [editor.title, editor.content, editor.isPublic, editor.id, authUserId]);

  // AI tag suggestions for current editor content
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ label: string; confidence: number; matchedTagId?: string; isExisting: boolean }[]>([]);
  const requestAiTags = async () => {
    if (!authUserId || !editor.id) return;
    setAiLoading(true);
    try {
      const res = await notesApi.suggestTags({ authUserId, noteId: editor.id, maxTags: 8 });
      if (res.isSuccess) setAiSuggestions(res.data.suggestions);
    } finally {
      setAiLoading(false);
    }
  };

  const commitSelectedTags = async (selected: { existingIds: string[]; newNames: string[] }) => {
    if (!authUserId || !editor.id) return;
    const res = await notesApi.commitTagSelections({ authUserId, noteId: editor.id, selectedTagIds: selected.existingIds, newTagNames: selected.newNames });
    if (res.isSuccess) {
      toast.success(`Applied ${res.data.totalTagsAssigned} tags`);
      setAiSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <input id={fileInputId} type="file" accept=".txt,.md,.pdf,.doc,.docx,.pptx,.ppt" className="hidden" onChange={onFileSelected} />
        <Button variant="secondary" onClick={onClickUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload file"}
        </Button>
        <Button onClick={openNewNote} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-sm text-foreground/70">Loading...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
            <p className="mb-3 text-sm text-foreground/70">No notes found.</p>
            <Button onClick={openNewNote}><Plus className="mr-2 h-4 w-4" /> Create your first note</Button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/12 bg-gradient-to-br from-[#361c15]/86 via-[#1f0d12]/92 to-[#0c0508]/97">
              <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                <CardTitle className="text-lg font-semibold text-white">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-1 flex-col gap-4 p-5">
                <p className="line-clamp-3 text-sm leading-relaxed text-foreground/70">{note.content || "No content"}</p>
                {Array.isArray(note.tagIds) && note.tagIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {note.tagIds.map((tid) => {
                      const t = tagIndex.get(tid);
                      const label = t?.name ?? "Unknown";
                      return (
                        <span key={`${note.id}-${tid}`} className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent">
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter className="relative z-10 flex items-center gap-2 border-t border-white/10 p-4">
                <Button size="sm" variant="secondary" onClick={() => openEditNote(note.id)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input id="note-title" value={editor.title} onChange={(e) => setEditor((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              {/* Placeholder for BlockNote rich text editor: using Textarea for MVP */}
              <Textarea id="note-content" rows={10} value={editor.content} onChange={(e) => setEditor((s) => ({ ...s, content: e.target.value }))} />
              <p className="text-xs text-foreground/50">Autosave {saving ? "saving..." : "ready"}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Public</Label>
                <Toggle pressed={editor.isPublic} onPressedChange={(p) => setEditor((s) => ({ ...s, isPublic: !!p }))}>
                  {editor.isPublic ? "Yes" : "No"}
                </Toggle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={requestAiTags} disabled={aiLoading || !editor.id}>
                  <Wand2 className="mr-2 h-4 w-4" /> Suggest Tags
                </Button>
              </div>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="rounded-lg border border-white/12 bg-black/20 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.35em] text-foreground/60">AI Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((s) => (
                    <span key={`${s.label}-${s.matchedTagId ?? s.label}`} className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent">
                      {s.label} <span className="text-[10px] text-foreground/50">({Math.round(s.confidence * 100)}%)</span>
                    </span>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => commitSelectedTags({ existingIds: aiSuggestions.filter(s => s.isExisting && s.matchedTagId).map(s => s.matchedTagId!) , newNames: aiSuggestions.filter(s => !s.isExisting).map(s => s.label) })}>Apply Selected</Button>
                  <Button size="sm" variant="secondary" onClick={() => setAiSuggestions([])}>Clear</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}