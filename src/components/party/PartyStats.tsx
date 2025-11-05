"use client";
import React from "react";

export default function PartyStats({ members, invites, resources }: { members: number; invites: number; resources: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/70">Members</div>
        <div className="text-2xl font-bold text-white">{members}</div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/70">Pending Invites</div>
        <div className="text-2xl font-bold text-white">{invites}</div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/70">Resources (Stash)</div>
        <div className="text-2xl font-bold text-white">{resources}</div>
      </div>
    </div>
  );
}