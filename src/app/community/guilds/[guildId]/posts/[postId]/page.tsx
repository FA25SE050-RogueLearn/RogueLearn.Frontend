"use client";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PostDetailView } from "@/components/guild/posts/PostDetailView";

export default function GuildPostDetailPage() {
  const { guildId, postId } = useParams<{ guildId: string; postId: string }>();
  if (!guildId || !postId) return null;
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl py-6">
        <PostDetailView guildId={String(guildId)} postId={String(postId)} />
      </div>
    </DashboardLayout>
  );
}