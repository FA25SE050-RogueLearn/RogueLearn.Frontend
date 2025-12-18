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
      <div className="relative w-[60vw] max-w-[60vw] max-h-[85vh] overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-b from-[#1a0a08] to-[#0a0506] p-8 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", backgroundSize: "100px", backgroundBlendMode: "overlay" }} />
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-2">
                <HelpCircle className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#f5c16c]">Party Management Overview</div>
                {partyId && (
                  <div className="mt-1 text-base text-white">Your role: <RoleBadge role={role} /></div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg border border-[#f5c16c]/30 bg-[#1a0b08]/60 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#f5c16c]/50 hover:bg-[#1a0b08]">Close</button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 140px)' }}>
            <section className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><Users className="h-6 w-6" /> Core Features</div>
              <ul className="space-y-2 text-base text-white/90">
                <li className="flex items-start gap-2"><Settings className="mt-0.5 h-4 w-4 text-white/60" /><span>Configure party <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">settings</span>: name, description, privacy, max members.</span></li>
                <li className="flex items-start gap-2"><UserPlus className="mt-0.5 h-4 w-4 text-white/60" /><span><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Invite</span> <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">members</span> and view pending <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">invitations</span>.</span></li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-white/60" /><span>Manage membership: <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transfer leadership</span>, <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">remove members</span>.</span></li>
                <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-white/60" /><span>Study <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">sprints</span> and <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">meetings</span>: create, end, and sync <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transcripts</span> from <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Google Meet</span>.</span></li>
                <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-white/60" /><span>Party <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">stash</span>: share <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">resources</span>, <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">tag</span> and <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">search</span>; <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Members</span> can <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">add</span>, <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">edit</span>, <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">delete</span>.</span></li>
                <li className="flex items-start gap-2"><LogOut className="mt-0.5 h-4 w-4 text-white/60" /><span><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Leave party</span>.</span></li>
              </ul>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/5 p-6 lg:row-span-2">
              <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><ShieldCheck className="h-6 w-6" /> Role Access</div>
              <div className="space-y-3 text-base text-white/90">
                <div>
                  <div className="mb-1 text-lg font-semibold text-[#f5c16c]">Leader</div>
                  <ul className="space-y-1">
                    <li>Configure <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">settings</span></li>
                    <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Invite</span> <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">members</span></li>
                    <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Transfer leadership</span></li>
                    <li>Remove <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">members</span></li>
                    <li>Create/end <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">meetings</span>; sync <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transcripts</span></li>
                    <li>Authorize <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Google Meet</span> access</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-lg font-semibold text-[#f5c16c]">Member</div>
                  <ul className="space-y-1">
                    <li>View party <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">info</span> and <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">members</span></li>
                    <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Join</span> meetings via link</li>
                    <li>View meeting details and <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transcripts</span></li>
                    <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Browse</span> and <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">search</span> stash <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">resources</span></li>
                    <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Add</span>/<span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">edit</span>/<span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">delete</span> stash <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">resources</span></li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><Users className="h-6 w-6" /> Joining Process</div>
              <ul className="space-y-2 text-base text-white/90">
                <li>For public party: click <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Join</span> to join the party.</li>
                <li>For private party: you must be <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">invited</span> by the <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Leader</span>.</li>
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><CalendarDays className="h-6 w-6" /> Meetings Notes</div>
            <ul className="space-y-1 text-base text-white/90">
              <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Transcript sync</span> available about 5 minutes after ending a meeting.</li>
              <li>If authorization is required, use the <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Authorize</span> button to grant <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Google Meet</span> scopes.</li>
              <li>All members can see the meeting <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">join link</span> when active.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
