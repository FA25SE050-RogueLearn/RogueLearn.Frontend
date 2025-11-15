"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import type { PartyStashItemDto } from "@/types/parties";
import Link from "next/link";
import { BlockNoteView } from "@blocknote/shadcn";
import { PartialBlock } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import {
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { DefaultChatTransport } from "ai";
import { Input } from "@/components/ui/input";
import { getMyContext } from "@/api/usersApi";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { CursorUsersProvider, nameToColor } from "@/components/collab/CursorUsersProvider";

// BlockNote styles for consistent editor appearance
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "@blocknote/xl-ai/style.css";

type EditorStatus = "loading" | "ready" | "saving" | "dirty";

export default function PartyStashDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partyId = (params?.partyId as string) ?? "";
  const stashId = (params?.stashId as string) ?? "";

  const [item, setItem] = useState<PartyStashItemDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EditorStatus>("loading");
  const [initialBlocks, setInitialBlocks] = useState<
    PartialBlock[] | undefined
  >(undefined);

  const saveTimerRef = useRef<number | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [cursorName, setCursorName] = useState("Anonymous");
  const [cursorColor, setCursorColor] = useState<string>(nameToColor("Anonymous"));

  useEffect(() => {
    const load = async () => {
      setStatus("loading");
      setError(null);
      try {
        const res = await partiesApi.getResourceById(partyId, stashId);
        if (res.isSuccess && res.data) {
          const n = res.data;
          setItem(n ?? null);
          setTitle(n.title ?? "");
          let blocks: PartialBlock[] | undefined = undefined;
          const raw = n.content;
          if (raw) {
            if (typeof raw === "string") {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  blocks = parsed as PartialBlock[];
                } else if (
                  parsed &&
                  typeof parsed === "object" &&
                  Array.isArray((parsed as any).blocks)
                ) {
                  blocks = (parsed as any).blocks as PartialBlock[];
                }
              } catch {}
            } else if (typeof raw === "object") {
              if (Array.isArray(raw)) {
                blocks = raw as PartialBlock[];
              } else if (Array.isArray((raw as any).blocks)) {
                blocks = (raw as any).blocks as PartialBlock[];
              }
            }
          }

          const fallback: PartialBlock[] = [
            {
              type: "paragraph",
              content: [{ type: "text", text: n.title ?? "", styles: {} }],
            },
          ];
          setInitialBlocks(blocks && blocks.length > 0 ? blocks : fallback);
        }
      } finally {
        setStatus("ready");
      }
    };
    load();
  }, [partyId, stashId]);

  const onEditorChange = () => {
    if (!canEdit) return;
    if (!stashId || !partyId || !editor) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setStatus("dirty");
    saveTimerRef.current = window.setTimeout(async () => {
      setStatus("saving");
      try {
        const json = editor.document;
        await partiesApi.updateResource(partyId, stashId, {
          title: title.trim(),
          content: json,
          tags: item?.tags ?? [],
        });
      } finally {
        setStatus("ready");
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyContext();
        const authId = me.data?.authUserId ?? null;
        const dn = (me.data as any)?.username || authId || "Anonymous";
        setCursorName(String(dn));
        setCursorColor(nameToColor(String(dn)));
        if (!mounted || !authId) {
          setCanEdit(false);
          return;
        }
        const rolesRes = await partiesApi.getMemberRoles(partyId, authId);
        const roles = rolesRes.data ?? [];
        const allowed = roles.includes("Leader") || roles.includes("CoLeader");
        setCanEdit(allowed);
      } catch {
        if (!mounted) return;
        setCanEdit(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [partyId]);

  const doc = new Y.Doc();
  const provider = new YPartyKitProvider(
    "blocknote-dev.yousefed.partykit.dev",
    // use a unique name as a "room" for your application:
    `${partyId}-${stashId}`,
    doc
  );

  const AI_BASE_URL = process.env.NEXT_PUBLIC_BLOCKNOTE_AI_SERVER_BASE_URL;
  const editor = useCreateBlockNote(
    {
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
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: cursorName,
          color: cursorColor,
        },
        showCursorLabels: "activity",
      },
    },
    [AI_BASE_URL, cursorName, cursorColor]
  );

  useEffect(() => {
    if (!editor) return;
    if (!initialBlocks || initialBlocks.length === 0) return;
    const docBlocks = editor.document;
    if (docBlocks.length === 1) {
      const b = docBlocks[0] as any;
      const emptyParagraph = b?.type === "paragraph" && Array.isArray(b?.content) && b.content.every((c: any) => (c?.text ?? "") === "");
      if (emptyParagraph) {
        editor.replaceBlocks([b], initialBlocks as any);
      }
    }
  }, [editor, initialBlocks]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={!canEdit}
          placeholder="Title"
          className="font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-foreground/60">
            {status === "saving"
              ? "Saving..."
              : status === "dirty"
              ? "Unsaved changes"
              : "Saved"}
          </span>
          <button
            onClick={() => router.back()}
            className="rounded bg-white/10 px-3 py-2 text-xs"
          >
            Back
          </button>
          <Link
            href={`/parties/${partyId}/stash`}
            className="rounded bg-white/10 px-3 py-2 text-xs"
          >
            Stash
          </Link>
        </div>
      </div>

      {error && <div className="text-xs text-red-400">{error}</div>}

      {item && (
        <div className="space-y-3 rounded border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-bold text-white">{item.title}</div>
          <div className="text-xs text-white/70">
            Shared by {item.sharedByUserId} •{" "}
            {new Date(item.sharedAt).toLocaleString()}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-white/10 px-2 py-1 text-xs text-white/80"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {item.originalNoteId && (
            <div className="text-xs">
              Origin:{" "}
              <Link
                href={`/arsenal/${item.originalNoteId}`}
                className="text-fuchsia-400 underline"
              >
                View original note
              </Link>
            </div>
          )}

          <div className="mt-3">
            <CursorUsersProvider provider={provider} defaultName={cursorName} defaultColor={cursorColor}>
            <BlockNoteView
              editor={editor}
              onChange={onEditorChange}
              formattingToolbar={false}
              slashMenu={false}
              editable={canEdit}
              style={{ minHeight: "60vh" }}
            >
              {AI_BASE_URL && canEdit && <AIMenuController />}

              <FormattingToolbarController
                formattingToolbar={() => (
                  <FormattingToolbar>
                    {...getFormattingToolbarItems()}
                    {AI_BASE_URL && canEdit && <AIToolbarButton />}
                  </FormattingToolbar>
                )}
              />

              {canEdit && (
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
                        keywords.some((k) =>
                          (k || "").toLowerCase().includes(q)
                        );
                      return title.includes(q) || matchKeywords;
                    });
                  }}
                />
              )}
            </BlockNoteView>
            </CursorUsersProvider>
          </div>
        </div>
      )}
    </div>
  );
}
