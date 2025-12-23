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
  const myRole: GuildRole | null = roles.length > 0 ? (roles.includes("GuildMaster") ? "GuildMaster" : roles.includes("Member") ? "Member" : null) : null;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-[98vw] max-w-[1600px] h-[96vh] overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-linear-to-b from-[#1a0a08] to-[#0a0506] p-6 md:p-8 shadow-2xl min-w-0">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')", backgroundSize: "100px", backgroundBlendMode: "overlay" }} />
        <div className="relative flex h-full flex-col min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-2">
                <HelpCircle className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#f5c16c]">Guild Management Overview</div>
                {guildId && (
                  <div className="mt-1 text-base text-white">Your role: <RoleBadge role={myRole} /></div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg border border-[#f5c16c]/30 bg-[#1a0b08]/60 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#f5c16c]/50 hover:bg-[#1a0b08]">Close</button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1 overflow-y-auto pr-2 min-w-0">
            <section className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><Users className="h-6 w-6" /> Core Features</div>
              <ul className="space-y-2 text-base text-white/90">
                <li className="flex items-start gap-2"><Settings className="mt-0.5 h-4 w-4 text-white/60" /><span>Configure guild <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">settings</span>: name, description, privacy, max members.</span></li>
                <li className="flex items-start gap-2"><UserPlus className="mt-0.5 h-4 w-4 text-white/60" /><span>Invite members and approve/decline <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">join requests</span>.</span></li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-white/60" /><span>Manage membership: <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transfer leadership</span>, remove members.</span></li>
                <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-white/60" /><span><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Meetings</span>: create, end, and sync <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transcripts</span> from <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Google Meet</span>.</span></li>
                <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-white/60" /><span>Guild <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">posts</span>: members can comment and like; post management is reserved for Guild Master.</span></li>
                <li className="flex items-start gap-2"><LogOut className="mt-0.5 h-4 w-4 text-white/60" /><span><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Leave guild</span>; <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Guild Masters</span> must transfer leadership first to leave the Guild.</span></li>
              </ul>
            </section>
            <section className="rounded-lg border border-white/10 bg-white/5 p-6 lg:row-span-2">
              <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><ShieldCheck className="h-6 w-6" /> Role Access</div>
              <div className="space-y-3 text-base text-white/90">
                <div>
                  <div className="mb-1 text-lg font-semibold text-[#f5c16c]">GuildMaster</div>
                  <ul className="space-y-1">
                    <li>Configure <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">settings</span></li>
                    <li>Invite <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">members</span></li>
                    <li>Approve/decline <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">join requests</span></li>
                    <li>Remove <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">members</span></li>
                    <li>Transfer <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">leadership</span></li>
                    <li>Create/end <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">meetings</span>; sync <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">transcripts</span></li>
                    <li>Manage <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">posts</span>: create, edit, delete, pin, lock, announcements</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-lg font-semibold text-[#f5c16c]">Member</div>
                  <ul className="space-y-1">
                    <li>View <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">posts</span> and <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">meetings</span></li>
                    <li><span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Join</span> meetings via link</li>
                    <li>Comment and like <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">posts</span></li>
                  </ul>
                </div>
              </div>
            </section>
            <section className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-white"><Users className="h-6 w-6" /> Joining Process</div>
              <ul className="space-y-2 text-base text-white/90">
                <li>For public guild: click on <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Join</span> to join the guild.</li>
                <li>For private guild: click on <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Request to Join</span> and wait for the <span className="rounded bg-[#f5c16c]/15 px-1.5 text-[#f5c16c]">Guild Master</span> to approve.</li>
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-3 flex items-center gap-2 text-xl font-semibold text:white"><CalendarDays className="h-6 w-6" /> Meetings Notes</div>
            <ul className="space-y-1 text-base text:white/90">
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
