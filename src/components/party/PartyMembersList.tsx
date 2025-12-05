"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MoreVertical, Crown, Shield, Mail, ArrowRightLeft, UserMinus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PartyMemberDto, PartyRole } from "@/types/parties";
import partiesApi from "@/api/partiesApi";
import { getMyContext } from "@/api/usersApi";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PartyMembersListProps {
  partyId: string;
  members: PartyMemberDto[];
  maxMembers?: number;
  onRefresh?: () => Promise<void> | void; // Parent can provide a refresh callback
}

export default function PartyMembersList({ partyId, members, maxMembers, onRefresh }: PartyMembersListProps) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PartyMemberDto | null>(null);

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
  

  const handleRemoveMember = async (member: PartyMemberDto) => {
    if (!isLeader) return;
    if (member.role === "Leader") return;
    setSelectedMember(member);
    setRemoveOpen(true);
  };

  const handleTransferLeadership = async (member: PartyMemberDto) => {
    if (!isLeader) return;
    setSelectedMember(member);
    setTransferOpen(true);
  };

  const getDisplayName = (m: PartyMemberDto) => {
    const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ");
    return m.username ?? (fullName || m.email || "Member");
  };

  const getInitials = (m: PartyMemberDto) => {
    const name = getDisplayName(m);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate a consistent color based on name
  const getAvatarColor = (m: PartyMemberDto) => {
    const colors = [
      "from-[#f5c16c]/30 to-[#d4a855]/30 text-[#f5c16c]",
      "from-[#d23187]/30 to-[#a0256a]/30 text-[#d23187]",
      "from-emerald-500/30 to-green-600/30 text-emerald-400",
      "from-blue-500/30 to-indigo-600/30 text-blue-400",
      "from-purple-500/30 to-violet-600/30 text-purple-400",
      "from-orange-500/30 to-amber-600/30 text-orange-400",
    ];
    const hash = getDisplayName(m).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
          <Shield className="h-4 w-4" />
          <span>Members</span>
        </div>
        <span className="rounded-full border border-[#f5c16c]/20 bg-[#f5c16c]/10 px-2 py-0.5 text-[10px] text-[#f5c16c]">
          {members.length}/{maxMembers ?? 8}
        </span>
      </div>

      <div className="space-y-2">
        {members.map((m) => {
          const name = getDisplayName(m);
          const isActive = String(m.status).toLowerCase() === "active";
          const isLeaderMember = m.role === "Leader";
          return (
            <div 
              key={m.id} 
              className={`group relative rounded-xl border p-3 transition-all ${
                isLeaderMember 
                  ? "border-[#f5c16c]/30 bg-gradient-to-r from-[#f5c16c]/5 to-transparent" 
                  : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-black/40"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  {m.profileImageUrl ? (
                    <Image 
                      src={m.profileImageUrl} 
                      alt={name} 
                      width={48} 
                      height={48} 
                      className="h-12 w-12 rounded-full border-2 border-white/10 object-cover" 
                    />
                  ) : (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 bg-gradient-to-br font-bold ${getAvatarColor(m)}`}>
                      {getInitials(m)}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black ${isActive ? "bg-emerald-500" : "bg-white/30"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm truncate ${isLeaderMember ? "text-[#f5c16c]" : "text-white"}`}>
                      {name}
                    </span>
                    {isLeaderMember && <Crown className="h-4 w-4 text-[#f5c16c] flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isLeaderMember 
                        ? "border border-[#f5c16c]/30 bg-[#f5c16c]/10 text-[#f5c16c]" 
                        : "border border-white/20 bg-white/5 text-white/60"
                    }`}>
                      {m.role}
                    </span>
                    <span className="text-[10px] text-white/40 truncate">{m.email}</span>
                  </div>
                </div>

                {/* Actions */}
                {isLeader && !isLeaderMember && (
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition-all outline-none opacity-0 group-hover:opacity-100" 
                      disabled={busyMemberId === m.id}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-black/95 border-white/10 text-white">
                      <DropdownMenuLabel className="text-[10px] text-white/40 uppercase tracking-wider">Manage</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={() => handleTransferLeadership(m)} 
                        className="text-[#f5c16c] focus:text-[#f5c16c] focus:bg-[#f5c16c]/10 cursor-pointer gap-2"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer Leadership
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(m)} 
                        className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer gap-2"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}



        {members.length === 0 && (
          <div className="py-8 text-center text-xs text-white/40">No members found.</div>
        )}
      </div>
    </div>

    {/* Confirm Remove Member */}
    <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
      <DialogContent className="bg-[#13111C] border-[#2D2842] text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-white">Remove Member</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/70">Remove {selectedMember?.username ?? selectedMember?.email ?? "this member"} from the party?</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setRemoveOpen(false)} className="border-[#2D2842] text-gray-300">Cancel</Button>
          <Button onClick={async () => {
            const m = selectedMember; setRemoveOpen(false); if (!m) return; setBusyMemberId(m.id);
            try { await partiesApi.removeMember(partyId, m.id, {}); toast.success("Member removed"); await onRefresh?.(); } 
            catch (e: any) { 
              // toast.error(e?.message ?? "Failed to remove member"); 
            } 
            finally { setBusyMemberId(null); }
          }} className="bg-red-600 hover:bg-red-700">Remove</Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Confirm Transfer Leadership */}
    <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
      <DialogContent className="bg-[#13111C] border-[#2D2842] text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-white">Transfer Leadership</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/70">Transfer leadership to {selectedMember?.username ?? selectedMember?.email ?? "this member"}?</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setTransferOpen(false)} className="border-[#2D2842] text-gray-300">Cancel</Button>
          <Button onClick={async () => {
            const m = selectedMember; setTransferOpen(false); if (!m) return; setBusyMemberId(m.id);
            try { await partiesApi.transferLeadership(partyId, { partyId, toUserId: m.authUserId }); toast.success("Leadership transferred"); await onRefresh?.(); try { window.location.reload(); } catch {} } 
            catch (e: any) { 
              // toast.error(e?.message ?? "Failed to transfer leadership"); 
            } 
            finally { setBusyMemberId(null); }
          }} className="bg-amber-500 hover:bg-amber-600 text-black">Transfer</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}