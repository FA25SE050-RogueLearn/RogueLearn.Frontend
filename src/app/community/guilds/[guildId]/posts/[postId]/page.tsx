import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PostDetailView } from "@/components/guild/posts/PostDetailView";

export default async function GuildPostDetailPage({
  params,
}: {
  params: Promise<{ guildId: string; postId: string }>;
}) {
  const { guildId, postId } = await params;
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl py-6">
        <PostDetailView guildId={String(guildId)} postId={String(postId)} />
      </div>
    </DashboardLayout>
  );
}