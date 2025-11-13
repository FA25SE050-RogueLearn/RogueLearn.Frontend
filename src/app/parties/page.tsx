"use client";
import React from "react";
import PartyManagementClient from "@/components/party/PartyManagementClient";

export default function PartiesManagementPage() {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Party Management</h1>
        <p className="text-sm text-white/70">Create, manage, and discover parties.</p>
      </div>
      <PartyManagementClient />
    </div>
  );
}