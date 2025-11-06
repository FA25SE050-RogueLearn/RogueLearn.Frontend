"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GuildJoinRequestDto, GuildRole } from "@/types/guilds";

interface JoinRequestsCardProps {
  loading: boolean;
  error: string | null;
  joinRequests: GuildJoinRequestDto[];
  myRole: GuildRole | null;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function JoinRequestsCard({ loading, error, joinRequests, myRole, onApprove, onDecline }: JoinRequestsCardProps) {
  return (
    <Card className="rounded-2xl border-white/12 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Pending Join Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-foreground/60">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : joinRequests.length === 0 ? (
          <div className="text-sm text-foreground/60">No pending requests.</div>
        ) : (
          joinRequests.map((jr) => (
            <div key={jr.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div>
                <div className="text-sm text-white">Request by {jr.requesterId}</div>
                <div className="text-xs text-foreground/60">Status: {jr.status}</div>
              </div>
              {myRole === "GuildMaster" && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => onApprove(jr.id)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => onDecline(jr.id)}>Decline</Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}