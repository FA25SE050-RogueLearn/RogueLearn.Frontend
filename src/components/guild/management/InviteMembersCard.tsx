"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteMembersCardProps {
  onInvite: (email: string) => Promise<void> | void;
}

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
    <Card className="rounded-2xl border-white/12 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Invite Members</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Input
          placeholder="user@email.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          disabled={submitting}
        />
        <Button onClick={submit} disabled={submitting}>Invite</Button>
      </CardContent>
    </Card>
  );
}