"use client";
import React from "react";
import { GuildRole } from "@/types/guilds";
import { useGuildRoles } from "@/hooks/useGuildRoles";

type Props = {
  guildId: string;
  requireAny?: GuildRole[];
  requireAll?: GuildRole[];
  exclude?: GuildRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export default function GuildRoleGate({ guildId, requireAny = [], requireAll = [], exclude = [], fallback = null, children }: Props) {
  const { roles, loading } = useGuildRoles(guildId);
  if (loading) return null as any;
  const hasAny = requireAny.length === 0 || requireAny.some((r) => roles.includes(r));
  const hasAll = requireAll.length === 0 || requireAll.every((r) => roles.includes(r));
  const isExcluded = exclude.length > 0 && exclude.some((r) => roles.includes(r));
  if (!isExcluded && hasAny && hasAll) return children as any;
  return fallback as any;
}