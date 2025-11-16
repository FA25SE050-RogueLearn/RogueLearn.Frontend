"use client";

import { useCallback, useEffect, useState, startTransition, type CSSProperties } from 'react';
import { ArrowLeft, Trophy, Users, Bell, Timer, Gauge, Activity, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CodeEditor from '../CodeEditor';
import type { Event, Room } from '@/types/event-service';
import { mockLeaderboards, type LeaderboardEntry } from '@/lib/mockCodeBattleData';
import CountdownTimer from '@/components/CountdownTimer';

interface Notification {
  message: string;
  type: string;
  time: string;
}

interface CodeArenaViewProps {
  event: Event | null;
  room: Room | null;
  problemTitle: string;
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  submissionResult: string;
  spaceConstraintMb: number | null;
  onBack: () => void;
  eventId: string | null;
  roomId: string | null;
  eventSourceRef: React.RefObject<EventSource | null>;
  notifications: Notification[];
  eventSecondsLeft: number | null;
  eventEndDate: string | null;
}

const getVariantClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100';
    case 'error':
      return 'border-rose-400/40 bg-rose-500/15 text-rose-100';
    default:
      return 'border-[#f5c16c]/30 bg-[#f5c16c]/10 text-foreground/90';
  }
};

const formatSpaceConstraint = (mb: number | null) => {
  if (!mb) return 'Flexible';
  return `${mb} MB`;
};

const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const PANEL_TILE_CLASS = 'relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-[#120806]/60';
const TEXTURE_OVERLAY: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  mixBlendMode: 'lighten',
  opacity: 0.3,
};
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};
const BACKDROP_GRADIENT: CSSProperties = {
  background: 'radial-gradient(circle at top, rgba(210,49,135,0.25), transparent 60%), linear-gradient(180deg, #100414 0%, #06020b 60%, #010103 100%)',
};
const BACKDROP_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
  opacity: 0.08,
  mixBlendMode: 'screen',
};
const USE_MOCK_LEADERBOARD = true;

