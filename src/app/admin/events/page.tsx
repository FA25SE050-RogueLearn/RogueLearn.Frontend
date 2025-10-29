"use client";

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
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with real data
const mockEvents = {
  pending: [
    {
      id: "evt-001",
      title: "Spring Java Championship 2025",
      guild: "Java Masters Guild",
      submittedDate: "2025-10-27",
      participants: 150,
      prizePool: "17,000,000 VND",
      status: "pending"
    },
    {
      id: "evt-002",
      title: "Algorithm Mastery Tournament",
      guild: "Code Warriors",
      submittedDate: "2025-10-26",
      participants: 80,
      prizePool: "10,000,000 VND",
      status: "pending"
    },
    {
      id: "evt-003",
      title: "Web Dev Sprint Challenge",
      guild: "Frontend Pioneers",
      submittedDate: "2025-10-25",
      participants: 120,
      prizePool: "12,000,000 VND",
      status: "pending"
    },
  ],
  active: [
    {
      id: "evt-004",
      title: "Database Design Competition",
      guild: "Data Architects",
      startDate: "2025-10-20",
      participants: 95,
      prizePool: "8,000,000 VND",
      status: "active"
    },
  ],
  past: [
    {
      id: "evt-005",
      title: "Winter Coding Marathon 2024",
      guild: "Elite Coders",
      endDate: "2025-10-15",
      participants: 200,
      prizePool: "20,000,000 VND",
      status: "completed"
    },
  ],
};

function EventCard({ event, type }: { event: any; type: string }) {
  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-950/50" },
    active: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-950/50" },
    completed: { icon: XCircle, color: "text-amber-600", bg: "bg-amber-950/50" },
  };

  const config = statusConfig[event.status as keyof typeof statusConfig];
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
              <span className="text-xs">Adventurers</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">{event.participants}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Bounty</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">{event.prizePool}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Date</span>
            </div>
            <p className="text-sm font-semibold text-amber-200">
              {event.submittedDate || event.startDate || event.endDate}
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

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-amber-950/30 border border-amber-900/30">
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-100 text-amber-600"
            >
              Awaiting ({mockEvents.pending.length})
            </TabsTrigger>
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-100 text-amber-600"
            >
              Active ({mockEvents.active.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-100 text-amber-600"
            >
              Completed ({mockEvents.past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockEvents.pending.map((event) => (
                <EventCard key={event.id} event={event} type="pending" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockEvents.active.map((event) => (
                <EventCard key={event.id} event={event} type="active" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockEvents.past.map((event) => (
                <EventCard key={event.id} event={event} type="past" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
