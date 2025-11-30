"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import { PartyDto } from "@/types/parties";
import PartyDetailClient from "./PartyDetailClient";
import PartyStash from "./PartyStash";
import MeetingManagement from "./MeetingManagement";
import InviteMemberModal from "./InviteMemberModal";
import { createClient } from "@/utils/supabase/client";
import RoleGate from "@/components/party/RoleGate";
import { usePartyRole } from "@/hooks/usePartyRole";
import { Users, Settings, UserPlus, LogOut, MoreVertical, Crown, HelpCircle } from "lucide-react";
import PartyInfoModal from "./PartyInfoModal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { PartyMemberDto, PartyInvitationDto, PartyRole } from "@/types/parties";
import * as usersApi from "@/api/usersApi";
import PartyMembersList from "./PartyMembersList";

export default function PartyDetailPageClient({ partyId }: { partyId: string }) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [party, setParty] = useState<PartyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [settingsName, setSettingsName] = useState<string>("");
  const [settingsDescription, setSettingsDescription] = useState<string>("");
  const [settingsIsPublic, setSettingsIsPublic] = useState<boolean>(true);
  const [settingsMaxMembers, setSettingsMaxMembers] = useState<number>(6);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [refreshAt, setRefreshAt] = useState<number>(0);
  const router = useRouter();
  const { role, refresh: refreshRole } = usePartyRole(partyId);
  const [members, setMembers] = useState<PartyMemberDto[]>([]);
  const [invites, setInvites] = useState<PartyInvitationDto[]>([]);
  const [stashCount, setStashCount] = useState<number>(0);
  const [inviteeNameById, setInviteeNameById] = useState<Record<string, string>>({});

  const triggerRefresh = () => {
    setRefreshAt((prev) => prev + 1);
    refreshRole();
  };

  useEffect(() => {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data }) => setAuthUserId(data.user?.id ?? null));
    }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await partiesApi.getById(partyId);
        if (!mounted) return;
        setParty((res.data as PartyDto | null) ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load party");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [partyId]);

  useEffect(() => {
    let mounted = true;
    const loadSideData = async () => {
      try {
        const [memRes, stashRes, invRes] = await Promise.all([
          partiesApi.getMembers(partyId),
          partiesApi.getResources(partyId),
          partiesApi.getPendingInvitations(partyId),
        ]);
        if (!mounted) return;
        setMembers(memRes.data ?? []);
        setStashCount((stashRes.data ?? []).length);
        setInvites(invRes.data ?? []);
      } catch {
        if (!mounted) return;
        setMembers([]);
        setStashCount(0);
        setInvites([]);
      }
    };
    loadSideData();
    return () => { mounted = false; };
  }, [partyId, refreshAt]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ids = Array.from(new Set(invites
        .filter(i => !i.inviteeName)
        .map(i => i.inviteeId)))
        .filter(id => !!id && !(id in inviteeNameById));
      if (ids.length === 0) return;
      try {
        const results = await Promise.all(ids.map(id => usersApi.getUserProfileByAuthId(id)));
        const map: Record<string, string> = { ...inviteeNameById };
        ids.forEach((id, i) => {
          const resp = results[i]?.data as any;
          const fullName = resp?.fullName || [resp?.firstName, resp?.lastName].filter(Boolean).join(" ") || resp?.username || resp?.email || "External Invite";
          map[id] = fullName;
        });
        if (mounted) setInviteeNameById(map);
      } catch {
        // ignore failures; keep fallbacks
      }
    })();
    return () => { mounted = false; };
  }, [invites, inviteeNameById]);

  useEffect(() => {
    // Sync settings form state when party loads
    if (party) {
      setSettingsName(party.name ?? "");
      setSettingsDescription((party as any).description ?? "");
      setSettingsIsPublic(!!party.isPublic);
      setSettingsMaxMembers(party.maxMembers ?? 6);
    }
  }, [party]);

  const handleSaveSettings = async () => {
    if (!party) return;
    if (settingsMaxMembers <= members.length) { setSettingsError(`Max members must be greater than current (${members.length})`); return; }
    if (settingsMaxMembers < 2) { setSettingsError('Max members must be at least 2'); return; }
    if (settingsMaxMembers > 8) { setSettingsError('Max members must be at most 8'); return; }
    setIsSavingSettings(true);
    setError(null);
    try {
      await partiesApi.configure(party.id, {
        partyId: party.id,
        name: settingsName,
        description: settingsDescription,
        privacy: settingsIsPublic ? "Public" : "Private",
        maxMembers: settingsMaxMembers,
      });
      // Reload party details
      const res = await partiesApi.getById(party.id);
      setParty((res.data as PartyDto | null) ?? null);
      setShowSettingsModal(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLeaveParty = async () => {
    if (!party) return;
    if (role === "Leader") {
      setError("Leader must transfer leadership before leaving");
      setShowLeaveConfirm(false);
      return;
    }
    setIsLeaving(true);
    try {
      await partiesApi.leave(party.id, { partyId: party.id, authUserId: authUserId! });
      router.push("/parties");
    } catch (e: any) {
      setError(e?.message ?? "Failed to leave party");
    } finally {
      setIsLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const header = (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#f5c16c]/30 bg-linear-to-br from-[#f5c16c]/20 to-[#d4a855]/20 shadow-lg">
          <Users className="h-7 w-7 text-[#f5c16c]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#f5c16c]">{party?.name ?? "Party"}</h2>
          {party && (
            <div className="text-sm text-white/60">{party.partyType} • {party.isPublic ? "Public" : "Private"} • Max {party.maxMembers}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-2 rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white"
          title="Party overview"
        >
          <HelpCircle className="h-4 w-4" />
          Info
        </button>
        <RoleGate partyId={partyId} requireAny={["Leader", "CoLeader"]}>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white"
            title="Configure settings"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </RoleGate>
        <RoleGate partyId={partyId} requireAny={["Leader", "CoLeader"]}>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </RoleGate>
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Leave Party
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {(loading || role === null || !party) && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-[#f5c16c]" />
        </div>
      )}
      {showInfoModal && (
        <PartyInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} partyId={partyId} />
      )}
      {!loading && role !== null && party && (
        <PartyDetailClient header={header}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Social / Meta (30%) */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Party Info</div>
                <div className="mt-1 text-xs italic text-white/70">{(party as any).description || "No description."}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/80">
                  <span title="Members">👥 {members.length}</span>
                  <span title="Stash">📦 {stashCount}</span>
                  {invites.length > 0 && <span title="Invites">✉️ {invites.length}</span>}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Party Details</div>
                {party && (
                  <div className="mt-2 space-y-2 text-xs text-white/80">
                    <div className="flex items-center justify-between"><span>Type</span><span className="rounded bg-white/10 px-2 py-0.5 text-white/70">{party.partyType}</span></div>
                    <div className="flex items-center justify-between"><span>Privacy</span><span className="rounded bg-white/10 px-2 py-0.5 text-white/70">{party.isPublic ? "Public" : "Private"}</span></div>
                    <div className="flex items-center justify-between"><span>Max Members</span><span className="rounded bg-white/10 px-2 py-0.5 text-white/70">{party.maxMembers}</span></div>
                    <div className="flex items-center justify-between"><span>Owner ID</span><span className="rounded bg-white/10 px-2 py-0.5 text-white/70">{party.createdBy}</span></div>
                    <div className="flex items-center justify-between"><span>Created</span><span className="rounded bg-white/10 px-2 py-0.5 text-white/70">{new Date(party.createdAt).toLocaleDateString()}</span></div>
                  </div>
                )}
              </div>

              <PartyMembersList partyId={party.id} members={members} maxMembers={party.maxMembers} onRefresh={async () => { triggerRefresh(); }} />

              {invites.length > 0 && (
                <div className="rounded-lg border border-[#f5c16c]/20 bg-black/40 p-4">
                  <div className="mb-2 text-sm font-medium text-[#f5c16c]">Pending Invitations</div>
                  <ul className="space-y-2">
                    {invites.map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span>To: {inv.inviteeName || inviteeNameById[inv.inviteeId] || "External Invite"}</span>
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{inv.status}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Workspace (70%) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">Study Sprints</div>
                  <RoleGate partyId={partyId} requireAny={["Leader", "CoLeader"]}>
                    <button onClick={() => setShowScheduleModal(true)} className="rounded bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2 text-xs font-semibold text-black">📅 Schedule Sprint</button>
                  </RoleGate>
                </div>
                <div>
                  <MeetingManagement partyId={party.id} variant="compact" />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <PartyStash partyId={party.id} />
              </div>
            </div>
          </div>
        </PartyDetailClient>
      )}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative overflow-hidden rounded-[28px] border border-rose-500/30 bg-linear-to-b from-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
            {/* Texture overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                backgroundSize: "100px",
                backgroundBlendMode: "overlay",
              }}
            />
            <div className="relative">
              <h3 className="mb-4 text-xl font-semibold text-rose-400">
                Leave Party
              </h3>
              <p className="mb-6 max-w-sm text-sm text-white/70">
                Are you sure you want to leave this party? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveParty}
                  disabled={isLeaving}
                  className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLeaving ? "Leaving..." : "Leave"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showInviteModal && party && (
        <InviteMemberModal
          partyId={party.id}
          onClose={() => setShowInviteModal(false)}
          onInvited={triggerRefresh}
        />
      )}
      {showSettingsModal && party && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSettingsModal(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-b from-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
            {/* Texture overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                backgroundSize: "100px",
                backgroundBlendMode: "overlay",
              }}
            />
            <div className="relative">
              <h3 className="mb-6 text-xl font-semibold text-[#f5c16c]">Configure Party</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#f5c16c]/80">Name</label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3 text-white placeholder-white/40 focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#f5c16c]/80">Description</label>
                  <textarea
                    value={settingsDescription}
                    onChange={(e) => setSettingsDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3 text-white placeholder-white/40 focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3">
                  <input
                    id="party-public-toggle"
                    type="checkbox"
                    checked={settingsIsPublic}
                    onChange={(e) => setSettingsIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-[#f5c16c]/30 bg-black/60 text-[#f5c16c] focus:ring-2 focus:ring-[#f5c16c]/30"
                  />
                  <label htmlFor="party-public-toggle" className="text-sm text-white/70">
                    Public party
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#f5c16c]/80">Max Members</label>
                  <input
                    type="number"
                    min={Math.max(2, members.length + 1)}
                    max={8}
                    value={settingsMaxMembers}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setSettingsMaxMembers(v);
                      if (v <= members.length) setSettingsError(`Max members must be greater than current (${members.length})`);
                      else if (v < 2) setSettingsError('Max members must be at least 2');
                      else if (v > 8) setSettingsError('Max members must be at most 8');
                      else setSettingsError(null);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3 text-white placeholder-white/40 focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
                  />
                  {settingsError && (
                    <div className="mt-1 text-xs text-rose-400">{settingsError}</div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShowSettingsModal(false)} 
                  className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings || !!settingsError}
                  className="rounded-lg bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-5 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingSettings ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showScheduleModal && party && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowScheduleModal(false)} />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-b from-[#1a0a08] to-[#0a0506] p-6 shadow-2xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", backgroundSize: "100px", backgroundBlendMode: "overlay" }}
            />
            <div className="relative">
              <div className="mb-3 text-sm font-semibold text-[#f5c16c]">Schedule New Sprint</div>
              <MeetingManagement partyId={party.id} variant="full" showList={false} />
              <div className="mt-4 flex justify-end">
                <button className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-2 text-sm text-white/80" onClick={() => setShowScheduleModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}