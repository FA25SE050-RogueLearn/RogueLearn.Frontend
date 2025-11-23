"use client";
import React, { useEffect, useMemo, useState } from "react";
import PartyCreationWizard from "./PartyCreationWizard";
import PublicPartiesCard from "./PublicPartiesCard";
import { PartyDto, PartyInvitationDto, PartyMemberDto } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { getMyContext } from "@/api/usersApi";
import { toast } from "sonner";
import { Users, Plus, LayoutGrid, Compass, Archive, Bell, ChevronRight, HelpCircle } from "lucide-react";
import PartyInfoModal from "./PartyInfoModal";

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const MAIN_CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export default function PartyManagementClient() {
  const [showWizard, setShowWizard] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "discover" | "archived">("dashboard");
  const [parties, setParties] = useState<PartyDto[]>([]);
  const [loadingParties, setLoadingParties] = useState(true);
  const [errorParties, setErrorParties] = useState<string | null>(null);
  const [myInvites, setMyInvites] = useState<PartyInvitationDto[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [partyMembers, setPartyMembers] = useState<Record<string, PartyMemberDto[]>>({});
  const [invitePartyNames, setInvitePartyNames] = useState<Record<string, string>>({});
  

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingParties(true);
        setErrorParties(null);
        const res = await partiesApi.getMine();
        if (!mounted) return;
        setParties(res.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setErrorParties(e?.message ?? "Failed to load parties");
      } finally {
        if (!mounted) return;
        setLoadingParties(false);
      }
    };
    const loadMe = async () => {
      try {
        const me = await getMyContext();
        if (!mounted) return;
        setAuthUserId(me.data?.authUserId ?? null);
      } catch {
        if (!mounted) return;
        setAuthUserId(null);
      }
    };
    load();
    loadMe();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
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
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const idsToResolve = myInvites.map((i) => i.partyId).filter((id) => !(id in invitePartyNames) && !(parties.find((p) => p.id === id)));
      if (idsToResolve.length === 0) return;
      const results = await Promise.all(idsToResolve.map((id) => partiesApi.getById(id)));
      const map: Record<string, string> = { ...invitePartyNames };
      idsToResolve.forEach((id, i) => { const data = results[i].data as PartyDto | null; if (data?.name) map[id] = data.name; });
      if (mounted) setInvitePartyNames(map);
    })();
    return () => { mounted = false; };
  }, [myInvites, parties, invitePartyNames]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ids = parties.map((p) => p.id);
      if (ids.length === 0) { if (mounted) setPartyMembers({}); return; }
      try {
        const results = await Promise.all(ids.map((id) => partiesApi.getMembers(id)));
        const map: Record<string, PartyMemberDto[]> = {};
        ids.forEach((id, i) => { map[id] = results[i].data ?? []; });
        if (mounted) setPartyMembers(map);
      } catch {
        if (mounted) setPartyMembers({});
      }
    })();
    return () => { mounted = false; };
  }, [parties]);

  const partyNameById = useMemo(() => {
    const map: Record<string, string> = {};
    parties.forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [parties]);

  const handleAcceptInvite = async (inv: PartyInvitationDto) => {
    if (!authUserId) { toast.error("Not authenticated"); return; }
    try {
      await partiesApi.acceptInvitation(inv.partyId, inv.id, { partyId: inv.partyId, invitationId: inv.id, authUserId });
      toast.success("Invitation accepted");
      const [resInv, resMine] = await Promise.all([
        partiesApi.getMyPendingInvitations(),
        partiesApi.getMine(),
      ]);
      setMyInvites(resInv.data ?? []);
      setParties(resMine.data ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to accept invitation");
    }
  };

  const handleDeclineInvite = async (inv: PartyInvitationDto) => {
    if (!authUserId) { toast.error("Not authenticated"); return; }
    try {
      await partiesApi.declineInvitation(inv.partyId, inv.id, { partyId: inv.partyId, invitationId: inv.id, authUserId });
      toast.success("Invitation declined");
      const resInv = await partiesApi.getMyPendingInvitations();
      setMyInvites(resInv.data ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to decline invitation");
    }
  };

  

  const renderMemberSlots = (p: PartyDto) => {
    const members = partyMembers[p.id] ?? [];
    const filled = members.slice(0, Math.min(members.length, p.maxMembers));
    const emptyCount = Math.max(p.maxMembers - filled.length, 0);
    return (
      <div className="mt-3 flex items-center gap-2">
        {filled.map((m) => (
          <div key={m.id} className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-[#f5c16c]/40">
            {m.profileImageUrl ? (
              <img src={m.profileImageUrl} alt={m.username ?? m.email ?? "Member"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#f5c16c]/10 text-xs text-[#f5c16c]">
                {(m.username ?? m.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8 rounded-full border border-white/20" />
        ))}
      </div>
    );
  };

  const PartyTile = ({ party }: { party: PartyDto }) => {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-linear-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", backgroundSize: "100px", backgroundBlendMode: "overlay" }} />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#f5c16c]/30 bg-linear-to-br from-[#f5c16c]/20 to-[#d4a855]/20 shadow-lg">
                <Users className="h-6 w-6 text-[#f5c16c]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#f5c16c]">{party.name}</h3>
                  <span className="rounded bg-[#f5c16c]/10 px-2 py-0.5 text-xs text-[#f5c16c]/80">{party.partyType}</span>
                </div>
                <div className="text-xs text-white/60">{party.isPublic ? "Public" : "Private"} • Max {party.maxMembers}</div>
              </div>
            </div>
            <a href={`/parties/${party.id}`} className="inline-flex items-center gap-1 rounded-lg bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-3 py-1.5 text-xs font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c]">
              Enter Party
              <ChevronRight className="h-3 w-3" />
            </a>
          </div>
          {renderMemberSlots(party)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen overflow-hidden bg-linear-to-b from-[#0a0506] via-[#120806] to-[#0a0506]">
      <aside className="flex w-72 flex-col border-r border-[#f5c16c]/20 bg-black/20">
        <div className="border-b border-[#f5c16c]/20 p-4">
          <button
            onClick={() => setShowWizard(true)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_15px_rgba(245,193,108,0.4)] transition-all hover:shadow-[0_0_25px_rgba(245,193,108,0.6)]"
          >
            <Plus className="h-4 w-4" />
            Create New Party
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#f5c16c]/30 bg-black/30 px-4 py-2.5 text-sm font-medium text-white/80 hover:border-[#f5c16c]/50 hover:bg-black/40"
          >
            <HelpCircle className="h-4 w-4" />
            Info
          </button>
        </div>
        <nav className="flex flex-1 flex-col p-2">
          <button
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeView === "dashboard" ? "bg-[#f5c16c]/10 text-[#f5c16c]" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => setActiveView("dashboard")}
          >
            <LayoutGrid className="h-4 w-4" />
            Dashboard
          </button>
          <button
            className={`mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeView === "discover" ? "bg-[#f5c16c]/10 text-[#f5c16c]" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => setActiveView("discover")}
          >
            <Compass className="h-4 w-4" />
            Discover
          </button>
          <button
            className={`mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeView === "archived" ? "bg-[#f5c16c]/10 text-[#f5c16c]" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => setActiveView("archived")}
          >
            <Archive className="h-4 w-4" />
            Archived
          </button>
          
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f5c16c]">{activeView === "dashboard" ? "Active Squads" : activeView === "discover" ? "Discover Public Parties" : "Archived"}</h2>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#f5c16c]" />
            {loadingInvites ? (
              <span className="text-xs text-white/60">Loading invitations…</span>
            ) : myInvites.length > 0 ? (
              <span className="text-xs text-white/80">{myInvites.length} pending</span>
            ) : (
              <span className="text-xs text-white/50">No invites</span>
            )}
          </div>
        </div>

        {myInvites.length > 0 && (
          <div className="mb-6 rounded-xl border border-[#f5c16c]/30 bg-linear-to-r from-[#2d1810]/70 to-black/70 p-4">
            <div className="mb-2 text-sm font-medium text-[#f5c16c]">Pending Invitations</div>
            <div className="flex flex-col gap-2">
              {myInvites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3">
                  <div>
                    <div className="text-sm text-white">Invitation to {partyNameById[inv.partyId] ?? invitePartyNames[inv.partyId] ?? inv.partyId}</div>
                    <div className="text-[11px] text-white/60">Expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptInvite(inv)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Accept</button>
                    <button onClick={() => handleDeclineInvite(inv)} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === "dashboard" && (
          <div className={MAIN_CARD_CLASS}>
            <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
            <div className="relative p-6">
              {loadingParties && <div className="text-sm text-white/70">Loading parties…</div>}
              {errorParties && <div className="text-xs text-red-400">{errorParties}</div>}
              {!loadingParties && !errorParties && parties.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="rounded-full bg-[#f5c16c]/10 p-6">
                    <Users className="h-12 w-12 text-[#f5c16c]" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-semibold text-[#f5c16c]">No Parties Yet</div>
                    <div className="text-sm text-white/70">Create or discover a party to get started.</div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowWizard(true)} className="rounded-lg bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-medium text-black hover:from-[#d4a855] hover:to-[#f5c16c]">Create Party</button>
                    <button onClick={() => setActiveView("discover")} className="rounded-lg border border-[#f5c16c]/30 bg-black/40 px-4 py-2.5 text-sm text-white/80 hover:border-[#f5c16c]/50 hover:bg-black/60">Find a Party</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {parties.map((p) => (
                  <PartyTile key={p.id} party={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "discover" && (
          <div className={MAIN_CARD_CLASS}>
            <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
            <div className="relative p-6">
              <PublicPartiesCard />
            </div>
          </div>
        )}

        {activeView === "archived" && (
          <div className={MAIN_CARD_CLASS}>
            <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
            <div className="relative p-6 text-sm text-white/70">No archived parties.</div>
          </div>
        )}
      </main>

      <PartyCreationWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreated={(id) => { window.location.href = `/parties/${id}`; }}
      />
      {showInfoModal && (
        <PartyInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} />
      )}
    </div>
  );
}