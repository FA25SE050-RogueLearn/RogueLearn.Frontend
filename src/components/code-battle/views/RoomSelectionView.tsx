"use client";

import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Users, Code, Trophy, Swords, Map, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Room, Problem, Event } from '@/types/event-service';
import CountdownTimer from '@/components/CountdownTimer';

interface RoomSelectionViewProps {
  event: Event | null;
  rooms: Room[];
  problems: Problem[];
  loadingRooms: boolean;
  loadingProblems: boolean;
  selectedRoomId: string | null;
  selectedProblemId: string | null;
  onBack: () => void;
  onSelectRoom: (roomId: string) => void;
  onSelectProblem: (problemId: string, title: string, statement: string) => void;
  onStartCoding: () => void;
  eventSecondsLeft: number | null;
  eventEndDate: string | null;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const buildRoomTag = (room: Room) => {
  const createdDate = new Date(room.CreatedDate);
  if (Number.isNaN(createdDate.getTime())) {
    return 'ACTIVE';
  }

  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(createdDate);

  return `OPENED ${formatted.toUpperCase()}`;
};

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 3) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  if (difficulty <= 6) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
};

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty <= 3) return 'Easy';
  if (difficulty <= 6) return 'Medium';
  return 'Hard';
};

const formatEventWindow = (start?: string, end?: string) => {
  if (!start || !end) return 'TBD';
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${formatter.format(new Date(start))} — ${formatter.format(new Date(end))}`;
};

const HERO_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#d23187]/35 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]';
const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const PANEL_TILE_CLASS = 'relative overflow-hidden rounded-2xl border border-[#f5c16c]/20 bg-[#120806]/60';
const CTA_CLASS = 'rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.4)]';
const TEXTURE_OVERLAY: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  mixBlendMode: 'lighten',
  opacity: 0.3,
};
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

export default function RoomSelectionView({
  event,
  rooms,
  problems,
  loadingRooms,
  loadingProblems,
  selectedRoomId,
  selectedProblemId,
  onBack,
  onSelectRoom,
  onSelectProblem,
  onStartCoding,
  eventSecondsLeft,
  eventEndDate,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: RoomSelectionViewProps) {
  const selectedRoom = rooms.find(r => r.ID === selectedRoomId);
  const selectedProblem = problems.find(p => p.id === selectedProblemId);

  type DifficultyBuckets = { easy: number; medium: number; hard: number };

  const difficultySpread = useMemo(() => {
    const initialBuckets: DifficultyBuckets = { easy: 0, medium: 0, hard: 0 };
    return problems.reduce<DifficultyBuckets>((acc, curr) => {
      if (curr.difficulty <= 3) acc.easy += 1;
      else if (curr.difficulty <= 6) acc.medium += 1;
      else acc.hard += 1;
      return acc;
    }, { ...initialBuckets });
  }, [problems]);

  const steps = [
    { label: 'Choose Room', description: 'Find a squad-ready arena', active: Boolean(selectedRoomId) },
    { label: 'Pick Challenge', description: 'Lock your contract', active: Boolean(selectedProblemId) },
    { label: 'Start Coding', description: 'Deploy to battlefield', active: Boolean(selectedRoomId && selectedProblemId) },
  ];

  const renderEmptyState = (icon: ReactNode, text: string) => (
    <Card className={SECTION_CARD_CLASS}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
      <CardContent className="relative z-10 py-12 text-center text-foreground/60">
        <div className="mb-4 flex justify-center text-foreground/30">{icon}</div>
        <p>{text}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-[80vh] flex-col gap-10">
      {/* Hero / Breadcrumb */}
      <Card className={HERO_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,193,108,0.25),transparent_60%)]" />
        <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />
        <CardContent className="relative z-10 flex flex-col gap-8 p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl text-white">
            <div className="mb-4 flex items-center gap-3 text-sm text-foreground/60">
              <button type="button" onClick={onBack} className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-[#f5c16c]">
                <ArrowLeft className="mr-2 h-3 w-3" />
                Events
              </button>
              <span>/</span>
              <span className="text-white/80">{event?.Title}</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight">{event?.Title || 'Code Battle Event'}</h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/70">{event?.Description || 'Select a war room and contract to begin your roguelike coding duel.'}</p>
            <div className="mt-6 grid gap-4 text-left text-sm sm:grid-cols-2">
              <div className={`${PANEL_TILE_CLASS} p-4 text-[#f9d9eb]`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Active Rooms</p>
                <p className="mt-1 text-2xl font-semibold text-white">{rooms.length || '—'}</p>
              </div>
              <div className={`${PANEL_TILE_CLASS} p-4 text-[#f9d9eb]`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Challenges</p>
                <p className="mt-1 text-2xl font-semibold text-white">{problems.length || '—'}</p>
              </div>
              <div className={`${PANEL_TILE_CLASS} col-span-2 p-4 text-[#f9d9eb]`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Battle Window</p>
                    <p className="mt-1 text-lg font-semibold text-white">{formatEventWindow(event?.StartedDate, event?.EndDate)}</p>
                  </div>
                  {event?.EndDate && (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#f5c16c]/40 bg-linear-to-br from-[#d23187]/20 via-[#f5c16c]/10 to-transparent px-4 py-3 shadow-[0_0_25px_rgba(245,193,108,0.25)]">
                      <p className="text-[9px] uppercase tracking-[0.35em] text-[#f5c16c]">Countdown</p>
                      <CountdownTimer
                        endDate={event.EndDate}
                        fontSize={24}
                        gap={3}
                        borderRadius={8}
                        horizontalPadding={8}
                        textColor="#ffffff"
                        fontWeight="black"
                        gradientHeight={14}
                        gradientFrom="rgba(0, 0, 0, 0.4)"
                        gradientTo="transparent"
                        showLabels={false}
                        counterStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(245, 193, 108, 0.3)',
                          borderRadius: '8px',
                          boxShadow: '0 0 15px rgba(245, 193, 108, 0.2)',
                        }}
                        digitStyle={{
                          textShadow: '0 0 10px rgba(245, 193, 108, 0.9), 0 2px 6px rgba(0, 0, 0, 0.6)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.label} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs uppercase tracking-wider ${
                step.active ? 'border-[#d23187]/60 bg-[#d23187]/15 text-white shadow-[0_8px_25px_rgba(210,49,135,0.25)]' : 'border-white/10 bg-white/5 text-white/70'
              }`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                  step.active ? 'border-[#f5c16c]/60 text-[#f5c16c]' : 'border-white/20 text-white/60'
                }`}>
                  {index + 1}
                </span>
                <div className="text-left">
                  <p className="font-semibold">{step.label}</p>
                  <p className="text-[10px] normal-case text-white/60">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Rooms */}
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative z-10 flex flex-col gap-3 border-b border-white/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <Users className="h-5 w-5 text-[#f5c16c]" />
                Battle Rooms
              </CardTitle>
              <p className="text-xs text-foreground/55">Choose where your party drops in.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <Trophy className="h-4 w-4 text-[#d23187]" />
              {selectedRoom ? `${selectedRoom.Name} selected` : 'No room locked in'}
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-5">
            {loadingRooms ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className={`${PANEL_TILE_CLASS} h-32 animate-pulse`} />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              renderEmptyState(<Users className="h-12 w-12" />, 'No rooms available yet')
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {rooms.map((room) => (
                  <button
                    type="button"
                    key={room.ID}
                    onClick={() => onSelectRoom(room.ID)}
                    className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all ${
                      selectedRoomId === room.ID
                        ? 'border-[#d23187]/60 bg-[#2b1310] shadow-[0_12px_30px_rgba(210,49,135,0.35)]'
                        : 'border-white/10 bg-[#0f0504]/80 hover:border-[#d23187]/40 hover:bg-[#1d0b09]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,193,108,0.08),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/80">{buildRoomTag(room)}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{room.Name}</h3>
                        {room.Description && <p className="mt-1 text-xs text-foreground/60">{room.Description}</p>}
                      </div>
                      <Swords className="h-5 w-5 text-[#d23187]" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loadingRooms && rooms.length > 0 && onPageChange && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
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
          </CardContent>
        </Card>

        {/* Selected Room + Challenges */}
        <div className="space-y-6">
          <Card className={SECTION_CARD_CLASS}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
            <CardHeader className="relative z-10 border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                <Code className="h-5 w-5 text-[#f5c16c]" />
                Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-5">
              {!selectedRoomId ? (
                renderEmptyState(<Map className="h-12 w-12" />, 'Select a room to reveal contracts')
              ) : loadingProblems ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={`${PANEL_TILE_CLASS} h-28 animate-pulse`} />
                  ))}
                </div>
              ) : problems.length === 0 ? (
                renderEmptyState(<Code className="h-12 w-12" />, 'No challenges in this room')
              ) : (
                <div className="space-y-4">
                  {problems.map((problem) => (
                    <button
                      type="button"
                      key={problem.id}
                      onClick={() => onSelectProblem(problem.id, problem.title, problem.problem_statement || '')}
                      className={`relative w-full overflow-hidden rounded-3xl border p-5 text-left transition-all ${
                        selectedProblemId === problem.id
                          ? 'border-[#d23187]/60 bg-[#2b1310] shadow-[0_12px_30px_rgba(210,49,135,0.35)]'
                          : 'border-white/10 bg-[#0f0504]/80 hover:border-[#d23187]/40 hover:bg-[#1d0b09]'
                      }`}
                    >
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]/85">Contract</p>
                          <h3 className="mt-2 text-lg font-semibold text-white">{problem.title}</h3>
                          {problem.problem_statement && (
                            <div className="mt-2 space-y-1">
                              {problem.problem_statement.split('```').map((part, index) => {
                                // Odd indices are code blocks
                                if (index % 2 === 1) {
                                  const lines = part.split('\n');
                                  const lang = lines[0].trim();
                                  const code = lines.slice(1).join('\n');
                                  return (
                                    <pre key={index} className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-2 text-[10px] text-white">
                                      <code>{code}</code>
                                    </pre>
                                  );
                                }
                                // Even indices are regular text
                                return (
                                  <p key={index} className="line-clamp-2 text-xs text-foreground/60">
                                    {part.trim()}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                          {getDifficultyLabel(problem.difficulty)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={SECTION_CARD_CLASS}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-[#f5c16c]" />
                Mission Briefing
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 text-sm text-foreground/70">
              <div className={`${PANEL_TILE_CLASS} p-4`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Selected Room</p>
                {selectedRoom ? (
                  <>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedRoom.Name}</p>
                    {selectedRoom.Description && <p className="mt-1 text-xs text-foreground/60">{selectedRoom.Description}</p>}
                  </>
                ) : (
                  <p className="mt-1 text-xs text-foreground/60">Pick a room to unlock perks.</p>
                )}
              </div>

              <div className={`${PANEL_TILE_CLASS} p-4`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Selected Contract</p>
                {selectedProblem ? (
                  <>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedProblem.title}</p>
                    <p className="mt-1 text-xs text-foreground/60">{getDifficultyLabel(selectedProblem.difficulty)} Difficulty</p>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-foreground/60">Choose a challenge to view intel.</p>
                )}
              </div>

              <div className={`${PANEL_TILE_CLASS} p-4`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                <p className="text-xs uppercase tracking-[0.3em] text-[#f5c16c]">Challenge Spread</p>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-emerald-300">Easy {difficultySpread.easy}</span>
                  <span className="text-yellow-300">Mid {difficultySpread.medium}</span>
                  <span className="text-rose-300">Hard {difficultySpread.hard}</span>
                </div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/5">
                  {(['easy', 'medium', 'hard'] as const).map((key) => (
                    <span
                      key={key}
                      className={
                        key === 'easy'
                          ? 'bg-emerald-400'
                          : key === 'medium'
                          ? 'bg-yellow-400'
                          : 'bg-rose-400'
                      }
                      style={{ width: problems.length ? `${(difficultySpread[key] / problems.length) * 100}%` : '0%' }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedRoomId && selectedProblemId && (
        <div className="flex justify-center">
          <Button
            onClick={onStartCoding}
            className={`${CTA_CLASS} px-12 py-5 text-sm font-bold uppercase tracking-[0.4em] transition-all hover:scale-105`}
          >
            Start Coding
            <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
