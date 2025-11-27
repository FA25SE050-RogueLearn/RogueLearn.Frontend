import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";

interface PageProps {
  params: Promise<{ partyId: string }>
}

export default async function PartyDetailPage({ params }: PageProps) {
  const { partyId } = await params;
  return (
    <DashboardLayout>
      <div className="mx-auto w-full p-6">
        <PartyDetailPageClient partyId={partyId} />
      </div>
    </DashboardLayout>
  );
}
