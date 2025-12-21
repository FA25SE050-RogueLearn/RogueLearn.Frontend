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
  const [parties, setParties] = useState<PartyDto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [myInvites, setMyInvites] = useState<PartyInvitationDto[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [partyNameMap, setPartyNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetchParties = async () => {
      try {
        // Use non-admin endpoint: fetch current user's parties
        const res = await partiesApi.getMine();
        if (!mounted) return;
        setParties(res.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        toast.error(e?.message ?? "Failed to load parties");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchParties();
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
      const knownParties = [...parties];
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
        } catch { }
      }
      if (mounted) setPartyNameMap(currentMap);
    })();
    return () => { mounted = false; };
  }, [myInvites, parties]);

  // Public party discovery moved to a separate card component

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="sticky top-0 z-10 bg-[#08040a]/80 pb-2">
        <input
          type="text"
          placeholder="Search parties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-md border border-[#f5c16c]/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-[#f5c16c] focus:outline-none focus:ring-1 focus:ring-[#f5c16c]/30"
        />
      </div>
      {loading && <div className="text-sm text-white/70">Loading parties...</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-xs text-white/50">No parties found.</div>
      )}
      <div className="flex flex-col gap-2">
        {filtered.map(p => (
          <PartyCard key={p.id} party={p} selected={selectedId === p.id} onClick={handleSelect} />
        ))}
      </div>

      {/* Global Pending Invitations Panel */}
      <div className="mt-6 rounded-lg border border-[#f5c16c]/20 bg-black/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#f5c16c]">My Pending Invitations</h4>
          {loadingInvites && <span className="text-xs text-white/60">Loading...</span>}
        </div>
        {myInvites.length === 0 ? (
          <div className="text-xs text-white/60">You have no pending invitations.</div>
        ) : (
          <ul className="space-y-2">
            {myInvites.map(inv => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg border border-[#f5c16c]/10 bg-linear-to-br from-[#2d1810]/40 to-black/60 p-3">
                <div>
                  <div className="text-sm text-white">Invitation to party {inv.partyName || partyNameMap[inv.partyId] || inv.partyId}</div>
                  <div className="text-[11px] text-white/50">Invited {new Date(inv.invitedAt).toLocaleString()} • Expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!authUserId) { toast.error("Not authenticated"); return; }
                      try {
                        await partiesApi.acceptInvitation(inv.partyId, inv.id, { partyId: inv.partyId, invitationId: inv.id, authUserId });
                        toast.success("Invitation accepted");
                        if (inv.joinLink) {
                          window.location.assign(inv.joinLink);
                          return;
                        }
                        // Refresh invitations and my parties
                        const [resInv, resMine] = await Promise.all([
                          partiesApi.getMyPendingInvitations(),
                          partiesApi.getMine(),
                        ]);
                        setMyInvites(resInv.data ?? []);
                        setParties(resMine.data ?? []);
                      } catch (e: any) {
                        // toast.error(e?.message ?? "Failed to accept invitation");
                      }
                    }}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
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
                        // toast.error(e?.message ?? "Failed to decline invitation");
                      }
                    }}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Public party discovery moved to PublicPartiesCard component */}
    </div>
  );
}
