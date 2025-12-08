"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Search, UserMinus, Crown, MoreHorizontal } from "lucide-react";
import type { GuildMemberDto, GuildRole } from "@/types/guilds";

const ROLE_OPTIONS: GuildRole[] = [
  "Member",
];

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

interface MembersManagementCardProps {
  loading: boolean;
  error: string | null;
  members: GuildMemberDto[];
  myRole: GuildRole | null;
  onRemoveMember: (memberId: string) => void;
  onTransferLeadership?: (toAuthUserId: string) => void;
}

export function MembersManagementCard({
  loading,
  error,
  members,
  myRole,
  onRemoveMember,
  onTransferLeadership,
}: MembersManagementCardProps) {
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.username || "";
      const email = m.email || "";
      const q = memberSearch.trim().toLowerCase();
      if (!q) return true;
      return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
    });
  }, [members, memberSearch]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil((filtered.length || 0) / pageSize)), [filtered.length]);
  const safePage = useMemo(() => Math.min(Math.max(1, page), pageCount), [page, pageCount]);
  const pagedMembers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, safePage]);

  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f5c16c]/10 p-2">
            <Shield className="h-5 w-5 text-[#f5c16c]" />
          </div>
          <CardTitle className="text-xl text-[#f5c16c]">Guild Members</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search members by name or email..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="border-[#f5c16c]/20 bg-black/40 pl-10 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
          />
        </div>
        {loading ? (
          <p className="text-sm text-white/60">Loading members...</p>
        ) : error ? (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-lg border border-[#f5c16c]/20 bg-[#f5c16c]/5 p-8 text-center">
            <Shield className="mx-auto mb-3 h-12 w-12 text-[#f5c16c]/40" />
            <p className="text-sm text-white/60">No members found.</p>
          </div>
        ) : (
          pagedMembers
            .map((m) => {
              const displayName =
                [m.firstName, m.lastName].filter(Boolean).join(" ") ||
                m.username ||
                m.email ||
                m.authUserId;
              const initials = (displayName.match(/\b\w/g) || [])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const joined = m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "";
              return (
                <div 
                  key={m.memberId} 
                  className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-linear-to-br from-black/40 to-[#1a0a08]/40 p-4 transition-all hover:border-[#f5c16c]/40"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-[#f5c16c]/30">
                      <AvatarImage src={m.profileImageUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-[#f5c16c]/10 text-[#f5c16c]">{initials || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <span className="font-medium">{displayName}</span>
                        {m.role === "GuildMaster" && (
                          <Crown className="h-3.5 w-3.5 text-[#f5c16c]" />
                        )}
                        <span className="rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#f5c16c]">
                          {m.role}
                        </span>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
                          {m.status}
                        </span>
                      </div>
                      <div className="text-xs text-white/50">
                        {m.email ? m.email + " • " : ""}Joined {joined}
                      </div>
                    </div>
                  </div>
                  {myRole === "GuildMaster" && m.role !== "GuildMaster" && (
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1a0a08] border-[#f5c16c]/20">
                          {onTransferLeadership && (
                            <DropdownMenuItem onClick={() => onTransferLeadership?.(m.authUserId)} className="text-white/80">
                              <Crown className="h-4 w-4" /> Transfer Leadership
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onRemoveMember(m.memberId)} className="text-white/80">
                            <UserMinus className="h-4 w-4" /> Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })
        )}
        {(!loading && !error && filtered.length > 0) && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-white/70">
              <span>Showing {(safePage - 1) * pageSize + 1}–{Math.min(filtered.length, safePage * pageSize)} of {filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={`border-[#f5c16c]/30 ${safePage===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</Button>
              <span className="text-xs text-white/70">Page {safePage} of {pageCount}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className={`border-[#f5c16c]/30 ${safePage===pageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
