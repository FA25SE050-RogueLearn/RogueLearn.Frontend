"use client";
import React from "react";
import { PartyDto } from "@/types/parties";

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
        "group cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition " +
        (selected ? "ring-2 ring-fuchsia-500/70" : "hover:bg-white/10 hover:border-white/20")
      }
    >
      <div className="flex items-center gap-3">
        {/* Emblem placeholder */}
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white shadow-md">
          <span className="text-sm font-bold">P</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">{party.name}</h4>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/80">
              {party.partyType}
            </span>
          </div>
          <div className="text-xs text-white/70">
            {party.isPublic ? "Public" : "Private"} • Max {party.maxMembers} members
          </div>
        </div>
      </div>
    </div>
  );
}