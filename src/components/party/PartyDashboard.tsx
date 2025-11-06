"use client";
import React, { useEffect, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { PartyMemberDto, PartyInvitationDto } from "@/types/parties";
import PartyStats from "./PartyStats";
import PartyMembersList from "./PartyMembersList";
import InvitationManagement from "./InvitationManagement";

export default function PartyDashboard({ partyId }: { partyId: string }) {
  const [members, setMembers] = useState<PartyMemberDto[]>([]);
  const [invites, setInvites] = useState<PartyInvitationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, i] = await Promise.all([
          partiesApi.getMembers(partyId),
          partiesApi.getPendingInvitations(partyId),
        ]);
        if (!mounted) return;
        setMembers(m.data ?? []);
        setInvites(i.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load dashboard");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [partyId]);

  const [stashCount, setStashCount] = useState<number>(0);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await partiesApi.getResources(partyId);
        if (mounted) setStashCount(res.data?.length ?? 0);
      } catch {
        if (mounted) setStashCount(0);
      }
    })();
    return () => { mounted = false; };
  }, [partyId]);

  const refreshMembers = async () => {
    try {
      const m = await partiesApi.getMembers(partyId);
      setMembers(m.data ?? []);
    } catch {
      // swallow
    }
  };

  return (
    <div className="space-y-6">
      {loading && <div className="text-sm text-white/70">Loading...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}

      <PartyStats members={members.length} invites={invites.length} resources={stashCount} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PartyMembersList partyId={partyId} members={members} onRefresh={refreshMembers} />
        <InvitationManagement invites={invites} />
      </div>

      {/* Public party discovery moved to /party page */}
    </div>
  );
}