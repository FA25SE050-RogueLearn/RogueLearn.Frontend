"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sword } from 'lucide-react';
import { mockEvents, Event } from '@/lib/mockCodeBattleData';

interface EventsListProps {
  apiBaseUrl: string;
  onEventSelect: (eventId: string) => void;
  selectedEventId: string | null;
}

const USE_MOCK_DATA = true; // Set to false when backend is ready

const resolveEventStatus = (event: Event) => {
  const now = new Date();
  const start = new Date(event.StartedDate);
  const end = new Date(event.EndDate);

  if (now < start) {
    return 'Scheduled';
  }

  if (now > end) {
    return 'Concluded';
  }

  return 'Live';
};

export default function EventsList({ apiBaseUrl, onEventSelect, selectedEventId }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Use mock data
          setTimeout(() => {
            setEvents(mockEvents);
            setLoading(false);
          }, 300); // Simulate network delay
        } else {
          // Use real API
          const response = await fetch(`${apiBaseUrl}/events`);
          const data = await response.json();
          if (data.data) {
            setEvents(data.data);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiBaseUrl]);

  return (
    <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-gradient-to-br from-[#26120e]/88 via-[#140908]/94 to-[#080404]/97 p-6 shadow-[0_20px_60px_rgba(54,18,9,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(210,49,135,0.4),_transparent_70%)] opacity-[0.35]" />
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d23187]/20 text-[#f5c16c]">
            <Sword className="h-5 w-5" />
          </span>
          Arena Events
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <p className="text-sm text-foreground/60">Uploading event ledger...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-foreground/60">No active tournaments detected.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.ID}
                onClick={() => onEventSelect(event.ID)}
                className={`group rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                  selectedEventId === event.ID
                    ? 'border-[#d23187]/55 bg-[#d23187]/20 text-white shadow-[0_12px_30px_rgba(210,49,135,0.35)]'
                    : 'border-[#f5c16c]/15 bg-white/5 text-foreground/70 hover:border-[#d23187]/40 hover:bg-[#d23187]/15 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{event.Title}</span>
                  <span className="text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/80">
                    {resolveEventStatus(event)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
