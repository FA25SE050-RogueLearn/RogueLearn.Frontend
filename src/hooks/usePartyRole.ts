"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import partiesApi from "@/api/partiesApi";
import { PartyRole } from "@/types/parties";
import { getMyContext } from "@/api/usersApi";

export function usePartyRole(partyId: string) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<PartyRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!partyId || !authUserId) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await partiesApi.getMemberRoles(partyId, authUserId);
      setRoles(res.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [partyId, authUserId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyContext();
        if (!mounted) return;
        setAuthUserId(me.data?.authUserId ?? null);
      } catch {
        if (!mounted) return;
        setAuthUserId(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const role: PartyRole | null = useMemo(() => {
    if (roles.includes("Leader")) return "Leader";
    if (roles.includes("CoLeader")) return "CoLeader";
    if (roles.includes("Member")) return "Member";
    return null;
  }, [roles]);

  return { authUserId, roles, role, loading, error, refresh } as const;
}