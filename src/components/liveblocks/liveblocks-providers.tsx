"use client";

import { ReactNode, useMemo } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { usePathname } from "next/navigation";
import partiesApi from "@/api/partiesApi";
import type { PartyMemberDto } from "@/types/parties";

// You can wrap your whole app in a LiveblocksProvider
export function LiveblocksProviders({ children }: { children: ReactNode }) {
  const LIVEBLOCKS_PUBLIC_KEY =
    process.env['NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY'] || "";
  const pathname = usePathname();
  const partyIdFromPath = useMemo(() => {
    const parts = (pathname || "").split("/").filter(Boolean);
    const idx = parts.indexOf("parties");
    if (idx !== -1 && parts.length > idx + 1) return parts[idx + 1];
    return null;
  }, [pathname]);

  async function getPartyMembers(partyId?: string | null): Promise<PartyMemberDto[]> {
    if (!partyId) return [];
    try {
      const res = await partiesApi.getMembers(partyId);
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  function nameOf(m?: PartyMemberDto | null): string | undefined {
    if (!m) return undefined;
    const u = (m.username ?? "").trim();
    if (u) return u;
    const full = `${(m.firstName ?? "").trim()} ${(m.lastName ?? "").trim()}`.trim();
    if (full) return full;
    const e = (m.email ?? "").trim();
    return e || undefined;
  }
  return (
    <LiveblocksProvider
      publicApiKey={LIVEBLOCKS_PUBLIC_KEY}
      resolveUsers={async ({ userIds }) => {
        const members = await getPartyMembers(partyIdFromPath);
        const byId = new Map<string, PartyMemberDto>();
        for (const m of members) byId.set(m.authUserId, m);
        return userIds.map((id) => {
          const m = byId.get(id);
          return m
            ? { name: nameOf(m), avatar: m.profileImageUrl ?? undefined }
            : { name: "User", avatar: undefined };
        });
      }}
      resolveMentionSuggestions={async ({ text }) => {
        const members = await getPartyMembers(partyIdFromPath);
        const q = (text ?? "").toLowerCase();
        const list = members.filter((m) => {
          if (!q) return true;
          const values = [
            m.username ?? "",
            m.email ?? "",
            m.firstName ?? "",
            m.lastName ?? "",
          ]
            .map((s) => s.toLowerCase())
            .filter(Boolean);
          return values.some((v) => v.includes(q));
        });
        return list.map((m) => m.authUserId);
      }}
    >
      {children}
    </LiveblocksProvider>
  );
}
