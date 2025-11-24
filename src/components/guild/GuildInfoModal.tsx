"use client";
import React from "react";
import { useGuildRoles } from "@/hooks/useGuildRoles";
import type { GuildRole } from "@/types/guilds";
import { HelpCircle, Crown, Users, CalendarDays, FileText, Settings, UserPlus, LogOut, ShieldCheck } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  guildId?: string;
};

function RoleBadge({ role }: { role: GuildRole | null }) {
  if (!role) return <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/80">Unknown</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[11px] text-white">
      {role === "GuildMaster" && <Crown className="h-3.5 w-3.5 text-[#f5c16c]" />}
      {role}
    </span>
  );
}

export default function GuildInfoModal({ open, onClose, guildId }: Props) {
  const { roles } = useGuildRoles(guildId ?? "");
  const myRole: GuildRole | null = roles.length > 0 ? (roles.includes("GuildMaster") ? "GuildMaster" : roles.includes("Officer") ? "Officer" : roles.includes("Veteran") ? "Veteran" : roles.includes("Member") ? "Member" : roles.includes("Recruit") ? "Recruit" : null) : null;
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
                <div className="text-xl font-semibold text-[#f5c16c]">Guild Management Overview</div>
                {guildId && (
                  <div className="mt-0.5 text-xs text-white/70">Your role: <RoleBadge role={myRole} /></div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white">Close</button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Users className="h-4 w-4" /> Core Features</div>
              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex items-start gap-2"><Settings className="mt-0.5 h-4 w-4 text-white/60" /><span>Configure guild settings: name, description, privacy, max members.</span></li>
                <li className="flex items-start gap-2"><UserPlus className="mt-0.5 h-4 w-4 text-white/60" /><span>Invite members and approve/decline join requests.</span></li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-white/60" /><span>Manage membership: transfer leadership, assign/revoke roles, remove members.</span></li>
                <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-white/60" /><span>Meetings: create, end, and sync transcripts from Google Meet.</span></li>
                <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-white/60" /><span>Guild posts: share announcements and discussions.</span></li>
                <li className="flex items-start gap-2"><LogOut className="mt-0.5 h-4 w-4 text-white/60" /><span>Leave guild; Guild Masters must transfer leadership first or the next highest member will be the leader.</span></li>
              </ul>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4" /> Role Access</div>
              <div className="space-y-3 text-xs text-white/80">
                <div>
                  <div className="mb-1 font-medium text-white">GuildMaster</div>
                  <ul className="space-y-1">
                    <li>Configure settings</li>
                    <li>Invite members</li>
                    <li>Approve/decline join requests</li>
                    <li>Assign/revoke roles</li>
                    <li>Remove members</li>
                    <li>Transfer leadership</li>
                    <li>Create/end meetings; sync transcripts</li>
                    <li>Authorize Google Meet access</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-white">Officer</div>
                  <ul className="space-y-1">
                    <li>Invite members</li>
                    <li>Remove non-officer members</li>
                    <li>Create/end meetings; sync transcripts</li>
                    <li>Authorize Google Meet access</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-white">Veteran</div>
                  <ul className="space-y-1">
                    <li>Participate in posts and meetings</li>
                    <li>View meeting details and transcripts</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-white">Member</div>
                  <ul className="space-y-1">
                    <li>View posts and meetings</li>
                    <li>Join meetings via link</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-white">Recruit</div>
                  <ul className="space-y-1">
                    <li>Limited access; can view public posts</li>
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