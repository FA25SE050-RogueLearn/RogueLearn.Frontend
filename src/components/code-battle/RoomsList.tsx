"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { mockRooms, Room } from '@/lib/mockCodeBattleData';

interface RoomsListProps {
  apiBaseUrl: string;
  eventId: string | null;
  onRoomSelect: (roomId: string) => void;
  selectedRoomId: string | null;
}

const USE_MOCK_DATA = true; // Set to false when backend is ready

export default function RoomsList({ apiBaseUrl, eventId, onRoomSelect, selectedRoomId }: RoomsListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          // Use mock data - filter rooms by event
          setTimeout(() => {
            const eventRooms = mockRooms.filter(room => room.EventID === eventId);
            setRooms(eventRooms);
            setLoading(false);
          }, 200); // Simulate network delay
        } else {
          // Use real API
          const response = await fetch(`${apiBaseUrl}/events/${eventId}/rooms`);
          const data = await response.json();
          if (data.data) {
            setRooms(data.data);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, [apiBaseUrl, eventId]);

  return (
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Users className="w-5 h-5" />
          Rooms
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!eventId ? (
          <p className="text-muted-foreground">Select an event to see rooms</p>
        ) : loading ? (
          <p className="text-muted-foreground">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-muted-foreground">No rooms available</p>
        ) : (
          <ul className="space-y-2">
            {rooms.map((room) => (
              <li
                key={room.ID}
                onClick={() => onRoomSelect(room.ID)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedRoomId === room.ID
                    ? 'bg-accent text-primary font-semibold'
                    : 'bg-card hover:bg-accent/10 border border-border'
                }`}
              >
                {room.Name}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
