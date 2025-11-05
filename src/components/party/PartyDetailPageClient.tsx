"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import { PartyDto } from "@/types/parties";
import PartyDetailClient, { Tabs } from "./PartyDetailClient";
import PartyDashboard from "./PartyDashboard";
import PartyStash from "./PartyStash";
import MeetingScheduler from "./MeetingScheduler";
import LiveMeeting from "./LiveMeeting";
import InviteMemberModal from "./InviteMemberModal";

export default function PartyDetailPageClient({ partyId }: { partyId: string }) {
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
    setIsLeaving(true);
    try {
      // FIXME: Get the real authUserId from user context
      const authUserId = "00000000-0000-0000-0000-000000000000";
      await partiesApi.leave(party.id, { partyId: party.id, authUserId });
      router.push("/party");
    } catch (e: any) {
      setError(e?.message ?? "Failed to leave party");
    } finally {
      setIsLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const header = (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white shadow-md">
          <span className="text-base font-bold">P</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{party?.name ?? "Party"}</h2>
          {party && (
            <div className="text-xs text-white/70">{party.partyType} • {party.isPublic ? "Public" : "Private"} • Max {party.maxMembers}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="rounded bg-white/10 px-3 py-2 text-xs"
          title="Configure settings"
        >
          ⚙ Settings
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="rounded bg-white/10 px-3 py-2 text-xs"
        >
          Invite Member
        </button>
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="rounded bg-red-500/20 px-3 py-2 text-xs text-red-300 hover:bg-red-500/30"
        >
          Leave Party
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-white/70">Loading...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      {!loading && (
        <PartyDetailClient header={header}>
          <Tabs active={activeTab} onChange={setActiveTab} />
          {activeTab === "dashboard" && party && <PartyDashboard partyId={party.id} />}
          {activeTab === "stash" && party && <PartyStash partyId={party.id} />}
          {activeTab === "scheduler" && <MeetingScheduler />}
          {activeTab === "live" && <LiveMeeting />}
        </PartyDetailClient>
      )}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-lg border border-white/10 bg-[#08040a] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Leave Party
            </h3>
            <p className="mb-6 text-sm text-white/70">
              Are you sure you want to leave this party?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="rounded bg-white/10 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveParty}
                disabled={isLeaving}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isLeaving ? "Leaving..." : "Leave"}
              </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#08040a] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-white">Configure Party</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/70">Name</label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full rounded border border-white/20 bg-white/10 p-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70">Description</label>
                <textarea
                  value={settingsDescription}
                  onChange={(e) => setSettingsDescription(e.target.value)}
                  className="w-full rounded border border-white/20 bg-white/10 p-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="party-public-toggle"
                  type="checkbox"
                  checked={settingsIsPublic}
                  onChange={(e) => setSettingsIsPublic(e.target.checked)}
                />
                <label htmlFor="party-public-toggle" className="text-xs text-white/70">
                  Public party
                </label>
              </div>
              <div>
                <label className="block text-xs text-white/70">Max Members</label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={settingsMaxMembers}
                  onChange={(e) => setSettingsMaxMembers(Number(e.target.value))}
                  className="w-full rounded border border-white/20 bg-white/10 p-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowSettingsModal(false)} className="rounded bg-white/10 px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSavingSettings ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}