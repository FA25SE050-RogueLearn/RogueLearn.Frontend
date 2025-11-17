"use client";
import React, { useMemo, useState } from "react";
import PartyListClient from "./PartyListClient";
import PartyCreationWizard from "./PartyCreationWizard";
import { PartyDto } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { useEffect } from "react";
import { Users, Plus, TrendingUp, Package, UserCheck } from "lucide-react";

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const MAIN_CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

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
    <div className="flex h-full flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="rounded-full bg-[#f5c16c]/10 p-6">
        <Users className="h-16 w-16 text-[#f5c16c]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#f5c16c]">Welcome to Party Management</h2>
        <p className="max-w-xl text-sm text-white/70">
          Create study groups, collaborate with peers, and share resources. Use the sidebar to create a new party
          or select an existing one to preview its activity.
        </p>
      </div>
    </div>
  ), []);

  const preview = selectedParty && (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#f5c16c]/30 bg-gradient-to-br from-[#f5c16c]/20 to-[#d4a855]/20 shadow-lg">
            <Users className="h-7 w-7 text-[#f5c16c]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#f5c16c]">{selectedParty.name}</h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>{selectedParty.partyType}</span>
              <span>•</span>
              <span>{selectedParty.isPublic ? "Public" : "Private"}</span>
            </div>
          </div>
        </div>
        <a
          href={`/parties/${selectedParty.id}`}
          className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c]"
        >
          Open Dashboard
        </a>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
              backgroundSize: "100px",
              backgroundBlendMode: "overlay",
            }}
          />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2 text-[#f5c16c]/70">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Members</span>
            </div>
            <div className="text-3xl font-bold text-[#f5c16c]">{loadingPreview ? "…" : (membersCount ?? "–")}</div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
              backgroundSize: "100px",
              backgroundBlendMode: "overlay",
            }}
          />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2 text-[#f5c16c]/70">
              <Package className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Stash Items</span>
            </div>
            <div className="text-3xl font-bold text-[#f5c16c]">{loadingPreview ? "…" : (resourcesCount ?? "–")}</div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
              backgroundSize: "100px",
              backgroundBlendMode: "overlay",
            }}
          />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2 text-[#f5c16c]/70">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Max Capacity</span>
            </div>
            <div className="text-3xl font-bold text-[#f5c16c]">{selectedParty.maxMembers}</div>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border border-[#f5c16c]/20 bg-black/40 p-6 text-sm text-white/70">
        <p>Recent activity and detailed analytics will appear here as features evolve.</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#0a0506] via-[#120806] to-[#0a0506]">
      {/* Sidebar */}
      <aside className="flex w-80 flex-col border-r border-[#f5c16c]/20 bg-black/20">
        <div className="border-b border-[#f5c16c]/20 p-4">
          <h2 className="text-lg font-semibold text-[#f5c16c]">My Parties</h2>
          <button
            onClick={() => setShowWizard(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c]"
          >
            <Plus className="h-4 w-4" />
            Create New Party
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <PartyListClient onSelectParty={setSelectedParty} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className={MAIN_CARD_CLASS}>
          <div
            className="pointer-events-none absolute inset-0"
            style={CARD_TEXTURE}
          />
          <div className="relative">
            {!selectedParty ? welcome : preview}
          </div>
        </div>
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