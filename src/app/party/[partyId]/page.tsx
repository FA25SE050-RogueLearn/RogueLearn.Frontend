import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";

// Next.js 15 typed App Router expects `params` to be a Promise in page components.
// Update the signature accordingly and await the promise to extract `partyId`.
export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ partyId: string }>;
}) {
  const { partyId } = await params;
  return (
    <DashboardLayout>
      <div className="mx-auto w-full p-6">
        <PartyDetailPageClient partyId={partyId} />
      </div>
    </DashboardLayout>
  );
}