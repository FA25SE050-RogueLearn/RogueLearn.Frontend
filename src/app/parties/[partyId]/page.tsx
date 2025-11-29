import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function PartyDetailPage({ params }: { params: Promise<{ partyId: string }> }) {
  const { partyId } = await params;
  return (
    <DashboardLayout>
      <PartyDetailPageClient partyId={partyId} />
    </DashboardLayout>
  );
}