export default function CodeArenaView({
  event,
  room,
  problemTitle,
  code,
  setCode,
  language,
  setLanguage,
  onSubmit,
  submissionResult,
  spaceConstraintMb,
  onBack,
  eventId,
  roomId,
  eventSourceRef,
  notifications,
  eventSecondsLeft,
  eventEndDate,
}: CodeArenaViewProps) {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateLeaderboard = useCallback((incoming: LeaderboardEntry[]) => {
    startTransition(() => {
      const sorted = [...incoming].sort((a, b) => a.place - b.place);
      setLeaderboardEntries(sorted);
      setLastUpdated(new Date());
    });
  }, []);

  const clearLeaderboard = useCallback(() => {
    startTransition(() => {
      setLeaderboardEntries([]);
      setLastUpdated(null);
    });
  }, []);

  useEffect(() => {
    if (!roomId) {
      clearLeaderboard();
      return;
    }

    if (!USE_MOCK_LEADERBOARD) return;

    const mockData = mockLeaderboards[roomId] || [];
    updateLeaderboard(mockData);
  }, [roomId, updateLeaderboard, clearLeaderboard]);

  useEffect(() => {
    if (USE_MOCK_LEADERBOARD) return;

    const eventSource = eventSourceRef.current;
    if (!eventSource) return;

    const handleLeaderboardUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const incoming = payload?.Data;
        if (Array.isArray(incoming)) {
          updateLeaderboard(incoming);
        }
      } catch (error) {
        console.error('Error parsing leaderboard data:', error);
      }
    };

    eventSource.addEventListener('LEADERBOARD_UPDATED', handleLeaderboardUpdate);
    return () => {
      eventSource.removeEventListener('LEADERBOARD_UPDATED', handleLeaderboardUpdate);
    };
  }, [eventSourceRef, updateLeaderboard]);

  const champion = leaderboardEntries[0];
  const challengers = leaderboardEntries.slice(1, 3);
  const trailingEntries = leaderboardEntries.slice(3);
  const leadGap = champion && leaderboardEntries[1] ? champion.score - leaderboardEntries[1].score : null;
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Awaiting sync';

  const constraintTiles = [
    { label: 'Memory Cap', value: formatSpaceConstraint(spaceConstraintMb), icon: Gauge },
    { label: 'Live Alerts', value: notifications.length > 0 ? `${notifications.length} updates` : 'Silent', icon: Activity },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} />
      <div className="sticky top-0 z-50 border-b border-[#f5c16c]/30 bg-[#0b0504]/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="rounded-full border-[#f5c16c]/30 bg-[#140707]/80 px-5 text-[10px] uppercase tracking-[0.35em]"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Exit Arena
            </Button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#f5c16c]">Current Challenge</span>
              <span className="text-xl font-semibold text-white">{problemTitle}</span>
              <p className="text-xs text-foreground/55">Deploy code, earn glory, climb the board.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#f5c16c]/25 bg-[#140707]/80 px-4 py-2 text-xs text-foreground/70">
              <Users className="h-4 w-4 text-[#f5c16c]" />
              {room?.Name || 'Room'}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#d23187]/30 bg-[#d23187]/15 px-4 py-2 text-xs font-semibold text-white">
              <Trophy className="h-4 w-4 text-[#d23187]" />
              {event?.Title || 'Event'}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.85fr]">
          <div className="space-y-6">
            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardContent className="relative z-10 space-y-6 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]">Mission Briefing</p>
                    <h1 className="mt-2 text-3xl font-bold text-white">{problemTitle}</h1>
                    <p className="mt-2 text-sm text-foreground/60">Submit your solution to earn points and keep your guild on top.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{event?.Type || 'Code Battle'}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{room?.Name || 'Unassigned Room'}</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Event Timer with Animated Countdown */}
                  {eventEndDate && (
                    <div className={`${PANEL_TILE_CLASS} flex flex-col items-center gap-3 border-[#f5c16c]/40 bg-linear-to-br from-[#d23187]/15 via-[#120806]/60 to-[#120806]/60 px-4 py-4 shadow-[0_0_20px_rgba(245,193,108,0.2)]`}>
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-[#f5c16c]" />
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5c16c]">Event Timer</p>
                      </div>
                      <CountdownTimer
                        endDate={eventEndDate}
                        fontSize={18}
                        gap={3}
                        borderRadius={6}
                        horizontalPadding={6}
                        textColor="#ffffff"
                        fontWeight="black"
                        gradientHeight={12}
                        gradientFrom="rgba(0, 0, 0, 0.4)"
                        gradientTo="transparent"
                        showLabels={false}
                        counterStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(245, 193, 108, 0.4)',
                          borderRadius: '6px',
                          boxShadow: '0 0 15px rgba(245, 193, 108, 0.25)',
                        }}
                        digitStyle={{
                          textShadow: '0 0 10px rgba(245, 193, 108, 1), 0 2px 6px rgba(0, 0, 0, 0.7)',
                        }}
                      />
                    </div>
                  )}

                  {constraintTiles.map(({ label, value, icon: Icon }) => (
                    <div key={label} className={`${PANEL_TILE_CLASS} flex items-center gap-3 px-4 py-3`}>
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d23187]/15 text-[#f5c16c]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5c16c]/80">{label}</p>
                        <p className="text-sm font-semibold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                  <Cpu className="h-4 w-4 text-[#f5c16c]" />
                  Combat Console
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 p-6">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  onSubmit={onSubmit}
                  submissionResult={submissionResult}
                  spaceConstraintMb={spaceConstraintMb}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Activity className="h-4 w-4 text-[#f5c16c]" />
                  Arena Status
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4 text-sm text-foreground/70">
                <div className={`${PANEL_TILE_CLASS} p-4`}>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Event</p>
                  <p className="text-lg font-semibold text-white">{event?.Title || 'Awaiting Event'}</p>
                  <p className="text-xs text-foreground/60">{event ? `${new Date(event.StartedDate).toLocaleString()} → ${new Date(event.EndDate).toLocaleString()}` : 'Dates pending'}</p>
                </div>
                <div className={`${PANEL_TILE_CLASS} p-4`}>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Room</p>
                  <p className="text-lg font-semibold text-white">{room?.Name || 'No room joined'}</p>
                  <p className="text-xs text-foreground/60">{room?.Description || 'Select a room to sync leaderboard and feed.'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`${SECTION_CARD_CLASS} overflow-hidden`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                <CardTitle className="flex items-start justify-between text-base font-semibold text-white">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#f5c16c]" />
                    Arena Leaderboard
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.35em] text-[#f5c16c]/70">
                    {eventId ? `Event ${eventId.slice(0, 8)}` : 'Event Pending'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-5">
                {!roomId ? (
                  <p className="text-sm text-foreground/60">Join a room to sync its ranking ladder.</p>
                ) : leaderboardEntries.length === 0 ? (
                  <p className="text-sm text-foreground/60">No combatants ranked yet. Launch your first submission.</p>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className={`${PANEL_TILE_CLASS} p-4`}>
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5c16c]/80">Active Fighters</p>
                        <p className="text-xl font-semibold text-white">{leaderboardEntries.length}</p>
                      </div>
                      <div className={`${PANEL_TILE_CLASS} p-4`}>
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5c16c]/80">Top Score</p>
                        <p className="text-xl font-semibold text-white">{champion?.score ?? '—'} pts</p>
                      </div>
                      <div className={`${PANEL_TILE_CLASS} p-4`}>
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5c16c]/80">Last Update</p>
                        <p className="text-xl font-semibold text-white">{lastUpdatedLabel}</p>
                      </div>
                    </div>

                    {champion && (
                      <div className="relative overflow-hidden rounded-3xl border border-[#f5c16c]/30 bg-linear-to-br from-[#d23187]/20 via-[#f5c16c]/10 to-transparent p-5 shadow-[0_10px_40px_rgba(210,49,135,0.25)]">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Current Champion</p>
                            <p className="mt-1 text-3xl font-bold text-white">{champion.player_name}</p>
                            <p className="text-sm text-foreground/70">Holding {champion.score} pts</p>
                          </div>
                          <div className="flex flex-col items-center gap-2 text-center md:items-end">
                            <span className="text-[11px] uppercase tracking-[0.4em] text-white/60">Lead</span>
                            <span className="text-4xl font-black text-[#f5c16c]">{leadGap ?? '—'}</span>
                            <span className="text-xs text-foreground/60">vs next rival</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {challengers.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {challengers.map((entry) => (
                          <div key={entry.place} className={`${PANEL_TILE_CLASS} flex items-center justify-between rounded-3xl p-4`}>
                            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                            <div className="relative z-10 flex items-center gap-4">
                              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d23187]/15 text-lg font-semibold text-[#f5c16c]">
                                #{entry.place}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-white">{entry.player_name}</p>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]/70">{entry.score} pts</p>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.35em] text-foreground/50">Challenger</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {trailingEntries.length > 0 && (
                      <div className={`${PANEL_TILE_CLASS} rounded-3xl p-0`}>
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                        <div className="relative z-10 max-h-60 divide-y divide-white/5 overflow-y-auto">
                          {trailingEntries.map((entry) => (
                            <div key={entry.place} className="flex items-center justify-between px-4 py-3 text-sm text-foreground/80">
                              <span className="flex items-center gap-3">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">#{entry.place}</span>
                                <span className="font-medium text-white">{entry.player_name}</span>
                              </span>
                              <span className="text-xs font-semibold text-white">{entry.score} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                  <Bell className="h-4 w-4 text-[#f5c16c]" />
                  Arena Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-foreground/50">Silence across the nexus.</p>
                  ) : (
                    notifications.slice(-10).reverse().map((notification, index) => {
                      const variantClasses = getVariantClasses(notification.type);
                      return (
                        <div key={`${notification.time}-${index}`} className={`rounded-2xl border px-4 py-2 text-xs ${variantClasses}`}>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em]">
                            <span>Arena Update</span>
                            <span>{notification.time}</span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-white">{notification.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardContent className="relative z-10 space-y-4 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <svg className="h-4 w-4 text-[#f5c16c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Combat Tips
                </h3>
                <ul className="space-y-3 text-xs text-foreground/70">
                  {[
                    'Audit the full prompt before touching the keyboard.',
                    'Sketch edge cases and input limits in comments first.',
                    'Run sample inputs locally before submitting to the judges.',
                    'Glance at constraints to avoid timeouts or memory traps.',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#f5c16c]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
