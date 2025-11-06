"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function GuildPostsPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!guildId) return;
    // Redirect to main guild page where Posts are rendered in tabs
    router.replace(`/community/guilds/${guildId}#posts`);
  }, [guildId, router]);

  return null;
}