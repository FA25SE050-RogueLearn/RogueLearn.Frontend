"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { CreatePartyCommandRequest, InviteMemberRequest } from "@/types/parties";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

interface PartyCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (partyId: string) => void;
}

/**
 * PartyCreationWizard: A guided multi-step flow to create a new party.
 * NOTE: Current API supports fields: name, isPublic, maxMembers, creatorAuthUserId.
 */
export default function PartyCreationWizard({ open, onClose, onCreated }: PartyCreationWizardProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [maxMembers, setMaxMembers] = useState(6);
  const [invitees, setInvitees] = useState<string[]>([]); // list of invitee emails
  const [newInvitee, setNewInvitee] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setCreating(false);
      setName("");
      setIsPublic(true);
      setMaxMembers(6);
      setInvitees([]);
      setNewInvitee("");
    }
  }, [open]);

  const addInvitee = useCallback(() => {
    const trimmed = newInvitee.trim();
    if (!trimmed) return;
    const looksLikeEmail = /@/.test(trimmed);
    if (!looksLikeEmail) return;
    setInvitees(prev => Array.from(new Set([...prev, trimmed.toLowerCase()])));
    setNewInvitee("");
  }, [newInvitee]);

  const removeInvitee = useCallback((id: string) => {
    setInvitees(prev => prev.filter(x => x !== id));
  }, []);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.id) {
        throw new Error("Not authenticated");
      }
      const payload: CreatePartyCommandRequest = {
        creatorAuthUserId: userData.user.id,
        name,
        isPublic,
        maxMembers,
      };
      const res = await partiesApi.create(payload);
      const partyId = res.data.partyId;

      // Send invites (optional) — using email targets instead of auth user IDs
      for (const inviteeEmail of invitees) {
        const invitePayload: InviteMemberRequest = {
          targets: [{ email: inviteeEmail }],
          message: `Join my party: ${name}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        try {
          await partiesApi.inviteMember(partyId, invitePayload);
        } catch (e) {
          // Non-blocking: ignore individual invite failures
          console.warn("Failed to invite", inviteeEmail, e);
        }
      }

      onCreated?.(partyId);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create party");
    } finally {
      setCreating(false);
    }
  }, [supabase, name, isPublic, maxMembers, invitees, onCreated, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[90vw] max-w-2xl rounded-lg border border-white/10 bg-[#121212] p-6 text-white shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create New Party</h3>
          <button className="rounded bg-white/10 px-3 py-1 text-xs" onClick={onClose}>Close</button>
        </div>
        <div className="mb-4 flex items-center gap-2 text-xs text-white/70">
          <span className={step === 1 ? "font-semibold text-fuchsia-300" : ""}>Step 1: Identity</span>
          <span>→</span>
          <span className={step === 2 ? "font-semibold text-fuchsia-300" : ""}>Step 2: Configuration</span>
          <span>→</span>
          <span className={step === 3 ? "font-semibold text-fuchsia-300" : ""}>Step 3: Invite Members</span>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm">Party Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Algorithms Avengers"
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-fuchsia-500/60 focus:outline-none"
            />
            <div className="mt-4 flex justify-end">
              <button
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Visibility</label>
              <div className="flex items-center gap-2">
                <button
                  className={"rounded px-3 py-1 text-xs " + (isPublic ? "bg-fuchsia-600" : "bg-white/10")}
                  onClick={() => setIsPublic(true)}
                >Public</button>
                <button
                  className={"rounded px-3 py-1 text-xs " + (!isPublic ? "bg-fuchsia-600" : "bg-white/10")}
                  onClick={() => setIsPublic(false)}
                >Private</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Max Members</label>
              <input
                type="number"
                min={2}
                max={50}
                value={maxMembers}
                onChange={e => setMaxMembers(Number(e.target.value) || 2)}
                className="w-24 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-fuchsia-500/60 focus:outline-none"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <button className="rounded bg-white/10 px-4 py-2 text-sm" onClick={() => setStep(1)}>Back</button>
              <button className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-medium" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-sm">Invite initial members (emails)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInvitee}
                onChange={e => setNewInvitee(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-fuchsia-500/60 focus:outline-none"
              />
              <button className="rounded bg-white/10 px-3 py-2 text-sm" onClick={addInvitee}>Add</button>
            </div>
            {invitees.length > 0 && (
              <div className="rounded border border-white/10 bg-white/5 p-2 text-xs">
                <div className="mb-2 font-medium">Invitees:</div>
                <div className="flex flex-wrap gap-2">
                  {invitees.map(email => (
                    <span key={email} className="inline-flex items-center gap-2 rounded bg-white/10 px-2 py-1">
                      {email}
                      <button className="text-red-300" onClick={() => removeInvitee(email)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="text-xs text-red-400">{error}</div>}

            <div className="mt-4 flex justify-between">
              <button className="rounded bg-white/10 px-4 py-2 text-sm" onClick={() => setStep(2)}>Back</button>
              <button
                disabled={creating || !name.trim()}
                className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
                onClick={handleCreate}
              >
                {creating ? "Creating..." : "Create Party"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}