"use client";

import { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { ArrowRight, Activity, ChevronLeft, Clock, Zap, Flame, Target, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Event } from '@/types/event-service';
import profileApi from '@/api/profileApi';
import { toast } from 'sonner';

interface EventsSelectionViewProps {
  events: Event[];
  loading: boolean;
  onSelectEvent: (eventId: string) => void;
  eventSecondsLeft?: number | null; // Not used anymore, kept for compatibility
  eventEndDate?: string | null; // Not used anymore, kept for compatibility
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  viewMode?: 'dashboard' | 'filtered';
  onViewModeChange?: (mode: 'dashboard' | 'filtered', status?: StatusKey) => void;
  currentStatusFilter?: StatusKey;
  activeTotalCount?: number;
  scheduledTotalCount?: number;
  completedTotalCount?: number;
}

type StatusKey = 'all' | 'live' | 'scheduled' | 'completed' | 'cancelled' | 'preparing';

const resolveEventStatus = (event: Event) => {
  const status = event.status || event.Status;

  // Check for cancelled status first (this is definitive)
  if (status === 'cancelled') return { label: 'Cancelled', color: 'text-rose-400', key: 'cancelled' as const };

  // Calculate time-based status
  const now = new Date();
  const start = new Date(event.started_date || event.StartedDate || '');
  const end = new Date(event.end_date || event.EndDate || '');
  const assignmentDate = (event.assignment_date || event.AssignmentDate)
    ? new Date(event.assignment_date || event.AssignmentDate || '')
    : null;

  // Priority 1: Check if registration deadline has passed but event hasn't started yet (PREPARING period)
  if (assignmentDate && now >= assignmentDate && now < start) {
    return { label: 'Preparing', color: 'text-amber-400', key: 'preparing' as const };
  }

  // Priority 2: Check if event has ended
  if (now > end) {
    return { label: 'Concluded', color: 'text-gray-400', key: 'completed' as const };
  }

  // Priority 3: Check if event is currently happening (between start and end)
  if (now >= start && now <= end) {
    return { label: 'Live', color: 'text-emerald-400', key: 'live' as const };
  }

  // Priority 4: Check if event is scheduled (before registration deadline or before start)
  if (now < start) {
    return { label: 'Scheduled', color: 'text-blue-400', key: 'scheduled' as const };
  }

  // Fallback to backend status if time-based logic doesn't match
  if (status === 'completed') return { label: 'Concluded', color: 'text-gray-400', key: 'completed' as const };
  if (status === 'active') return { label: 'Live', color: 'text-emerald-400', key: 'live' as const };

  return { label: 'Scheduled', color: 'text-blue-400', key: 'scheduled' as const };
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
const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-[#120806]/70';
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
  onPageChange,
  viewMode = 'dashboard',
  onViewModeChange,
  currentStatusFilter = 'all',
  activeTotalCount = 0,
  scheduledTotalCount = 0,
  completedTotalCount = 0
}: EventsSelectionViewProps) {
  const router = useRouter();
  const [isGuildMaster, setIsGuildMaster] = useState(false);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [userId, setUserId] = useState<string | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  
  // Track previous preparing events to detect transitions to live
  const previousPreparingEventsRef = useRef<Set<string>>(new Set());
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // Helper to format countdown time
  const formatCountdown = useCallback((ms: number): string => {
    if (ms <= 0) return 'Starting now!';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  // Get preparing events for polling
  const preparingEvents = useMemo(() => {
    return events.filter(event => {
      const status = resolveEventStatus(event);
      return status.key === 'preparing';
    });
  }, [events]);

  // Faster polling for preparing events (every 5 seconds)
  useEffect(() => {
    if (preparingEvents.length === 0) return;

    const updateCountdowns = () => {
      const now = Date.now();
      const newCountdowns: Record<string, string> = {};
      
      preparingEvents.forEach(event => {
        const eventId = event.id || event.ID || '';
        const startTime = new Date(event.started_date || event.StartedDate || '').getTime();
        const timeLeft = startTime - now;
        newCountdowns[eventId] = formatCountdown(timeLeft);
      });
      
      setCountdowns(newCountdowns);
      setCurrentTime(now);
    };

    // Initial update
    updateCountdowns();

    // Poll every 5 seconds for preparing events
    const interval = setInterval(updateCountdowns, 5000);

    return () => clearInterval(interval);
  }, [preparingEvents, formatCountdown]);

  // Track live events for end detection
  const previousLiveEventsRef = useRef<Set<string>>(new Set());
  const endNotifiedEventsRef = useRef<Set<string>>(new Set());

  // Get live events for monitoring
  const liveEvents = useMemo(() => {
    return events.filter(event => {
      const status = resolveEventStatus(event);
      return status.key === 'live';
    });
  }, [events]);

  // Detect preparing -> live transitions and notify
  useEffect(() => {
    const currentPreparingIds = new Set(
      preparingEvents.map(e => e.id || e.ID || '')
    );
    
    // Check if any previously preparing event is now live
    events.forEach(event => {
      const eventId = event.id || event.ID || '';
      const status = resolveEventStatus(event);
      
      // If event was preparing and is now live, and we haven't notified yet
      if (
        previousPreparingEventsRef.current.has(eventId) &&
        status.key === 'live' &&
        !notifiedEventsRef.current.has(eventId)
      ) {
        // Show notification
        toast.success(`${event.Title || event.title} is now LIVE!`, {
          description: 'The battle has begun. Enter the arena now!',
          duration: 10000,
          action: {
            label: 'Enter Arena',
            onClick: () => onSelectEvent(eventId),
          },
        });
        
        // Play notification sound if available
        try {
          const audio = new Audio('/sounds/battle-start.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
        
        notifiedEventsRef.current.add(eventId);
      }
    });
    
    // Update the previous preparing events ref
    previousPreparingEventsRef.current = currentPreparingIds;
  }, [events, preparingEvents, onSelectEvent]);

  // Detect live -> completed transitions and notify with redirect to results
  useEffect(() => {
    const currentLiveIds = new Set(
      liveEvents.map(e => e.id || e.ID || '')
    );
    
    // Check if any previously live event is now completed
    events.forEach(event => {
      const eventId = event.id || event.ID || '';
      const status = resolveEventStatus(event);
      
      // If event was live and is now completed, and we haven't notified yet
      if (
        previousLiveEventsRef.current.has(eventId) &&
        status.key === 'completed' &&
        !endNotifiedEventsRef.current.has(eventId)
      ) {
        // Show notification with redirect action
        toast.success(`${event.Title || event.title} has ended!`, {
          description: 'The battle has concluded.',
          duration: 10000,
          action: {
            label: 'Back to Events',
            onClick: () => router.push(`/code-battle`),
          },
        });
        
        // Play notification sound if available
        try {
          const audio = new Audio('/sounds/battle-end.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
        
        endNotifiedEventsRef.current.add(eventId);
      }
    });
    
    // Update the previous live events ref
    previousLiveEventsRef.current = currentLiveIds;
  }, [events, liveEvents, router]);

  // Standard time update every minute for non-preparing events
  useEffect(() => {
    // Only run if no preparing events (they have their own faster polling)
    if (preparingEvents.length > 0) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, [preparingEvents.length]);

  useEffect(() => {
    const checkGuildMasterStatusAndRegistrations = async () => {
      try {
        // Use profile API to get user info including roles
        const profileResponse = await profileApi.getMyProfile();

        if (!profileResponse.isSuccess || !profileResponse.data) {
          console.log('No user profile found');
          return;
        }

        const profile = profileResponse.data;
        console.log('Current user ID:', profile.authUserId);
        setUserId(profile.authUserId);

        // Check if user has "Guild Master" role directly from profile roles array
        const hasGuildMasterRole = profile.roles?.includes('Guild Master');
        
        if (hasGuildMasterRole) {
          console.log('✅ User has Guild Master role');
          setIsGuildMaster(true);
          
          // Get guild info to get the guildId
          const socialResponse = await profileApi.getSocialByAuthId(profile.authUserId);
          if (socialResponse.isSuccess && socialResponse.data?.relations?.guildMembers) {
            const guildMembership = socialResponse.data.relations.guildMembers.find(
              (member) => member.role === 'GuildMaster'
            );
            if (guildMembership) {
              console.log('✅ User is guild master of:', guildMembership.guildName, 'ID:', guildMembership.guildId);
              setGuildId(guildMembership.guildId);
            }
          }
        } else {
          console.log('⚠️ User does not have Guild Master role');
        }
      } catch (error) {
        console.error('❌ Error checking guild master status:', error);
      }
    };

    checkGuildMasterStatusAndRegistrations();
  }, []);

  // Check registration status for active (live) and preparing events
  useEffect(() => {
    const checkRegistrations = async () => {
      if (!userId || events.length === 0) return;

      const registered = new Set<string>();

      // Check registration for live and preparing events (preparing will become live soon)
      const eventsToCheck = events.filter(event => {
        const status = resolveEventStatus(event);
        return status.key === 'live' || status.key === 'preparing';
      });

      for (const event of eventsToCheck) {
        try {
          const eventId = event.id || event.ID;
          if (!eventId) continue;

          // Import the API here to avoid circular dependencies
          const eventServiceApi = (await import('@/api/eventServiceApi')).default;
          const response = await eventServiceApi.getRegisteredGuildMembers(eventId);

          if (response.success && response.data) {
            const isUserRegistered = response.data.some(member => member.user_id === userId);
            if (isUserRegistered) {
              registered.add(eventId);
            }
          }
        } catch (error) {
          console.error(`Error checking registration for event ${event.ID}:`, error);
        }
      }

      setRegisteredEventIds(registered);
    };

    checkRegistrations();
  }, [userId, events, liveEvents]);

  const eventStats = useMemo(() => {
    // In dashboard mode, use total counts from API
    // In filtered mode, calculate from events array
    if (viewMode === 'dashboard') {
      return {
        total: activeTotalCount + scheduledTotalCount + completedTotalCount,
        live: activeTotalCount,
        scheduled: scheduledTotalCount,
        completed: completedTotalCount,
        preparing: 0
      };
    } else {
      const base = { total: events.length, live: 0, scheduled: 0, completed: 0, preparing: 0 };
      events.forEach((event) => {
        const status = resolveEventStatus(event);
        if (status.key in base) {
          base[status.key as 'live' | 'scheduled' | 'completed' | 'preparing'] += 1;
        }
      });
      return base;
    }
  }, [events, viewMode, activeTotalCount, scheduledTotalCount, completedTotalCount]);

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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const statusA = resolveEventStatus(a);
      const statusB = resolveEventStatus(b);

      // Priority order: live > preparing > scheduled > completed/cancelled
      const priorityMap: Record<string, number> = {
        'live': 1,
        'preparing': 2,
        'scheduled': 3,
        'completed': 4,
        'cancelled': 5,
      };

      const priorityA = priorityMap[statusA.key] || 999;
      const priorityB = priorityMap[statusB.key] || 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within same priority, sort by start date (earliest first for scheduled/live, latest first for completed)
      const dateA = new Date(a.started_date || a.StartedDate || '').getTime();
      const dateB = new Date(b.started_date || b.StartedDate || '').getTime();

      if (statusA.key === 'completed' || statusA.key === 'cancelled') {
        return dateB - dateA; // Most recent completed events first
      }

      return dateA - dateB; // Earliest upcoming/live events first
    });
  }, [events]);

  // Render a single event card
  const renderEventCard = (event: Event, compact: boolean = false) => {
    const status = resolveEventStatus(event);
    const progress = calculateProgress(event);
    const eventId = event.id || event.ID || '';

    // Check if user is registered for this event
    const isUserRegistered = eventId ? registeredEventIds.has(eventId) : false;

    // Show "Not Registered" badge only if event is live and user is not registered
    const showNotRegistered = status.key === 'live' && !isUserRegistered;

    // Show "Registration Closed" badge only for preparing status (between deadline and start)
    const showRegistrationClosed = status.key === 'preparing';

    return (
      <Card
        key={event.ID}
        className={`group relative overflow-hidden ${
          compact ? 'rounded-2xl' : 'rounded-[28px]'
        } border border-[#f5c16c]/25 bg-linear-to-br from-[#1a0e0d]/92 via-[#130807]/97 to-[#080303] transition-all duration-300 hover:-translate-y-1 hover:border-[#d23187]/50 hover:shadow-[0_15px_40px_rgba(210,49,135,0.25)]`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,108,0.1),transparent_65%)] opacity-0 transition-opacity group-hover:opacity-100" />
        <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

        <CardHeader className={`relative z-10 border-b border-white/5 ${compact ? 'pb-2' : 'pb-3'}`}>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className={`${compact ? 'text-sm' : 'text-base'} text-white flex-1`}>{event.Title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {showNotRegistered && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                  Not Registered
                </span>
              )}
              {showRegistrationClosed && (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 animate-pulse">
                    <Clock className="h-3 w-3" />
                    {countdowns[eventId] || 'Starting soon...'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                    Registration Closed
                  </span>
                </>
              )}
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.color} border-current/30 bg-current/10`}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                {status.label}
              </span>
            </div>
          </div>
          {!compact && (
            <p className="mt-2 text-xs text-foreground/60 line-clamp-2">
              {event.Description || 'Join this legendary roguelike code challenge and earn rare loot.'}
            </p>
          )}
        </CardHeader>

        <CardContent className={`relative z-10 space-y-4 ${compact ? 'p-3' : 'p-5'}`}>
          <div className={`space-y-2 ${compact ? 'text-[10px]' : 'text-[11px]'} text-foreground/60`}>
            <div className="flex items-center gap-2">
              <span>{formatDateRange(event.started_date || event.StartedDate || '', event.end_date || event.EndDate || '')}</span>
            </div>
            {!compact && (
              <div className="flex items-center gap-2">
                <span>Max {event.MaxGuilds} Guilds • {event.MaxPlayersPerGuild} per Guild</span>
              </div>
            )}
          </div>

          {!compact && (
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-foreground/50">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {status.key === 'scheduled' || (event.Status === 'pending' && new Date(event.AssignmentDate || event.started_date) > new Date()) ? (
            <Button
              onClick={() => router.push(`/code-battle/${event.ID}`)}
              className={`w-full ${compact ? 'px-3 py-1.5 text-[10px]' : 'px-5 py-2.5 text-xs'} font-semibold uppercase tracking-wider ${CTA_CLASS}`}
            >
              View Details & Register
              <ArrowRight className={`ml-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            </Button>
          ) : status.key === 'preparing' ? (
            <div className="space-y-2">
              <Button
                disabled
                variant="outline"
                className={`w-full ${compact ? 'px-3 py-1.5 text-[10px]' : 'px-5 py-2.5 text-xs'} font-semibold uppercase tracking-wider border-[#f5c16c]/40 bg-[#f5c16c]/10 text-[#f5c16c] cursor-not-allowed opacity-70`}
              >
                <Zap className={`mr-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} animate-pulse`} />
                Starts in {countdowns[eventId] || '...'}
              </Button>
            </div>
          ) : status.key === 'completed' ? (
            <Button
              onClick={() => router.push(`/code-battle/${event.ID}/results`)}
              className={`w-full ${compact ? 'px-3 py-1.5 text-[10px]' : 'px-5 py-2.5 text-xs'} font-semibold uppercase tracking-wider ${CTA_CLASS}`}
            >
              View Results
              <ArrowRight className={`ml-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            </Button>
          ) : showNotRegistered ? (
            <Button
              disabled
              className={`w-full ${compact ? 'px-3 py-1.5 text-[10px]' : 'px-5 py-2.5 text-xs'} font-semibold uppercase tracking-wider bg-gray-600/50 text-gray-400 cursor-not-allowed opacity-60`}
            >
              Not Registered - Cannot Enter
            </Button>
          ) : (
            <Button
              onClick={() => {
                const eventId = event.id || event.ID;
                if (eventId) onSelectEvent(eventId);
              }}
              className={`w-full ${compact ? 'px-3 py-1.5 text-[10px]' : 'px-5 py-2.5 text-xs'} font-semibold uppercase tracking-wider ${CTA_CLASS}`}
            >
              Enter Arena
              <ArrowRight className={`ml-2 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Dashboard Mode - 3 section layout
  if (viewMode === 'dashboard') {
    // Categorize events by status
    const activeEvents = sortedEvents.filter(e => {
      const status = resolveEventStatus(e);
      return status.key === 'live' || status.key === 'preparing';
    });
    const scheduledEvents = sortedEvents.filter(e => resolveEventStatus(e).key === 'scheduled');
    const completedEvents = sortedEvents.filter(e => resolveEventStatus(e).key === 'completed');

    return (
      <div className="flex min-h-[80vh] flex-col gap-12">
        <Card className={HERO_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
          <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />
          <CardContent className="relative z-10 flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d23187]/50 bg-[#d23187]/10 px-5 py-1.5 text-xs uppercase tracking-[0.45em] text-[#f9d9eb]">
                Arena
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Choose Your Next Code Battle</h1>
              <p className="mt-4 text-base text-foreground/75">
                Rally your party, sharpen your algorithms, and step into a live roguelike tournament designed for elite devs.
              </p>
              {featuredEvent && (
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-foreground/80">
                  <div className="flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-1">
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
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-sm text-[#f9d9eb]/70">
                <span className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Quick Navigation</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push('/practice')}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d23187]/50 bg-linear-to-r from-[#d23187]/20 to-[#f5c16c]/20 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(210,49,135,0.25)] hover:from-[#d23187]/30 hover:to-[#f5c16c]/30 hover:shadow-[0_12px_30px_rgba(210,49,135,0.4)] transition-all"
                >
                  Solo Practice
                </Button>
                {isGuildMaster && guildId && (
                  <Button
                    onClick={() => router.push(`/community/guilds/${guildId}#manage`)}
                    className="rounded-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-white shadow-[0_8px_24px_rgba(210,49,135,0.4)] hover:shadow-[0_12px_32px_rgba(210,49,135,0.6)] transition-all duration-300"
                  >
                    Request Event
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Two Column Layout - Active and Scheduled */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Events Section */}
          <Card className={SECTION_CARD_CLASS}>
            <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
            <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl text-white">Active Battles</CardTitle>
                  </div>
                  <p className="text-xs text-foreground/60">Currently running events</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-3 py-1">
                  <span className="text-lg font-bold text-[#d23187]">{activeTotalCount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-5">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : activeEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <Flame className="mx-auto mb-3 h-12 w-12 text-foreground/20" />
                  <p className="text-sm text-foreground/60">No active battles right now</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {activeEvents.slice(0, 3).map(event => renderEventCard(event, false))}
                  {activeTotalCount > 4 && onViewModeChange && (
                    <Button
                      onClick={() => onViewModeChange('filtered', 'live')}
                      variant="outline"
                      className="w-full border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                    >
                      View All {activeTotalCount} Active Battles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Events Section */}
          <Card className={SECTION_CARD_CLASS}>
            <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
            <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl text-white">Scheduled Battles</CardTitle>
                  </div>
                  <p className="text-xs text-foreground/60">Upcoming events to register</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-3 py-1">
                  <span className="text-lg font-bold text-[#f5c16c]">{scheduledTotalCount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-5">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : scheduledEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <Target className="mx-auto mb-3 h-12 w-12 text-foreground/20" />
                  <p className="text-sm text-foreground/60">No scheduled battles yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {scheduledEvents.slice(0, 3).map(event => renderEventCard(event, false))}
                  {scheduledTotalCount > 4 && onViewModeChange && (
                    <Button
                      onClick={() => onViewModeChange('filtered', 'scheduled')}
                      variant="outline"
                      className="w-full border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                    >
                      View All {scheduledTotalCount} Scheduled Battles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Concluded Events Section - Full Width */}
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative z-10 border-b border-[#f5c16c]/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl text-white">Concluded Battles</CardTitle>
                </div>
                <p className="text-xs text-foreground/60">View past event results</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-gray-400/30 bg-gray-400/10 px-3 py-1">
                <span className="text-lg font-bold text-gray-400">{completedTotalCount}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-5">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-56 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : completedEvents.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy className="mx-auto mb-3 h-12 w-12 text-foreground/20" />
                <p className="text-sm text-foreground/60">No concluded battles yet</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {completedEvents.slice(0, 4).map(event => renderEventCard(event, true))}
                </div>
                {completedTotalCount > 4 && onViewModeChange && (
                  <Button
                    onClick={() => onViewModeChange('filtered', 'completed')}
                    variant="outline"
                    className="w-full mt-4 border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                  >
                    View All {completedTotalCount} Concluded Battles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtered Mode - Full grid view with pagination
  return (
    <div className="flex min-h-[80vh] flex-col gap-8">
      {/* Back Button and Filter Header */}
      <Card className={HERO_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
        <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />
        <CardContent className="relative z-10 p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {onViewModeChange && (
                <Button
                  onClick={() => onViewModeChange('dashboard')}
                  variant="outline"
                  className="border-[#f5c16c]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {currentStatusFilter === 'all' && 'All Battles'}
                  {currentStatusFilter === 'live' && 'Active Battles'}
                  {currentStatusFilter === 'scheduled' && 'Scheduled Battles'}
                  {currentStatusFilter === 'completed' && 'Concluded Battles'}
                  {currentStatusFilter === 'cancelled' && 'Cancelled Battles'}
                </h2>
                <p className="text-sm text-foreground/60 mt-1">
                  {events.length} {events.length === 1 ? 'event' : 'events'} found
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Filter By Status</span>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => onViewModeChange && onViewModeChange('filtered', filter.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      currentStatusFilter === filter.key
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
        </CardContent>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`${PANEL_SURFACE_CLASS} h-56 animate-pulse`} />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <Card className={`${PANEL_SURFACE_CLASS} text-center`}>
          <CardContent className="py-16 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-foreground/30" />
            <h3 className="mb-2 text-xl font-semibold text-white">No Battles Found</h3>
            <p className="text-foreground/60">Try exploring a different status or check back later for new tournaments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map(event => renderEventCard(event, false))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && sortedEvents.length > 0 && onPageChange && totalPages > 1 && (
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
  );
}
