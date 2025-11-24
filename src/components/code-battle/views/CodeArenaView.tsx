"use client";

import { useCallback, useEffect, useState, startTransition, type CSSProperties } from 'react';
import { ArrowLeft, Trophy, Users, Timer, Gauge, Activity, Cpu } from 'lucide-react';
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
  problemStatement: string;
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  submissionResult: string;
  isSubmitting: boolean;
  spaceConstraintMb: number | null;
  onBack: () => void;
  eventId: string | null;
  roomId: string | null;
  eventSourceRef: React.RefObject<EventSource | null>;
  notifications: Notification[];
  leaderboardData: Array<{ place: number; player_name: string; score: number }>;
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
const USE_MOCK_LEADERBOARD = false;

export default function CodeArenaView({
  event,
  room,
  problemTitle,
  problemStatement,
  code,
  setCode,
  language,
  setLanguage,
  onSubmit,
  submissionResult,
  isSubmitting,
  spaceConstraintMb,
  onBack,
  eventId,
  roomId,
  eventSourceRef,
  notifications,
  leaderboardData,
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

  // Update leaderboard when prop changes
  useEffect(() => {
    if (leaderboardData && leaderboardData.length > 0) {
      updateLeaderboard(leaderboardData);
    }
  }, [leaderboardData, updateLeaderboard]);

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
        <div className="space-y-6">
          {/* Mission Briefing and Sidebar - Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Mission Briefing */}
            <Card className={`${SECTION_CARD_CLASS} h-full`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardContent className="relative z-10 space-y-6 p-6 h-full flex flex-col">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f5c16c]/80">{event?.Type || 'Code Battle'}</span>
                    <span className="rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#d23187]">{room?.Name || 'Unassigned Room'}</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]">Mission Briefing</p>
                    <h1 className="mt-2 text-3xl font-bold text-white">{problemTitle}</h1>
                    <p className="mt-2 text-sm text-foreground/60">Submit your solution to earn points and keep your guild on top.</p>
                    {problemStatement && (
                      <div className="mt-4 space-y-3 rounded-2xl border border-[#f5c16c]/20 bg-[#0f0504]/60 p-4 flex-1 overflow-y-auto">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Requirements</p>
                          <span className="shrink-0 rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#f5c16c]">
                            Sample
                          </span>
                        </div>
                        <p className="text-[10px] italic text-foreground/50">
                          Note: This is a sample test case for reference. Your submission will be evaluated against additional hidden test cases.
                        </p>
                        <div className="space-y-2 text-sm text-foreground/80">
                          {problemStatement.split('```').map((part, index) => {
                            // Odd indices are code blocks
                            if (index % 2 === 1) {
                              const lines = part.split('\n');
                              const lang = lines[0].trim();
                              const code = lines.slice(1).join('\n');
                              return (
                                <pre key={index} className="overflow-x-auto rounded-lg border border-[#f5c16c]/30 bg-black/60 p-3 text-xs font-mono text-white">
                                  <code>{code}</code>
                                </pre>
                              );
                            }
                            // Even indices are regular text
                            if (part.trim()) {
                              return (
                                <p key={index} className="leading-relaxed text-foreground/70">
                                  {part.trim()}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
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

            {/* Sidebar with Arena Status and Leaderboard stacked */}
            <div className="space-y-6 flex flex-col">
              <Card className={`${SECTION_CARD_CLASS} flex-1`}>
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
                    <p className="text-xs text-foreground/60">{event && event.StartedDate && event.EndDate ? `${new Date(event.StartedDate).toLocaleString()} → ${new Date(event.EndDate).toLocaleString()}` : 'Dates pending'}</p>
                  </div>
                  <div className={`${PANEL_TILE_CLASS} p-4`}>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                    <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Room</p>
                    <p className="text-lg font-semibold text-white">{room?.Name || 'No room joined'}</p>
                    <p className="text-xs text-foreground/60">{room?.Description || 'Select a room to sync leaderboard and feed.'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${SECTION_CARD_CLASS} overflow-hidden flex-1`}>
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
                <CardContent className="relative z-10 space-y-4 overflow-y-auto max-h-[500px]">
                  {!roomId ? (
                    <p className="text-sm text-foreground/60">Join a room to sync its ranking ladder.</p>
                  ) : leaderboardEntries.length === 0 ? (
                    <p className="text-sm text-foreground/60">No combatants ranked yet. Launch your first submission.</p>
                  ) : (
                    <>
                      <div className="grid gap-2 grid-cols-3">
                        <div className={`${PANEL_TILE_CLASS} p-3`}>
                          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                          <p className="text-[9px] uppercase tracking-[0.3em] text-[#f5c16c]/80">Active</p>
                          <p className="text-lg font-semibold text-white">{leaderboardEntries.length}</p>
                        </div>
                        <div className={`${PANEL_TILE_CLASS} p-3`}>
                          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                          <p className="text-[9px] uppercase tracking-[0.3em] text-[#f5c16c]/80">Top Score</p>
                          <p className="text-lg font-semibold text-white">{champion?.score ?? '—'}</p>
                        </div>
                        <div className={`${PANEL_TILE_CLASS} p-3`}>
                          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                          <p className="text-[9px] uppercase tracking-[0.3em] text-[#f5c16c]/80">Updated</p>
                          <p className="text-[10px] font-semibold text-white">{lastUpdatedLabel}</p>
                        </div>
                      </div>

                      {champion && (
                        <div className="relative overflow-hidden rounded-2xl border border-[#f5c16c]/30 bg-linear-to-br from-[#d23187]/20 via-[#f5c16c]/10 to-transparent p-4 shadow-[0_10px_40px_rgba(210,49,135,0.25)]">
                          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                          <div className="relative z-10 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5c16c]">Champion</p>
                              <div className="mt-1 flex items-center gap-2">
                                <p className="text-xl font-bold text-white">{champion.player_name}</p>
                                {champion.state === 'present' ? (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                ) : champion.state === 'disconnected' ? (
                                  <span className="inline-flex h-2 w-2 rounded-full bg-gray-500"></span>
                                ) : null}
                              </div>
                              <p className="text-xs text-foreground/70">{champion.score} pts</p>
                            </div>
                            {leadGap !== null && (
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Lead</p>
                                <p className="text-2xl font-black text-[#f5c16c]">{leadGap}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {challengers.length > 0 && (
                        <div className="space-y-2">
                          {challengers.map((entry) => (
                            <div key={entry.place} className={`${PANEL_TILE_CLASS} flex items-center justify-between rounded-2xl p-3`}>
                              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                              <div className="relative z-10 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d23187]/15 text-base font-semibold text-[#f5c16c]">
                                  #{entry.place}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-white">{entry.player_name}</p>
                                    {entry.state === 'present' ? (
                                      <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                    ) : entry.state === 'disconnected' ? (
                                      <span className="inline-flex h-2 w-2 rounded-full bg-gray-500"></span>
                                    ) : null}
                                  </div>
                                  <p className="text-xs text-[#f5c16c]/70">{entry.score} pts</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {trailingEntries.length > 0 && (
                        <div className={`${PANEL_TILE_CLASS} rounded-2xl p-0`}>
                          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                          <div className="relative z-10 max-h-40 divide-y divide-white/5 overflow-y-auto">
                            {trailingEntries.map((entry) => (
                              <div key={entry.place} className="flex items-center justify-between px-3 py-2 text-sm text-foreground/80">
                                <span className="flex items-center gap-2">
                                  <span className="text-xs text-[#f5c16c]/70">#{entry.place}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-white">{entry.player_name}</span>
                                    {entry.state === 'present' ? (
                                      <span className="flex h-1.5 w-1.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                      </span>
                                    ) : entry.state === 'disconnected' ? (
                                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                                    ) : null}
                                  </div>
                                </span>
                                <span className="text-xs font-semibold text-white">{entry.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Combat Console - Full Width */}
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
                isSubmitting={isSubmitting}
                spaceConstraintMb={spaceConstraintMb}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
