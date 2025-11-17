"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import type { GuildRole } from "@/types/guilds";

interface MembershipCardProps {
  myRole: GuildRole | null;
  onLeave: () => void;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function MembershipCard({ myRole, onLeave }: MembershipCardProps) {
  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f5c16c]/10 p-2">
            <Shield className="h-5 w-5 text-[#f5c16c]" />
          </div>
          <CardTitle className="text-xl text-[#f5c16c]">My Membership</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative flex items-center justify-between pt-6">
        <div className="text-sm text-white/70">
          Current role:{" "}
          <span className="ml-1 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1 text-sm font-medium text-[#f5c16c]">
            {myRole ?? "Unknown"}
          </span>
        </div>
        <Button 
          variant="destructive" 
          onClick={onLeave}
          className="bg-rose-600 hover:bg-rose-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Leave Guild
        </Button>
      </CardContent>
    </Card>
  );
}