"use client";
import React from "react";
import { useParams } from "next/navigation";
import PartyStash from "@/components/party/PartyStash";

export default function PartyStashPage() {
  const params = useParams();
  const partyId = (params?.partyId as string) ?? "";
  return (
    <div className="p-4">
      <PartyStash partyId={partyId} />
    </div>
  );
}