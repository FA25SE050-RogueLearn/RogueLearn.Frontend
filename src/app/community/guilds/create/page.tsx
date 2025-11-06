"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import guildsApi from "@/api/guildsApi";
import profileApi from "@/api/profileApi";
import type { CreateGuildResponse } from "@/types/guilds";

export default function CreateGuildPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "invite_only">("public");
  const [maxMembers, setMaxMembers] = useState<number>(50);
  const [myAuthUserId, setMyAuthUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    profileApi.getMyProfile().then((res) => setMyAuthUserId(res.data?.authUserId ?? null)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !myAuthUserId) return;
    setSubmitting(true);
    try {
      const res = await guildsApi.create({
        creatorAuthUserId: myAuthUserId,
        name,
        description,
        privacy,
        maxMembers,
      });
      const data = res.data as CreateGuildResponse;
      router.push(`/community/guilds/${data.guildId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create guild.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative max-h-screen w-full overflow-hidden bg-[#08040a] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0510]/95 via-[#1b0b19]/90 to-[#070b1c]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.35),_transparent_60%)]" />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.15]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')" }} />
      </div>
      <DashboardFrame>
      <div className="flex flex-col gap-6 pb-16">
        <Card className="rounded-2xl border-white/12 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Create Guild</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Guild name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select value={privacy} onValueChange={(v) => setPrivacy(v as "public" | "invite_only")}> 
                <SelectTrigger>
                  <SelectValue placeholder="Privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={9999}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleSubmit} disabled={submitting || !name.trim() || !description.trim() || !myAuthUserId}>
              {submitting ? "Creating..." : "Create Guild"}
            </Button>
          </CardContent>
        </Card>
      </div>
      </DashboardFrame>
    </div>
  );
}