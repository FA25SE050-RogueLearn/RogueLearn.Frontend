"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LecturerVerificationPanel } from "@/components/profile/LecturerVerificationPanel";
import { LogOut, Sparkles, X, UploadCloud } from "lucide-react";
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
  defaultTab?: "profile" | "settings" | "verification" | "notifications" | "guildRequests" | "invitations";
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
  const [partyInvites, setPartyInvites] = useState<PartyInvitationDto[]>([]);
  const [loadingPartyInvites, setLoadingPartyInvites] = useState(false);
  const [partyInvitesError, setPartyInvitesError] = useState<string | null>(null);
  const [guildInvites, setGuildInvites] = useState<GuildInvitationDto[]>([]);
  const [loadingGuildInvites, setLoadingGuildInvites] = useState(false);
  const [guildInvitesError, setGuildInvitesError] = useState<string | null>(null);

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
    if (open && activeTab === "guildRequests") fetchJoinRequests();
    return () => { mounted = false; };
  }, [open, activeTab]);

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
    if (open && activeTab === "invitations") fetchPartyInvites();
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
    if (open && activeTab === "invitations") fetchGuildInvites();
    return () => { mounted = false; };
  }, [open, activeTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1500px] max-h-[92vh] border-[#d4a353]/20 bg-[#13111C] p-0 overflow-hidden">
        <div className="relative flex h-[88vh]">
          <div className="w-64 bg-[#161422] border-r border-[#2D2842] flex flex-col p-6">
            <div className="text-xl font-bold text-white mb-8">Sanctum Settings</div>
            <div className="space-y-2 flex-1">
              <NavButton label="Character Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
              <NavButton label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
              <NavButton label="Notifications" active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
              <div className="h-px bg-[#2D2842] my-4" />
              <NavButton label="Lecturer Verification" active={activeTab === "verification"} isSpecial onClick={() => setActiveTab("verification")} />
              <NavButton label="Guild Join Requests" active={activeTab === "guildRequests"} onClick={() => setActiveTab("guildRequests")} />
              <NavButton label="Invitations" active={activeTab === "invitations"} onClick={() => setActiveTab("invitations")} />
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 px-0">
              <LogOut className="size-4" /> Close
            </Button>
          </div>

          <div className="flex-1 bg-[#13111C] p-8 overflow-hidden relative">

            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="text-2xl font-bold text-white">Profile</div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-xl border border-[#2D2842] bg-[#1E1B2E] p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#2D2842]">
                        {profile?.profileImageUrl ? (
                          <Image src={profile.profileImageUrl} alt="Profile Image" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#13111C] text-white/70 text-xl font-bold">
                            {(profile?.firstName?.[0] || profile?.username?.[0] || "").toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/70">Name</div>
                        <div className="text-lg font-bold text-white mt-1">{(profile?.firstName || "") + (profile?.lastName ? ` ${profile?.lastName}` : "") || profile?.username || ""}</div>
                        <div className="mt-1 text-xs text-white/60">{profile?.email}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/60">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(profile?.roles || []).map(r => (
                        <span key={r} className="px-2 py-1 text-[10px] rounded-full border border-[#2D2842] text-white/80">{r}</span>
                      ))}
                    </div>
                    <div className="mt-6 rounded-lg border border-[#2D2842] bg-[#13111C] p-4">
                      <div className="text-sm font-semibold text-white/80">Bio</div>
                      <div className="text-sm text-white/70 mt-1">{bio || profile?.bio || ""}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="text-2xl font-bold text-white">Settings</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#1E1B2E] border border-[#2D2842] text-white rounded-lg px-3 py-2 focus:border-[#d4a353] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#1E1B2E] border border-[#2D2842] text-white rounded-lg px-3 py-2 focus:border-[#d4a353] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[#1E1B2E] border border-[#2D2842] text-white rounded-lg px-3 py-2 min-h-24 focus:border-[#d4a353] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Profile Image</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) setProfileImageFile(f); }}
                    className={`border-2 border-dashed ${dragActive ? 'border-[#d4a353]' : 'border-[#2D2842]'} bg-[#1E1B2E] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition`}
                  >
                    <div className="p-3 bg-[#13111C] rounded-full mb-3">
                      <UploadCloud className="text-[#d4a353]" />
                    </div>
                    <div className="text-sm text-white/80 font-medium">{profileImageFile ? profileImageFile.name : 'Drop Profile Image Here'}</div>
                    <div className="text-xs text-white/60 mt-1">PNG or JPG, Max 5MB</div>
                    <input type="file" accept="image/*" onChange={(e) => setProfileImageFile(e.target.files?.[0] ?? null)} className="mt-3 text-xs" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={async () => { setSaving(true); try { await updateMyProfile({ firstName, lastName, bio }, profileImageFile || undefined); const res = await profileApi.getMyProfile(); if (res.isSuccess) setProfile(res.data || null); } finally { setSaving(false); } }} disabled={saving} className="bg-[#d4a353] text-[#13111C] hover:bg-[#b88a3f]">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-white">Notifications</div>
                <div className="text-sm text-white/70">Manage notification settings.</div>
              </div>
            )}

            {activeTab === "verification" && <LecturerVerificationPanel />}

            {activeTab === "guildRequests" && (
              <div className="space-y-6">
                <div className="text-2xl font-bold text-white">Guild Join Requests</div>
                <div className="rounded-xl border border-[#2D2842] bg-[#1E1B2E] p-6">
                  {loadingJoinRequests && (
                    <div className="text-sm text-white/70">Loading...</div>
                  )}
                  {joinRequestsError && (
                    <div className="text-sm text-rose-400">{joinRequestsError}</div>
                  )}
                  {!loadingJoinRequests && !joinRequestsError && joinRequests.length === 0 && (
                    <div className="text-sm text-white/60">No join requests.</div>
                  )}
                  {!loadingJoinRequests && !joinRequestsError && joinRequests.length > 0 && (
                    <div className="space-y-3">
                      {joinRequests.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border border-[#2D2842] bg-[#13111C] p-4">
                          <div>
                            <div className="text-white font-semibold text-sm">Guild: {r.guildId}</div>
                            <div className="text-xs text-white/60">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border">
                            {r.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "invitations" && (
              <div className="space-y-6">
                <div className="text-2xl font-bold text-white">Invitations</div>
                <div className="rounded-xl border border-[#2D2842] bg-[#1E1B2E] p-6 space-y-6">
                  <div>
                    <div className="mb-4 text-sm font-semibold text-white">Guild Invites</div>
                    {loadingGuildInvites && (
                      <div className="text-sm text-white/70">Loading...</div>
                    )}
                    {guildInvitesError && (
                      <div className="text-sm text-rose-400">{guildInvitesError}</div>
                    )}
                    {!loadingGuildInvites && !guildInvitesError && guildInvites.length === 0 && (
                      <div className="text-sm text-white/60">No guild invites.</div>
                    )}
                    {!loadingGuildInvites && !guildInvitesError && guildInvites.length > 0 && (
                      <div className="space-y-3">
                        {guildInvites.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between rounded-lg border border-[#2D2842] bg-[#13111C] p-4">
                            <div>
                              <div className="text-white font-semibold text-sm">Guild: {inv.guildId}</div>
                              <div className="text-xs text-white/60">Invited: {new Date(inv.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={async () => {
                                  try {
                                    await guildsApi.acceptInvitation(inv.guildId, inv.invitationId || inv.id);
                                  } catch {}
                                  try {
                                    const res = await guildsApi.getMyPendingInvitations();
                                    setGuildInvites(res.data || []);
                                  } catch {}
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    await guildsApi.declineInvitation(inv.guildId, inv.invitationId || inv.id);
                                  } catch {}
                                  try {
                                    const res = await guildsApi.getMyPendingInvitations();
                                    setGuildInvites(res.data || []);
                                  } catch {}
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-4 text-sm font-semibold text-white">Party Invites</div>
                    {loadingPartyInvites && (
                      <div className="text-sm text-white/70">Loading...</div>
                    )}
                    {partyInvitesError && (
                      <div className="text-sm text-rose-400">{partyInvitesError}</div>
                    )}
                    {!loadingPartyInvites && !partyInvitesError && partyInvites.length === 0 && (
                      <div className="text-sm text-white/60">No party invites.</div>
                    )}
                    {!loadingPartyInvites && !partyInvitesError && partyInvites.length > 0 && (
                      <div className="space-y-3">
                        {partyInvites.map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-lg border border-[#2D2842] bg-[#13111C] p-4">
                            <div>
                              <div className="text-white font-semibold text-sm">Party: {p.partyId}</div>
                              <div className="text-xs text-white/60">Invited: {new Date(p.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
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
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs"
                              >
                                Accept
                              </Button>
                              <Button
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
                                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs"
                              >
                                Decline
                              </Button>
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

function NavButton({ label, active, isSpecial, onClick }: { label: string; active: boolean; isSpecial?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium flex items-center justify-between ${
        active ? "bg-[#d4a353] text-[#13111C] shadow-lg shadow-[#d4a353]/10 font-bold" : "text-gray-400 hover:bg-[#1E1B2E] hover:text-gray-200"
      } ${isSpecial && !active ? "text-[#d4a353]" : ""}`}
    >
      {label}
      {isSpecial && <Sparkles className={active ? "text-[#13111C] size-4" : "text-[#d4a353] size-4"} />}
    </button>
  );
}

function InviteItem({ invite, type }: { invite: GuildJoinRequestDto | PartyInvitationDto; type: 'guild' | 'party' }) {
  const title = type === 'guild' ? `Guild: ${(invite as GuildJoinRequestDto).guildId}` : `Party: ${(invite as PartyInvitationDto).partyId}`;
  const createdAt = type === 'guild' ? (invite as GuildJoinRequestDto).createdAt : (invite as PartyInvitationDto).createdAt;
  const status = type === 'guild' ? (invite as GuildJoinRequestDto).status : (invite as PartyInvitationDto).status as any;
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#2D2842] bg-[#13111C] p-4">
      <div>
        <div className="text-white font-semibold text-sm">{title}</div>
        <div className="text-xs text-white/60">Requested: {new Date(createdAt).toLocaleString()}</div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border">
        {String(status)}
      </div>
    </div>
  );
}