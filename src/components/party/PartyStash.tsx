"use client";
import React, { useEffect, useMemo, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { PartyStashItemDto } from "@/types/parties";
import Link from "next/link";

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
  const [items, setItems] = useState<PartyStashItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string>("");
  const [contentText, setContentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => { load(); }, [partyId]);

  const addResource = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
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
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">Party Stash</h4>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stash..."
            className="w-40 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs"
          />
          <button
            className="rounded bg-white/10 px-3 py-2 text-xs"
            onClick={load}
            title="Refresh"
          >
            Refresh
          </button>
          <button className="rounded bg-fuchsia-600 px-3 py-2 text-xs font-medium" onClick={() => setShowAdd(true)}>Add Resource</button>
        </div>
      </div>
      {loading && <div className="text-sm text-white/70">Loading...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.id} className="rounded border border-white/10 bg-white/5 p-3">
            {editingId === item.id ? (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs">Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs">Tags (comma separated)</label>
                  <input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs">Content</label>
                  <textarea
                    value={editContentText}
                    onChange={(e) => setEditContentText(e.target.value)}
                    className="min-h-24 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="rounded bg-white/10 px-3 py-2 text-xs" onClick={cancelEdit}>Cancel</button>
                  <button
                    disabled={savingEdit || !editTitle.trim()}
                    className="rounded bg-fuchsia-600 px-3 py-2 text-xs font-medium disabled:opacity-50"
                    onClick={saveEdit}
                  >
                    {savingEdit ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="text-[11px] text-white/70">
                  Shared by {item.sharedByUserId} • {new Date(item.sharedAt).toLocaleString()}
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded bg-white/10 px-2 py-1 text-xs text-white/80">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-white/70 line-clamp-3">
                  {extractPlainText(item.content) || "(no content)"}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/parties/${partyId}/stash/${item.id}`}
                    className="rounded bg-white/10 px-3 py-2 text-xs"
                  >
                    View
                  </Link>
                  <button
                    className="rounded bg-white/10 px-3 py-2 text-xs"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded bg-red-600/80 px-3 py-2 text-xs"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="text-xs text-white/50">No resources yet.</div>
        )}
      </div>

      {showAdd && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h5 className="mb-2 text-sm font-semibold">Add Resource</h5>
          <div className="mb-2">
            <label className="block text-xs">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs">Content</label>
            <textarea
              value={contentText}
              onChange={e => setContentText(e.target.value)}
              className="min-h-24 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="rounded bg-white/10 px-3 py-2 text-xs" onClick={() => setShowAdd(false)}>Cancel</button>
            <button
              disabled={submitting || !title.trim()}
              className="rounded bg-fuchsia-600 px-3 py-2 text-xs font-medium disabled:opacity-50"
              onClick={addResource}
            >
              {submitting ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}