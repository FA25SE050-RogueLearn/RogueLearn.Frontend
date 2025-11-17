"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Search, UserCog, UserMinus, Crown } from "lucide-react";
import type { GuildMemberDto, GuildRole } from "@/types/guilds";

const ROLE_OPTIONS: GuildRole[] = [
  "GuildMaster",
  "Officer",
  "Veteran",
  "Member",
  "Recruit",
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
  onAssignRole: (authUserId: string, role: GuildRole) => void;
  onRevokeRole: (authUserId: string, role: GuildRole) => void;
  onRemoveMember: (memberId: string) => void;
}

export function MembersManagementCard({
  loading,
  error,
  members,
  myRole,
  onAssignRole,
  onRevokeRole,
  onRemoveMember,
}: MembersManagementCardProps) {
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [roleToAssign, setRoleToAssign] = useState<GuildRole>("Member");

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
          members
            .filter((m) => {
              const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.username || "";
              const email = m.email || "";
              const q = memberSearch.trim().toLowerCase();
              if (!q) return true;
              return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
            })
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
                  className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-gradient-to-br from-black/40 to-[#1a0a08]/40 p-4 transition-all hover:border-[#f5c16c]/40"
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
                        {typeof m.level === "number" ? ` • Lv ${m.level}` : ""}
                      </div>
                    </div>
                  </div>
                  {myRole === "GuildMaster" && m.role !== "GuildMaster" && (
                    <div className="flex items-center gap-2">
                      <Select value={roleToAssign} onValueChange={(v) => setRoleToAssign(v as GuildRole)}>
                        <SelectTrigger className="w-[140px] border-[#f5c16c]/30 bg-black/40 text-white focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="border-[#f5c16c]/30 bg-[#1a0a08]">
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem 
                              key={r} 
                              value={r}
                              className="text-white hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                            >
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={() => onAssignRole(m.authUserId, roleToAssign)}
                        className="bg-[#f5c16c] text-black hover:bg-[#d4a855]"
                      >
                        <UserCog className="mr-1.5 h-3.5 w-3.5" />
                        Assign
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onRevokeRole(m.authUserId, m.role)}
                        className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                      >
                        Revoke
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onRemoveMember(m.memberId)}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </CardContent>
    </Card>
  );
}