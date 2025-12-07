"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import { PartyStashItemDto } from "@/types/parties";
import Link from "next/link";
import { FileText, Plus, Search, RefreshCw, Pencil, Trash2, Eye, X, FolderOpen, Clock, ArrowLeft } from "lucide-react";
import { usePartyRole } from "@/hooks/usePartyRole";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to convert BlockNote raw blocks to plain text for previews
function extractPlainText(blocks?: Record<string, unknown>[]) {
  if (!blocks || blocks.length === 0) return "";
  try {
    const lines: string[] = [];
    for (const b of blocks) {
      // Very lightweight text extractor compatible with BlockNote schema
      const type = (b as any)?.type;
      const content = (b as any)?.content;
      if (Array.isArray(content)) {
        const text = content
          .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
          .join("");
        if (text.trim()) lines.push(text.trim());
      } else if (typeof (b as any)?.text === "string") {
        lines.push(((b as any).text as string).trim());
      }
      // Add line breaks for paragraph-like blocks
      if (type === "paragraph" || type === "heading") lines.push("");
    }
    return lines.join("\n").trim();
  } catch {
    return "";
  }
}

export default function PartyStash({ partyId }: { partyId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<PartyStashItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string>("");
  const [contentText, setContentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { role, loading: roleLoading } = usePartyRole(partyId);

  // Management state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editContentText, setEditContentText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await partiesApi.getResources(partyId);
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load stash");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [partyId]);

  const addResource = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        // Minimal BlockNote paragraph block from plain text
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: contentText }],
          },
        ],
      };
      await partiesApi.addResource(partyId, payload);
      setTitle("");
      setTags("");
      setContentText("");
      setShowAdd(false);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to add resource");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: PartyStashItemDto) => {
    setEditingId(item.id);
    setEditTitle(item.title ?? "");
    setEditTags((item.tags ?? []).join(", "));
    setEditContentText(extractPlainText(item.content));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditTags("");
    setEditContentText("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    setError(null);
    try {
      const payload = {
        title: editTitle,
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: editContentText }],
          },
        ],
      } as any; // matches UpdatePartyResourceRequest
      await partiesApi.updateResource(partyId, editingId, payload);
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update resource");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteItem = async (id: string) => {
    setError(null);
    try {
      await partiesApi.deleteResource(partyId, id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete resource");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const inTitle = i.title?.toLowerCase().includes(q);
      const inTags = (i.tags ?? []).some((t) => t.toLowerCase().includes(q));
      const inText = extractPlainText(i.content).toLowerCase().includes(q);
      return inTitle || inTags || inText;
    });
  }, [items, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length]);
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (roleLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
              <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-white/5" />
                <Skeleton className="h-4 w-24 bg-white/5" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-lg bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <Skeleton className="mb-3 h-5 w-3/4 bg-white/5" />
              <Skeleton className="mb-2 h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-2/3 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#f5c16c]/30 bg-[#f5c16c]/10">
              <FolderOpen className="h-6 w-6 text-[#f5c16c]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Party Stash</h1>
              <p className="text-sm text-white/50">{items.length} resource{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none sm:w-48"
              />
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {role && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#f5c16c] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#f5c16c]/90"
              >
                <Plus className="h-4 w-4" />
                Add Resource
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <FileText className="h-8 w-8 text-white/30" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">No resources yet</h3>
          <p className="mb-6 text-sm text-white/50">Share notes and documents with your party members</p>
          {role && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5c16c] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#f5c16c]/90"
            >
              <Plus className="h-4 w-4" />
              Add First Resource
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paged.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-[#f5c16c]/30 hover:bg-black/30"
              >
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none"
                    />
                    <input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="Tags (comma separated)"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none"
                    />
                    <textarea
                      value={editContentText}
                      onChange={(e) => setEditContentText(e.target.value)}
                      placeholder="Content..."
                      className="min-h-[80px] w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={savingEdit || !editTitle.trim()}
                        className="flex-1 rounded-lg bg-[#f5c16c] py-2 text-sm font-medium text-black transition-colors hover:bg-[#f5c16c]/90 disabled:opacity-50"
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-[#f5c16c]" />
                        <h3 className="truncate font-medium text-white group-hover:text-[#f5c16c]">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.sharedAt)}
                      </div>
                    </div>

                    {item.tags && item.tags.filter(t => !t.toLowerCase().startsWith("source:")).length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {item.tags
                          .filter((t) => !t.toLowerCase().startsWith("source:"))
                          .slice(0, 3)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60"
                            >
                              #{tag}
                            </span>
                          ))}
                        {item.tags.filter(t => !t.toLowerCase().startsWith("source:")).length > 3 && (
                          <span className="text-[10px] text-white/40">
                            +{item.tags.filter(t => !t.toLowerCase().startsWith("source:")).length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="mb-4 text-sm leading-relaxed text-white/50 line-clamp-2">
                      {extractPlainText(item.content) || "No content preview"}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/parties/${partyId}/stash/${item.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        Open
                      </Link>
                      {role && (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="flex items-center justify-center rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this resource?")) {
                                deleteItem(item.id);
                              }
                            }}
                            className="flex items-center justify-center rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-red-500/20 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="text-sm text-white/50">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1410] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Resource</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Tags (optional)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="notes, study, chapter-1"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Content</label>
                <textarea
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Write something..."
                  className="min-h-[120px] w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={addResource}
                  disabled={submitting || !title.trim()}
                  className="flex-1 rounded-lg bg-[#f5c16c] py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#f5c16c]/90 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Resource"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
