import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#2c2f33]">Settings</h1>
          <p className="text-[#2c2f33]/60">System configuration and preferences</p>
        </div>

        <Card className="bg-white border border-[#beaca3]/30 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#beaca3]/30 p-2">
                <Settings className="h-5 w-5 text-[#2c2f33]" />
              </div>
              <CardTitle className="text-lg font-semibold text-[#2c2f33]">Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#2c2f33]/60">Settings options will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
