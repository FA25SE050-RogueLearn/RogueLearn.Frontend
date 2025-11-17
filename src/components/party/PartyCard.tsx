"use client";
import React from "react";
import { PartyDto } from "@/types/parties";
import { Users } from "lucide-react";

interface PartyCardProps {
  party: PartyDto;
  selected?: boolean;
  onClick?: (party: PartyDto) => void;
}

/**
 * PartyCard: Displays a summary of a party.
 * Shows emblem placeholder, name, type, visibility, member capacity.
 */
export default function PartyCard({ party, selected, onClick }: PartyCardProps) {
  return (
    <div
      onClick={() => onClick?.(party)}
      className={
        "group cursor-pointer rounded-lg border p-4 transition-all " +
        (selected 
          ? "border-[#f5c16c] bg-gradient-to-br from-[#f5c16c]/20 to-[#d4a855]/10 ring-2 ring-[#f5c16c]/50" 
          : "border-[#f5c16c]/20 bg-black/40 hover:border-[#f5c16c]/40 hover:bg-gradient-to-br hover:from-[#2d1810]/40 hover:to-black/60")
      }
    >
      <div className="flex items-center gap-3">
        {/* Emblem placeholder */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#f5c16c]/30 bg-gradient-to-br from-[#f5c16c]/20 to-[#d4a855]/20 shadow-lg">
          <Users className="h-5 w-5 text-[#f5c16c]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[#f5c16c]">{party.name}</h4>
            <span className="rounded bg-[#f5c16c]/10 px-2 py-0.5 text-xs text-[#f5c16c]/80">
              {party.partyType}
            </span>
          </div>
          <div className="text-xs text-white/60">
            {party.isPublic ? "Public" : "Private"} • Max {party.maxMembers} members
          </div>
        </div>
      </div>
    </div>
  );
}