"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import partiesApi from "@/api/partiesApi";
import { CreatePartyCommandRequest, InviteMemberRequest } from "@/types/parties";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";
import { Users, X } from "lucide-react";

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
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || "Failed to create party");
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-[90vw] max-w-2xl overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-b from-[#1a0a08] to-[#0a0506] p-8 text-white shadow-2xl">
        {/* Texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            backgroundSize: "100px",
            backgroundBlendMode: "overlay",
          }}
        />
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-2.5">
                <Users className="h-6 w-6 text-[#f5c16c]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f5c16c]">Create New Party</h3>
            </div>
            <button 
              className="rounded-lg border border-[#f5c16c]/20 bg-black/40 p-2 text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-6 flex items-center gap-2 text-sm text-white/60">
            <span className={step === 1 ? "font-semibold text-[#f5c16c]" : ""}>Step 1: Identity</span>
            <span>→</span>
            <span className={step === 2 ? "font-semibold text-[#f5c16c]" : ""}>Step 2: Configuration</span>
            <span>→</span>
            <span className={step === 3 ? "font-semibold text-[#f5c16c]" : ""}>Step 3: Invite Members</span>
          </div>

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#f5c16c]">Party Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Algorithms Avengers"
              className="w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
            />
            <div className="mt-6 flex justify-end">
              <button
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-6 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-black/40 p-4">
              <label className="text-sm font-medium text-[#f5c16c]">Visibility</label>
              <div className="flex items-center gap-2">
                <button
                  className={"rounded-lg px-4 py-1.5 text-xs font-medium transition-all " + (isPublic ? "bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black" : "border border-[#f5c16c]/20 bg-black/40 text-white/70")}
                  onClick={() => setIsPublic(true)}
                >Public</button>
                <button
                  className={"rounded-lg px-4 py-1.5 text-xs font-medium transition-all " + (!isPublic ? "bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black" : "border border-[#f5c16c]/20 bg-black/40 text-white/70")}
                  onClick={() => setIsPublic(false)}
                >Private</button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-black/40 p-4">
              <label className="text-sm font-medium text-[#f5c16c]">Max Members</label>
              <input
                type="number"
                min={1}
                max={8}
                value={maxMembers}
                onChange={e => setMaxMembers(Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-[#f5c16c]/20 bg-black/40 px-3 py-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
              />
            </div>
            <div className="mt-6 flex justify-between">
              <button 
                className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white" 
                onClick={() => setStep(1)}
              >Back</button>
              <button 
                className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-6 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c]" 
                onClick={() => setStep(3)}
              >Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <label className="block text-sm font-medium text-[#f5c16c]">Invite initial members (emails)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInvitee}
                onChange={e => setNewInvitee(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
              />
              <button 
                className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white" 
                onClick={addInvitee}
              >Add</button>
            </div>
            {invitees.length > 0 && (
              <div className="rounded-lg border border-[#f5c16c]/20 bg-black/40 p-4 text-xs">
                <div className="mb-3 text-sm font-medium text-[#f5c16c]">Invitees:</div>
                <div className="flex flex-wrap gap-2">
                  {invitees.map(email => (
                    <span key={email} className="inline-flex items-center gap-2 rounded-lg border border-[#f5c16c]/20 bg-gradient-to-r from-[#2d1810]/60 to-black/80 px-3 py-1.5 text-white">
                      {email}
                      <button className="text-rose-400 transition-colors hover:text-rose-300" onClick={() => removeInvitee(email)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

            <div className="mt-6 flex justify-between">
              <button 
                className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white" 
                onClick={() => setStep(2)}
              >Back</button>
              <button
                disabled={creating || !name.trim()}
                className="rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-6 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleCreate}
              >
                {creating ? "Creating..." : "Create Party"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}