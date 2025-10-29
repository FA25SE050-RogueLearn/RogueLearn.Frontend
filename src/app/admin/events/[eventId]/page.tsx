"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  DollarSign, 
  Trophy,
  Calendar,
  Server,
  Star,
  ChevronLeft,
  Clock
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

// Mock event data - will be replaced with real data from API
const mockEventData: any = {
  "evt-001": {
    id: "evt-001",
    title: "Spring Java Championship 2025",
    description: "A comprehensive Java programming competition testing Spring Boot expertise, algorithm design, database integration, and software design patterns.",
    guild: {
      name: "Java Masters Guild",
      leader: "Nguyen Van A",
      totalEvents: 2,
      successRate: 100,
      rating: 4.7,
      members: 45
    },
    participants: 150,
    expectedParticipants: 200,
    startDate: "2025-03-15",
    endDate: "2025-03-17",
    submittedDate: "2025-10-27",
    revenue: {
      projected: 20000000,
      platformFee: 3000000,
      prizePool: 17000000
    },
    prizes: {
      first: 7000000,
      second: 5000000,
      third: 3000000,
      topTen: 2500000,
      total: 11500000,
      percentage: 67.6
    },
    problemSet: {
      springBoot: { required: 10, available: 15, status: "sufficient" },
      algorithms: { required: 15, available: 22, status: "sufficient" },
      database: { required: 8, available: 8, status: "sufficient" },
      designPatterns: { required: 5, available: 6, status: "sufficient" }
    },
    resources: {
      serverCapacity: { available: 85, required: 5, status: "ready" },
      calendarConflicts: false,
      moderators: 3,
      engineers: 2,
      recommendation: "Ready for approval"
    },
    status: "pending"
  }
};

export default function EventDetailPage({ params }: PageProps) {
  const { eventId } = use(params);
  const event = mockEventData[eventId];

  if (!event) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-foreground/60">Event not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button - RPG styled */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 hover:text-amber-200"
          >
            <Link href="/admin/events" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-amber-100">{event.title}</h1>
            <p className="text-sm text-amber-700">Submitted by {event.guild.name}</p>
          </div>
        </div>

        {/* Event Overview - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Quest Overview</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6 pt-6">
            <p className="text-sm text-amber-600">{event.description}</p>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Adventurers", value: event.participants, icon: Users },
                { label: "Start Date", value: event.startDate, icon: Calendar },
                { label: "Duration", value: "3 days", icon: Clock },
                { label: "Submitted", value: event.submittedDate, icon: Calendar },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-amber-200">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Problem Set Validation - RPG styled */}
          <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
            <CardHeader className="relative border-b border-amber-900/20">
              <CardTitle className="text-amber-100">Challenge Validation</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4 pt-6">
              {Object.entries(event.problemSet).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                  <div>
                    <p className="text-sm font-medium text-amber-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-xs text-amber-700">
                      {value.required} required / {value.available} available
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
              ))}
              <div className="rounded-lg bg-emerald-950/50 border border-emerald-700/30 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-400">All Challenge Sets Sufficient</p>
              </div>
            </CardContent>
          </Card>

          {/* Guild History - RPG styled */}
          <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
            <CardHeader className="relative border-b border-amber-900/20">
              <CardTitle className="text-amber-100">Guild Chronicles</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Guild Name</span>
                <span className="text-sm font-semibold text-amber-200">{event.guild.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Guild Leader</span>
                <span className="text-sm font-semibold text-amber-200">{event.guild.leader}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Total Quests</span>
                <span className="text-sm font-semibold text-amber-200">{event.guild.totalEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Success Rate</span>
                <span className="text-sm font-semibold text-emerald-400">{event.guild.successRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-200">{event.guild.rating}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">Members</span>
                <span className="text-sm font-semibold text-amber-200">{event.guild.members}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget & Prizes - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Treasury & Bounty Allocation</CardTitle>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-600">Revenue</h3>
                <div className="space-y-3 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-700">Projected Revenue</span>
                    <span className="text-sm font-semibold text-amber-200">{(event.revenue.projected / 1000000).toFixed(1)}M VND</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-700">Sanctum Fee (15%)</span>
                    <span className="text-sm font-semibold text-rose-400">{(event.revenue.platformFee / 1000000).toFixed(1)}M VND</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-amber-900/30 pt-3">
                    <span className="text-sm font-semibold text-amber-300">Bounty Pool</span>
                    <span className="text-lg font-bold text-amber-100">{(event.revenue.prizePool / 1000000).toFixed(1)}M VND</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-600">Bounty Distribution</h3>
                <div className="space-y-3 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                  {[
                    { place: "Champion", amount: event.prizes.first },
                    { place: "Runner-up", amount: event.prizes.second },
                    { place: "3rd Place", amount: event.prizes.third },
                    { place: "Top 10 Rewards", amount: event.prizes.topTen },
                  ].map((prize) => (
                    <div key={prize.place} className="flex items-center justify-between">
                      <span className="text-sm text-amber-700">{prize.place}</span>
                      <span className="text-sm font-semibold text-amber-200">{(prize.amount / 1000000).toFixed(1)}M VND</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-amber-900/30 pt-3">
                    <span className="text-sm font-semibold text-amber-300">Total Allocated</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {(event.prizes.total / 1000000).toFixed(1)}M ({event.prizes.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Check - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Resource Verification</CardTitle>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Server className="h-4 w-4" />
                  <span className="text-xs">Sanctum Capacity</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-amber-200">{event.resources.serverCapacity.available}%</p>
                <p className="text-xs text-amber-700">Needs {event.resources.serverCapacity.required}%</p>
              </div>
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Calendar</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-emerald-400">No Conflicts</p>
              </div>
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Overseers</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-amber-200">{event.resources.moderators} Available</p>
              </div>
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Server className="h-4 w-4" />
                  <span className="text-xs">Artificers</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-amber-200">{event.resources.engineers} On Call</p>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-emerald-950/50 border border-emerald-700/30 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-400">✓ {event.resources.recommendation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Approval Actions - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Approval Decision</CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-4 pt-6 sm:flex-row">
            <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-emerald-50 shadow-lg shadow-emerald-900/50">
              <CheckCircle className="mr-2 h-5 w-5" />
              Approve Quest
            </Button>
            <Button variant="outline" className="flex-1 border-red-700/50 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300">
              <XCircle className="mr-2 h-5 w-5" />
              Reject Quest
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
