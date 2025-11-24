"use client";
import React from "react";
import { usePartyRole } from "@/hooks/usePartyRole";
import type { PartyRole } from "@/types/parties";
import { HelpCircle, Crown, Users, CalendarDays, FileText, Settings, UserPlus, LogOut, ShieldCheck } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  partyId?: string;
};

function RoleBadge({ role }: { role: PartyRole | null }) {
  if (!role) return <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/80">Unknown</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[11px] text-white">
      {role === "Leader" && <Crown className="h-3.5 w-3.5 text-[#f5c16c]" />}
      {role}
    </span>
  );
}

export default function PartyInfoModal({ open, onClose, partyId }: Props) {
  const { role } = usePartyRole(partyId ?? "");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-b from-[#1a0a08] to-[#0a0506] p-6 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", backgroundSize: "100px", backgroundBlendMode: "overlay" }} />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-2">
                <HelpCircle className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <div>
                <div className="text-xl font-semibold text-[#f5c16c]">Party Management Overview</div>
                {partyId && (
                  <div className="mt-0.5 text-xs text-white/70">Your role: <RoleBadge role={role} /></div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white">Close</button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Users className="h-4 w-4" /> Core Features</div>
              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-start gap-2"><Settings className="mt-0.5 h-4 w-4 text-white/60" /><span>Configure party settings: name, description, privacy, max members.</span></li>
                <li className="flex items-start gap-2"><UserPlus className="mt-0.5 h-4 w-4 text-white/60" /><span>Invite members and view pending invitations.</span></li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-white/60" /><span>Manage membership: transfer leadership, promote/demote Co-Leader, remove members.</span></li>
                <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-white/60" /><span>Study sprints and meetings: create, end, and sync transcripts from Google Meet.</span></li>
                <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-white/60" /><span>Party stash: share resources, tag and search; leaders and co-leaders can add, edit, delete.</span></li>
                <li className="flex items-start gap-2"><LogOut className="mt-0.5 h-4 w-4 text-white/60" /><span>Leave party; leaders must transfer leadership first or the next highest role member will be the next leader.</span></li>
              </ul>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4" /> Role Access</div>
              <div className="space-y-3 text-xs text-white/80">
                <div>
                  <div className="mb-1 font-medium text-white">Leader</div>
                  <ul className="space-y-1">
                    <li>Configure settings</li>
                    <li>Invite members</li>
                    <li>Transfer leadership</li>
                    <li>Promote/demote Co-Leader</li>
                    <li>Remove members (except Leader)</li>
                    <li>Create/end meetings; sync transcripts</li>
                    <li>Authorize Google Meet access</li>
                    <li>Add/edit/delete stash resources</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-white">CoLeader</div>
                  <ul className="space-y-1">
                    <li>Configure settings</li>
                    <li>Invite members</li>
                    <li>Create/end meetings; sync transcripts</li>
                    <li>Authorize Google Meet access</li>
                    <li>Add/edit/delete stash resources</li>
                    <li>Cannot transfer leadership or modify Leader</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-white">Member</div>
                  <ul className="space-y-1">
                    <li>View party info and members</li>
                    <li>Join meetings via link</li>
                    <li>View meeting details and transcripts</li>
                    <li>Browse and search stash resources</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><CalendarDays className="h-4 w-4" /> Meetings Notes</div>
            <ul className="space-y-1 text-xs text-white/80">
              <li>Transcript sync available about 10 minutes after ending a meeting.</li>
              <li>If authorization is required, use the Authorize button to grant Google Meet scopes.</li>
              <li>All members can see the meeting join link when active.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}