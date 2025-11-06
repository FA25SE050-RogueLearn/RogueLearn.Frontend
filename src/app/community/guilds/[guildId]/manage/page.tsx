"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function GuildManagementPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!guildId) return;
    // Redirect to main guild page where Management is rendered in tabs
    router.replace(`/community/guilds/${guildId}#manage`);
  }, [guildId, router]);

  return null;
}