"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import eventServiceApi from "@/api/eventServiceApi";
import type { EventRequest } from "@/types/event-service";

interface DisplayEvent {
  id: string;
  title: string;
  guild: string;
  startDate?: string;
  endDate?: string;
  participants: number; // Number of guilds
  status: string;
}

function EventCard({ event, type }: { event: DisplayEvent; type: string }) {
  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-950/50" },
    approved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-950/50" },
    rejected: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-950/50" },
  };

  const config = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410] transition-all hover:border-amber-700/50 hover:shadow-lg hover:shadow-amber-900/20">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 rounded-lg pointer-events-none" />
      <CardContent className="relative flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className={`rounded-md p-1.5 ${config.bg}`}>
                <StatusIcon className={`h-4 w-4 ${config.color}`} />
              </div>
              <span className={`text-xs font-medium capitalize ${config.color}`}>
                {event.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-amber-100">{event.title}</h3>
            <p className="text-sm text-amber-700">{event.guild}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700">
              <Users className="h-4 w-4" />
              <span className="text-xs">Guilds</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">{event.participants}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Start Date</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">{event.startDate || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" />
              <span className="text-xs">End Date</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">
              {event.endDate || 'N/A'}
            </p>
          </div>
        </div>

        {type === "pending" && (
          <Button
            asChild
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50 shadow-lg shadow-amber-900/50"
          >
            <Link href={`/admin/events/${event.id}`} className="flex items-center justify-center gap-2">
              Review Quest
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function EventManagementPage() {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventRequests();
  }, []);

  const fetchEventRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventServiceApi.getAllEventRequests();
      if (response.success && response.data) {
        setEventRequests(response.data);
      } else {
        setError(response.error?.message || 'Failed to load event requests');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching event requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform EventRequest to DisplayEvent
  const transformEventRequest = (req: EventRequest): DisplayEvent => {
    // Handle both API response formats: participation_details and participation
    const participation = (req as any).participation_details || req.participation;
    const maxGuilds = participation ? participation.max_guilds : 0;

    // Handle both id and request_id
    const requestId = (req as any).id || req.request_id;

    return {
      id: requestId,
      title: req.title || 'Untitled Event',
      guild: req.requester_guild_id || 'Unknown Guild',
      startDate: req.proposed_start_date ? new Date(req.proposed_start_date).toLocaleDateString('en-US') : undefined,
      endDate: req.proposed_end_date ? new Date(req.proposed_end_date).toLocaleDateString('en-US') : undefined,
      participants: maxGuilds, // Number of guilds, not total players
      status: req.status || 'pending',
    };
  };

  const pendingEvents = eventRequests
    .filter(req => req.status === 'pending')
    .map(transformEventRequest);

  const approvedEvents = eventRequests
    .filter(req => req.status === 'approved')
    .map(transformEventRequest);

  const rejectedEvents = eventRequests
    .filter(req => req.status === 'rejected')
    .map(transformEventRequest);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* RPG-styled Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 rounded-lg blur-xl" />
          <div className="relative p-6 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
            <h1 className="text-3xl font-bold tracking-tight text-amber-100">Quest Management</h1>
            <p className="text-amber-700">
              Oversee, approve and chronicle guild quests
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-rose-900/30 bg-gradient-to-br from-rose-950/30 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <Button
                onClick={fetchEventRequests}
                variant="outline"
                className="mt-4 border-rose-700/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/50"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-3 text-amber-700">Loading event requests...</span>
          </div>
        ) : (
          /* Tabs */
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-amber-950/30 border border-amber-900/30">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-100 text-amber-600"
              >
                Awaiting ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-100 text-amber-600"
              >
                Approved ({approvedEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-100 text-amber-600"
              >
                Rejected ({rejectedEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingEvents.length === 0 ? (
                <Card className="border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-amber-700/50" />
                    <p className="mt-4 text-amber-700">No pending event requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingEvents.map((event) => (
                    <EventCard key={event.id} event={event} type="pending" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedEvents.length === 0 ? (
                <Card className="border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-emerald-700/50" />
                    <p className="mt-4 text-amber-700">No approved event requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {approvedEvents.map((event) => (
                    <EventCard key={event.id} event={event} type="approved" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedEvents.length === 0 ? (
                <Card className="border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
                  <CardContent className="py-12 text-center">
                    <XCircle className="mx-auto h-12 w-12 text-rose-700/50" />
                    <p className="mt-4 text-amber-700">No rejected event requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rejectedEvents.map((event) => (
                    <EventCard key={event.id} event={event} type="rejected" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
