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
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Sword className="w-5 h-5" />
          Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground">No events available</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.ID}
                onClick={() => onEventSelect(event.ID)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedEventId === event.ID
                    ? 'bg-accent text-primary font-semibold'
                    : 'bg-card hover:bg-accent/10 border border-border'
                }`}
              >
                {event.Title}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
