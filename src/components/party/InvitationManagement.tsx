"use client";
import React, { useEffect, useState } from "react";
import { PartyInvitationDto } from "@/types/parties";
import { getUserProfileByAuthId } from "@/api/usersApi";

export default function InvitationManagement({ invites }: { invites: PartyInvitationDto[] }) {
  const [inviteeMap, setInviteeMap] = useState<Record<string, { username?: string; email?: string }>>({});
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ids = Array.from(new Set(invites.map((inv) => inv.inviteeId).filter((id) => !!id)));
      if (ids.length === 0) {
        if (mounted) setInviteeMap({});
        return;
      }
      try {
        const results = await Promise.all(ids.map((id) => getUserProfileByAuthId(id)));
        const map: Record<string, { username?: string; email?: string }> = {};
        results.forEach((res, idx) => {
          const id = ids[idx];
          const p = res.data;
          if (p) map[id] = { username: p.username, email: p.email };
        });
        if (mounted) setInviteeMap(map);
      } catch {
        if (mounted) setInviteeMap({});
      }
    })();
    return () => { mounted = false; };
  }, [invites]);
  const display = (id: string) => {
    const info = inviteeMap[id];
    if (info?.username || info?.email) {
      const uname = info.username?.trim();
      const mail = info.email?.trim();
      if (uname && mail) return `${uname} • ${mail}`;
      return uname || mail || id;
    }
    return id;
  };
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h4 className="mb-2 text-sm font-semibold">Pending Invitations</h4>
      <ul className="space-y-2">
        {invites.map(inv => (
          <li key={inv.id} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-xs">
            <span>{display(inv.inviteeId)}</span>
            <span className="rounded bg-white/10 px-2 py-0.5">{inv.status}</span>
          </li>
        ))}
        {invites.length === 0 && <li className="text-xs text-white/50">No pending invitations.</li>}
      </ul>
    </section>
  );
}