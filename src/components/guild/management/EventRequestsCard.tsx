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

export function EventRequestsCard({ guildId }: EventRequestsCardProps) {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventRequests();
  }, [guildId]);

  const fetchEventRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventServiceApi.getGuildEventRequests(guildId);
      if (response.success && response.data) {
        setEventRequests(response.data);
      } else {
        setError(response.error?.message || "Failed to load event requests");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching guild event requests:", err);
    } finally {
      setLoading(false);
    }
  };

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
    <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
      <CardHeader className="border-b border-amber-900/20">
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <Trophy className="h-5 w-5 text-amber-600" />
          Event Requests
        </CardTitle>
        <CardDescription className="text-amber-700">
          View the status of your guild&apos;s event requests
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
            <span className="ml-3 text-amber-700">Loading event requests...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <XCircle className="h-8 w-8 text-rose-400" />
            <p className="text-amber-700">{error}</p>
            <Button
              onClick={fetchEventRequests}
              variant="outline"
              size="sm"
              className="border-amber-700/50 bg-amber-900/20 text-amber-300"
            >
              Retry
            </Button>
          </div>
        ) : eventRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Trophy className="h-12 w-12 text-amber-700/50" />
            <p className="text-amber-700">No event requests yet</p>
            <p className="text-sm text-amber-700/70">
              Create your first event request to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              const maxParticipants = request.participation.max_guilds * request.participation.max_players_per_guild;

              return (
                <div
                  key={request.request_id}
                  className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4 transition-all hover:border-amber-700/50"
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

                      <h3 className="text-lg font-semibold text-amber-100">{request.title}</h3>
                      <p className="mt-1 text-sm text-amber-600 line-clamp-2">{request.description}</p>

                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-amber-700">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">Start Date</span>
                          </div>
                          <p className="text-xs font-semibold text-amber-200">
                            {new Date(request.proposed_start_date).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-amber-700">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">End Date</span>
                          </div>
                          <p className="text-xs font-semibold text-amber-200">
                            {new Date(request.proposed_end_date).toLocaleDateString("en-US")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-amber-700">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Max Participants</span>
                          </div>
                          <p className="text-xs font-semibold text-amber-200">{maxParticipants}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-amber-700">
                            <Trophy className="h-3 w-3" />
                            <span className="text-xs">Rooms</span>
                          </div>
                          <p className="text-xs font-semibold text-amber-200">
                            {request.room_configuration.number_of_rooms}
                          </p>
                        </div>
                      </div>

                      {request.rejection_reason && (
                        <div className="mt-3 rounded-lg border border-rose-700/30 bg-rose-950/30 p-3">
                          <p className="text-xs uppercase tracking-wide text-rose-400">
                            Rejection Reason
                          </p>
                          <p className="mt-1 text-sm text-rose-300">{request.rejection_reason}</p>
                        </div>
                      )}

                      {request.reviewed_by && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-amber-700">
                          <span>
                            Reviewed by: <span className="text-amber-300">{request.reviewed_by}</span>
                          </span>
                          {request.reviewed_at && (
                            <span>
                              on{" "}
                              <span className="text-amber-300">
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
