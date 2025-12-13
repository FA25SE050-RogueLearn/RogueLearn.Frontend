"use client";
import React, { useEffect, useMemo, useState } from "react";
import PartyCreationWizard from "./PartyCreationWizard";
import PublicPartiesCard from "./PublicPartiesCard";
import { PartyDto, PartyInvitationDto, PartyMemberDto } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { getMyContext } from "@/api/usersApi";
import { toast } from "sonner";
import { Users, Plus, LayoutGrid, Compass, Archive, Bell, ChevronRight, HelpCircle, ExternalLink } from "lucide-react";

export default function PartyManagementClient() {
  const [showWizard, setShowWizard] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "discover" | "archived">("dashboard");
  const [parties, setParties] = useState<PartyDto[]>([]);
  const [loadingParties, setLoadingParties] = useState(true);
  const [errorParties, setErrorParties] = useState<string | null>(null);
  const [myInvites, setMyInvites] = useState<PartyInvitationDto[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [partyMembers, setPartyMembers] = useState<Record<string, PartyMemberDto[]>>({});
  

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
      if (inv.joinLink) {
        window.open(inv.joinLink, "_blank");
      }
      const [resInv, resMine] = await Promise.all([
        partiesApi.getMyPendingInvitations(),
        partiesApi.getMine(),
      ]);
      setMyInvites(resInv.data ?? []);
      setParties(resMine.data ?? []);
    } catch (e: any) {
      // toast.error(e?.message ?? "Failed to accept invitation");
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
      // toast.error(e?.message ?? "Failed to decline invitation");
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
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5 transition-all hover:border-[#f5c16c]/30 hover:bg-black/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#f5c16c]/30 bg-[#f5c16c]/10">
              <Users className="h-6 w-6 text-[#f5c16c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white group-hover:text-[#f5c16c]">{party.name}</h3>
                <span className="rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-2 py-0.5 text-[10px] text-[#f5c16c]">{party.partyType}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                <span>{party.isPublic ? "Public" : "Private"}</span>
                <span>•</span>
                <span>Max {party.maxMembers}</span>
              </div>
            </div>
          </div>
          <a href={`/parties/${party.id}`} className="rounded-lg border border-[#f5c16c]/30 bg-transparent px-3 py-1.5 text-xs font-medium text-[#f5c16c] transition-all hover:bg-[#f5c16c]/10">
            Enter <ChevronRight className="ml-1 inline h-3 w-3" />
          </a>
        </div>
        {renderMemberSlots(party)}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 min-h-[70vh] grid grid-cols-[280px_1fr]">
      {/* Left Sidebar */}
      <div className="border-r border-white/10 p-4 space-y-4">
        <button
          onClick={() => setShowWizard(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_15px_rgba(245,193,108,0.3)] transition-all hover:shadow-[0_0_25px_rgba(245,193,108,0.5)]"
        >
          <Plus className="h-4 w-4" />
          Create Party
        </button>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
            <LayoutGrid className="h-4 w-4" />
            <span>Navigation</span>
          </div>
          <nav className="space-y-1">
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${activeView === "dashboard" ? "bg-[#f5c16c]/10 text-[#f5c16c] border border-[#f5c16c]/30" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              onClick={() => setActiveView("dashboard")}
            >
              <LayoutGrid className="h-4 w-4" />
              My Parties
            </button>
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${activeView === "discover" ? "bg-[#f5c16c]/10 text-[#f5c16c] border border-[#f5c16c]/30" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              onClick={() => setActiveView("discover")}
            >
              <Compass className="h-4 w-4" />
              Discover
            </button>
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${activeView === "archived" ? "bg-[#f5c16c]/10 text-[#f5c16c] border border-[#f5c16c]/30" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              onClick={() => setActiveView("archived")}
            >
              <Archive className="h-4 w-4" />
              Archived
            </button>
          </nav>
        </div>

        {/* Invitations Section */}
        {myInvites.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#d23187]/80 mb-3">
              <Bell className="h-4 w-4" />
              <span>Invitations ({myInvites.length})</span>
            </div>
            <div className="space-y-2">
              {myInvites.map((inv) => (
                <div key={inv.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="text-xs text-white mb-1 truncate">{inv.partyName || partyNameById[inv.partyId] || "Party"}</div>
                  <div className="text-[10px] text-white/40 mb-2">Expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                  {inv.message && <div className="mb-2 text-[10px] text-white/60 line-clamp-2">{inv.message}</div>}
                  {inv.joinLink && (
                    <button
                      onClick={() => window.open(inv.joinLink!, "_blank")}
                      className="mb-2 flex items-center gap-1 rounded bg-[#f5c16c]/15 px-2 py-1 text-[10px] text-[#f5c16c] hover:bg-[#f5c16c]/25"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open game link
                    </button>
                  )}
                  {inv.gameSessionId && (
                    <div className="mb-2 text-[10px] text-white/40">
                      Session: <span className="text-white/70">{inv.gameSessionId}</span>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <button onClick={() => handleAcceptInvite(inv)} className="flex-1 rounded bg-emerald-600/80 px-2 py-1 text-[10px] font-medium text-white hover:bg-emerald-600">Accept</button>
                    <button onClick={() => handleDeclineInvite(inv)} className="flex-1 rounded bg-rose-600/80 px-2 py-1 text-[10px] font-medium text-white hover:bg-rose-600">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Help */}
        <div className="border-t border-white/10 pt-4">
          <button className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 hover:border-white/20 hover:text-white/70">
            <HelpCircle className="h-4 w-4" />
            Party Guide
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {activeView === "dashboard" ? "My Parties" : activeView === "discover" ? "Discover Public Parties" : "Archived Parties"}
          </h2>
          {loadingInvites ? (
            <span className="text-xs text-white/40">Loading...</span>
          ) : myInvites.length > 0 ? (
            <span className="flex items-center gap-1.5 rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-2.5 py-1 text-xs text-[#d23187]">
              <Bell className="h-3 w-3" />
              {myInvites.length} pending
            </span>
          ) : null}
        </div>

        {activeView === "dashboard" && (
          <>
            {loadingParties && <div className="text-sm text-white/50">Loading parties...</div>}
            {errorParties && <div className="text-xs text-red-400">{errorParties}</div>}
            {!loadingParties && !errorParties && parties.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="rounded-full bg-[#f5c16c]/10 p-6">
                  <Users className="h-12 w-12 text-[#f5c16c]" />
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-semibold text-[#f5c16c]">No Parties Yet</div>
                  <div className="text-sm text-white/50">Create or discover a party to get started.</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowWizard(true)} className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-medium text-black">Create Party</button>
                  <button onClick={() => setActiveView("discover")} className="rounded-lg border border-[#f5c16c]/30 bg-transparent px-4 py-2.5 text-sm text-[#f5c16c] hover:bg-[#f5c16c]/10">Find a Party</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {parties.map((p) => (
                <PartyTile key={p.id} party={p} />
              ))}
            </div>
          </>
        )}

        {activeView === "discover" && <PublicPartiesCard />}

        {activeView === "archived" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Archive className="h-12 w-12 text-white/20 mb-4" />
            <div className="text-sm text-white/40">No archived parties.</div>
          </div>
        )}
      </div>

      <PartyCreationWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreated={(id) => { window.location.href = `/parties/${id}`; }}
      />
    </div>
  );
}

