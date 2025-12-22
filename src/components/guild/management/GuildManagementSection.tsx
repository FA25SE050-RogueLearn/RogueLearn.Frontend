"use client";
import { useEffect, useMemo, useState, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildJoinRequestDto, GuildMemberDto, GuildRole, GuildInvitationDto } from "@/types/guilds";
import { InviteMembersCard } from "@/components/guild/management/InviteMembersCard";
import { JoinRequestsCard } from "@/components/guild/management/JoinRequestsCard";
import { MembersManagementCard } from "@/components/guild/management/MembersManagementCard";
import { MembershipCard } from "@/components/guild/management/MembershipCard";
import { AccessRestrictedCard } from "@/components/guild/management/AccessRestrictedCard";
import { CreateEventRequestCard } from "@/components/guild/management/CreateEventRequestCard";
import { EventRequestsCard } from "@/components/guild/management/EventRequestsCard";
import { RegisteredEventsCard } from "@/components/guild/management/RegisteredEventsCard";
import { PendingInvitationsCard } from "@/components/guild/management/PendingInvitationsCard";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuildManagementSectionProps {
  guildId: string;
  onLeftGuild?: () => void;
}

export function GuildManagementSection({ guildId, onLeftGuild }: GuildManagementSectionProps) {
  const [members, setMembers] = useState<GuildMemberDto[]>([]);
  const [joinRequests, setJoinRequests] = useState<GuildJoinRequestDto[]>([]);
  const [invitations, setInvitations] = useState<GuildInvitationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [myResolvedRole, setMyResolvedRole] = useState<GuildRole | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTargetAuthId, setTransferTargetAuthId] = useState<string | null>(null);
  const router = useRouter();

  const reload = useCallback(() => {
    if (!guildId) return;
    startTransition(() => { setLoading(true); });
    setError(null);
    (async () => {
      try {
        const pRes = await profileApi.getMyProfile();
        const auth = pRes.data?.authUserId ?? null;
        setMyAuthUserId(auth);
        const mRes = await guildsApi.getMembers(guildId);
        const ms = mRes.data ?? [];
        setMembers(ms);
        const me = auth ? ms.find((m) => m.authUserId === auth) || null : null;
        const role = me?.role ?? null;
        setMyResolvedRole(role);
        if (role === "GuildMaster") {
          try {
            const jrRes = await guildsApi.getJoinRequests(guildId, true);
            setJoinRequests(jrRes.data ?? []);
          } catch {
            setJoinRequests([]);
          }
        } else {
          setJoinRequests([]);
        }
        if (role === "GuildMaster") {
          try {
            const invRes = await guildsApi.getInvitations(guildId);
            setInvitations(invRes.data ?? []);
          } catch {
            setInvitations([]);
          }
        } else {
          setInvitations([]);
        }
      } catch (err) {
        console.error("Failed to load management data", err);
        setError("Failed to load management data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [guildId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const approveRequest = async (requestId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.approveJoinRequest(guildId, requestId);
      reload();
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to approve.");
    }
  };

  const declineRequest = async (requestId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.declineJoinRequest(guildId, requestId);
      reload();
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to decline.");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.removeMember(guildId, memberId, { reason: null });
      setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
      toast.success("Member removed");
    } catch (err) {
      console.error(err);
      // toast.error("Failed to remove member.");
    }
  };

  const transferLeadership = async (toAuthUserId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.transferLeadership(guildId, { toUserId: toAuthUserId });
      reload();
      toast.success("Leadership transferred.");
      try { router.refresh(); } catch { try { window.location.reload(); } catch {} }
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to transfer leadership.");
    }
  };

  const sendInvite = async (email: string) => {
    if (!guildId || !email.trim()) return;
    try {
      await guildsApi.invite(guildId, { targets: [{ email }], message: null });
      reload();
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to send invite.");
    }
  };

  const leaveGuild = async () => {
    if (!guildId) return;
    try {
      await guildsApi.leaveGuild(guildId);
      onLeftGuild?.();
      router.push("/community");
      toast.success("You have left the guild.");
    } catch (err: any) {
      console.error(err);
      // toast.error("Failed to leave guild. You may need to transfer leadership first if you are the Guild Master.");
    }
  };

  const myRole: GuildRole | null = myResolvedRole;

  // All members can access this section; components below enforce role-specific actions.

  const isPrivileged = myRole === "GuildMaster";

  return (
    <div className="flex flex-col gap-6">
      {isPrivileged && (
        <>
          <InviteMembersCard onInvite={sendInvite} />
          <PendingInvitationsCard loading={loading} invitations={invitations} />
          {myRole === "GuildMaster" && (
            <CreateEventRequestCard guildId={guildId} onRequestCreated={reload} />
          )}
          {myRole === "GuildMaster" && (
            <EventRequestsCard guildId={guildId} />
          )}
        </>
      )}

      <RegisteredEventsCard guildId={guildId} />

      {myRole === "GuildMaster" && (
        <JoinRequestsCard
          loading={loading}
          error={error}
          joinRequests={joinRequests}
          myRole={myRole}
          onApprove={approveRequest}
          onDecline={declineRequest}
        />
      )}

      <MembersManagementCard
        loading={loading}
        error={error}
        members={members}
        myRole={myRole}
        onRemoveMember={removeMember}
        onTransferLeadership={(toAuthUserId) => { setTransferTargetAuthId(toAuthUserId); setTransferOpen(true); }}
      />

      <MembershipCard myRole={myRole} onLeave={() => setConfirmLeaveOpen(true)} />

      {/* Confirm Leave Guild */}
      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent className="border-[#f5c16c]/30 bg-[#1a0e0d]">
          <DialogHeader>
            <DialogTitle className="text-white">Leave Guild</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/80">Are you sure you want to leave this guild?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)} className="border-[#f5c16c]/30 text-[#f5c16c]">Cancel</Button>
            <Button onClick={async () => { setConfirmLeaveOpen(false); await leaveGuild(); }} className="bg-rose-600 hover:bg-rose-700">Leave</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Transfer Leadership */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="border-[#f5c16c]/30 bg-[#1a0e0d]">
          <DialogHeader>
            <DialogTitle className="text-white">Transfer Leadership</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/80">Transfer guild leadership to this member?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setTransferOpen(false)} className="border-[#f5c16c]/30 text-[#f5c16c]">Cancel</Button>
            <Button onClick={async () => { const target = transferTargetAuthId; setTransferOpen(false); if (target) await transferLeadership(target); }} className="bg-amber-500 hover:bg-amber-600 text-black">Transfer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
