"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Search } from "lucide-react";

interface AccessRestrictedCardProps {
  onGoToGuild: () => void;
  onBrowseGuilds: () => void;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-[#1a0a08] to-black shadow-xl";

export function AccessRestrictedCard({ onGoToGuild, onBrowseGuilds }: AccessRestrictedCardProps) {
  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-rose-500/10 p-2">
            <Lock className="h-5 w-5 text-rose-400" />
          </div>
          <CardTitle className="text-xl text-rose-400">Access Restricted</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 pt-6">
        <p className="text-sm text-white/70">
          You must be a member of this guild to access the Management tab.
        </p>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onGoToGuild}
            className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to Guild
          </Button>
          <Button 
            onClick={onBrowseGuilds}
            className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c]"
          >
            <Search className="mr-2 h-4 w-4" />
            Browse Guilds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}