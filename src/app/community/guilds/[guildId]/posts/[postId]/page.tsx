// Converted to a Server Component to avoid importing server-only utilities into a client component
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PostDetailView } from "@/components/guild/posts/PostDetailView";

export default function GuildPostDetailPage({ params }: { params: { guildId: string; postId: string } }) {
  const { guildId, postId } = params;
  if (!guildId || !postId) return null;
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl py-6">
        <PostDetailView guildId={String(guildId)} postId={String(postId)} />
      </div>
    </DashboardLayout>
  );
}