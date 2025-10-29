import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2 } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* RPG-styled Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 rounded-lg blur-xl" />
          <div className="relative p-6 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
            <h1 className="text-3xl font-bold text-amber-100">Sanctum Configuration</h1>
            <p className="text-amber-700">
              System enchantments and wards
            </p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Master Settings</CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-900/50">
              <Settings2 className="h-8 w-8 text-amber-50" />
            </div>
            <p className="mt-4 text-sm text-amber-600">Arcane configuration panel materializing soon...</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
