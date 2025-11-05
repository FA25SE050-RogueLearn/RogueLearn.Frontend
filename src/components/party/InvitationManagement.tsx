"use client";
import React from "react";
import { PartyInvitationDto } from "@/types/parties";

export default function InvitationManagement({ invites }: { invites: PartyInvitationDto[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h4 className="mb-2 text-sm font-semibold">Pending Invitations</h4>
      <ul className="space-y-2">
        {invites.map(inv => (
          <li key={inv.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-xs">
            <span>{inv.inviteeId}</span>
            <span className="rounded bg-white/10 px-2 py-0.5">{inv.status}</span>
          </li>
        ))}
        {invites.length === 0 && <li className="text-xs text-white/50">No pending invitations.</li>}
      </ul>
    </section>
  );
}