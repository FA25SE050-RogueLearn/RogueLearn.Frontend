"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccessRestrictedCardProps {
  onGoToGuild: () => void;
  onBrowseGuilds: () => void;
}

export function AccessRestrictedCard({ onGoToGuild, onBrowseGuilds }: AccessRestrictedCardProps) {
  return (
    <Card className="rounded-2xl border-white/12 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Access Restricted</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-foreground/70">
        <div>
          You must be a member of this guild to access the Management tab.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onGoToGuild}>
            Go to Guild
          </Button>
          <Button onClick={onBrowseGuilds}>Browse Guilds</Button>
        </div>
      </CardContent>
    </Card>
  );
}