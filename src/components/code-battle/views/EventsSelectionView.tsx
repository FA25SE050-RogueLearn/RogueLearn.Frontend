"use client";

import { useMemo, useState, useEffect, type CSSProperties } from 'react';
import { ArrowRight, Trophy, Calendar, Users, Target, Activity, Flame, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Event } from '@/types/event-service';
import { createClient } from '@/utils/supabase/client';

interface EventsSelectionViewProps {
  events: Event[];
  loading: boolean;
  onSelectEvent: (eventId: string) => void;
  eventSecondsLeft?: number | null; // Not used anymore, kept for compatibility
  eventEndDate?: string | null; // Not used anymore, kept for compatibility
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

type StatusKey = 'all' | 'live' | 'scheduled' | 'completed' | 'cancelled';

const resolveEventStatus = (event: Event) => {
  const status = event.status || event.Status;
  if (status === 'active') return { label: 'Live', color: 'text-emerald-400', key: 'live' as const };
  if (status === 'completed') return { label: 'Concluded', color: 'text-gray-400', key: 'completed' as const };
  if (status === 'cancelled') return { label: 'Cancelled', color: 'text-rose-400', key: 'cancelled' as const };

  const now = new Date();
  const start = new Date(event.started_date || event.StartedDate || '');
  const end = new Date(event.end_date || event.EndDate || '');

  if (now < start) return { label: 'Scheduled', color: 'text-blue-400', key: 'scheduled' as const };
  if (now > end) return { label: 'Concluded', color: 'text-gray-400', key: 'completed' as const };

  return { label: 'Live', color: 'text-emerald-400', key: 'live' as const };
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDateRange = (start: string, end: string) => `${formatDate(start)} — ${formatDate(end)}`;

const calculateProgress = (event: Event) => {
  const start = new Date(event.started_date || event.StartedDate || '').getTime();
  const end = new Date(event.end_date || event.EndDate || '').getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
};

const statusFilters: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All Battles' },
  { key: 'live', label: 'Live' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const HERO_CARD_CLASS = 'relative overflow-hidden rounded-[32px] border border-[#d23187]/35 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]';
const PANEL_SURFACE_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/20 bg-[#120806]/70';
const CTA_CLASS = 'rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] text-[#2b130f] shadow-[0_12px_30px_rgba(210,49,135,0.35)]';
const TEXTURE_OVERLAY: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  mixBlendMode: 'lighten',
  opacity: 0.35,
};
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

export default function EventsSelectionView({
  events,
  loading,
  onSelectEvent,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: EventsSelectionViewProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [isGuildMaster, setIsGuildMaster] = useState(false);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  console.log('🔍 Current state - isGuildMaster:', isGuildMaster, 'guildId:', guildId);

  // Update current time every minute to refresh featured event
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkGuildMasterStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log('No user found');
          return;
        }

        console.log('Current user ID:', user.id);

        // Query guilds table to find guild where user is the creator
        const { data: guilds, error } = await supabase
          .from('guilds')
          .select('id, name')
          .eq('created_by', user.id)
          .limit(1);

        if (error) {
          console.error('❌ Error querying guilds:', error);
          return;
        }

        if (guilds && guilds.length > 0) {
          const guild = guilds[0];
          console.log('✅ User is guild master of:', guild.name, 'ID:', guild.id);
          setIsGuildMaster(true);
          setGuildId(guild.id);
        } else {
          console.log('⚠️ User is not a guild master');
        }
      } catch (error) {
        console.error('❌ Error checking guild master status:', error);
      }
    };

    checkGuildMasterStatus();
  }, []);

  const eventStats = useMemo(() => {
    const base = { total: events.length, live: 0, scheduled: 0, completed: 0 };
    events.forEach((event) => {
      const status = resolveEventStatus(event);
      if (status.key in base) {
        base[status.key as 'live' | 'scheduled' | 'completed'] += 1;
      }
    });
    return base;
  }, [events]);

  const featuredEvent = useMemo(() => {
    if (events.length === 0) return null;
    
    const now = currentTime;
    
    // First priority: Find the closest upcoming event (scheduled but not started yet)
    const upcomingEvents = events
      .filter((event) => {
        const start = new Date(event.started_date).getTime();
        return start > now && event.Status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.started_date).getTime() - new Date(b.started_date).getTime());
    
    if (upcomingEvents.length > 0) return upcomingEvents[0];
    
    // Second priority: Find a currently running event
    const liveEvent = events.find((event) => resolveEventStatus(event).key === 'live');
    if (liveEvent) return liveEvent;
    
    // Fallback: Return the first event
    return events[0];
  }, [events, currentTime]);

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') return events;
    return events.filter((event) => resolveEventStatus(event).key === statusFilter);
  }, [events, statusFilter]);

  return (
    <div className="flex min-h-[80vh] flex-col gap-12">
      <Card className={HERO_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
        <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />
        <CardContent className="relative z-10 flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d23187]/50 bg-[#d23187]/10 px-5 py-1.5 text-xs uppercase tracking-[0.45em] text-[#f9d9eb]">
              <Trophy className="h-4 w-4" />
              Arena
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Choose Your Next Code Battle</h1>
            <p className="mt-4 text-base text-foreground/75">
              Rally your party, sharpen your algorithms, and step into a live roguelike tournament designed for elite devs.
            </p>
            {featuredEvent && (
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-foreground/80">
                <div className="flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-1">
                  <Calendar className="h-3.5 w-3.5 text-[#f5c16c]" />
                  <span>{formatDate(featuredEvent.started_date || featuredEvent.StartedDate || '')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#d23187]" />
                  <span className="font-semibold text-white">{featuredEvent.title || featuredEvent.Title}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid w-full max-w-xl gap-4 text-left text-white lg:max-w-sm">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Live Battles', value: eventStats.live, icon: Flame },
                { label: 'On Deck', value: eventStats.scheduled, icon: Target },
                { label: 'Season Total', value: eventStats.total, icon: Activity },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className={`${PANEL_SURFACE_CLASS} text-center`}>
                  <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
                  <CardContent className="relative flex flex-col items-center gap-2 p-4">
                    <Icon className="h-5 w-5 text-[#f5c16c]" />
                    <span className="text-2xl font-bold">{value}</span>
                    <span className="text-xs uppercase tracking-wide text-foreground/60">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="relative z-10 border-t border-[#f5c16c]/20 px-8 py-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#f9d9eb]/70">
            <span className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Filter Battles</span>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    statusFilter === filter.key
                      ? 'border-[#f5c16c] bg-[#f5c16c]/20 text-white shadow-[0_0_15px_rgba(245,193,108,0.35)]'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-[#d23187]/40 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#f5c16c]">Arena Listings</p>
            <h2 className="text-2xl font-semibold text-white">Available Tournaments</h2>
          </div>
          <div className="flex items-center gap-3">
            {isGuildMaster && guildId && (
              <Button
                onClick={() => router.push(`/community/guilds/${guildId}#manage`)}
                className="rounded-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-white shadow-[0_8px_24px_rgba(210,49,135,0.4)] hover:shadow-[0_12px_32px_rgba(210,49,135,0.6)] transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Request Event
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`${PANEL_SURFACE_CLASS} h-56 animate-pulse`} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className={`${PANEL_SURFACE_CLASS} text-center`}>
            <CardContent className="py-16 text-center">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-foreground/30" />
              <h3 className="mb-2 text-xl font-semibold text-white">No Battles Match That Filter</h3>
              <p className="text-foreground/60">Try exploring a different status or check back later for new tournaments.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const status = resolveEventStatus(event);
              const progress = calculateProgress(event);

              return (
                <Card
                  key={event.ID}
                  className={`group relative overflow-hidden rounded-[28px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1a0e0d]/92 via-[#130807]/97 to-[#080303] transition-all duration-300 hover:-translate-y-1 hover:border-[#d23187]/50 hover:shadow-[0_15px_40px_rgba(210,49,135,0.25)]`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,108,0.1),transparent_65%)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

                  <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-white">{event.Title}</CardTitle>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.color} border-current/30 bg-current/10`}>
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground/60 line-clamp-2">
                      {event.Description || 'Join this legendary roguelike code challenge and earn rare loot.'}
                    </p>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-4 p-5">
                    <div className="space-y-2 text-[11px] text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDateRange(event.started_date || event.StartedDate || '', event.end_date || event.EndDate || '')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>Max {event.MaxGuilds} Guilds • {event.MaxPlayersPerGuild} per Guild</span>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-foreground/50">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c]" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {status.key === 'scheduled' || (event.Status === 'pending' && new Date(event.AssignmentDate || event.started_date) > new Date()) ? (
                      <Button
                        onClick={() => router.push(`/code-battle/${event.ID}`)}
                        className={`w-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider ${CTA_CLASS}`}
                      >
                        View Details & Register
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    ) : status.key === 'completed' ? (
                      <Button
                        onClick={() => router.push(`/code-battle/${event.ID}/results`)}
                        className={`w-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider ${CTA_CLASS}`}
                      >
                        View Results
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const eventId = event.id || event.ID;
                          if (eventId) onSelectEvent(eventId);
                        }}
                        className={`w-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider ${CTA_CLASS}`}
                      >
                        Enter Arena
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredEvents.length > 0 && onPageChange && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                // Show ellipsis
                const showEllipsis =
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2);

                if (showEllipsis) {
                  return (
                    <span key={page} className="px-2 text-[#f5c16c]/50">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <Button
                    key={page}
                    onClick={() => onPageChange(page)}
                    variant={page === currentPage ? "default" : "outline"}
                    className={
                      page === currentPage
                        ? "bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-white"
                        : "border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                    }
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
