"use client";
import { useEffect, useMemo, useState, useCallback, startTransition } from "react";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { GuildJoinRequestDto, GuildMemberDto, GuildRole } from "@/types/guilds";
import { InviteMembersCard } from "@/components/guild/management/InviteMembersCard";
import { JoinRequestsCard } from "@/components/guild/management/JoinRequestsCard";
import { MembersManagementCard } from "@/components/guild/management/MembersManagementCard";
import { MembershipCard } from "@/components/guild/management/MembershipCard";
import { AccessRestrictedCard } from "@/components/guild/management/AccessRestrictedCard";
import { CreateEventRequestCard } from "@/components/guild/management/CreateEventRequestCard";
import { EventRequestsCard } from "@/components/guild/management/EventRequestsCard";

interface GuildManagementSectionProps {
  guildId: string;
  onLeftGuild?: () => void;
}

export function GuildManagementSection({ guildId, onLeftGuild }: GuildManagementSectionProps) {
  const [members, setMembers] = useState<GuildMemberDto[]>([]);
  const [joinRequests, setJoinRequests] = useState<GuildJoinRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!guildId) return;
    startTransition(() => {
      setLoading(true);
    });
    Promise.all([
      guildsApi.getMembers(guildId),
      guildsApi.getJoinRequests(guildId, true),
      profileApi.getMyProfile(),
    ])
      .then(([mRes, jrRes, pRes]) => {
        setMembers(mRes.data ?? []);
        setJoinRequests(jrRes.data ?? []);
        setMyAuthUserId(pRes.data?.authUserId ?? null);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load management data", err);
        setError("Failed to load management data.");
      })
      .finally(() => setLoading(false));
  }, [guildId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const approveRequest = async (requestId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.approveJoinRequest(guildId, requestId);
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to approve.");
    }
  };

  const declineRequest = async (requestId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.declineJoinRequest(guildId, requestId);
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to decline.");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!guildId) return;
    try {
      await guildsApi.removeMember(guildId, memberId, { reason: null });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to remove member.");
    }
  };

  const assignRoleWithRole = async (authUserId: string, role: GuildRole) => {
    if (!guildId || !myAuthUserId) return;
    try {
      await guildsApi.assignRole(guildId, {
        memberAuthUserId: authUserId,
        roleToAssign: role,
        actorAuthUserId: myAuthUserId,
        isAdminOverride: false,
      });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to assign role.");
    }
  };

  const revokeRole = async (authUserId: string, role: GuildRole) => {
    if (!guildId || !myAuthUserId) return;
    try {
      await guildsApi.revokeRole(guildId, {
        memberAuthUserId: authUserId,
        roleToRevoke: role,
        actorAuthUserId: myAuthUserId,
        isAdminOverride: false,
      });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to revoke role.");
    }
  };

  const transferLeadership = async (toAuthUserId: string) => {
    if (!guildId) return;
    const confirmed = window.confirm("Transfer guild leadership to this member?");
    if (!confirmed) return;
    try {
      await guildsApi.transferLeadership(guildId, { toUserId: toAuthUserId });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to transfer leadership.");
    }
  };

  const sendInvite = async (email: string) => {
    if (!guildId || !email.trim()) return;
    try {
      await guildsApi.invite(guildId, { targets: [{ email }], message: null });
      reload();
    } catch (err) {
      console.error(err);
      alert("Failed to send invite.");
    }
  };

  const leaveGuild = async () => {
    if (!guildId) return;
    const confirmLeave = window.confirm("Are you sure you want to leave this guild?");
    if (!confirmLeave) return;
    try {
      await guildsApi.leaveGuild(guildId);
      onLeftGuild?.();
    } catch (err) {
      console.error(err);
      alert("Failed to leave guild. You may need to transfer leadership first if you are the Guild Master.");
    }
  };

  const myRole: GuildRole | null = useMemo(() => {
    if (!myAuthUserId) return null;
    const me = members.find((m) => m.authUserId === myAuthUserId);
    return me?.role ?? null;
  }, [members, myAuthUserId]);

  if (!loading && myRole === null) {
    return (
      <AccessRestrictedCard
        onGoToGuild={() => { /* no-op in section; parent controls navigation */ }}
        onBrowseGuilds={() => { /* no-op in section; parent controls navigation */ }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {(myRole === "GuildMaster" || myRole === "Officer") && (
        <>
          <InviteMembersCard onInvite={sendInvite} />
          <CreateEventRequestCard guildId={guildId} onRequestCreated={reload} />
          <EventRequestsCard guildId={guildId} />
        </>
      )}

      <JoinRequestsCard
        loading={loading}
        error={error}
        joinRequests={joinRequests}
        myRole={myRole}
        onApprove={approveRequest}
        onDecline={declineRequest}
      />

      <MembersManagementCard
        loading={loading}
        error={error}
        members={members}
        myRole={myRole}
        onAssignRole={(authUserId, role) => assignRoleWithRole(authUserId, role)}
        onRevokeRole={revokeRole}
        onRemoveMember={removeMember}
        onTransferLeadership={transferLeadership}
      />

      <MembershipCard myRole={myRole} onLeave={leaveGuild} />
    </div>
  );
}