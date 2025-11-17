"use client";
import React from "next";
import { useParams } from "next/navigation";
import PartyStash from "@/components/party/PartyStash";

export default function PartyStashPage() {
  const params = useParams();
  const partyId = (params?.partyId as string) ?? "";
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0506] via-[#120806] to-[#0a0506] p-6">
      <PartyStash partyId={partyId} />
    </div>
  );
}