import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PartyManagementClient from "@/components/party/PartyManagementClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const HERO_CARD_CLASS = "relative overflow-hidden rounded-[32px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]";
const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

export default async function PartyPage() {
  return (
    <DashboardLayout>
      <div className="w-full p-6">
        <Card className={HERO_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE as any} />
          <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-6">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d23187]/20 border border-[#d23187]/40">
                <Users className="h-8 w-8 text-[#f5c16c]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]">Party Nexus</p>
                <CardTitle className="text-3xl text-white">Form Your Party</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-foreground/70">
              Create and manage your learning parties in one place.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6">
          <PartyManagementClient />
        </div>
      </div>
    </DashboardLayout>
  );
}