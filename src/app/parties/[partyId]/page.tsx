"use client";
import React from "react";
import { useParams } from "next/navigation";
import PartyDetailPageClient from "@/components/party/PartyDetailPageClient";

export default function PartyDetailPage() {
  const params = useParams();
  const partyId = (params?.partyId as string) ?? "";
  return (
    <div className="p-4">
      <PartyDetailPageClient partyId={partyId} />
    </div>
  );
}