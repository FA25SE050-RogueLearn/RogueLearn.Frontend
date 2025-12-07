"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import type { PartyStashItemDto } from "@/types/parties";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PartialBlock } from "@blocknote/core";
import { Input } from "@/components/ui/input";
import { getMyContext } from "@/api/usersApi";
import { FileText, ArrowLeft, Tag } from "lucide-react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { nameToColor } from "@/components/collab/CursorUsersProvider";
const BlockNoteStashEditor = dynamic(() => import("@/components/party/BlockNoteStashEditor"), { ssr: false });

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

  const onEditorChange = (json: any) => {
    if (!canEdit) return;
    if (!stashId || !partyId) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setStatus("dirty");
    saveTimerRef.current = window.setTimeout(async () => {
      setStatus("saving");
      try {
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
        const allowed = roles.includes("Leader") || roles.includes("Member");
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
  const fragment = useMemo(() => doc.getXmlFragment("document-store"), [doc]);

  const AI_BASE_URL = "/api/blocknote";

  useEffect(() => {
    return () => {
      try { (provider as any)?.destroy?.(); } catch {}
    };
  }, [provider]);

  

  return (
    <DashboardFrame>
      <div className="flex flex-col gap-6 pb-24">
        {/* Header Section - Arsenal Style */}
        <section className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/20 p-8">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#f5c16c]/10 p-4">
                <FileText className="h-8 w-8 text-[#f5c16c]" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/60">Party Stash</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  readOnly={!canEdit}
                  placeholder="Document Title..."
                  className="border-none bg-transparent text-3xl font-semibold text-[#f5c16c] placeholder:text-[#f5c16c]/40 focus:ring-0 focus-visible:ring-0 p-0 h-auto w-[400px]"
                />
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        status === "saving"
                          ? "animate-pulse bg-amber-400"
                          : status === "dirty"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span>
                      {status === "saving"
                        ? "Saving..."
                        : status === "dirty"
                        ? "Unsaved changes"
                        : "All changes saved"}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{item?.tags?.length ?? 0} tags</span>
                  {item && (
                    <>
                      <span>•</span>
                      <span>{new Date(item.sharedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="rounded-lg border border-[#f5c16c]/30 bg-transparent px-4 py-2 text-sm text-[#f5c16c] transition-all hover:bg-[#f5c16c]/10"
              >
                <ArrowLeft className="mr-1.5 inline h-4 w-4" />
                Back
              </button>
              <Link
                href={`/parties/${partyId}/stash`}
                className="rounded-lg border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-2 text-sm font-medium text-[#f5c16c] transition-all hover:bg-[#f5c16c]/20"
              >
                View Stash
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {/* Main Content - Arsenal Style */}
        <div className="rounded-2xl border border-white/12 bg-black/20 min-h-[80vh]">
          {/* Tags Bar */}
          {item?.tags && item.tags.length > 0 && (
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-[#f5c16c]/60" />
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/10 px-2.5 py-0.5 text-xs text-[#f5c16c]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Editor Area */}
          <div className="h-[75vh] overflow-y-auto p-6">
            {item && (
              <BlockNoteStashEditor
                initialBlocks={initialBlocks}
                editable={canEdit}
                provider={provider}
                fragment={fragment}
                cursorName={cursorName}
                cursorColor={cursorColor}
                onChange={onEditorChange}
                aiBaseUrl={AI_BASE_URL}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardFrame>
  );
}
