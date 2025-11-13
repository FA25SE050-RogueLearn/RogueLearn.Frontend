"use client";
import React, { useMemo, useState } from "react";
import PartyListClient from "./PartyListClient";
import PartyCreationWizard from "./PartyCreationWizard";
import { PartyDto } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { useEffect } from "react";
import PublicPartiesCard from "./PublicPartiesCard";

export default function PartyManagementClient() {
  const [selectedParty, setSelectedParty] = useState<PartyDto | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [membersCount, setMembersCount] = useState<number | null>(null);
  const [resourcesCount, setResourcesCount] = useState<number | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPreview = async () => {
      if (!selectedParty) {
        setMembersCount(null);
        setResourcesCount(null);
        return;
      }
      setLoadingPreview(true);
      try {
        const [mem, stash] = await Promise.all([
          partiesApi.getMembers(selectedParty.id),
          partiesApi.getResources(selectedParty.id),
        ]);
        if (!mounted) return;
        setMembersCount(mem.data?.length ?? 0);
        setResourcesCount(stash.data?.length ?? 0);
      } catch (e) {
        if (!mounted) return;
        setMembersCount(null);
        setResourcesCount(null);
      } finally {
        if (!mounted) return;
        setLoadingPreview(false);
      }
    };
    fetchPreview();
    return () => { mounted = false; };
  }, [selectedParty]);

  const welcome = useMemo(() => (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold text-white">Welcome to Party Management</h2>
      <p className="max-w-xl text-sm text-white/80">
        Create study groups, collaborate with peers, and share resources. Use the sidebar to create a new party
        or select an existing one to preview its activity.
      </p>
    </div>
  ), []);

  const preview = selectedParty && (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white shadow-md">
            <span className="text-base font-bold">P</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{selectedParty.name}</h3>
            <div className="text-xs text-white/70">{selectedParty.partyType} • {selectedParty.isPublic ? "Public" : "Private"}</div>
          </div>
        </div>
        <a
          href={`/parties/${selectedParty.id}`}
          className="rounded bg-fuchsia-600 px-3 py-2 text-xs font-medium text-white"
        >
          Open Full Dashboard
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/70">Members</div>
          <div className="text-2xl font-bold text-white">{loadingPreview ? "…" : (membersCount ?? "–")}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/70">Stash Items</div>
          <div className="text-2xl font-bold text-white">{loadingPreview ? "…" : (resourcesCount ?? "–")}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/70">Max Capacity</div>
          <div className="text-2xl font-bold text-white">{selectedParty.maxMembers}</div>
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Recent activity and previews will appear here as the feature evolves.
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
      {/* Left Sidebar */}
      <aside className="md:sticky md:top-0 md:h-[calc(100vh-120px)] md:self-start">
        <div className="flex flex-col gap-3">
          <button
            className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-fuchsia-600 to-purple-700 px-3 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
            onClick={() => setShowWizard(true)}
          >
            <span>＋</span>
            <span>Create New Party</span>
          </button>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <PartyListClient onSelectParty={setSelectedParty} />
          </div>
          {/* Public parties discovery moved to its own card */}
          <PublicPartiesCard onJoinedNavigate={true} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-[50vh] rounded-lg border border-white/10 bg-white/5 p-6">
        {!selectedParty ? welcome : preview}
      </main>

      <PartyCreationWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreated={(id) => {
          // After creation, auto-navigate to the new party page.
          window.location.href = `/parties/${id}`;
        }}
      />
    </div>
  );
}