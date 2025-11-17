"use client";
import { useEffect, useState, useCallback } from "react";
import type { GuildRole } from "@/types/guilds";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";

export function useGuildRoles(guildId: string | null | undefined) {
  const [roles, setRoles] = useState<GuildRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!guildId) {
      setRoles([]);
      return;
    }
    setLoading(true);
    try {
      const profileRes = await profileApi.getMyProfile();
      const authUserId = profileRes.data?.authUserId ?? null;
      if (!authUserId) {
        setRoles([]);
        setError(null);
        return;
      }
      const res = await guildsApi.getMemberRoles(String(guildId), authUserId);
      setRoles(res.data ?? []);
      setError(null);
    } catch (err: any) {
      setError("failed");
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const refresh = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, error, refresh };
}