import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";

const BACKDROP_GRADIENT = {
  background: "radial-gradient(circle at top, rgba(210,49,135,0.25), transparent 60%), linear-gradient(180deg, #100414 0%, #06020b 60%, #010103 100%)",
};
const BACKDROP_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
  opacity: 0.08,
  mixBlendMode: "screen" as const,
};

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ partyId: string }>;
}) {
  const { partyId } = await params;
  return (
    <DashboardLayout>
      <div className="relative min-h-screen overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT as any} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE as any} />
        <div className="relative z-10 p-6">
          <PartyDetailPageClient partyId={partyId} />
        </div>
      </div>
    </DashboardLayout>
  );
}