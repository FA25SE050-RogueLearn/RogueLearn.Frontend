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
import type { GuildMemberDto, GuildRole } from "@/types/guilds";

const ROLE_OPTIONS: GuildRole[] = [
  "GuildMaster",
  "Officer",
  "Veteran",
  "Member",
  "Recruit",
];

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
    <Card className="rounded-2xl border-white/12 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search members by name or email"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-sm text-foreground/60">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : members.length === 0 ? (
          <div className="text-sm text-foreground/60">No members.</div>
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
                <div key={m.memberId} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={m.profileImageUrl || undefined} alt={displayName} />
                      <AvatarFallback>{initials || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-white flex items-center gap-2">
                        <span>{displayName}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">{m.role}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">{m.status}</span>
                      </div>
                      <div className="text-xs text-foreground/60">
                        {m.email ? m.email + " • " : ""}Joined {joined}
                        {typeof m.level === "number" ? ` • Lv ${m.level}` : ""}
                      </div>
                    </div>
                  </div>
                  {myRole === "GuildMaster" && m.role !== "GuildMaster" && (
                    <div className="flex items-center gap-2">
                      <Select value={roleToAssign} onValueChange={(v) => setRoleToAssign(v as GuildRole)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => onAssignRole(m.authUserId, roleToAssign)}>Assign</Button>
                      <Button size="sm" variant="outline" onClick={() => onRevokeRole(m.authUserId, m.role)}>Revoke</Button>
                      <Button size="sm" variant="destructive" onClick={() => onRemoveMember(m.memberId)}>Remove</Button>
                    </div>
                  )}
                  {myRole === "Officer" && m.role !== "GuildMaster" && m.role !== "Officer" && (
                    <div className="flex items-center gap-2">
                      <Select value={roleToAssign} onValueChange={(v) => setRoleToAssign(v as GuildRole)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Veteran", "Recruit"].map((r) => (
                            <SelectItem key={r} value={r as GuildRole}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => onAssignRole(m.authUserId, roleToAssign)}>Assign</Button>
                      <Button size="sm" variant="destructive" onClick={() => onRemoveMember(m.memberId)}>Remove</Button>
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