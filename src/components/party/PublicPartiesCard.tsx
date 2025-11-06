"use client";
import React, { useEffect, useMemo, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { PartyDto } from "@/types/parties";
import { toast } from "sonner";

interface PublicPartiesCardProps {
  onJoinedNavigate?: boolean; // if true, navigate to party page after joining
}

export default function PublicPartiesCard({ onJoinedNavigate = true }: PublicPartiesCardProps) {
  const [publicParties, setPublicParties] = useState<PartyDto[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [search, setSearch] = useState("");
  const [joinBusyId, setJoinBusyId] = useState<string | null>(null);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [fetchingCounts, setFetchingCounts] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<"members" | "newest" | "name">("members");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingPublic(true);
        const res = await partiesApi.getAll();
        if (!mounted) return;
        setPublicParties((res.data ?? []).filter((p) => p.isPublic));
      } catch {
        if (!mounted) return;
        setPublicParties([]);
      } finally {
        if (!mounted) return;
        setLoadingPublic(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const list = publicParties.filter((p) => p.name.toLowerCase().includes(term));
    // Sort according to selected option
    if (sortBy === "members") {
      return [...list].sort((a, b) => (memberCounts[b.id] ?? 0) - (memberCounts[a.id] ?? 0));
    }
    if (sortBy === "newest") {
      return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [publicParties, search, sortBy, memberCounts]);

  // Fetch member counts for visible items (lazy)
  useEffect(() => {
    const visible = filtered.slice(0, 12);
    visible.forEach((p) => {
      if (memberCounts[p.id] !== undefined || fetchingCounts[p.id]) return;
      setFetchingCounts((prev) => ({ ...prev, [p.id]: true }));
      partiesApi
        .getMembers(p.id)
        .then((res) => {
          const count = (res.data ?? []).length;
          setMemberCounts((prev) => ({ ...prev, [p.id]: count }));
        })
        .catch(() => {
          // ignore errors, keep undefined
        })
        .finally(() => {
          setFetchingCounts((prev) => ({ ...prev, [p.id]: false }));
        });
    });
  }, [filtered, memberCounts, fetchingCounts]);

  const handleJoin = async (partyIdToJoin: string) => {
    try {
      setJoinBusyId(partyIdToJoin);
      await partiesApi.joinPublic(partyIdToJoin);
      toast.success("Joined party successfully.");
      if (onJoinedNavigate) {
        window.location.href = `/party/${partyIdToJoin}`;
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to join party");
    } finally {
      setJoinBusyId(null);
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-[#0a0710] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Discover Public Parties</h4>
        {loadingPublic && <span className="text-xs text-white/60">Loading...</span>}
      </div>
      <div className="mb-3 flex gap-3">
        <input
          type="text"
          placeholder="Search public parties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-fuchsia-500/60 focus:outline-none"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-fuchsia-500/60 focus:outline-none"
        >
          <option value="members">Most Members</option>
          <option value="newest">Newest</option>
          <option value="name">A–Z</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="text-xs text-white/60">No public parties available right now.</div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-start justify-between rounded bg-white/5 p-3">
              <button className="text-left" onClick={() => (window.location.href = `/party/${p.id}`)}>
                <div className="text-sm font-medium text-white">{p.name}</div>
                {p.description && (
                  <div className="mt-0.5 line-clamp-2 text-xs text-white/70">{p.description}</div>
                )}
                <div className="mt-1 text-[11px] text-white/50">
                  {p.partyType} • Max {p.maxMembers} • Created {new Date(p.createdAt).toLocaleDateString()}
                </div>
                <div className="text-[11px] text-white/50">Owner ID: {p.createdBy}</div>
                <div className="mt-1 text-[11px] text-white/60">
                  Members: {memberCounts[p.id] !== undefined ? memberCounts[p.id] : fetchingCounts[p.id] ? "Loading…" : "—"}
                </div>
              </button>
              <div className="ml-4 flex items-center gap-2">
                <a
                  href={`/party/${p.id}`}
                  className="rounded bg-white/10 px-3 py-1.5 text-xs text-white"
                >
                  Open
                </a>
                <button
                  onClick={() => handleJoin(p.id)}
                  disabled={joinBusyId === p.id}
                  className="rounded bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  {joinBusyId === p.id ? "Joining…" : "Join"}
                </button>
              </div>
            </li>
          ))}
      </ul>
      )}
    </div>
  );
}