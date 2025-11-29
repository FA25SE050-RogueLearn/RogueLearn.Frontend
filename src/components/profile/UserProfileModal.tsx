"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LecturerVerificationPanel } from "@/components/profile/LecturerVerificationPanel";
import { SocialScryingContent } from "@/components/profile/SocialScryingModal";
import { LogOut, Sparkles, UploadCloud, User, Settings, Bell, Users, Shield, Mail, GraduationCap, Loader2 } from "lucide-react";
import profileApi from "@/api/profileApi";
import { updateMyProfile } from "@/api/usersApi";
import type { UserProfileDto } from "@/types/user-profile";
import Image from "next/image";
import guildsApi from "@/api/guildsApi";
import partiesApi from "@/api/partiesApi";
import type { GuildJoinRequestDto, GuildInvitationDto } from "@/types/guilds";
import type { PartyInvitationDto } from "@/types/parties";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "profile" | "settings" | "verification" | "notifications" | "guildRequests" | "invitations" | "social";
}

export default function UserProfileModal({ open, onOpenChange, defaultTab = "profile" }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<typeof defaultTab>(defaultTab);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [joinRequests, setJoinRequests] = useState<GuildJoinRequestDto[]>([]);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);
  const [joinRequestsError, setJoinRequestsError] = useState<string | null>(null);
  const [joinGuildNames, setJoinGuildNames] = useState<Record<string, string>>({});
  const [partyInvites, setPartyInvites] = useState<PartyInvitationDto[]>([]);
  const [loadingPartyInvites, setLoadingPartyInvites] = useState(false);
  const [partyInvitesError, setPartyInvitesError] = useState<string | null>(null);
  const [guildInvites, setGuildInvites] = useState<GuildInvitationDto[]>([]);
  const [loadingGuildInvites, setLoadingGuildInvites] = useState(false);
  const [guildInvitesError, setGuildInvitesError] = useState<string | null>(null);
  const [joinRequestsHistory, setJoinRequestsHistory] = useState<GuildJoinRequestDto[]>([]);
  const [loadingJoinRequestsHistory, setLoadingJoinRequestsHistory] = useState(false);
  const [joinRequestsHistoryError, setJoinRequestsHistoryError] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await profileApi.getMyProfile();
      if (mounted && res.isSuccess) {
        const p = res.data || null;
        setProfile(p);
        setFirstName(((p?.firstName ?? "") as string) || "");
        setLastName(((p?.lastName ?? "") as string) || "");
        setBio(((p?.bio ?? "") as string) || "");
      }
    };
    if (open) load();
    return () => { mounted = false; };
  }, [open]);

  useEffect(() => {
    let mounted = true;
    const fetchJoinRequests = async () => {
      setLoadingJoinRequests(true);
      setJoinRequestsError(null);
      try {
        const res = await guildsApi.getMyJoinRequests(true);
        if (mounted && res.isSuccess) {
          setJoinRequests(res.data || []);
        }
      } catch (err: any) {
        if (mounted) setJoinRequestsError(err?.normalized?.message || "Failed to load join requests");
      } finally {
        if (mounted) setLoadingJoinRequests(false);
      }
    };
    if (open && (activeTab === "guildRequests" || activeTab === "invitations")) fetchJoinRequests();
    return () => { mounted = false; };
  }, [open, activeTab]);

  useEffect(() => {
    let mounted = true;
    const resolveGuildNames = async () => {
      const allIds = [
        ...((joinRequests || []).map(r => r.guildId)),
        ...((joinRequestsHistory || []).map(r => r.guildId)),
      ];
      const missingIds = Array.from(new Set(allIds.filter(id => !joinGuildNames[id])));
      if (missingIds.length === 0) return;
      try {
        const results = await Promise.all(missingIds.map(id => guildsApi.getById(id)));
        const map: Record<string, string> = { ...joinGuildNames };
        missingIds.forEach((id, i) => { const g = results[i].data; if (g?.name) map[id] = g.name; });
        if (mounted) setJoinGuildNames(map);
      } catch {}
    };
    if (open && (activeTab === "guildRequests" || activeTab === "invitations")) resolveGuildNames();
    return () => { mounted = false; };
  }, [open, activeTab, joinRequests, joinRequestsHistory, joinGuildNames]);

  useEffect(() => {
    let mounted = true;
    const fetchPartyInvites = async () => {
      setLoadingPartyInvites(true);
      setPartyInvitesError(null);
      try {
        const res = await partiesApi.getMyPendingInvitations();
        if (mounted && res.isSuccess) {
          setPartyInvites(res.data || []);
        }
      } catch (err: any) {
        if (mounted) setPartyInvitesError(err?.normalized?.message || "Failed to load party invites");
      } finally {
        if (mounted) setLoadingPartyInvites(false);
      }
    };
    if (open && (activeTab === "invitations" || activeTab === "guildRequests")) fetchPartyInvites();
    return () => { mounted = false; };
  }, [open, activeTab]);

  useEffect(() => {
    let mounted = true;
    const fetchGuildInvites = async () => {
      setLoadingGuildInvites(true);
      setGuildInvitesError(null);
      try {
        const res = await guildsApi.getMyPendingInvitations();
        if (mounted && res.isSuccess) {
          setGuildInvites(res.data || []);
        }
      } catch (err: any) {
        if (mounted) setGuildInvitesError(err?.normalized?.message || "Failed to load guild invites");
      } finally {
        if (mounted) setLoadingGuildInvites(false);
      }
    };
    if (open && (activeTab === "invitations" || activeTab === "guildRequests")) fetchGuildInvites();
    return () => { mounted = false; };
  }, [open, activeTab]);

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      setLoadingJoinRequestsHistory(true);
      setJoinRequestsHistoryError(null);
      try {
        const res = await guildsApi.getMyJoinRequests(false);
        if (mounted && res.isSuccess) {
          setJoinRequestsHistory(res.data || []);
        }
      } catch (err: any) {
        if (mounted) setJoinRequestsHistoryError(err?.normalized?.message || "Failed to load history");
      } finally {
        if (mounted) setLoadingJoinRequestsHistory(false);
      }
    };
    if (open && (activeTab === "guildRequests" || activeTab === "invitations")) fetchHistory();
    return () => { mounted = false; };
  }, [open, activeTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1500px] max-h-[92vh] border-[#f5c16c]/20 bg-linear-to-br from-[#0f0708] to-[#1a0b08] p-0 overflow-hidden">
        <DialogTitle className="sr-only">User Profile</DialogTitle>
        <div className="pointer-events-none absolute inset-0 bg-[radial-linear(circle_at_top_left,rgba(210,49,135,0.08),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
        <div className="relative flex h-[88vh]">
          {/* Sidebar */}
          <div className="w-72 bg-linear-to-b from-[#1a0b08] to-[#0f0708] border-r border-[#f5c16c]/10 flex flex-col p-6">
            <div className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f5c16c]/30 bg-linear-to-br from-[#d23187]/20 to-[#f5c16c]/20">
                <Sparkles className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <span className="tracking-wide">Sanctum</span>
            </div>
            <div className="space-y-1.5 flex-1">
              <NavButton icon={User} label="Character Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
              <NavButton icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
              <NavButton icon={Bell} label="Notifications" active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
              <NavButton icon={Users} label="Social Panel" active={activeTab === "social"} onClick={() => setActiveTab("social")} />
              <div className="h-px bg-linear-to-r from-transparent via-[#f5c16c]/20 to-transparent my-5" />
              <NavButton icon={GraduationCap} label="Lecturer Verification" active={activeTab === "verification"} isSpecial onClick={() => setActiveTab("verification")} />
              <NavButton icon={Shield} label="Requests and Invites" active={activeTab === "guildRequests" || activeTab === "invitations"} onClick={() => setActiveTab("guildRequests")} />
            </div>
            <button 
              onClick={() => onOpenChange(false)} 
              className="flex items-center gap-2 text-[#f5c16c]/50 hover:text-[#f5c16c] text-sm transition-colors mt-4"
            >
              <LogOut className="size-4" /> Close
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-linear-to-br from-[#0f0708] to-[#1a0b08] p-8 overflow-y-auto relative">

            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Character Profile</h2>
                
                {/* Profile Card */}
                <div className="relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-linear-to-r from-[#2a140f]/95 via-[#1a0b08]/95 to-[#2a140f]/95 p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-linear(circle_at_top_left,rgba(210,49,135,0.15),transparent_50%)]" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#f5c16c]/50 shadow-[0_0_20px_rgba(210,49,135,0.3)]">
                        {profile?.profileImageUrl ? (
                          <Image src={profile.profileImageUrl} alt="Profile Image" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#d23187]/30 to-[#f5c16c]/20 text-[#f5c16c] text-2xl font-bold">
                            {(profile?.firstName?.[0] || profile?.username?.[0] || "").toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#f5c16c]/60 mb-1">Name</p>
                        <h3 className="text-xl font-bold text-white">{(profile?.firstName || "") + (profile?.lastName ? ` ${profile?.lastName}` : "") || profile?.username || ""}</h3>
                        <p className="mt-1 text-sm text-[#f5c16c]/70">{profile?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-[#f5c16c]/50 mb-5">
                      <span>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(profile?.roles || []).map(r => (
                        <span key={r} className="inline-flex items-center gap-1.5 rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-3 py-1 text-xs text-white">
                          {r}
                        </span>
                      ))}
                    </div>
                    
                    <div className="rounded-xl border border-[#f5c16c]/10 bg-[#0b0504]/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f5c16c]/60 mb-2">Bio</p>
                      <p className="text-sm text-white/80 leading-relaxed">{bio || profile?.bio || "No bio yet"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                
                <div className="relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-linear-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-6">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#d23187]/10 blur-3xl" />
                  <div className="relative z-10 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#f5c16c]/60 uppercase tracking-wider mb-2">First Name</label>
                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#0b0504]/60 border border-[#f5c16c]/20 text-white rounded-xl px-4 py-3 focus:border-[#f5c16c]/50 focus:ring-1 focus:ring-[#f5c16c]/30 outline-none transition placeholder:text-white/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#f5c16c]/60 uppercase tracking-wider mb-2">Last Name</label>
                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#0b0504]/60 border border-[#f5c16c]/20 text-white rounded-xl px-4 py-3 focus:border-[#f5c16c]/50 focus:ring-1 focus:ring-[#f5c16c]/30 outline-none transition placeholder:text-white/30" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#f5c16c]/60 uppercase tracking-wider mb-2">Bio</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[#0b0504]/60 border border-[#f5c16c]/20 text-white rounded-xl px-4 py-3 min-h-28 focus:border-[#f5c16c]/50 focus:ring-1 focus:ring-[#f5c16c]/30 outline-none transition resize-none placeholder:text-white/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#f5c16c]/60 uppercase tracking-wider mb-2">Profile Image</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) setProfileImageFile(f); }}
                        className={`border-2 border-dashed ${dragActive ? 'border-[#f5c16c]/50 bg-[#f5c16c]/5' : 'border-[#f5c16c]/20'} bg-[#0b0504]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#f5c16c]/30`}
                      >
                        <div className="p-3 rounded-full bg-linear-to-br from-[#d23187]/20 to-[#f5c16c]/20 border border-[#f5c16c]/30 mb-3">
                          <UploadCloud className="h-5 w-5 text-[#f5c16c]" />
                        </div>
                        <div className="text-sm text-white font-medium">{profileImageFile ? profileImageFile.name : 'Drop Profile Image Here'}</div>
                        <div className="text-xs text-[#f5c16c]/50 mt-1">PNG or JPG, Max 5MB</div>
                        <input type="file" accept="image/*" onChange={(e) => setProfileImageFile(e.target.files?.[0] ?? null)} className="mt-3 text-xs text-[#f5c16c]/70" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={async () => { setSaving(true); try { await updateMyProfile({ firstName, lastName, bio }, profileImageFile || undefined); const res = await profileApi.getMyProfile(); if (res.isSuccess) setProfile(res.data || null); } finally { setSaving(false); } }} 
                        disabled={saving} 
                        className="bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] hover:opacity-90 text-[#1a0b08] font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(210,49,135,0.3)] disabled:opacity-50"
                      >
                        {saving ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                <div className="relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-linear-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-8 text-center">
                  <div className="text-4xl opacity-30 mb-3">🔔</div>
                  <p className="text-sm text-[#f5c16c]/70">Notification settings coming soon</p>
                </div>
              </div>
            )}

            {activeTab === "verification" && <LecturerVerificationPanel />}

            {activeTab === "social" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Social Panel</h2>
                <div className="rounded-[20px] border border-[#f5c16c]/20 bg-linear-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-0 overflow-hidden">
                  <SocialScryingContent />
                </div>
              </div>
            )}

            {(activeTab === "guildRequests" || activeTab === "invitations") && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Requests and Invites</h2>
                <div className="rounded-[20px] border border-[#f5c16c]/20 bg-linear-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-[#f5c16c]" />
                    <span className="text-sm font-semibold text-white">Pending Guild Join Requests</span>
                  </div>
                  {loadingJoinRequests && (
                    <div className="flex items-center justify-center gap-2 py-8 text-[#f5c16c]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                  {joinRequestsError && (
                    <div className="flex items-center gap-2 text-rose-400 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                      {joinRequestsError}
                    </div>
                  )}
                  {!loadingJoinRequests && !joinRequestsError && joinRequests.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl opacity-30 mb-2">🛡️</div>
                      <p className="text-sm text-[#f5c16c]/50">No join requests</p>
                    </div>
                  )}
                  {!loadingJoinRequests && !joinRequestsError && joinRequests.length > 0 && (
                    <div className="space-y-3">
                      {joinRequests.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#f5c16c]/20 bg-[#0b0504]/60 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/20 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-[#f5c16c]" />
                            </div>
                            <div>
                                <div className="text-white font-semibold text-sm">Guild: {joinGuildNames[r.guildId] ?? r.guildId}</div>
                              <div className="text-xs text-[#f5c16c]/50">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 text-[#f5c16c]">
                            {r.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-linear-to-r from-transparent via-[#f5c16c]/20 to-transparent my-6" />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-[#f5c16c]" />
                      <span className="text-sm font-semibold text-white">Guild Invites</span>
                    </div>
                    {loadingGuildInvites && (
                      <div className="flex items-center justify-center gap-2 py-6 text-[#f5c16c]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    )}
                    {guildInvitesError && (
                      <div className="text-sm text-rose-400 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">{guildInvitesError}</div>
                    )}
                    {!loadingGuildInvites && !guildInvitesError && guildInvites.length === 0 && (
                      <div className="text-sm text-[#f5c16c]/50 text-center py-4">No guild invites</div>
                    )}
                  {!loadingGuildInvites && !guildInvitesError && guildInvites.length > 0 && (
                    <div className="space-y-3">
                      {guildInvites.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between rounded-xl border border-[#f5c16c]/20 bg-[#0b0504]/60 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/20 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-[#f5c16c]" />
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm">Guild: {inv.guildName || inv.guildId}</div>
                              <div className="text-xs text-[#f5c16c]/50">Invited: {new Date(inv.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await guildsApi.acceptInvitation(inv.guildId, inv.invitationId || inv.id);
                                } catch {}
                                try {
                                  const res = await guildsApi.getMyPendingInvitations();
                                  setGuildInvites(res.data || []);
                                } catch {}
                              }}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-4 py-2 text-xs rounded-lg font-semibold transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await guildsApi.declineInvitation(inv.guildId, inv.invitationId || inv.id);
                                } catch {}
                                try {
                                  const res = await guildsApi.getMyPendingInvitations();
                                  setGuildInvites(res.data || []);
                                } catch {}
                              }}
                              className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 px-4 py-2 text-xs rounded-lg font-semibold transition"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="h-px bg-linear-to-r from-transparent via-[#f5c16c]/20 to-transparent my-6" />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-[#d23187]" />
                    <span className="text-sm font-semibold text-white">Party Invites</span>
                  </div>
                  {loadingPartyInvites && (
                    <div className="flex items-center justify-center gap-2 py-6 text-[#f5c16c]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                  {partyInvitesError && (
                    <div className="text-sm text-rose-400 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">{partyInvitesError}</div>
                  )}
                  {!loadingPartyInvites && !partyInvitesError && partyInvites.length === 0 && (
                    <div className="text-sm text-[#f5c16c]/50 text-center py-4">No party invites</div>
                  )}
                  {!loadingPartyInvites && !partyInvitesError && partyInvites.length > 0 && (
                    <div className="space-y-3">
                      {partyInvites.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-[#d23187]/20 bg-[#0b0504]/60 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#d23187]/10 border border-[#d23187]/20 flex items-center justify-center">
                              <Users className="h-5 w-5 text-[#d23187]" />
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm">Party: {p.partyName || p.partyId}</div>
                              <div className="text-xs text-[#f5c16c]/50">Invited: {new Date(p.invitedAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                if (!profile?.authUserId) return;
                                try {
                                  await partiesApi.acceptInvitation(p.partyId, p.id, { partyId: p.partyId, invitationId: p.id, authUserId: profile.authUserId });
                                } catch {}
                                try {
                                  const res = await partiesApi.getMyPendingInvitations();
                                  setPartyInvites(res.data || []);
                                } catch {}
                              }}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-4 py-2 text-xs rounded-lg font-semibold transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={async () => {
                                if (!profile?.authUserId) return;
                                try {
                                  await partiesApi.declineInvitation(p.partyId, p.id, { partyId: p.partyId, invitationId: p.id, authUserId: profile.authUserId });
                                } catch {}
                                try {
                                  const res = await partiesApi.getMyPendingInvitations();
                                  setPartyInvites(res.data || []);
                                } catch {}
                              }}
                              className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 px-4 py-2 text-xs rounded-lg font-semibold transition"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="h-px bg-linear-to-r from-transparent via-[#f5c16c]/20 to-transparent my-6" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#f5c16c]" />
                      <span className="text-sm font-semibold text-white">Guild Requests History</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setHistoryFilter('all')} className={`px-3 py-1 text-xs rounded ${historyFilter==='all'?'bg-[#f5c16c]/20 text-[#f5c16c]':'border border-[#f5c16c]/20 text-white/70'}`}>All</button>
                      <button onClick={() => setHistoryFilter('accepted')} className={`px-3 py-1 text-xs rounded ${historyFilter==='accepted'?'bg-emerald-500/20 text-emerald-400':'border border-emerald-500/30 text-white/70'}`}>Accepted</button>
                      <button onClick={() => setHistoryFilter('declined')} className={`px-3 py-1 text-xs rounded ${historyFilter==='declined'?'bg-rose-500/20 text-rose-400':'border border-rose-500/30 text-white/70'}`}>Declined</button>
                    </div>
                  </div>
                  {loadingJoinRequestsHistory && (
                    <div className="flex items-center justify-center gap-2 py-6 text-[#f5c16c]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                  {joinRequestsHistoryError && (
                    <div className="text-sm text-rose-400 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">{joinRequestsHistoryError}</div>
                  )}
                  {!loadingJoinRequestsHistory && !joinRequestsHistoryError && (
                    <div className="space-y-3">
                      {joinRequestsHistory
                        .filter(r => historyFilter==='all' ? true : historyFilter==='accepted' ? r.status==='Accepted' : r.status==='Declined')
                        .map(r => (
                          <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#f5c16c]/20 bg-[#0b0504]/60 p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/20 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-[#f5c16c]" />
                              </div>
                              <div>
                                <div className="text-white font-semibold text-sm">Guild: {joinGuildNames[r.guildId] ?? r.guildId}</div>
                                <div className="text-xs text-[#f5c16c]/50">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${r.status==='Accepted' ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : r.status==='Declined' ? 'border-rose-500/30 bg-rose-500/20 text-rose-400' : 'border-[#f5c16c]/30 bg-[#f5c16c]/10 text-[#f5c16c]'}`}>
                              {r.status}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NavButton({ icon: Icon, label, active, isSpecial, onClick }: { icon: React.ElementType; label: string; active: boolean; isSpecial?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 ${
        active 
          ? "bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-[#1a0b08] shadow-[0_0_15px_rgba(210,49,135,0.3)] font-bold" 
          : "text-[#f5c16c]/60 hover:bg-[#f5c16c]/5 hover:text-[#f5c16c]"
      } ${isSpecial && !active ? "text-[#d23187]" : ""}`}
    >
      <Icon className={`size-4 ${active ? "text-[#1a0b08]" : isSpecial ? "text-[#d23187]" : "text-[#f5c16c]/60"}`} />
      <span className="flex-1">{label}</span>
      {isSpecial && !active && <Sparkles className="text-[#d23187] size-3" />}
    </button>
  );
}

function InviteItem({ invite, type }: { invite: GuildJoinRequestDto | PartyInvitationDto; type: 'guild' | 'party' }) {
  const title = type === 'guild' ? `Guild: ${(invite as GuildJoinRequestDto).guildId}` : `Party: ${(invite as PartyInvitationDto).partyId}`;
  const createdAt = type === 'guild' ? (invite as GuildJoinRequestDto).createdAt : (invite as PartyInvitationDto).invitedAt;
  const status = type === 'guild' ? (invite as GuildJoinRequestDto).status : (invite as PartyInvitationDto).status as any;
  const iconColor = type === 'guild' ? 'text-[#f5c16c]' : 'text-[#d23187]';
  const IconComponent = type === 'guild' ? Shield : Users;
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#f5c16c]/20 bg-[#0b0504]/60 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${type === 'guild' ? 'bg-[#f5c16c]/10 border-[#f5c16c]/20' : 'bg-[#d23187]/10 border-[#d23187]/20'} border flex items-center justify-center`}>
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{title}</div>
          <div className="text-xs text-[#f5c16c]/50">Requested: {new Date(createdAt).toLocaleString()}</div>
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 text-[#f5c16c]">
        {String(status)}
      </div>
    </div>
  );
}