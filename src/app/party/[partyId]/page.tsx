import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";

export default async function PartyDetailPage({ params }: { params: { partyId: string } }) {
  const { partyId } = params;
  return (
    <DashboardLayout>
      <div className="mx-auto w-full p-6">
        <PartyDetailPageClient partyId={partyId} />
      </div>
    </DashboardLayout>
  );
}