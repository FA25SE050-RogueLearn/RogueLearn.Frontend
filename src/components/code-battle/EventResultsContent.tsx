"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  Shield,
  ArrowLeft,
  Loader2,
  Medal,
  Star,
  Code2
} from "lucide-react";
import eventServiceApi from "@/api/eventServiceApi";
import type { Event, Leaderboard, LeaderboardEntry, Problem } from "@/types/event-service";
import Link from "next/link";
import type { CSSProperties } from "react";

interface EventResultsContentProps {
  eventId: string;
}

const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

export default function EventResultsContent({ eventId }: EventResultsContentProps) {
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [userLeaderboard, setUserLeaderboard] = useState<Leaderboard | null>(null);
  const [guildLeaderboard, setGuildLeaderboard] = useState<Leaderboard | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch event details
      const eventResponse = await eventServiceApi.getEventById(eventId);
      if (eventResponse.success && eventResponse.data) {
        setEvent(eventResponse.data);
      }

      // Fetch user leaderboard
      const userResponse = await eventServiceApi.getEventLeaderboards(eventId, 'user');
      if (userResponse.success && userResponse.data) {
        setUserLeaderboard(userResponse.data);
      }

      // Fetch guild leaderboard
      const guildResponse = await eventServiceApi.getEventLeaderboards(eventId, 'guild');
      if (guildResponse.success && guildResponse.data) {
        setGuildLeaderboard(guildResponse.data);
      }

      // Fetch event problems
      const problemsResponse = await eventServiceApi.getEventProblems(eventId);
      if (problemsResponse.success && problemsResponse.data) {
        setProblems(problemsResponse.data);
      }

    } catch (err) {
      setError('Failed to load event results');
      console.error('Error fetching event results:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (rank: number, totalEntries: number) => {
    // If there's only 1 entry, show Champion instead of rank
    if (totalEntries === 1 && rank === 1) {
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    }

    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="text-[#f5c16c] font-bold">#{rank}</span>;
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, type: 'user' | 'guild', totalEntries: number) => {
    // Show champion styling for rank 1, and champion badge only if there's only 1 entry
    const isChampion = entry.rank === 1;
    const showChampionBadge = entry.rank === 1 && totalEntries === 1;
    const isTopThree = entry.rank <= 3;

    // Handle both old and new API response formats
    const name = type === 'user'
      ? entry.username || entry.player_name || entry.user_id || entry.player_id || 'Unknown Player'
      : entry.guild_name || entry.guild_id || 'Unknown Guild';

    const score = entry.score || entry.total_score || 0;
    const problemsSolved = entry.problems_solved || 0;

    return (
      <div
        key={entry.rank}
        className={`relative rounded-xl border ${
          isChampion
            ? 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/5'
            : isTopThree
            ? 'border-[#f5c16c]/20 bg-[#d23187]/5'
            : 'border-white/10 bg-white/5'
        }`}
      >
        {/* Champion badge */}
        {showChampionBadge && (
          <div className="absolute -top-2 left-4">
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-2 py-0.5">
              <Star className="h-2.5 w-2.5 text-yellow-950 fill-yellow-950" />
              <span className="text-[10px] font-bold text-yellow-950 tracking-wider">CHAMPION</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 p-4">
          {/* Rank */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            {getRankDisplay(entry.rank, totalEntries)}
          </div>

          {/* Name & Stats */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${
              isChampion ? 'text-yellow-400' : 'text-white'
            }`}>
              {name}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#f9d9eb]/50">
              {/* Show guild name for user leaderboard */}
              {type === 'user' && entry.guild_name && (
                <>
                  <Shield className="h-3 w-3" />
                  <span>{entry.guild_name}</span>
                </>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right shrink-0">
            <p className={`text-xl font-bold ${
              isChampion ? 'text-yellow-400' : 'text-[#f5c16c]'
            }`}>
              {score.toLocaleString()}
            </p>
            <p className="text-[9px] text-[#f9d9eb]/40 uppercase tracking-wider">points</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
        <span className="ml-3 text-[#f9d9eb]/70">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-[#f9d9eb]/70">{error}</p>
        <Button
          onClick={() => router.push('/code-battle')}
          variant="outline"
          className="border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-32 mt-12 pb-24">
      {/* Hero Header */}
      <Card className={SECTION_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(210,49,135,0.2),transparent_60%)]" />
        <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

        <CardContent className="relative z-10 p-8">
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/code-battle')}
              className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-[#f5c16c] hover:text-[#f9d9eb] transition-colors"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Events
            </button>
            <span className="text-white/40">/</span>
            <span className="text-white/80">{event?.title || 'Results'}</span>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              {event?.title || 'Event Results'}
            </h1>
            <p className="mt-4 text-base text-foreground/75">
              Final Rankings & Scores - See who conquered the arena
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboards - Side by Side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Player Rankings */}
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#d23187]/10 via-transparent to-[#f5c16c]/5" />

          <CardHeader className="relative border-b border-[#d23187]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#d23187]/20 p-2">
                  <Users className="h-5 w-5 text-[#f5c16c]" />
                </div>
                <div>
                  <CardTitle className="text-white">Player Rankings</CardTitle>
                  <p className="text-xs text-[#f9d9eb]/60 mt-1">
                    {userLeaderboard?.rankings.length || 0} Warriors
                  </p>
                </div>
              </div>
              <Trophy className="h-8 w-8 text-[#f5c16c]/40" />
            </div>
          </CardHeader>

          <CardContent className="relative pt-6">
            {userLeaderboard && userLeaderboard.rankings.length > 0 ? (
              <div className="space-y-3">
                <div className="mb-4 text-xs text-[#f9d9eb]/50 text-right">
                  Last updated: {new Date(userLeaderboard.last_updated).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {/* Champion (Rank 1) */}
                {userLeaderboard.rankings[0] && (
                  <div className="mb-6">
                    {renderLeaderboardEntry(userLeaderboard.rankings[0], 'user', userLeaderboard.rankings.length)}
                  </div>
                )}

                {/* Rest of rankings */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#d23187]/30 scrollbar-track-transparent">
                  {userLeaderboard.rankings.slice(1).map((entry) =>
                    renderLeaderboardEntry(entry, 'user', userLeaderboard.rankings.length)
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#f9d9eb]/60">
                <Users className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-sm">No player rankings available</p>
                <p className="text-xs text-[#f9d9eb]/40 mt-1">Compete to see your name here!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guild Rankings */}
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#f5c16c]/10 via-transparent to-[#d23187]/5" />

          <CardHeader className="relative border-b border-[#f5c16c]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#f5c16c]/20 p-2">
                  <Shield className="h-5 w-5 text-[#d23187]" />
                </div>
                <div>
                  <CardTitle className="text-white">Guild Rankings</CardTitle>
                  <p className="text-xs text-[#f9d9eb]/60 mt-1">
                    {guildLeaderboard?.rankings.length || 0} Guilds
                  </p>
                </div>
              </div>
              <Trophy className="h-8 w-8 text-[#d23187]/40" />
            </div>
          </CardHeader>

          <CardContent className="relative pt-6">
            {guildLeaderboard && guildLeaderboard.rankings.length > 0 ? (
              <div className="space-y-3">
                <div className="mb-4 text-xs text-[#f9d9eb]/50 text-right">
                  Last updated: {new Date(guildLeaderboard.last_updated).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {/* Champion (Rank 1) */}
                {guildLeaderboard.rankings[0] && (
                  <div className="mb-6">
                    {renderLeaderboardEntry(guildLeaderboard.rankings[0], 'guild', guildLeaderboard.rankings.length)}
                  </div>
                )}

                {/* Rest of rankings */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#f5c16c]/30 scrollbar-track-transparent">
                  {guildLeaderboard.rankings.slice(1).map((entry) =>
                    renderLeaderboardEntry(entry, 'guild', guildLeaderboard.rankings.length)
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#f9d9eb]/60">
                <Shield className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-sm">No guild rankings available</p>
                <p className="text-xs text-[#f9d9eb]/40 mt-1">Form a guild and dominate the arena!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Problems Summary */}
      <Card className={SECTION_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#d23187]/5 via-transparent to-[#f5c16c]/10" />

        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-[#f5c16c]/20 p-3">
                <Code2 className="h-6 w-6 text-[#f5c16c]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Event Problems</h3>
                <p className="text-sm text-[#f9d9eb]/60">
                  {problems.length} challenge{problems.length !== 1 ? 's' : ''} in this event
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/code-battle/${eventId}/problems`)}
              className="bg-[#f5c16c] text-black hover:bg-[#f5c16c]/90"
            >
              View All Problems
            </Button>
          </div>

          {/* Quick Stats */}
          {problems.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {problems.filter(p => p.difficulty === 1).length}
                </p>
                <p className="text-xs text-emerald-400/70">Easy</p>
              </div>
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {problems.filter(p => p.difficulty === 2).length}
                </p>
                <p className="text-xs text-yellow-400/70">Medium</p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                <p className="text-2xl font-bold text-red-400">
                  {problems.filter(p => p.difficulty === 3).length}
                </p>
                <p className="text-xs text-red-400/70">Hard</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
