"use client";
import React, { useEffect, useMemo, useState } from "react";
import { PartyMemberDto, PartyRole } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { getMyContext } from "@/api/usersApi";
import { toast } from "sonner";

interface PartyMembersListProps {
  partyId: string;
  members: PartyMemberDto[];
  onRefresh?: () => Promise<void> | void; // Parent can provide a refresh callback
}

export default function PartyMembersList({ partyId, members, onRefresh }: PartyMembersListProps) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyContext();
        if (!mounted) return;
        setAuthUserId(me.data?.authUserId ?? null);
      } catch {
        if (!mounted) return;
        setAuthUserId(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const myRole: PartyRole | null = useMemo(() => {
    if (!authUserId) return null;
    const me = members.find(m => m.authUserId === authUserId);
    return me?.role ?? null;
  }, [authUserId, members]);

  const isLeader = myRole === "Leader";

  const handleRoleChange = async (member: PartyMemberDto, nextRole: PartyRole) => {
    // Only allow toggling between Member and CoLeader via assign/revoke.
    if (!isLeader) return;
    if (member.role === nextRole) return; // no-op
    setBusyMemberId(member.id);
    try {
      if (nextRole === "CoLeader") {
        await partiesApi.assignRole(partyId, member.authUserId, "CoLeader");
        toast.success(`Granted CoLeader to ${member.username ?? member.email ?? member.authUserId.slice(0,8)}`);
      } else if (nextRole === "Member") {
        // Revoke CoLeader if present
        if (member.role === "CoLeader") {
          await partiesApi.revokeRole(partyId, member.authUserId, "CoLeader");
          toast.success(`Revoked CoLeader from ${member.username ?? member.email ?? member.authUserId.slice(0,8)}`);
        }
      }
      // Refresh members
      await onRefresh?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update role");
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRemoveMember = async (member: PartyMemberDto) => {
    if (!isLeader) return;
    const confirmed = window.confirm(`Remove ${member.username ?? member.email ?? "this member"} from the party?`);
    if (!confirmed) return;
    setBusyMemberId(member.id);
    try {
      await partiesApi.removeMember(partyId, member.id, {});
      toast.success("Member removed");
      await onRefresh?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to remove member");
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleTransferLeadership = async (member: PartyMemberDto) => {
    if (!isLeader) return;
    const confirmed = window.confirm(`Transfer party leadership to ${member.username ?? member.email ?? "this member"}?`);
    if (!confirmed) return;
    setBusyMemberId(member.id);
    try {
      await partiesApi.transferLeadership(partyId, { partyId, toUserId: member.authUserId });
      toast.success("Leadership transferred");
      await onRefresh?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to transfer leadership");
    } finally {
      setBusyMemberId(null);
    }
  };

  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h4 className="mb-3 text-sm font-semibold">Members</h4>
      {!authUserId && (
        <div className="mb-2 text-[11px] text-white/60">Sign in required to manage members.</div>
      )}
      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-fuchsia-600/30"></div>
              <div>
                <p className="text-xs font-semibold">{m.username ?? m.email ?? "Member"}</p>
                <p className="text-xs text-white/60">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                {m.role}
              </span>
              <span className="text-xs capitalize text-green-400">
                {m.status}
              </span>
              {/* Actions: visible to leader, and not for the current leader target */}
              {isLeader && m.role !== "Leader" && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-white/60">Role:</label>
                  <select
                    value={m.role}
                    disabled={busyMemberId === m.id}
                    onChange={(e) => handleRoleChange(m, e.target.value as PartyRole)}
                    className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="Member">Member</option>
                    <option value="CoLeader">CoLeader</option>
                    {/* Leader changes should be done via explicit transfer */}
                  </select>
                  <button
                    onClick={() => handleRemoveMember(m)}
                    disabled={busyMemberId === m.id}
                    className="rounded bg-red-600/80 px-2 py-1 text-[11px] text-white hover:bg-red-600 disabled:opacity-50"
                    title="Remove member"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleTransferLeadership(m)}
                    disabled={busyMemberId === m.id}
                    className="rounded bg-amber-500/80 px-2 py-1 text-[11px] text-black hover:bg-amber-500 disabled:opacity-50"
                    title="Transfer leadership to this member"
                  >
                    Transfer Lead
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
        {members.length === 0 && (
          <li className="text-xs text-white/50">No members found.</li>
        )}
      </ul>
    </section>
  );
}