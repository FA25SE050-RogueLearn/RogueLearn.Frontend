import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyManagementClient from "@/components/party/PartyManagementClient";

export default async function PartyPage() {
  return (
    <DashboardLayout>
      <div className="w-full p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Party Management</h1>
          <p className="text-sm text-white/70">Create and manage your learning parties.</p>
        </div>
        <PartyManagementClient />
      </div>
    </DashboardLayout>
  );
}