"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Calendar,
  Users,
  Loader2,
  XCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import eventServiceApi from "@/api/eventServiceApi";
import type { Event } from "@/types/event-service";

interface RegisteredEventsCardProps {
  guildId: string;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function RegisteredEventsCard({ guildId }: RegisteredEventsCardProps) {
  const router = useRouter();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegisteredEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all events
      const eventsResponse = await eventServiceApi.getAllEvents(1, 100, 'code_battle');
      if (!eventsResponse.success || !eventsResponse.data) {
        setError("Failed to load events");
        return;
      }

      const allEvents = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];

      // Filter events where this guild is registered
      const registered: Event[] = [];
      for (const event of allEvents) {
        try {
          const membersResponse = await eventServiceApi.getRegisteredGuildMembers(event.ID, guildId);
          if (membersResponse.success && membersResponse.data && membersResponse.data.length > 0) {
            registered.push(event);
          }
        } catch (err) {
          // Guild not registered for this event, continue
          console.log(`Guild not registered for event ${event.ID}`);
        }
      }

      setRegisteredEvents(registered);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching registered events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredEvents();
  }, [guildId]);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const assignmentDate = event.AssignmentDate ? new Date(event.AssignmentDate) : null;
    const startDate = new Date(event.StartedDate);

    if (event.Status === 'pending') {
      if (assignmentDate && now < assignmentDate) {
        return { label: 'Registration Open', color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-700/30' };
      } else {
        return { label: 'Registration Closed', color: 'text-gray-400', bg: 'bg-gray-950/50 border-gray-700/30' };
      }
    } else if (event.Status === 'active') {
      return { label: 'Live Now', color: 'text-red-400', bg: 'bg-red-950/50 border-red-700/30' };
    } else if (event.Status === 'completed') {
      return { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-950/50 border-gray-700/30' };
    }
    return { label: event.Status, color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-700/30' };
  };

  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />

      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <CardTitle className="flex items-center gap-2 text-[#f5c16c]">
          <CheckCircle className="h-5 w-5 text-[#f5c16c]" />
          Registered Events
        </CardTitle>
        <CardDescription className="text-white/60">
          Events your guild has registered for
        </CardDescription>
      </CardHeader>
      <CardContent className="relative pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#f5c16c]" />
            <span className="ml-3 text-white/60">Loading registered events...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <XCircle className="h-8 w-8 text-rose-400" />
            <p className="text-white/60">{error}</p>
            <Button
              onClick={fetchRegisteredEvents}
              variant="outline"
              size="sm"
              className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
            >
              Retry
            </Button>
          </div>
        ) : registeredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Trophy className="h-12 w-12 text-[#f5c16c]/40" />
            <p className="text-white/60">No registered events yet</p>
            <p className="text-sm text-white/50">
              Register for approved events to participate
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registeredEvents.map((event) => {
              const status = getEventStatus(event);

              return (
                <div
                  key={event.ID}
                  className="rounded-lg border border-[#f5c16c]/20 bg-gradient-to-br from-black/40 to-[#1a0a08]/40 p-4 transition-all hover:border-[#f5c16c]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`rounded-md border p-1.5 ${status.bg}`}>
                          <Trophy className={`h-4 w-4 ${status.color}`} />
                        </div>
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white">{event.Title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-white/60">{event.Description}</p>

                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">Start Date</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">
                            {new Date(event.StartedDate).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">End Date</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">
                            {new Date(event.EndDate).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Max Guilds</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">{event.MaxGuilds}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        {event.Status === 'active' && (
                          <Button
                            onClick={() => router.push('/events')}
                            size="sm"
                            className="bg-gradient-to-r from-[#d23187] to-[#f5c16c] text-white hover:opacity-90"
                          >
                            Enter Arena
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        )}
                        {event.Status === 'completed' && (
                          <Button
                            onClick={() => router.push(`/code-battle/${event.ID}/results`)}
                            size="sm"
                            variant="outline"
                            className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                          >
                            View Results
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        )}
                        {event.Status === 'pending' && (
                          <Button
                            onClick={() => router.push(`/code-battle/${event.ID}`)}
                            size="sm"
                            variant="outline"
                            className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
                          >
                            View Details
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
