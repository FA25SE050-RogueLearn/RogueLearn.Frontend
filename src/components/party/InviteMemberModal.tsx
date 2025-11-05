import React, { useState } from 'react';
import partiesApi from '@/api/partiesApi';

interface InviteMemberModalProps {
  partyId: string;
  onClose: () => void;
}

export default function InviteMemberModal({ partyId, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    const looksLikeEmail = /@/.test(trimmed);
    if (!looksLikeEmail) return;
    setIsInviting(true);
    setError(null);
    try {
      await partiesApi.inviteMember(partyId, {
        targets: [{ email: trimmed.toLowerCase() }],
        message: 'You have been invited to join this party.',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#08040a] p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-white">Invite Member</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user's email"
          className="w-full rounded border border-white/20 bg-white/10 p-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded bg-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={isInviting}
            className="rounded bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isInviting ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}