"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Users, Eye } from "lucide-react";
import type { GuildJoinRequestDto, GuildRole } from "@/types/guilds";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ApplicantProfileView } from "./ApplicantProfileView";

interface JoinRequestsCardProps {
  loading: boolean;
  error: string | null;
  joinRequests: GuildJoinRequestDto[];
  myRole: GuildRole | null;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function JoinRequestsCard({ loading, error, joinRequests, myRole, onApprove, onDecline }: JoinRequestsCardProps) {
  const [page, setPage] = useState<number>(1);
  const [viewingRequesterId, setViewingRequesterId] = useState<string | null>(null);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil((joinRequests.length || 0) / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pagedRequests = joinRequests.slice((safePage - 1) * pageSize, (safePage - 1) * pageSize + pageSize);
  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f5c16c]/10 p-2">
            <Users className="h-5 w-5 text-[#f5c16c]" />
          </div>
          <CardTitle className="text-xl text-[#f5c16c]">Pending Join Requests</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3 pt-6">
        {loading ? (
          <p className="text-sm text-white/60">Loading requests...</p>
        ) : error ? (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        ) : joinRequests.length === 0 ? (
          <div className="rounded-lg border border-[#f5c16c]/20 bg-[#f5c16c]/5 p-8 text-center">
            <UserCheck className="mx-auto mb-3 h-12 w-12 text-[#f5c16c]/40" />
            <p className="text-sm text-white/60">No pending requests.</p>
          </div>
        ) : (
          pagedRequests.map((jr) => (
            <div 
              key={jr.id} 
              className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-linear-to-br from-black/40 to-[#1a0a08]/40 p-4 transition-all hover:border-[#f5c16c]/40"
            >
              <div>
                <p className="font-medium text-white">Request by {jr.requesterName || jr.requesterId}</p>
                <p className="text-xs text-white/50">Requested: {new Date(jr.createdAt).toLocaleString()}</p>
                <p className="text-xs text-white/50">
                  Status: <span className="text-amber-400">{jr.status}</span>
                </p>
              </div>
              {myRole === "GuildMaster" && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setViewingRequesterId(jr.requesterId)}
                    className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Profile
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onApprove(jr.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onDecline(jr.id)}
                    className="border-rose-500/30 bg-transparent text-rose-400 hover:bg-rose-500/10"
                  >
                    <UserX className="mr-1.5 h-3.5 w-3.5" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
        {(!loading && !error && joinRequests.length > 0) && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-white/70">
              <span>Showing {(safePage - 1) * pageSize + 1}–{Math.min(joinRequests.length, safePage * pageSize)} of {joinRequests.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={`border-[#f5c16c]/30 ${safePage===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</Button>
              <span className="text-xs text-white/70">Page {safePage} of {pageCount}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className={`border-[#f5c16c]/30 ${safePage===pageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={!!viewingRequesterId} onOpenChange={(open) => !open && setViewingRequesterId(null)}>
        <DialogContent className="w-[98vw] max-w-[1200px] h-[90vh] border-[#f5c16c]/30 bg-[#0b0a13]/95 p-0 overflow-hidden min-w-0">
          <DialogTitle className="sr-only">User Profile</DialogTitle>
          <div className="w-full h-full overflow-y-auto overflow-x-hidden min-w-0">
             <ApplicantProfileView authUserId={viewingRequesterId ?? undefined} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}