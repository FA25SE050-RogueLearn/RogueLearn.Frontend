"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import notesApi from "@/api/notesApi";
import tagsApi from "@/api/tagsApi";
import { NoteDto } from "@/types/notes";
import { Tag } from "@/types/tags";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

// BlockNote imports
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import {
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";

// Optional AI extension (will be disabled if env missing)
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import "@blocknote/xl-ai/style.css";
import { DefaultChatTransport } from "ai";

type EditorStatus = "loading" | "ready" | "saving";

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteIdParam = (params as any)?.noteId;
  const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [note, setNote] = useState<NoteDto | null>(null);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<EditorStatus>("loading");
  const [initialBlocks, setInitialBlocks] = useState<
    PartialBlock[] | undefined
  >(undefined);

  const [myTags, setMyTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<
    {
      label: string;
      confidence: number;
      matchedTagId?: string;
      reason?: string;
      isExisting: boolean;
    }[]
  >([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!noteId) return;
    const load = async () => {
      setStatus("loading");
      try {
        const res = await notesApi.getById(noteId);
        if (res.isSuccess && res.data) {
          const n = res.data;
          setNote(n);
          setTitle(n.title);
          setIsPublic(n.isPublic);
          // Try to parse JSON blocks; fallback to simple paragraph block
          let blocks: PartialBlock[] | undefined = undefined;
          if (n.content) {
            try {
              const parsed = JSON.parse(n.content);
              if (Array.isArray(parsed)) blocks = parsed as PartialBlock[];
            } catch {
              // fallback to a paragraph block with the content as text
              blocks = [{ type: "paragraph", content: n.content ?? "" }];
            }
          }
          setInitialBlocks(blocks);
        }
      } finally {
        setStatus("ready");
      }
    };
    const loadTags = async () => {
      try {
        const my = await tagsApi.getMyTags();
        if (my.isSuccess) setMyTags((my.data as any)?.tags ?? []);
        const nt = await tagsApi.getTagsForNote(noteId);
        if (nt.isSuccess) setNoteTags(nt.data.tags);
      } catch {}
    };
    load();
    loadTags();
  }, [noteId]);

  const AI_BASE_URL = process.env.NEXT_PUBLIC_BLOCKNOTE_AI_SERVER_BASE_URL;

  const editor = useMemo(() => {
    if (status === "loading") return undefined as unknown as BlockNoteEditor;
    return BlockNoteEditor.create({
      initialContent: initialBlocks,
      dictionary: AI_BASE_URL ? ({ ...en, ai: aiEn } as any) : undefined,
      extensions: AI_BASE_URL
        ? [
            createAIExtension({
              transport: new DefaultChatTransport({
                api: `${AI_BASE_URL}/regular/streamText`,
              }),
            }),
          ]
        : undefined,
    });
  }, [status, initialBlocks, AI_BASE_URL]);

  // Autosave title & public toggle
  useEffect(() => {
    if (!noteId || !authUserId) return;
    const handle = setTimeout(async () => {
      setStatus("saving");
      try {
        // Backend validator requires non-empty content on update.
        // When autosaving title/public, include current or last-known content.
        const existingContent = note?.content ?? "[]";
        await notesApi.update(noteId, {
          authUserId,
          title: title.trim(),
          isPublic: isPublic,
          content: existingContent,
        });
      } finally {
        setStatus("ready");
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [title, isPublic, noteId, authUserId]);

  // Save content on change (debounced by BlockNoteView onChange frequency)
  const onEditorChange = async () => {
    if (!noteId || !authUserId || !editor) return;
    try {
      const json = editor.document; // Block[]
      await notesApi.update(noteId, {
        authUserId,
        content: JSON.stringify(json),
        isPublic: isPublic,
        title: title.trim(),
      });
    } catch {}
  };

  const requestAiTags = async () => {
    if (!authUserId || !noteId) return;
    setAiLoading(true);
    try {
      const res = await notesApi.suggestTags({
        authUserId,
        noteId,
        maxTags: 8,
      });
      if (res.isSuccess) setAiSuggestions(res.data.suggestions);
    } finally {
      setAiLoading(false);
    }
  };

  const commitAiTags = async (existingIds: string[], newNames: string[]) => {
    if (!authUserId || !noteId) return;
    const res = await notesApi.commitTagSelections({
      authUserId,
      noteId,
      selectedTagIds: existingIds,
      newTagNames: newNames,
    });
    if (res.isSuccess) {
      toast.success(`Applied ${res.data.totalTagsAssigned} tags`);
      setAiSuggestions([]);
      const nt = await tagsApi.getTagsForNote(noteId);
      if (nt.isSuccess) setNoteTags(nt.data.tags);
    }
  };

  const attachTag = async (tagId: string) => {
    if (!authUserId || !noteId) return;
    const res = await tagsApi.attachToNote({ authUserId, noteId, tagId });
    if (res.isSuccess) {
      toast.success(`Attached tag '${res.data.tag.name}'`);
      const nt = await tagsApi.getTagsForNote(noteId);
      if (nt.isSuccess) setNoteTags(nt.data.tags);
    }
  };

  const detachTag = async (tagId: string) => {
    if (!authUserId || !noteId) return;
    await tagsApi.removeFromNote({ authUserId, noteId, tagId });
    const nt = await tagsApi.getTagsForNote(noteId);
    if (nt.isSuccess) setNoteTags(nt.data.tags);
  };

  if (status === "loading" || !editor) {
    return (
      <DashboardFrame>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading note...
        </div>
      </DashboardFrame>
    );
  }

  return (
    <DashboardFrame>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-24">
        <section className="rounded-2xl border border-white/12 bg-gradient-to-br from-[#251017]/88 via-[#13070b]/92 to-[#070307]/96 p-4">
          <div className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="font-semibold"
            />
            <div className="ml-auto flex items-center gap-2">
              <Checkbox
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={(v) => setIsPublic(!!v)}
              />
              <Label htmlFor="public-toggle" className="text-xs">
                Public
              </Label>
              <span className="text-xs text-foreground/60">
                {status === "saving" ? "Saving..." : "Saved"}
              </span>
            </div>
          </div>
          <Separator className="my-3" />

          <BlockNoteView
            editor={editor}
            onChange={onEditorChange}
            formattingToolbar={false}
            slashMenu={false}
            style={{ minHeight: "60vh" }}
          >
            {/* AI command menu if enabled */}
            {AI_BASE_URL && <AIMenuController />}

            {/* Custom formatting toolbar including AI button */}
            <FormattingToolbarController
              formattingToolbar={() => (
                <FormattingToolbar>
                  {...getFormattingToolbarItems()}
                  {AI_BASE_URL && <AIToolbarButton />}
                </FormattingToolbar>
              )}
            />

            {/* Slash menu with AI if enabled */}
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) => {
                const items = [
                  ...getDefaultReactSlashMenuItems(editor),
                  ...(AI_BASE_URL ? getAISlashMenuItems(editor) : []),
                ];
                const q = (query ?? "").toLowerCase();
                if (!q) return items;
                return items.filter((item: any) => {
                  const title = (
                    item?.title ||
                    item?.label ||
                    ""
                  ).toLowerCase();
                  const keywords: string[] =
                    item?.keywords || item?.aliases || [];
                  const matchKeywords =
                    Array.isArray(keywords) &&
                    keywords.some((k) => (k || "").toLowerCase().includes(q));
                  return title.includes(q) || matchKeywords;
                });
              }}
            />
          </BlockNoteView>
        </section>

        {/* Sidebar: Tags & AI Suggestions */}
        <aside className="rounded-2xl border border-white/12 bg-black/20 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white">Tags</h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {noteTags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent"
              >
                {t.name}
                <button
                  className="text-foreground/60 hover:text-foreground"
                  onClick={() => detachTag(t.id)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <Label htmlFor="attach-tag" className="text-xs">
            Attach existing tag
          </Label>
          <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
            <select
              id="attach-tag"
              className="rounded-md border bg-background p-2 text-sm"
            >
              {myTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const sel = (
                  document.getElementById(
                    "attach-tag"
                  ) as HTMLSelectElement | null
                )?.value;
                if (sel) attachTag(sel);
              }}
            >
              Attach
            </Button>
          </div>

          <Separator className="my-4" />
          <h3 className="mb-2 text-sm font-semibold text-white">
            AI Tag Suggestions
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={requestAiTags}
            disabled={aiLoading}
          >
            {aiLoading ? "Suggesting..." : "Suggest tags"}
          </Button>
          {aiSuggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {aiSuggestions.map((s, idx) => (
                <Card key={idx} className="border-white/10 bg-black/30">
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm text-white">
                      {s.label}{" "}
                      <span className="ml-2 text-xs text-foreground/60">
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 text-xs text-foreground/70">
                    {s.reason}
                    <div className="mt-2 flex gap-2">
                      {s.matchedTagId ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => commitAiTags([s.matchedTagId!], [])}
                        >
                          Attach existing
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => commitAiTags([], [s.label])}
                        >
                          Create & attach
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const existingIds = aiSuggestions
                      .filter((s) => s.matchedTagId)
                      .map((s) => s.matchedTagId!);
                    const newNames = aiSuggestions
                      .filter((s) => !s.matchedTagId)
                      .map((s) => s.label);
                    commitAiTags(existingIds, newNames);
                  }}
                >
                  Apply all
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAiSuggestions([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </DashboardFrame>
  );
}
