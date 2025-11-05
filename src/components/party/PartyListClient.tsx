"use client";
import React, { useEffect, useMemo, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { PartyDto, PartyInvitationDto } from "@/types/parties";
import { toast } from "sonner";
import { getMyContext } from "@/api/usersApi";
import PartyCard from "./PartyCard";

interface PartyListClientProps {
  onSelectParty?: (party: PartyDto | null) => void;
}

export default function PartyListClient({ onSelectParty }: PartyListClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<PartyDto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [publicParties, setPublicParties] = useState<PartyDto[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [joinBusyId, setJoinBusyId] = useState<string | null>(null);
  const [selectedPublic, setSelectedPublic] = useState<PartyDto | null>(null);
  const [myInvites, setMyInvites] = useState<PartyInvitationDto[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [publicSearch, setPublicSearch] = useState<string>("");
  const [partyNameMap, setPartyNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const fetchParties = async () => {
      try {
        // Use non-admin endpoint: fetch current user's parties
        const res = await partiesApi.getMine();
        if (!mounted) return;
        setParties(res.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load parties");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchParties();
    // Load public parties discovery
    (async () => {
      try {
        setLoadingPublic(true);
        const res = await partiesApi.getAll();
        if (!mounted) return;
        setPublicParties((res.data ?? []).filter(p => p.isPublic));
      } catch {
        if (!mounted) return;
        setPublicParties([]);
      } finally {
        if (!mounted) return;
        setLoadingPublic(false);
      }
    })();
    // Load my pending invitations
    (async () => {
      try {
        setLoadingInvites(true);
        const res = await partiesApi.getMyPendingInvitations();
        if (!mounted) return;
        setMyInvites(res.data ?? []);
      } catch {
        if (!mounted) return;
        setMyInvites([]);
      } finally {
        if (!mounted) return;
        setLoadingInvites(false);
      }
    })();
    // Load auth user context
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
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(term));
  }, [parties, search]);

  const handleSelect = (party: PartyDto) => {
    setSelectedId(party.id);
    onSelectParty?.(party);
  };

  // Resolve party names for pending invitations: use my parties, public list, or fetch by id
  useEffect(() => {
    let mounted = true;
    (async () => {
      const currentMap: Record<string, string> = { ...partyNameMap };
      const knownParties = [...parties, ...publicParties];
      const missingIds = new Set<string>();
      myInvites.forEach(inv => {
        const known = knownParties.find(p => p.id === inv.partyId);
        if (known) currentMap[inv.partyId] = known.name;
        else if (!currentMap[inv.partyId]) missingIds.add(inv.partyId);
      });
      if (missingIds.size > 0) {
        const fetches = [...missingIds].map(id => partiesApi.getById(id));
        try {
          const results = await Promise.all(fetches);
          results.forEach((res) => {
            const p = res.data as PartyDto | null;
            if (p) currentMap[p.id] = p.name;
          });
        } catch {}
      }
      if (mounted) setPartyNameMap(currentMap);
    })();
    return () => { mounted = false; };
  }, [myInvites, parties, publicParties]);

  const handleJoin = async (partyIdToJoin: string) => {
    try {
      setJoinBusyId(partyIdToJoin);
      await partiesApi.joinPublic(partyIdToJoin);
      toast.success("Joined party successfully.");
      // Refresh my parties
      const resMine = await partiesApi.getMine();
      setParties(resMine.data ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to join party");
    } finally {
      setJoinBusyId(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="sticky top-0 z-10 bg-[#08040a]/80 pb-2">
        <input
          type="text"
          placeholder="Search parties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-fuchsia-500/60 focus:outline-none"
        />
      </div>
      {loading && <div className="text-sm text-white/70">Loading parties...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-xs text-white/50">No parties found.</div>
      )}
      <div className="flex flex-col gap-2">
        {filtered.map(p => (
          <PartyCard key={p.id} party={p} selected={selectedId === p.id} onClick={handleSelect} />
        ))}
      </div>

      {/* Global Pending Invitations Panel */}
      <div className="mt-6 rounded-lg border border-white/10 bg-[#0a0710] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">My Pending Invitations</h4>
          {loadingInvites && <span className="text-xs text-white/60">Loading...</span>}
        </div>
        {myInvites.length === 0 ? (
          <div className="text-xs text-white/60">You have no pending invitations.</div>
        ) : (
          <ul className="space-y-2">
            {myInvites.map(inv => (
              <li key={inv.id} className="flex items-center justify-between rounded bg-white/5 p-3">
                <div>
                  <div className="text-sm text-white">Invitation to party {partyNameMap[inv.partyId] ?? inv.partyId}</div>
                  <div className="text-[11px] text-white/50">Sent at {new Date(inv.createdAt).toLocaleString()} • Expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!authUserId) { toast.error("Not authenticated"); return; }
                      try {
                        await partiesApi.acceptInvitation(inv.partyId, inv.id, { partyId: inv.partyId, invitationId: inv.id, authUserId });
                        toast.success("Invitation accepted");
                        // Refresh invitations and my parties
                        const [resInv, resMine] = await Promise.all([
                          partiesApi.getMyPendingInvitations(),
                          partiesApi.getMine(),
                        ]);
                        setMyInvites(resInv.data ?? []);
                        setParties(resMine.data ?? []);
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to accept invitation");
                      }
                    }}
                    className="rounded bg-emerald-600 px-3 py-1.5 text-xs text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={async () => {
                      if (!authUserId) { toast.error("Not authenticated"); return; }
                      try {
                        await partiesApi.declineInvitation(inv.partyId, inv.id, { partyId: inv.partyId, invitationId: inv.id, authUserId });
                        toast.success("Invitation declined");
                        const resInv = await partiesApi.getMyPendingInvitations();
                        setMyInvites(resInv.data ?? []);
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to decline invitation");
                      }
                    }}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs text-white"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Discover Public Parties Panel */}
      <div className="mt-6 rounded-lg border border-white/10 bg-[#0a0710] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Discover Public Parties</h4>
          {loadingPublic && <span className="text-xs text-white/60">Loading...</span>}
        </div>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search public parties..."
            value={publicSearch}
            onChange={(e) => setPublicSearch(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-fuchsia-500/60 focus:outline-none"
          />
        </div>
        {publicParties.filter(p => p.name.toLowerCase().includes(publicSearch.toLowerCase())).length === 0 ? (
          <div className="text-xs text-white/60">No public parties available right now.</div>
        ) : (
          <ul className="space-y-2">
            {publicParties.filter(p => p.name.toLowerCase().includes(publicSearch.toLowerCase())).map(p => (
              <li key={p.id} className="flex items-center justify-between rounded bg-white/5 p-3">
                <button className="text-left" onClick={() => setSelectedPublic(p)}>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  <div className="text-xs text-white/60">{p.description}</div>
                  <div className="text-[11px] text-white/50">Max {p.maxMembers} • {p.isPublic ? 'Public' : 'Private'}</div>
                </button>
                <button
                  className="rounded bg-fuchsia-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  disabled={!p.isPublic || joinBusyId === p.id}
                  onClick={() => handleJoin(p.id)}
                >
                  {joinBusyId === p.id ? 'Joining...' : 'Join'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Public Party Detail Modal */}
      {selectedPublic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#08040a] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-white">{selectedPublic.name}</h3>
            <div className="space-y-3">
              <div className="text-sm text-white/70">{selectedPublic.description}</div>
              <div className="text-xs text-white/50">Type: {selectedPublic.partyType}</div>
              <div className="text-xs text-white/50">Max Members: {selectedPublic.maxMembers}</div>
              <div className="text-xs text-white/50">Created: {new Date(selectedPublic.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedPublic(null)} className="rounded bg-white/10 px-4 py-2 text-sm">
                Close
              </button>
              <button
                onClick={() => handleJoin(selectedPublic.id)}
                disabled={joinBusyId === selectedPublic.id}
                className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {joinBusyId === selectedPublic.id ? "Joining..." : "Join Party"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}