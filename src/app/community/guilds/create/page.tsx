"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Lock, Globe } from "lucide-react";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import { getMyContext } from "@/api/usersApi";
import type { CreateGuildResponse } from "@/types/guilds";
import { toast } from "sonner";

const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};
const BACKDROP_GRADIENT: CSSProperties = {
  background: 'radial-gradient(circle at top, rgba(210,49,135,0.25), transparent 60%), linear-gradient(180deg, #100414 0%, #06020b 60%, #010103 100%)',
};
const BACKDROP_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
  opacity: 0.08,
  mixBlendMode: 'screen',
};

export default function CreateGuildPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "invite_only">("public");
  const [maxMembers, setMaxMembers] = useState<number>(50);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isLecturer, setIsLecturer] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await profileApi.getMyProfile();
        setMyAuthUserId(res.data?.authUserId ?? null);
        const roles = res.data?.roles ?? [];
        const ctx = await getMyContext().catch(() => ({ data: { roles: [] } } as any));
        const allRoles: string[] = Array.isArray(roles) ? roles : [];
        const ctxRoles: string[] = Array.isArray(ctx?.data?.roles) ? ctx.data.roles : [];
        const lecturer = [...allRoles, ...ctxRoles].some((r) => /lecturer/i.test(r));
        setIsLecturer(lecturer);
        if (lecturer) setMaxMembers((m) => Math.max(m, 100));
      } catch {}
    })();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !myAuthUserId) return;
    setSubmitting(true);
    try {
      const allowedMax = isLecturer ? 100 : 50;
      const minAllowed = 2;
      const finalMax = Math.max(minAllowed, Math.min(maxMembers, allowedMax));
      const res = await guildsApi.create({
        creatorAuthUserId: myAuthUserId,
        name,
        description,
        privacy,
        maxMembers: finalMax,
      });
      const data = res.data as CreateGuildResponse;
      router.push(`/community/guilds/${data.guildId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.normalized?.message || err?.message || "Failed to create guild.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} />
      
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-8 pb-24 pt-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d23187]/50 bg-[#d23187]/10 px-5 py-1.5 text-xs uppercase tracking-[0.45em] text-[#f9d9eb]">
              <Shield className="h-4 w-4" />
              Guild Forge
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Establish Your Guild</h1>
            <p className="mt-3 text-base text-foreground/75">
              Create a fellowship to unite heroes under a common banner
            </p>
          </div>

          {/* Form */}
          <Card className={SECTION_CARD_CLASS}>
            <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
            <CardHeader className="relative z-10 border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                <Shield className="h-5 w-5 text-[#f5c16c]" />
                Guild Details
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6 pt-6">
              
              {/* Guild Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  Guild Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="The Iron Fellowship"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#f5c16c]/25 bg-[#140707]/80 text-white placeholder:text-foreground/40"
                />
                <p className="text-xs text-foreground/50">Choose a memorable name that reflects your guild&apos;s identity</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  Description <span className="text-rose-400">*</span>
                </label>
                <Textarea
                  placeholder="A fellowship of dedicated developers committed to mastering algorithms and conquering challenges together..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-[#f5c16c]/25 bg-[#140707]/80 text-white placeholder:text-foreground/40"
                />
                <p className="text-xs text-foreground/50">Describe your guild&apos;s purpose and what makes it unique</p>
              </div>

              {/* Privacy & Max Members */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wide text-white/80">
                    Privacy Setting
                  </label>
                  <Select value={privacy} onValueChange={(v) => setPrivacy(v as "public" | "invite_only")}>
                    <SelectTrigger className="border-[#f5c16c]/25 bg-[#140707]/80 text-white">
                      <SelectValue placeholder="Select privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-400" />
                          <span>Public - Open to all</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="invite_only">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-amber-400" />
                          <span>Invite Only - Restricted</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wide text-white/80">
                    Max Members
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5c16c]/60" />
                    <Input
                      type="number"
                      min={2}
                      max={isLecturer ? 100 : 50}
                      value={maxMembers}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const cap = isLecturer ? 100 : 50;
                        const clamped = Math.max(2, Math.min(v || 2, cap));
                        setMaxMembers(clamped);
                      }}
                      className="pl-10 border-[#f5c16c]/25 bg-[#140707]/80 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1 rounded-full border-[#f5c16c]/30 bg-[#140707]/80 text-[#f5c16c]"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !name.trim() || !description.trim() || !myAuthUserId}
                  className="flex-1 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] px-6 text-xs uppercase tracking-[0.4em] text-[#2b130f] shadow-[0_12px_30px_rgba(210,49,135,0.35)] disabled:opacity-50"
                >
                  {submitting ? "Forging..." : "Forge Guild"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-[#120806]/60">
            <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
            <CardContent className="relative z-10 space-y-4 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <svg className="h-4 w-4 text-[#f5c16c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Guild Leadership Tips
              </h3>
              <ul className="space-y-2 text-xs text-foreground/70">
                {[
                  'Choose a clear, memorable name that reflects your mission',
                  'Write a compelling description to attract like-minded members',
                  'Set appropriate privacy settings based on your community goals',
                  'Start with a reasonable member limit - you can adjust later',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f5c16c] shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}