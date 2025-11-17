"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import eventServiceApi from "@/api/eventServiceApi";
import type { EventRequest } from "@/types/event-service";

interface EventRequestsCardProps {
  guildId: string;
}

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

export function EventRequestsCard({ guildId }: EventRequestsCardProps) {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventServiceApi.getGuildEventRequests(guildId);
      if (response.success && response.data) {
        // Ensure data is an array
        const requestsData = Array.isArray(response.data) ? response.data : [];
        setEventRequests(requestsData);
      } else {
        setError(response.error?.message || "Failed to load event requests");
        setEventRequests([]);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setEventRequests([]);
      console.error("Error fetching guild event requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventRequests();
  }, [guildId]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-orange-400",
          bg: "bg-orange-950/50 border-orange-700/30",
          label: "Pending Review"
        };
      case "approved":
        return {
          icon: CheckCircle,
          color: "text-emerald-400",
          bg: "bg-emerald-950/50 border-emerald-700/30",
          label: "Approved"
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-rose-400",
          bg: "bg-rose-950/50 border-rose-700/30",
          label: "Rejected"
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-amber-400",
          bg: "bg-amber-950/50 border-amber-700/30",
          label: status
        };
    }
  };

  return (
    <Card className={CARD_CLASS}>
      {/* Texture overlay */}
      <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      
      <CardHeader className="relative border-b border-[#f5c16c]/20">
        <CardTitle className="flex items-center gap-2 text-[#f5c16c]">
          <Trophy className="h-5 w-5 text-[#f5c16c]" />
          Event Requests
        </CardTitle>
        <CardDescription className="text-white/60">
          View the status of your guild&apos;s event requests
        </CardDescription>
      </CardHeader>
      <CardContent className="relative pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#f5c16c]" />
            <span className="ml-3 text-white/60">Loading event requests...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <XCircle className="h-8 w-8 text-rose-400" />
            <p className="text-white/60">{error}</p>
            <Button
              onClick={fetchEventRequests}
              variant="outline"
              size="sm"
              className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10"
            >
              Retry
            </Button>
          </div>
        ) : eventRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Trophy className="h-12 w-12 text-[#f5c16c]/40" />
            <p className="text-white/60">No event requests yet</p>
            <p className="text-sm text-white/50">
              Create your first event request to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              // Handle both API response formats: participation_details and participation
              const participation = (request as any).participation_details || request.participation;
              const maxParticipants = participation
                ? (participation.max_guilds * participation.max_players_per_guild)
                : 0;
              // Handle both id and request_id
              const requestId = (request as any).id || request.request_id;

              return (
                <div
                  key={requestId}
                  className="rounded-lg border border-[#f5c16c]/20 bg-gradient-to-br from-black/40 to-[#1a0a08]/40 p-4 transition-all hover:border-[#f5c16c]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`rounded-md border p-1.5 ${statusConfig.bg}`}>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                        </div>
                        <span className={`text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-white/60">{request.description}</p>

                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">Start Date</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">
                            {new Date(request.proposed_start_date).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">End Date</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">
                            {new Date(request.proposed_end_date).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Max Participants</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">{maxParticipants}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#f5c16c]/70">
                            <Trophy className="h-3 w-3" />
                            <span className="text-xs">Rooms</span>
                          </div>
                          <p className="text-xs font-semibold text-[#f5c16c]">
                            {request.room_configuration?.number_of_rooms ?? 0}
                          </p>
                        </div>
                      </div>

                      {request.rejection_reason && (
                        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                          <p className="text-xs uppercase tracking-wide text-rose-400">
                            Rejection Reason
                          </p>
                          <p className="mt-1 text-sm text-rose-300">{request.rejection_reason}</p>
                        </div>
                      )}

                      {request.reviewed_by && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
                          <span>
                            Reviewed by: <span className="text-white">{request.reviewed_by}</span>
                          </span>
                          {request.reviewed_at && (
                            <span>
                              on{" "}
                              <span className="text-white">
                                {new Date(request.reviewed_at).toLocaleDateString("en-US")}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
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
