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

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "profile" | "settings" | "verification" | "notifications";
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
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 px-0">
              <LogOut className="size-4" /> Close
            </Button>
          </div>

          <div className="flex-1 bg-[#13111C] p-8 overflow-hidden relative">

            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="text-2xl font-bold text-white">Profile</div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
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
                    </div>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-4 text-center">
                      <div className="text-xl font-bold text-[#d4a353]">{profile?.level ?? 0}</div>
                      <div className="text-xs text-white/60">Level</div>
                    </div>
                    <div className="rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-4 text-center">
                      <div className="text-xl font-bold text-[#d4a353]">{(profile?.experiencePoints ?? 0).toLocaleString()}</div>
                      <div className="text-xs text-white/60">XP</div>
                    </div>
                    <div className="col-span-2 rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-4">
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