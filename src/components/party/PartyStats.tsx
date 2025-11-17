"use client";
import React from "react";
import { Users, Mail, Package } from "lucide-react";

export default function PartyStats({ members, invites, resources }: { members: number; invites: number; resources: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            backgroundSize: "100px",
            backgroundBlendMode: "overlay",
          }}
        />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 text-[#f5c16c]/70">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Members</span>
          </div>
          <div className="text-3xl font-bold text-[#f5c16c]">{members}</div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            backgroundSize: "100px",
            backgroundBlendMode: "overlay",
          }}
        />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 text-[#f5c16c]/70">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Pending Invites</span>
          </div>
          <div className="text-3xl font-bold text-[#f5c16c]">{invites}</div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            backgroundSize: "100px",
            backgroundBlendMode: "overlay",
          }}
        />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2 text-[#f5c16c]/70">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Resources (Stash)</span>
          </div>
          <div className="text-3xl font-bold text-[#f5c16c]">{resources}</div>
        </div>
      </div>
    </div>
  );
}