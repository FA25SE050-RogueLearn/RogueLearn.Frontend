"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
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
  participants: number;
  status: string;
}

function EventCard({ event, type }: { event: DisplayEvent; type: string }) {
  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
    approved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    rejected: { icon: XCircle, color: "text-[#e07a5f]", bg: "bg-[#e07a5f]/10" },
  };

  const config = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card className="bg-[#1a1410] border border-[#f5c16c]/30 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col gap-4 p-5">
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
            <h3 className="text-base font-semibold text-white">{event.title}</h3>
            <p className="text-sm text-white/60">{event.guild}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-lg bg-[#0a0506] border border-[#f5c16c]/20 p-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">Guilds</span>
            </div>
            <p className="text-sm font-semibold text-white">{event.participants}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Start</span>
            </div>
            <p className="text-sm font-semibold text-white">{event.startDate || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/50">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">End</span>
            </div>
            <p className="text-sm font-semibold text-white">{event.endDate || 'N/A'}</p>
          </div>
        </div>

        {type === "pending" && (
          <Button asChild className="w-full bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
            <Link href={`/admin/events/${event.id}`} className="flex items-center justify-center gap-2">
              Review Request
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

  const transformEventRequest = (req: EventRequest): DisplayEvent => {
    const participation = (req as any).participation_details || req.participation;
    const maxGuilds = participation ? participation.max_guilds : 0;
    const requestId = (req as any).id || req.request_id;

    return {
      id: requestId,
      title: req.title || 'Untitled Event',
      guild: req.requester_guild_id || 'Unknown Guild',
      startDate: req.proposed_start_date ? new Date(req.proposed_start_date).toLocaleDateString('en-US') : undefined,
      endDate: req.proposed_end_date ? new Date(req.proposed_end_date).toLocaleDateString('en-US') : undefined,
      participants: maxGuilds,
      status: req.status || 'pending',
    };
  };

  const pendingEvents = eventRequests.filter(req => req.status === 'pending').map(transformEventRequest);
  const approvedEvents = eventRequests.filter(req => req.status === 'approved').map(transformEventRequest);
  const rejectedEvents = eventRequests.filter(req => req.status === 'rejected').map(transformEventRequest);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Event Requests</h1>
          <p className="text-white/60">Review and manage event requests from guilds</p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-[#e07a5f]/10 border border-[#e07a5f]/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[#e07a5f]">
                <XCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={fetchEventRequests} variant="outline" size="sm" className="mt-3 border-[#e07a5f]/30 text-[#e07a5f] hover:bg-[#e07a5f]/10">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
            <span className="ml-3 text-white/60">Loading event requests...</span>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-[#0a0506] border border-[#f5c16c]/20">
              <TabsTrigger value="pending" className="text-white/60 data-[state=active]:bg-[#f5c16c]/20 data-[state=active]:text-[#f5c16c]">
                Pending ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-white/60 data-[state=active]:bg-[#f5c16c]/20 data-[state=active]:text-[#f5c16c]">
                Approved ({approvedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-white/60 data-[state=active]:bg-[#f5c16c]/20 data-[state=active]:text-[#f5c16c]">
                Rejected ({rejectedEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 space-y-4">
              {pendingEvents.length === 0 ? (
                <Card className="bg-[#1a1410] border border-[#f5c16c]/30">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-[#f5c16c]/40" />
                    <p className="mt-4 text-white/60">No pending event requests</p>
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

            <TabsContent value="approved" className="mt-4 space-y-4">
              {approvedEvents.length === 0 ? (
                <Card className="bg-[#1a1410] border border-[#f5c16c]/30">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-[#f5c16c]/40" />
                    <p className="mt-4 text-white/60">No approved event requests</p>
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

            <TabsContent value="rejected" className="mt-4 space-y-4">
              {rejectedEvents.length === 0 ? (
                <Card className="bg-[#1a1410] border border-[#f5c16c]/30">
                  <CardContent className="py-12 text-center">
                    <XCircle className="mx-auto h-12 w-12 text-[#f5c16c]/40" />
                    <p className="mt-4 text-white/60">No rejected event requests</p>
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
