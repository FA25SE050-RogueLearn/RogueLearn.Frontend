"use client";
import React from "react";
import { PartyRole } from "@/types/parties";
import { usePartyRole } from "@/hooks/usePartyRole";

type Props = {
  partyId: string;
  requireAny?: PartyRole[];
  requireAll?: PartyRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function RoleGate({ partyId, requireAny = [], requireAll = [], fallback = null, children }: Props) {
  const { roles, loading } = usePartyRole(partyId);
  if (loading) {
    return (
      <span className="inline-flex items-center">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#f5c16c]" />
      </span>
    ) as any;
  }
  const hasAny = requireAny.length === 0 || requireAny.some((r) => roles.includes(r));
  const hasAll = requireAll.length === 0 || requireAll.every((r) => roles.includes(r));
  if (hasAny && hasAll) return children as any;
  return fallback as any;
}