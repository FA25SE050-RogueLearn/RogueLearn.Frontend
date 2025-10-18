"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { mockLeaderboards, LeaderboardEntry } from '@/lib/mockCodeBattleData';

interface LeaderboardProps {
  apiBaseUrl: string;
  eventId: string | null;
  roomId: string | null;
  eventSourceRef: React.MutableRefObject<EventSource | null>;
}

const USE_MOCK_DATA = true; // Set to false when backend is ready

export default function Leaderboard({ apiBaseUrl, eventId, roomId, eventSourceRef }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  // Load initial mock data when room is selected
  useEffect(() => {
    if (USE_MOCK_DATA && roomId) {
      // Load mock leaderboard for this room
      const mockData = mockLeaderboards[roomId] || [];
      setEntries(mockData);
    }
  }, [roomId]);

  useEffect(() => {
    if (!eventSourceRef.current || USE_MOCK_DATA) return;

    const eventSource = eventSourceRef.current;

    const handleLeaderboardUpdate = (e: MessageEvent) => {
      try {
        const eventPayload = JSON.parse(e.data);
        const newEntries = eventPayload.Data;

        if (Array.isArray(newEntries) && newEntries.length > 0) {
          newEntries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.place - b.place);
          setEntries(newEntries);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error('Error parsing leaderboard data:', error);
      }
    };

    eventSource.addEventListener('LEADERBOARD_UPDATED', handleLeaderboardUpdate);

    return () => {
      eventSource.removeEventListener('LEADERBOARD_UPDATED', handleLeaderboardUpdate);
    };
  }, [eventSourceRef]);

  return (
    <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-gradient-to-br from-[#24120d]/88 via-[#140a08]/94 to-[#070405]/97 p-6 shadow-[0_20px_60px_rgba(48,17,9,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.38),_transparent_70%)] opacity-[0.35]" />
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d23187]/20 text-[#f5c16c]">
            <Trophy className="h-5 w-5" />
          </span>
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {!roomId ? (
          <p className="text-sm text-foreground/60">Select a room to sync its leaderboard.</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-foreground/60">No combatants ranked yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.place}
                className="flex items-center justify-between rounded-2xl border border-[#f5c16c]/20 bg-[#d23187]/10 px-4 py-3 text-sm text-foreground/80"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5c16c]/20 text-[#f5c16c] font-semibold">
                    #{entry.place}
                  </span>
                  <span className="font-medium text-white">{entry.player_name}</span>
                </span>
                <span className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/90">{entry.score} pts</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
