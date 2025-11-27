"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MoreVertical, Crown, Shield, Mail, ArrowRightLeft, UserMinus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PartyMemberDto, PartyRole } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { getMyContext } from "@/api/usersApi";
import { toast } from "sonner";

interface PartyMembersListProps {
  partyId: string;
  members: PartyMemberDto[];
  maxMembers?: number;
  onRefresh?: () => Promise<void> | void; // Parent can provide a refresh callback
}

export default function PartyMembersList({ partyId, members, maxMembers, onRefresh }: PartyMembersListProps) {
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
  const isCoLeader = myRole === "CoLeader";

  const handleRoleChange = async (member: PartyMemberDto, nextRole: PartyRole) => {
    if (!isLeader) return;
    if (member.role === nextRole) return;
    setBusyMemberId(member.id);
    try {
      if (nextRole === "CoLeader") {
        if (member.role !== "Leader") {
          await partiesApi.assignRole(partyId, member.authUserId, "CoLeader");
          toast.success(`Granted CoLeader to ${member.username ?? member.email ?? member.authUserId.slice(0,8)}`);
        }
      } else if (nextRole === "Member") {
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
    if (member.role === "Leader") return;
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

  const getDisplayName = (m: PartyMemberDto) => {
    const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ");
    return m.username ?? (fullName || m.email || "Member");
  };
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2D2842] bg-[#1E1B2E] flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Party Members</h4>
        <span className="bg-[#2D2842] text-gray-400 text-[10px] px-2 py-0.5 rounded-md font-mono">{members.length} / {maxMembers ?? 8}</span>
      </div>
      <div className="divide-y divide-[#2D2842]">
        {members.map((m) => {
          const name = getDisplayName(m);
          const isActive = String(m.status).toLowerCase() === "active";
          const roleBadgeClass = m.role === "Leader"
            ? "bg-[#d4a353]/10 text-[#d4a353] border-[#d4a353]/20"
            : "bg-[#2D2842] text-gray-400 border-transparent group-hover:border-gray-600";
          return (
            <div key={m.id} className="group flex items-center justify-between p-4 hover:bg-[#1E1B2E] transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {m.profileImageUrl ? (
                    <Image src={m.profileImageUrl} alt={name} width={40} height={40} className="w-10 h-10 rounded-full bg-black/40 border border-[#2D2842] object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-black/40 border border-[#2D2842]" />
                  )}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161422] ${isActive ? "bg-green-500" : "bg-gray-500"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${m.role === "Leader" ? "text-[#d4a353]" : "text-white"}`}>{name}</span>
                    {m.role === "Leader" ? (
                      <Crown className="size-3.5 text-[#d4a353]" />
                    ) : (
                      <span className="text-[10px] text-gray-500 border border-gray-700 px-1.5 rounded bg-[#13111C]">LVL {m.level}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Mail className="size-3" />
                    <span>{m.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded text-xs font-bold border flex items-center gap-2 ${roleBadgeClass}`}>
                  {m.role === "Leader" ? <Crown className="size-3" /> : <Shield className="size-3" />}
                  {m.role}
                </div>
                { isLeader && m.role !== "Leader" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-gray-500 hover:text-white hover:bg-[#2D2842] rounded-lg transition outline-none" disabled={busyMemberId === m.id}>
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#13111C] border-[#2D2842] text-gray-200">
                      <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Manage {name}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#2D2842]" />
                      <DropdownMenuItem onClick={() => handleTransferLeadership(m)} className="text-yellow-500 focus:text-yellow-400 focus:bg-[#d4a353]/10 cursor-pointer gap-2">
                        <ArrowRightLeft className="size-3.5" /> Transfer Leadership
                      </DropdownMenuItem>
                      {m.role === "Member" && (
                        <DropdownMenuItem onClick={() => handleRoleChange(m, "CoLeader")} className="text-amber-400 focus:text-amber-300 focus:bg-amber-500/10 cursor-pointer gap-2">
                          <Shield className="size-3.5" /> Promote to CoLeader
                        </DropdownMenuItem>
                      )}
                      {m.role === "CoLeader" && (
                        <DropdownMenuItem onClick={() => handleRoleChange(m, "Member")} className="text-gray-300 focus:text-white focus:bg-[#2D2842] cursor-pointer gap-2">
                          <Shield className="size-3.5" /> Demote to Member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleRemoveMember(m)} className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-2">
                        <UserMinus className="size-3.5" /> Remove from Party
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
        {members.length === 0 && (
          <div className="p-4 text-xs text-white/50">No members found.</div>
        )}
      </div>
    </section>
  );
}