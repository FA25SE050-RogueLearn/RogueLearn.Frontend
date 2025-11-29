"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { DashboardFrame } from "@/components/layout/DashboardFrame";
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
  const [userProfile, setUserProfile] = useState<{
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  } | undefined>(undefined);

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

  useEffect(() => {
    getMyContext()
      .then((res) => {
        if (!res.isSuccess || !res.data) return;
        const ctx = res.data as any;
        const display = (ctx.displayName || ctx.username || "").trim();
        const parts = display.split(/\s+/);
        const first = parts[0] || ctx.username || "";
        const last = parts.slice(1).join(" ") || "";
        setUserProfile({
          username: ctx.username,
          firstName: first,
          lastName: last,
          profileImageUrl: ctx.profileImageUrl ?? null,
        });
      })
      .catch(() => {});
  }, []);

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

  const doc = useMemo(() => new Y.Doc(), [partyId, stashId]);
  const provider = useMemo(() => new YPartyKitProvider(
    "blocknote-dev.yousefed.partykit.dev",
    `${partyId}-${stashId}`,
    doc
  ), [partyId, stashId, doc]);

  const AI_BASE_URL = "/api/blocknote";
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
    return () => {
      try { (provider as any)?.destroy?.(); } catch {}
    };
  }, [provider]);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    if (!editor) return;
    if (!initialBlocks || initialBlocks.length === 0) return;
    const docBlocks = editor.document;
    if (docBlocks.length === 1) {
      const b = docBlocks[0] as any;
      const emptyParagraph = b?.type === "paragraph" && Array.isArray(b?.content) && b.content.every((c: any) => (c?.text ?? "") === "");
      if (emptyParagraph) {
        editor.replaceBlocks([b], initialBlocks as any);
        initializedRef.current = true;
      }
    }
  }, [editor, initialBlocks]);

  return (
    <DashboardFrame userProfile={userProfile}>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header with RPG styling */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-br from-[#2d1810] via-[#1a0a08] to-black p-6 shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            backgroundSize: "100px",
            backgroundBlendMode: "overlay",
          }}
        />
        
        <div className="relative flex items-center gap-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            readOnly={!canEdit}
            placeholder="Document Title..."
            className="flex-1 border-[#f5c16c]/20 bg-black/40 text-lg font-semibold text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#f5c16c]/20 bg-black/40 px-3 py-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  status === "saving"
                    ? "animate-pulse bg-amber-400"
                    : status === "dirty"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              <span className="text-xs text-white/70">
                {status === "saving"
                  ? "Saving..."
                  : status === "dirty"
                  ? "Unsaved"
                  : "Saved"}
              </span>
            </div>
            <button
              onClick={() => router.back()}
              className="rounded-lg border border-[#f5c16c]/30 bg-transparent px-4 py-2 text-sm text-[#f5c16c] transition-all hover:bg-[#f5c16c]/10"
            >
              Back
            </button>
            <Link
              href={`/parties/${partyId}/stash`}
              className="rounded-lg bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c]"
            >
              View Stash
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {item && (
        <div className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-linear-to-br from-[#2d1810]/90 via-[#1a0a08]/95 to-black/98 p-6 shadow-lg">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
              backgroundSize: "100px",
              backgroundBlendMode: "overlay",
            }}
          />
          
          <div className="relative space-y-4">
            <h2 className="text-2xl font-bold text-[#f5c16c]">{item.title}</h2>
            
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>{new Date(item.sharedAt).toLocaleString()}</span>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-xs font-medium text-[#f5c16c]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-[#f5c16c]/20 bg-black/40 p-6">
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
                        {getFormattingToolbarItems()}
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
        </div>
      )}
      </div>
    </DashboardFrame>
  );
}
