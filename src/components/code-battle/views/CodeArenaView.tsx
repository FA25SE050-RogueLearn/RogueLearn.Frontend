"use client";

import { useCallback, useEffect, useState, startTransition, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Timer, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CodeEditor from '../CodeEditor';
import type { Event, Room } from '@/types/event-service';
import { mockLeaderboards, type LeaderboardEntry } from '@/lib/mockCodeBattleData';
import CountdownTimer from '@/components/CountdownTimer';
import { toast } from 'sonner';

interface Notification {
  message: string;
  type: string;
  time: string;
}

interface Problem {
  id: string;
  title: string;
  problem_statement: string;
  difficulty: number;
  supported_languages?: string[];
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
  problems?: Problem[];
  selectedProblemId?: string | null;
  onProblemChange?: (problemId: string) => void;
}

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
  problems = [],
  selectedProblemId,
  onProblemChange,
}: CodeArenaViewProps) {
  const router = useRouter();
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [eventEnded, setEventEnded] = useState(false);

  // Handle event timer completion
  const handleEventTimeout = useCallback(() => {
    if (eventEnded) return;

    setEventEnded(true);

    // Show notification
    toast.success('Event has ended!', {
      description: 'The code battle event has concluded. Redirecting to events...',
      duration: 5000,
    });

    // Redirect to the event results/leaderboard page after 3 seconds
    setTimeout(() => {
      if (eventId) {
        router.push(`/code-battle`);
      } else {
        onBack();
      }
    }, 3000);
  }, [eventEnded, eventId, router, onBack]);

  const updateLeaderboard = useCallback((incoming: LeaderboardEntry[]) => {
    startTransition(() => {
      const sorted = [...incoming].sort((a, b) => a.place - b.place);
      setLeaderboardEntries(sorted);
    });
  }, []);

  useEffect(() => {
    if (leaderboardData && leaderboardData.length > 0) {
      updateLeaderboard(leaderboardData);
    }
  }, [leaderboardData, updateLeaderboard]);

  const clearLeaderboard = useCallback(() => {
    startTransition(() => {
      setLeaderboardEntries([]);
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

  const topPlayers = leaderboardEntries.slice(0, 5);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} />

      {/* Event Ended Overlay */}
      {eventEnded && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="mx-4 max-w-md rounded-[24px] border-2 border-[#f5c16c]/50 bg-gradient-to-br from-[#1a0b08] via-[#2a1510] to-[#1a0b08] p-8 text-center shadow-[0_0_60px_rgba(210,49,135,0.5)]">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#f5c16c]/10 p-4">
                <Clock className="h-16 w-16 text-[#f5c16c]" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white">Event Has Ended!</h2>
            <p className="mb-6 text-sm text-[#f5c16c]/70">
              The code battle event has concluded. Redirecting you to the leaderboard...
            </p>
            <div className="flex justify-center">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-[#f5c16c]/20">
                <div className="h-full w-full animate-pulse bg-gradient-to-r from-[#f5c16c] to-[#d23187]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-[#f5c16c]/20 bg-[#0b0504]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="rounded-lg border-[#f5c16c]/30 bg-[#140707]/80 px-4 text-[10px] uppercase tracking-wider hover:bg-[#f5c16c]/10"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{event?.Title || 'Code Battle'}</span>
              <span className="text-xs text-foreground/50">•</span>
              <span className="text-xs text-foreground/70">{room?.Name || 'Room'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Problem Chooser Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-[#f5c16c]/30 bg-[#140707]/80 px-4 text-xs hover:bg-[#f5c16c]/10"
                >
                  {selectedProblemId && problems.length > 0
                    ? problems.find(p => p.id === selectedProblemId)?.title || 'Choose Problem'
                    : 'Choose Problem'}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#140707]/95 border-[#f5c16c]/30 backdrop-blur-xl">
                {problems.length > 0 ? (
                  problems.map((problem) => (
                    <DropdownMenuItem
                      key={problem.id}
                      onClick={() => onProblemChange?.(problem.id)}
                      className="text-xs text-white cursor-pointer hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                    >
                      {problem.title}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-xs text-foreground/50">
                    No problems available
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Dropdown */}
            {(() => {
              const selectedProblem = problems.find(p => p.id === selectedProblemId);
              const supportedLanguages = selectedProblem?.supported_languages || ['Python', 'Golang', 'Javascript'];
              const languageDisplayMap: Record<string, string> = {
                'python': 'Python',
                'go': 'Golang',
                'golang': 'Golang',
                'javascript': 'Javascript',
                'js': 'Javascript',
              };
              const languageCodeMap: Record<string, string> = {
                'Python': 'python',
                'Golang': 'go',
                'Javascript': 'javascript',
              };
              const displayLanguage = languageDisplayMap[language.toLowerCase()] || language;
              
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-[#f5c16c]/30 bg-[#140707]/80 px-4 text-xs hover:bg-[#f5c16c]/10"
                    >
                      Language: {displayLanguage}
                      <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 bg-[#140707]/95 border-[#f5c16c]/30 backdrop-blur-xl">
                    {supportedLanguages.map((lang) => (
                      <DropdownMenuItem
                        key={lang}
                        onClick={() => setLanguage(languageCodeMap[lang] || lang.toLowerCase())}
                        className="text-xs text-white cursor-pointer hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                      >
                        {lang}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Main Content Area - LeetCode Style */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Panel - Problem Description and Leaderboard */}
        <div className="flex w-[35%] flex-col border-r border-[#f5c16c]/20">
          {/* Time Left Section */}
          {eventEndDate && (
            <div className="border-b border-[#f5c16c]/20 bg-[#0f0504]/60 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#f5c16c]">Time Remaining</span>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#f5c16c]" />
                  <CountdownTimer
                    endDate={eventEndDate}
                    fontSize={14}
                    gap={2}
                    borderRadius={4}
                    horizontalPadding={4}
                    textColor="#ffffff"
                    fontWeight="bold"
                    gradientHeight={8}
                    gradientFrom="rgba(0, 0, 0, 0.3)"
                    gradientTo="transparent"
                    showLabels={false}
                    onComplete={handleEventTimeout}
                    counterStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(245, 193, 108, 0.3)',
                      borderRadius: '4px',
                    }}
                    digitStyle={{
                      textShadow: '0 0 8px rgba(245, 193, 108, 0.8)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Section */}
          <div className="border-b border-[#f5c16c]/20 bg-[#0f0504]/40">
            <div className="flex items-center justify-between border-b border-[#f5c16c]/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#f5c16c]" />
                <span className="text-sm font-semibold text-white">Leaderboard</span>
              </div>
              <span className="text-xs text-foreground/50">{room?.Name || 'Room'}</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {!roomId ? (
                <div className="px-4 py-3 text-xs text-foreground/60">Join a room to view rankings</div>
              ) : leaderboardEntries.length === 0 ? (
                <div className="px-4 py-3 text-xs text-foreground/60">No submissions yet</div>
              ) : (
                <div className="divide-y divide-[#f5c16c]/10">
                  {topPlayers.map((entry, index) => (
                    <div
                      key={entry.place}
                      className={`flex items-center justify-between px-4 py-2 ${
                        index === 0 ? 'bg-[#f5c16c]/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                            index === 0
                              ? 'bg-[#f5c16c] text-black'
                              : index === 1
                              ? 'bg-[#d23187]/50 text-white'
                              : index === 2
                              ? 'bg-[#f5c16c]/30 text-white'
                              : 'text-foreground/50'
                          }`}
                        >
                          {entry.place}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{entry.player_name}</span>
                          {entry.state === 'present' ? (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          ) : entry.state === 'disconnected' ? (
                            <span className="inline-flex h-2 w-2 rounded-full bg-gray-500"></span>
                          ) : null}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#f5c16c]">{entry.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Problem Description */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{problemTitle}</h1>
                <p className="mt-2 text-sm text-foreground/60">
                  Submit your solution to earn points and climb the leaderboard.
                </p>
              </div>

              {problemStatement && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#f5c16c]/10 px-2 py-1 text-xs font-medium text-[#f5c16c]">
                      Sample Test Case
                    </span>
                  </div>
                  <p className="text-xs italic text-foreground/50">
                    Note: Your submission will be evaluated against additional hidden test cases.
                  </p>
                  <div className="space-y-2 text-sm leading-relaxed text-foreground/80">
                    {problemStatement.split('```').map((part, index) => {
                      if (index % 2 === 1) {
                        const lines = part.split('\n');
                        const lang = lines[0].trim();
                        const code = lines.slice(1).join('\n');
                        return (
                          <pre
                            key={index}
                            className="overflow-x-auto rounded-lg border border-[#f5c16c]/20 bg-black/60 p-3 text-xs font-mono text-white"
                          >
                            <code>{code}</code>
                          </pre>
                        );
                      }
                      if (part.trim()) {
                        return (
                          <p key={index} className="text-foreground/70">
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
        </div>

        {/* Right Panel - Code Editor and Output */}
        <div className="flex w-[65%] flex-col">
          {/* Code Editor */}
          <div className="flex-1 bg-[#0a0a0a]">
            <div className="h-full">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmit={onSubmit}
                submissionResult=""
                isSubmitting={isSubmitting}
                spaceConstraintMb={spaceConstraintMb}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="h-[40%] overflow-y-auto border-t border-[#f5c16c]/20 bg-[#0f0504]/40 px-4 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f5c16c]">Execution Result</h3>
              {submissionResult ? (
                <div className="space-y-2">
                  {(() => {
                    // Parse the submission result
                    const parts = submissionResult.split('|').map(p => p.trim());
                    const status = parts[0];
                    const isSuccess = status === 'SUCCESS';
                    const isError = status === 'ERROR';

                    // Parse details into a structured object
                    const details: Record<string, string> = {};

                    parts.slice(1).forEach(part => {
                      // Handle special "Wrong answer:" field with embedded test case info
                      // Skip displaying it since we show the test case details below
                      if (part.startsWith('❌') || part.includes('Wrong Answer on Test Case')) {
                        // Extract test case details from the error message
                        const inputMatch = part.match(/Input:\s*([^\n]+)/);
                        const expectedMatch = part.match(/Expected Output:\s*([^\n]+)/);
                        const yourOutputMatch = part.match(/Your Output:\s*([^\n]+)/);

                        if (inputMatch) details['Input'] = inputMatch[1].trim();
                        if (expectedMatch) details['Expected Output'] = expectedMatch[1].trim();
                        if (yourOutputMatch) details['Your Output'] = yourOutputMatch[1].trim();
                        return;
                      }

                      const colonIndex = part.indexOf(':');
                      if (colonIndex > 0) {
                        const key = part.substring(0, colonIndex).trim();
                        const value = part.substring(colonIndex + 1).trim();

                        // Skip if this is a duplicate key we already extracted
                        if (key === 'Input' || key === 'Expected Output' || key === 'Your Output') {
                          if (!details[key]) details[key] = value;
                        } else {
                          details[key] = value;
                        }
                      }
                    });

                    // Determine if this is a test case failure
                    const hasTestCase = details['Input'] || details['Expected Output'] || details['Your Output'];

                    return (
                      <div className="space-y-3">
                        {/* Status Banner */}
                        <div className={`flex items-center justify-between rounded-lg border p-3 ${
                          isSuccess
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : isError
                            ? 'border-red-500/30 bg-red-500/10'
                            : 'border-amber-500/30 bg-amber-500/10'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {isSuccess ? '✅' : isError ? '❌' : '⚠️'}
                            </span>
                            <span className={`font-bold text-sm ${
                              isSuccess
                                ? 'text-emerald-400'
                                : isError
                                ? 'text-red-400'
                                : 'text-amber-400'
                            }`}>
                              {isSuccess ? 'Accepted' : isError ? 'Wrong Answer' : status}
                            </span>
                          </div>
                          {details['Status'] && details['Status'] !== 'Wrong Answer' && (
                            <span className="text-xs text-foreground/60">{details['Status']}</span>
                          )}
                        </div>

                        {/* Test Case Details for Failures */}
                        {hasTestCase && (
                          <div className="space-y-2">
                            {details['Input'] && (
                              <div className="rounded-lg border border-[#f5c16c]/20 bg-black/60 p-3">
                                <p className="text-xs font-semibold text-[#f5c16c] mb-2">Input</p>
                                <pre className="text-xs text-white font-mono whitespace-pre-wrap">{details['Input']}</pre>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              {details['Expected Output'] && (
                                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                                  <p className="text-xs font-semibold text-emerald-400 mb-2">Expected Output</p>
                                  <pre className="text-xs text-emerald-300 font-mono font-bold whitespace-pre-wrap">{details['Expected Output']}</pre>
                                </div>
                              )}

                              {details['Your Output'] && (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                  <p className="text-xs font-semibold text-red-400 mb-2">Your Output</p>
                                  <pre className="text-xs text-red-300 font-mono font-bold whitespace-pre-wrap">{details['Your Output']}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Execution Time (always show if available, but not Status since it's in banner) */}
                        {details['Execution Time'] && (
                          <div className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-3 py-2 text-xs">
                            <span className="text-foreground/60">Execution Time: </span>
                            <span className="text-white font-mono">{details['Execution Time']}</span>
                          </div>
                        )}

                        {/* Success Details */}
                        {isSuccess && Object.keys(details).length > 0 && (
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                            {Object.entries(details)
                              .filter(([key]) => key !== 'Status' && key !== 'Execution Time')
                              .map(([key, value], idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <span className="font-semibold text-emerald-400 min-w-[120px]">{key}:</span>
                                  <span className="text-white font-mono">{value}</span>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Raw output for debugging */}
                        <details className="text-xs">
                          <summary className="cursor-pointer text-foreground/50 hover:text-foreground/80">
                            View Raw Output
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded-lg border border-[#f5c16c]/20 bg-black/60 p-3 text-xs font-mono text-white whitespace-pre-wrap">
                            {submissionResult}
                          </pre>
                        </details>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <div className="text-4xl opacity-30">💻</div>
                  <p className="text-xs text-foreground/50">
                    Submit your code to see execution results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
