import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#f5c16c]">Settings</h1>
          <p className="text-white/60">System configuration and preferences</p>
        </div>

        <Card className="bg-[#1a1410] border border-[#f5c16c]/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#f5c16c]/10 p-2">
                <Settings className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <CardTitle className="text-lg font-semibold text-white">Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60">Settings options will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
