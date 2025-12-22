"use client";

import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Swords, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  if (difficulty === 1) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  if (difficulty === 2) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
};

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty === 1) return 'Easy';
  if (difficulty === 2) return 'Medium';
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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const selectedRoom = rooms.find(r => r.ID === selectedRoomId);
  const selectedProblem = problems.find(p => p.id === selectedProblemId);

  const handleBackClick = () => {
    // Only show warning if user is in a room
    if (selectedRoomId) {
      setShowLeaveDialog(true);
    } else {
      onBack();
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveDialog(false);
    onBack();
  };

  type DifficultyBuckets = { easy: number; medium: number; hard: number };

  const difficultySpread = useMemo(() => {
    const initialBuckets: DifficultyBuckets = { easy: 0, medium: 0, hard: 0 };
    return problems.reduce<DifficultyBuckets>((acc, curr) => {
      if (curr.difficulty === 1) acc.easy += 1;
      else if (curr.difficulty === 2) acc.medium += 1;
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
              <button type="button" onClick={handleBackClick} className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-[#f5c16c] hover:text-[#f9d9eb] transition-colors">
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
                  {event?.EndDate && event?.StartedDate && (() => {
                    const now = new Date();
                    const startDate = new Date(event.StartedDate || event.started_date);
                    const endDate = new Date(event.EndDate || event.end_date);
                    const hasStarted = now >= startDate;
                    const countdownDate = hasStarted ? endDate : startDate;
                    const countdownLabel = hasStarted ? 'Time Left' : 'Starts In';

                    return (
                      <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#f5c16c]/40 bg-linear-to-br from-[#d23187]/20 via-[#f5c16c]/10 to-transparent px-4 py-3 shadow-[0_0_25px_rgba(245,193,108,0.25)]">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-[#f5c16c]">{countdownLabel}</p>
                        <CountdownTimer
                          endDate={countdownDate.toISOString()}
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
                    );
                  })()}
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

      {/* Show Rooms List when no room is selected */}
      {!selectedRoomId ? (
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative z-10 flex flex-col gap-3 border-b border-white/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-white">
                Battle Rooms
              </CardTitle>
              <p className="text-xs text-foreground/55">Choose where your party drops in.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              No room locked in
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-5">
            {loadingRooms ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={`${PANEL_TILE_CLASS} h-32 animate-pulse`} />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              renderEmptyState(<span className="text-4xl">🏠</span>, 'No rooms available yet')
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <button
                    type="button"
                    key={room.ID}
                    onClick={() => onSelectRoom(room.ID)}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0504]/80 p-6 text-left transition-all hover:border-[#d23187]/40 hover:bg-[#1d0b09] hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,193,108,0.08),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/80">{buildRoomTag(room)}</p>
                        <Swords className="h-5 w-5 text-[#d23187] group-hover:text-[#f5c16c] transition-colors" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{room.Name}</h3>
                      {room.Description && (
                        <p className="text-xs text-foreground/60 line-clamp-2">{room.Description}</p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-xs text-[#f5c16c]">
                        <ArrowRight className="h-3 w-3" />
                        <span>Enter Room</span>
                      </div>
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
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;

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
      ) : (
        /* Show Problems and Mission Briefing when room is selected */
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Challenges */}
          <Card className={SECTION_CARD_CLASS}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
            <CardHeader className="relative z-10 border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">
                  Challenges
                </CardTitle>
                <Button
                  onClick={() => onSelectRoom('')}
                  size="sm"
                  variant="ghost"
                  className="text-xs text-[#f5c16c] hover:text-[#f9d9eb]"
                >
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Change Room
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-5">
              {loadingProblems ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={`${PANEL_TILE_CLASS} h-28 animate-pulse`} />
                  ))}
                </div>
              ) : problems.length === 0 ? (
                renderEmptyState(<span className="text-4xl">📋</span>, 'No challenges in this room')
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
                                if (index % 2 === 1) {
                                  const lines = part.split('\n');
                                  const code = lines.slice(1).join('\n');
                                  return (
                                    <pre key={index} className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-2 text-[10px] text-white">
                                      <code>{code}</code>
                                    </pre>
                                  );
                                }
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

          {/* Mission Briefing */}
          <div className="space-y-6">
            <Card className={SECTION_CARD_CLASS}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-sm font-semibold text-white">
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
      )}

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

      {/* Leave Room Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="border-[#d23187]/30 bg-[#120806]/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-amber-500/10 p-3">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl text-white">
              Leave Battle Arena?
            </DialogTitle>
            <DialogDescription className="text-center text-base text-foreground/70">
              <span className="block mt-2">
                If you leave this room, you <span className="font-semibold text-red-400">cannot rejoin</span> once you exit.
              </span>
              <span className="block mt-2">
                Your progress will be saved, but you won&apos;t be able to continue in this arena.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              className="flex-1 border-[#f5c16c]/40 bg-white/5 text-[#f5c16c] hover:bg-[#f5c16c]/20"
            >
              Stay in Room
            </Button>
            <Button
              onClick={handleConfirmLeave}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
            >
              Leave Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
