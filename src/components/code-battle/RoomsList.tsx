"use client";

import { useState, useEffect, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import eventServiceApi from '@/api/eventServiceApi';
import type { Room } from '@/types/event-service';

interface RoomsListProps {
  apiBaseUrl: string;
  eventId: string | null;
  onRoomSelect: (roomId: string) => void;
  selectedRoomId: string | null;
}

const buildRoomTag = (room: Room) => {
  const createdDate = new Date(room.CreatedDate);
  if (Number.isNaN(createdDate.getTime())) {
    return 'ACTIVE';
  }

  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(createdDate);

  return `OPENED ${formatted.toUpperCase()}`;
};

export default function RoomsList({ apiBaseUrl, eventId, onRoomSelect, selectedRoomId }: RoomsListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      startTransition(() => {
        setRooms([]);
      });
      return;
    }

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await eventServiceApi.getEventRooms(eventId);

        console.log('Rooms API Response:', response);

        if (response.success && response.data) {
          // Ensure data is an array
          if (Array.isArray(response.data)) {
            setRooms(response.data);
          } else {
            console.error('Rooms data is not an array:', response.data);
            startTransition(() => {
              setRooms([]);
            });
          }
        } else {
          console.error('Failed to fetch rooms:', response.error);
          startTransition(() => {
            setRooms([]);
          });
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        startTransition(() => {
          setRooms([]);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [apiBaseUrl, eventId]);

  return (
    <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-linear-to-br from-[#24110d]/88 via-[#130906]/94 to-[#070403]/98 p-6 shadow-[0_20px_60px_rgba(45,16,8,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,193,108,0.35),transparent_70%)] opacity-[0.35]" />
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d23187]/20 text-[#f5c16c]">
            <Users className="h-5 w-5" />
          </span>
          Battle Rooms
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {!eventId ? (
          <p className="text-sm text-foreground/60">Select an event to open its rooms.</p>
        ) : loading ? (
          <p className="text-sm text-foreground/60">Calibrating room nodes...</p>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-foreground/60">No rooms are active for this event.</p>
        ) : (
          <ul className="space-y-3">
            {rooms.map((room) => (
              <li
                key={room.ID}
                onClick={() => onRoomSelect(room.ID)}
                className={`rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                  selectedRoomId === room.ID
                    ? 'border-[#d23187]/55 bg-[#d23187]/20 text-white shadow-[0_12px_30px_rgba(210,49,135,0.35)]'
                    : 'border-[#f5c16c]/15 bg-white/5 text-foreground/70 hover:border-[#d23187]/40 hover:bg-[#d23187]/15 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{room.Name}</span>
                  <span className="text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/80">
                    {buildRoomTag(room)}
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
