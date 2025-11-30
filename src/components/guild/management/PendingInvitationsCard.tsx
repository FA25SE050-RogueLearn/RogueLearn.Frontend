"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { GuildInvitationDto } from "@/types/guilds";

interface PendingInvitationsCardProps {
  loading: boolean;
  invitations: GuildInvitationDto[];
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function PendingInvitationsCard({ loading, invitations }: PendingInvitationsCardProps) {
  const pending = invitations.filter((inv) => inv.status === "Pending");

  return (
    <Card className={CARD_CLASS}>
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />

      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f5c16c]/10 p-2">
            <Clock className="h-5 w-5 text-[#f5c16c]" />
          </div>
          <CardTitle className="text-xl text-[#f5c16c]">Pending Invitations</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3 pt-6">
        {loading ? (
          <p className="text-sm text-white/60">Loading invitations...</p>
        ) : pending.length === 0 ? (
          <div className="rounded-lg border border-[#f5c16c]/20 bg-[#f5c16c]/5 p-8 text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-[#f5c16c]/40" />
            <p className="text-sm text-white/60">No pending invitations.</p>
          </div>
        ) : (
          pending.map((inv) => (
            <div
              key={inv.invitationId || inv.id}
              className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-linear-to-br from-black/40 to-[#1a0a08]/40 p-4 transition-all hover:border-[#f5c16c]/40"
            >
              <div>
                <p className="font-medium text-white">
                  {inv.inviteeName || inv.targetEmail || inv.targetUserId || "Unknown target"}
                </p>
                <p className="text-xs text-white/50">Created: {new Date(inv.createdAt).toLocaleString()}</p>
                <p className="text-xs text-white/50">Expires: {new Date(inv.expiresAt).toLocaleString()}</p>
                <p className="text-xs text-white/50">
                  Status: <span className="text-amber-400">{inv.status}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}