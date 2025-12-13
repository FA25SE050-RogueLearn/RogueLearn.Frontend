"use client";
import React, { useEffect, useMemo, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { getMyContext } from "@/api/usersApi";
import { PartyDto, PartyMemberDto } from "@/types/parties";
import { toast } from "sonner";

interface PublicPartiesCardProps {
  onJoinedNavigate?: boolean; // if true, navigate to party page after joining
}

export default function PublicPartiesCard({ onJoinedNavigate = true }: PublicPartiesCardProps) {
  const [publicParties, setPublicParties] = useState<PartyDto[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [search, setSearch] = useState("");
  const [joinBusyId, setJoinBusyId] = useState<string | null>(null);
  const [partyMembers, setPartyMembers] = useState<Record<string, PartyMemberDto[]>>({});
  const [fetchingMembers, setFetchingMembers] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<"members" | "newest" | "name">("members");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [authUserId, setAuthUserId] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyContext();
        if (!mounted) return;
        setAuthUserId(me.data?.authUserId ?? null);
      } catch {
        if (!mounted) return;
        setAuthUserId(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const list = publicParties.filter((p) => p.name.toLowerCase().includes(term));
    // Sort according to selected option
    if (sortBy === "members") {
      return [...list].sort((a, b) => (partyMembers[b.id]?.length ?? 0) - (partyMembers[a.id]?.length ?? 0));
    }
    if (sortBy === "newest") {
      return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [publicParties, search, sortBy, partyMembers]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length]);
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // Fetch members for visible items (lazy)
  useEffect(() => {
    const visible = paged;
    visible.forEach((p) => {
      if (partyMembers[p.id] !== undefined || fetchingMembers[p.id]) return;
      setFetchingMembers((prev) => ({ ...prev, [p.id]: true }));
      partiesApi
        .getMembers(p.id)
        .then((res) => {
          setPartyMembers((prev) => ({ ...prev, [p.id]: res.data ?? [] }));
        })
        .catch(() => {
          setPartyMembers((prev) => ({ ...prev, [p.id]: [] }));
        })
        .finally(() => {
          setFetchingMembers((prev) => ({ ...prev, [p.id]: false }));
        });
    });
  }, [paged, partyMembers, fetchingMembers]);

  const renderMemberSlots = (p: PartyDto) => {
    const members = partyMembers[p.id] ?? [];
    const filled = members.slice(0, Math.min(members.length, p.maxMembers));
    const emptyCount = Math.max(p.maxMembers - filled.length, 0);
    return (
      <div className="mt-3 flex items-center gap-1">
        {filled.map((m) => (
          <div key={m.id} className="h-7 w-7 overflow-hidden rounded-full ring-2 ring-[#f5c16c]/30">
            {m.profileImageUrl ? (
              <img src={m.profileImageUrl} alt={m.username ?? m.email ?? "Member"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#f5c16c]/10 text-[10px] text-[#f5c16c]">
                {(m.username ?? m.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {emptyCount > 0 && emptyCount <= 5 && Array.from({ length: emptyCount }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7 rounded-full border border-dashed border-white/20" />
        ))}
        {emptyCount > 5 && <span className="ml-1 text-[10px] text-white/40">+{emptyCount} slots</span>}
      </div>
    );
  };

  const handleJoin = async (partyIdToJoin: string) => {
    try {
      setJoinBusyId(partyIdToJoin);
      await partiesApi.joinPublic(partyIdToJoin);
      toast.success("Joined party successfully.");
      if (onJoinedNavigate) {
        window.location.href = `/parties/${partyIdToJoin}`;
      }
    } catch (e: any) {
      // toast.error(e?.message ?? "Failed to join party");
    } finally {
      setJoinBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search public parties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#f5c16c]/40 focus:outline-none"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#f5c16c]/40 focus:outline-none"
        >
          <option value="members">Most Members</option>
          <option value="newest">Newest</option>
          <option value="name">A–Z</option>
        </select>
        {loadingPublic && <span className="self-center text-xs text-white/40">Loading...</span>}
      </div>

      {/* Party List */}
      {loadingPublic ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-[#f5c16c]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-sm text-white/40">No public parties available right now.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {paged.map((p) => {
            const isJoined = !!authUserId && (partyMembers[p.id]?.some(m => m.authUserId === authUserId && m.status === "Active") ?? false);
            return (
              <div key={p.id} className="group rounded-xl border border-white/10 bg-black/30 p-4 transition-all hover:border-[#f5c16c]/30 hover:bg-black/40">
                <div className="flex items-start justify-between">
                  <button className="flex-1 text-left" onClick={() => (window.location.href = `/parties/${p.id}`)}>
                    <div className="text-sm font-medium text-white group-hover:text-[#f5c16c]">{p.name}</div>
                    {p.description && (
                      <div className="mt-1 line-clamp-2 text-xs text-white/50">{p.description}</div>
                    )}
                  </button>
                  <div className="ml-3 flex items-center gap-1.5">
                    {!isJoined && (
                      <button
                        onClick={() => handleJoin(p.id)}
                        disabled={joinBusyId === p.id}
                        className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
                      >
                        {joinBusyId === p.id ? "..." : "Join"}
                      </button>
                    )}
                  </div>
                </div>
                {renderMemberSlots(p)}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-white/40">
                  <span className="rounded-full border border-[#f5c16c]/20 bg-[#f5c16c]/10 px-2 py-0.5 text-[#f5c16c]">{p.partyType}</span>
                  <span>{partyMembers[p.id]?.length ?? (fetchingMembers[p.id] ? "..." : 0)}/{p.maxMembers} members</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  {isJoined && <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">Joined</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-white/40">
            Page {page} of {totalPages} ({filtered.length} parties)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/70 disabled:opacity-30 hover:border-white/20"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/70 disabled:opacity-30 hover:border-white/20"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
