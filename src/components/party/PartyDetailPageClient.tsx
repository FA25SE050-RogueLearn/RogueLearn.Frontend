"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import { PartyDto } from "@/types/parties";
import PartyDetailClient, { Tabs } from "./PartyDetailClient";
import PartyDashboard from "./PartyDashboard";
import PartyStash from "./PartyStash";
import MeetingManagement from "./MeetingManagement";
import InviteMemberModal from "./InviteMemberModal";
import { createClient } from "@/utils/supabase/client";
import RoleGate from "@/components/party/RoleGate";
import { usePartyRole } from "@/hooks/usePartyRole";
import { Users, Settings, UserPlus, LogOut } from "lucide-react";

export default function PartyDetailPageClient({ partyId }: { partyId: string }) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [party, setParty] = useState<PartyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsName, setSettingsName] = useState<string>("");
  const [settingsDescription, setSettingsDescription] = useState<string>("");
  const [settingsIsPublic, setSettingsIsPublic] = useState<boolean>(true);
  const [settingsMaxMembers, setSettingsMaxMembers] = useState<number>(6);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const router = useRouter();
  const { role } = usePartyRole(partyId);

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
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#f5c16c]/30 bg-gradient-to-br from-[#f5c16c]/20 to-[#d4a855]/20 shadow-lg">
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
      {loading && <div className="text-sm text-white/70">Loading...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      {!loading && role === null && (
        <div className="rounded border border-white/10 bg-white/5 p-4 text-sm">
          You do not have permission to view this party.
        </div>
      )}
      {!loading && role !== null && (
        <PartyDetailClient header={header}>
          <Tabs active={activeTab} onChange={setActiveTab} />
          {activeTab === "dashboard" && party && <PartyDashboard partyId={party.id} />}
          {activeTab === "stash" && party && <PartyStash partyId={party.id} />}
          {activeTab === "meetings" && party && <MeetingManagement partyId={party.id} />}
        </PartyDetailClient>
      )}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative overflow-hidden rounded-[28px] border border-rose-500/30 bg-gradient-to-b from-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
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
        />
      )}
      {showSettingsModal && party && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSettingsModal(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-b from-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
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
                    min={2}
                    max={50}
                    value={settingsMaxMembers}
                    onChange={(e) => setSettingsMaxMembers(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3 text-white placeholder-white/40 focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
                  />
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
                  disabled={isSavingSettings}
                  className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-5 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingSettings ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}