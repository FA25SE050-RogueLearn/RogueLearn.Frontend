"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, GraduationCap, Search, Trash2, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getAllUserProfiles } from "@/api/usersApi";
import userRolesApi from "@/api/userRolesApi";
import rolesApi from "@/api/rolesApi";
import type { UserProfileDto } from "@/types/user-profile";
import type { RoleDto } from "@/types/roles";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUserRolesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<UserProfileDto[]>([]);
  const [rolesCatalog, setRolesCatalog] = useState<RoleDto[]>([]);
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserProfileDto | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<{ roleId: string; roleName: string; assignedAt: string }[]>([]);
  const [contextLoading, setContextLoading] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [profilesRes, rolesRes] = await Promise.all([
          getAllUserProfiles(),
          rolesApi.getAll(),
        ]);
        if (!mounted) return;
        if (!profilesRes.isSuccess || !profilesRes.data) throw new Error("Failed to load user profiles");
        if (!rolesRes.isSuccess || !rolesRes.data) throw new Error("Failed to load roles catalog");
        setProfiles(profilesRes.data.userProfiles);
        setRolesCatalog(Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const normalizeRole = (n: string) => String(n ?? '').toLowerCase().replace(/\s+/g, '');
  const roleTabs = useMemo(() => {
    const list = Array.isArray(rolesCatalog) ? rolesCatalog : [];
    return list.map(rc => ({
      id: rc.id,
      label: rc.name || rc.id,
      value: normalizeRole(rc.name || rc.id),
    }));
  }, [rolesCatalog]);
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const currentRole = activeRole || (roleTabs[0]?.value ?? "");
    const base = currentRole
      ? profiles.filter(p => (p.roles ?? []).some(r => normalizeRole(r) === currentRole))
      : profiles;
    if (!q) return base;
    return base.filter(p =>
      p.username.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.firstName ?? "").toLowerCase().includes(q) ||
      (p.lastName ?? "").toLowerCase().includes(q)
    );
  }, [profiles, search, activeRole, roleTabs]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / pageSize)), [filteredUsers.length]);
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);
  useEffect(() => { setPage(1); }, [search, activeRole, filteredUsers.length]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of profiles) {
      for (const r of (p.roles ?? [])) {
        const key = normalizeRole(r);
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
    return counts;
  }, [profiles]);

  

  const selectUser = async (profile: UserProfileDto) => {
    setSelectedUser(profile);
    setContextLoading(true);
    setSelectedUserRoles([]);
    try {
      const rolesRes = await userRolesApi.getByAuthUserId(profile.authUserId);
      if (!rolesRes.isSuccess || !rolesRes.data) throw new Error("Failed to load roles");
      const arr = Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles : [];
      const normalized = arr.map((r: any) => ({
        roleId: r?.roleId ?? r?.id ?? String(r?.roleName ?? r?.name ?? r ?? ""),
        roleName: r?.roleName ?? r?.name ?? (typeof r === "string" ? r : ""),
        assignedAt: r?.assignedAt ?? r?.createdAt ?? "",
      })).filter(x => !!x.roleName);
      setSelectedUserRoles(normalized);
      
    } catch (e: any) {
      setError(e?.message ?? "Failed to load user context");
    } finally {
      setContextLoading(false);
    }
  };

  const refreshSelectedUser = async () => {
    if (!selectedUser) return;
    await selectUser(selectedUser);
  };

  const reloadAll = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        getAllUserProfiles(),
        rolesApi.getAll(),
      ]);
      if (profilesRes.isSuccess && profilesRes.data) {
        setProfiles(profilesRes.data.userProfiles);
      }
      if (rolesRes.isSuccess && rolesRes.data) {
        setRolesCatalog(Array.isArray(rolesRes.data.roles) ? rolesRes.data.roles : []);
      }
    } catch {}
  };

  const verifiedLecturerRoleId = useMemo(() => {
    const list = Array.isArray(rolesCatalog) ? rolesCatalog : [];
    const byExact = list.find(r => (String(r.name ?? '').toLowerCase().replace(/\s+/g, '')) === 'verifiedlecturer');
    return byExact?.id ?? null;
  }, [rolesCatalog]);

  const handleRevokeVerifiedLecturer = async () => {
    if (!selectedUser || !verifiedLecturerRoleId) {
      toast.error("Verified Lecturer role not found");
      return;
    }
    try {
      await userRolesApi.remove({ authUserId: selectedUser.authUserId, roleId: verifiedLecturerRoleId });
      toast.success("Verified Lecturer revoked");
      await refreshSelectedUser();
      await reloadAll();
      setIsRevokeOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to revoke role");
    }
  };

  

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-[#f5c16c]/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <GraduationCap className="text-[#f5c16c]" size={32} />
              User Roles Management
            </h1>
            <p className="text-amber-700 mt-2 max-w-xl">
              Manage user roles. Revocation removes Verified Lecturer role.
            </p>
          </div>
        <div className="flex gap-4 flex-wrap">
          {(rolesCatalog ?? []).map(rc => {
            const key = normalizeRole(rc.name || rc.id);
            const count = roleCounts[key] ?? 0;
            return (
              <div key={rc.id} className="bg-[#1E1B2E] border border-[#2D2842] rounded-lg px-4 py-2 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{rc.name || rc.id}</div>
              </div>
            );
          })}
        </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-[#13111C] p-2 rounded-xl border border-[#2D2842]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search scholars by name or email..."
                className="w-full bg-[#1E1B2E] border border-transparent focus:border-[#f5c16c]/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={activeRole || (roleTabs[0]?.value ?? "")} onValueChange={setActiveRole} className="flex-1">
              <TabsList className="bg-[#1E1B2E] border border-[#2D2842] text-gray-300">
                {roleTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                    <span>{tab.label}</span>
                    <span className="rounded-full bg-[#2D2842] px-2 py-0.5 text-[10px] text-white/70">
                      {roleCounts[tab.value] ?? 0}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={activeRole} />
            </Tabs>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">User</div>
              <div className="col-span-6">Roles</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-amber-300 px-6 py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-rose-400 px-6 py-4">{error}</div>
            )}
            {!loading && !error && pagedUsers.map(user => (
              <div key={user.id} className="group grid grid-cols-12 items-center px-6 py-4 bg-[#1E1B2E] border border-[#2D2842] rounded-xl hover:border-[#f5c16c]/30 transition-all">
                <div className="col-span-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-[#f5c16c]/20">
                    <AvatarImage src={user.profileImageUrl ?? undefined} />
                    <AvatarFallback>{(user.username ?? 'U').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-bold text-sm flex items-center gap-2">
                      {user.username}
                      <ShieldAlert size={12} className="text-[#f5c16c]" />
                    </div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                </div>
                <div className="col-span-6 text-xs text-gray-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2D2842] bg-[#151226] text-gray-300 hover:bg-[#1E1B2E] transition">
                        <span className="text-[11px] font-semibold uppercase tracking-wide">Roles</span>
                        <span className="rounded-full bg-[#2D2842] px-2 py-0.5 text-[10px] text-white/70">{(user.roles ?? []).length}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[220px] bg-[#13111C] border-[#2D2842] text-white">
                      {(user.roles ?? []).length > 0 ? (
                        (user.roles ?? []).map((r, idx) => (
                          <DropdownMenuItem key={`${user.id}-${idx}`} className="text-xs text-gray-200">
                            {r}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled className="text-xs text-gray-400">No roles</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="col-span-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <CheckCircle2 size={10} /> Active
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {(activeRole || (roleTabs[0]?.value ?? "")) === 'verifiedlecturer' && (
                    <button
                      onClick={async () => { await selectUser(user); setIsRevokeOpen(true); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wide"
                    >
                      <Trash2 size={12} />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!loading && !error && filteredUsers.length > 0 && (
              <div className="px-6 py-3 flex items-center justify-between">
                <div className="text-xs text-white/60">Page {page} of {totalPages}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded bg-[#2D2842] px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded bg-[#2D2842] px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
          <DialogContent className="bg-[#13111C] border-[#2D2842] text-white max-w-md">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <DialogTitle className="text-center text-xl">Revoke Lecturer Credentials?</DialogTitle>
              <DialogDescription className="text-center text-gray-400 pt-2">
                You are about to remove <span className="text-white font-bold">{selectedUser?.username}</span> from the Verified Lecturer Registry.
                <div className="mt-4 bg-[#1E1B2E] p-3 rounded-lg text-xs text-left border border-red-500/20">
                  <p className="font-bold text-red-400 mb-1">Impact:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>User loses access to Verified Lecturer status.</li>
                    <li>Max number of guild members will be reduced to 50.</li>
                    <li>If the guild current members is currently more than 50, the max number of members will be capped to that current number.</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <button
                onClick={() => setIsRevokeOpen(false)}
                className="px-4 py-2 bg-transparent hover:bg-[#2D2842] text-gray-300 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeVerifiedLecturer}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition flex items-center gap-2"
              >
                <Trash2 size={14} />
                Confirm Revocation
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        
      </div>
    </AdminLayout>
  );
}