"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, UserPlus } from "lucide-react";

interface InviteMembersCardProps {
  onInvite: (email: string) => Promise<void> | void;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function InviteMembersCard({ onInvite }: InviteMembersCardProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    try {
      setSubmitting(true);
      await onInvite(email);
      setInviteEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f5c16c]/10 p-2">
            <Mail className="h-5 w-5 text-[#f5c16c]" />
          </div>
          <CardTitle className="text-xl text-[#f5c16c]">Invite Members</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative flex items-center gap-3 pt-6">
        <Input
          placeholder="Enter email address..."
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          disabled={submitting}
          className="flex-1 border-[#f5c16c]/20 bg-black/40 text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:ring-[#f5c16c]/30"
        />
        <Button 
          onClick={submit} 
          disabled={submitting || !inviteEmail.trim()}
          className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-medium hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {submitting ? "Sending..." : "Invite"}
        </Button>
      </CardContent>
    </Card>
  );
}