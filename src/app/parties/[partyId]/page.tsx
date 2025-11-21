"use client";
import { useParams } from "next/navigation";
import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";

export default function PartyDetailPage() {
  const params = useParams();
  const partyId = (params?.partyId as string) ?? "";
  return (
    <div className="min-h-screen bg-linear-to-b from-[#0a0506] via-[#120806] to-[#0a0506] p-6">
      <PartyDetailPageClient partyId={partyId} />
    </div>
  );
}