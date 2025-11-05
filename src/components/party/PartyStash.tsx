"use client";
import React, { useEffect, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { PartyStashItemDto } from "@/types/parties";

export default function PartyStash({ partyId }: { partyId: string }) {
  const [items, setItems] = useState<PartyStashItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string>("");
  const [contentText, setContentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        content: { text: contentText },
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Party Stash</h4>
        <button className="rounded bg-fuchsia-600 px-3 py-2 text-xs font-medium" onClick={() => setShowAdd(true)}>Add Resource</button>
      </div>
      {loading && <div className="text-sm text-white/70">Loading...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map(item => (
          <div key={item.id} className="rounded border border-white/10 bg-white/5 p-3">
            <div className="text-sm font-medium text-white">{item.title}</div>
            <div className="text-xs text-white/70">Shared by {item.sharedByUserId}</div>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="rounded bg-white/10 px-2 py-1 text-xs text-white/80">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && !loading && <div className="text-xs text-white/50">No resources yet.</div>}
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