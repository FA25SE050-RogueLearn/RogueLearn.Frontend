"use client";
import React from "react";
import { PartyMemberDto } from "@/types/parties";

export default function PartyMembersList({ members }: { members: PartyMemberDto[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h4 className="mb-3 text-sm font-semibold">Members</h4>
      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-fuchsia-600/30"></div>
              <div>
                <p className="text-xs font-semibold">{m.username}</p>
                <p className="text-xs text-white/60">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                {m.role}
              </span>
              <span className="text-xs capitalize text-green-400">
                {m.status}
              </span>
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