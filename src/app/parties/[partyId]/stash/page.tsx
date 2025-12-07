"use client";
import React from "react";
import { useParams } from "next/navigation";
import PartyStash from "@/components/party/PartyStash";
import { DashboardFrame } from "@/components/layout/DashboardFrame";

export default function PartyStashPage() {
  const params = useParams();
  const partyId = (params?.partyId as string) ?? "";
  return (
    <DashboardFrame>
      <PartyStash partyId={partyId} />
    </DashboardFrame>
  );
}