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
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!roomId ? (
          <p className="text-muted-foreground">Select a room to see the leaderboard</p>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground">No players on the leaderboard yet</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.place}
                className="p-3 rounded-lg bg-card border border-border flex justify-between items-center"
              >
                <span className="flex items-center gap-2">
                  <span className="font-bold text-accent">#{entry.place}</span>
                  <span>{entry.player_name}</span>
                </span>
                <span className="font-semibold text-accent">{entry.score} pts</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
