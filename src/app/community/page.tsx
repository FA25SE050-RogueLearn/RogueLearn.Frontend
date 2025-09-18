// roguelearn-web/src/app/community/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCommunity } from "@/lib/mockData";
import { ShieldCheck } from "lucide-react";

// Renders the Community page, listing available guilds.
export default function CommunityPage() {
  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-10 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-heading">Halls of Knowledge</h1>
            <p className="mt-2 text-foreground/70 font-body">Join a Guild to learn and grow with fellow scribes.</p>
          </div>
          <Button>Create Guild</Button>
        </div>

        <div className="space-y-6">
          {mockCommunity.guilds.map(guild => (
            <Card key={guild.id} className="bg-card/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold font-heading">{guild.name}</h3>
                    {guild.isVerified && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified Lecturer</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-foreground/70 mt-1 font-body">{guild.description}</p>
                  <div className="flex items-center gap-4 text-sm text-foreground/60 mt-2 font-body">
                    <span>Members: {guild.members}</span>
                    <span>Active Events: {guild.activeEvents}</span>
                  </div>
                </div>
                <Button variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </DashboardLayout>
  );
}