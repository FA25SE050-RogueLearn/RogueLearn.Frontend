"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GuildRole } from "@/types/guilds";

interface MembershipCardProps {
  myRole: GuildRole | null;
  onLeave: () => void;
}

export function MembershipCard({ myRole, onLeave }: MembershipCardProps) {
  return (
    <Card className="rounded-2xl border-white/12 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">My Membership</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-sm text-foreground/70">
          Current role: <span className="text-white font-medium">{myRole ?? "Unknown"}</span>
        </div>
        <Button variant="destructive" onClick={onLeave}>Leave Guild</Button>
      </CardContent>
    </Card>
  );
}