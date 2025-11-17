import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyManagementClient from "@/components/party/PartyManagementClient";
import { Users } from "lucide-react";

export default function PartiesManagementPage() {
  return (
    <DashboardLayout>
      <div className="w-full p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#f5c16c]/10 p-3">
              <Users className="h-6 w-6 text-[#f5c16c]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f5c16c]">Party Management</h1>
              <p className="text-sm text-white/60">Create, manage, and discover parties.</p>
            </div>
          </div>
        </div>
        <PartyManagementClient />
      </div>
    </DashboardLayout>
  );
}