"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Trophy, ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { safeDate } from "@/utils/time";
import { useRouter } from "next/navigation";
import type { Event } from "@/types/event-service";
import eventServiceApi from "@/api/eventServiceApi";

export function FeaturedEventsSection() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventServiceApi.getAllEvents(1, 10, 'code_battle', 'active');
        if (response.success && response.data) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const featuredEvent = events[0] || null;

  const getStatusBadgeColor = (status: Event["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-[#f5c16c]/20 text-[#f5c16c] border-[#f5c16c]/30";
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex h-[240px] items-center justify-center rounded-[24px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#1f0d09] via-[#2a1015] to-[#1a0b08]">
          <div className="text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 animate-spin text-[#f5c16c]" />
            <p className="text-sm text-[#f5c16c]/70">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Featured Event Banner */}
      {featuredEvent && (
        <div
          className="group relative h-[240px] overflow-hidden rounded-[24px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#1f0d09] via-[#2a1015] to-[#1a0b08] transition-all hover:border-[#f5c16c]/50 cursor-pointer"
          onClick={() => router.push(`/code-battle?eventId=${featuredEvent.id}`)}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(245,193,108,0.15) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Content Overlay */}
          <div className="relative flex h-full flex-col justify-between p-8">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusBadgeColor(
                    featuredEvent.status
                  )}`}
                >
                  {featuredEvent.status}
                </span>
                <span className="flex items-center gap-1 text-sm text-[#f5c16c]/70">
                  <Trophy className="h-4 w-4" />
                  Featured Event
                </span>
              </div>

              <h2 className="mb-3 text-3xl font-bold text-white">
                {featuredEvent.title}
              </h2>
              <p className="max-w-2xl text-sm text-[#f5c16c]/80">
                {featuredEvent.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-[#f5c16c]/60">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{featuredEvent.current_participants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Ends {safeDate(featuredEvent.end_date) ? formatDistanceToNow(safeDate(featuredEvent.end_date)!, { addSuffix: true }) : "TBD"}
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f5c16c] to-[#d23187] px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f5c16c]/30">
                Join Battle
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {events.length > 1 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#f5c16c]">
              Code Battles & Events
            </h3>
            <button
              onClick={() => router.push("/code-battle")}
              className="flex items-center gap-1 text-sm text-[#f5c16c]/70 transition-colors hover:text-[#f5c16c]"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(1).map((event) => (
              <div
                key={event.id}
                className="group cursor-pointer rounded-[20px] border border-[#f5c16c]/20 bg-[#1f0d09]/90 p-4 transition-all hover:border-[#f5c16c]/40 hover:bg-[#1f0d09]"
                onClick={() => router.push(`/code-battle?eventId=${event.id}`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="flex-1 text-base font-semibold text-white group-hover:text-[#f5c16c] transition-colors">
                    {event.title}
                  </h4>
                  <span
                    className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getStatusBadgeColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>

                <p className="mb-4 line-clamp-2 text-xs text-[#f5c16c]/60">
                  {event.description}
                </p>

                <div className="space-y-2 text-xs text-[#f5c16c]/70">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{event.current_participants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      Ends {safeDate(event.end_date) ? format(safeDate(event.end_date)!, "MMM d, yyyy") : "TBD"}
                    </span>
                  </div>
                </div>

                <button className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#f5c16c]/10 to-[#d23187]/10 px-4 py-2 text-sm font-semibold text-[#f5c16c] transition-all hover:from-[#f5c16c]/20 hover:to-[#d23187]/20">
                  Enter Arena
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!featuredEvent && events.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#f5c16c]/20 bg-[#1f0d09]/40 p-12 text-center">
          <Trophy className="mb-4 h-16 w-16 text-[#f5c16c]/30" />
          <h3 className="mb-2 text-lg font-semibold text-[#f5c16c]">
            No Active Events
          </h3>
          <p className="text-sm text-[#f5c16c]/50">
            Check back soon for upcoming code battles and competitions!
          </p>
        </div>
      )}
    </section>
  );
}
