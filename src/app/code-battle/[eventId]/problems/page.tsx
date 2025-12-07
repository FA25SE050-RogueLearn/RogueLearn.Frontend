"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Code2,
  Tag,
  Search,
  Filter
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import eventServiceApi from "@/api/eventServiceApi";
import type { Event, Problem } from "@/types/event-service";
import type { CSSProperties } from "react";

const SECTION_CARD_CLASS = 'relative overflow-hidden rounded-3xl border border-[#f5c16c]/25 bg-[#120806]/80';
const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

export default function EventProblemsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!eventId) return;
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [eventResponse, problemsResponse] = await Promise.all([
        eventServiceApi.getEventById(eventId),
        eventServiceApi.getEventProblems(eventId)
      ]);

      if (eventResponse.success && eventResponse.data) {
        setEvent(eventResponse.data);
      }

      if (problemsResponse.success && problemsResponse.data) {
        setProblems(problemsResponse.data);
      }
    } catch (err) {
      setError('Failed to load problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = !search || 
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.tags?.some(tag => tag.name.toLowerCase().includes(search.toLowerCase()));
    const matchesDifficulty = difficultyFilter === null || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyLabel = (difficulty: number) => {
    return difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard';
  };

  const getDifficultyColor = (difficulty: number) => {
    return difficulty === 1 
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
      : difficulty === 2 
      ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' 
      : 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
          <span className="ml-3 text-[#f9d9eb]/70">Loading problems...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-[#f9d9eb]/70">{error}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-[#d23187]/40 bg-white/5 text-[#f5c16c] hover:bg-[#d23187]/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 px-8 lg:px-32 mt-12 pb-24">
        {/* Header */}
        <Card className={SECTION_CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(210,49,135,0.2),transparent_60%)]" />
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

          <CardContent className="relative z-10 p-8">
            <div className="mb-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/code-battle/${eventId}/results`)}
                className="inline-flex items-center text-xs uppercase tracking-[0.35em] text-[#f5c16c] hover:text-[#f9d9eb] transition-colors"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                Results
              </button>
              <span className="text-white/40">/</span>
              <span className="text-white/80">Problems</span>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Event Problems
                </h1>
                <p className="mt-2 text-sm text-foreground/60">
                  {event?.title} - {problems.length} challenge{problems.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search problems..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[#f5c16c]/50 focus:outline-none sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setDifficultyFilter(null)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      difficultyFilter === null ? 'bg-[#f5c16c] text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDifficultyFilter(1)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      difficultyFilter === 1 ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => setDifficultyFilter(2)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      difficultyFilter === 2 ? 'bg-yellow-500 text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setDifficultyFilter(3)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      difficultyFilter === 3 ? 'bg-red-500 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems Grid */}
        {filteredProblems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem) => (
              <Card
                key={problem.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#120806]/60 transition-all hover:border-[#f5c16c]/30 hover:bg-[#120806]/80"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white group-hover:text-[#f5c16c] transition-colors line-clamp-2">
                      {problem.title}
                    </h3>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {getDifficultyLabel(problem.difficulty)}
                    </span>
                  </div>

                  {problem.tags && problem.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 rounded-full bg-[#d23187]/10 px-2 py-0.5 text-[10px] text-[#f9d9eb]/70"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs leading-relaxed text-[#f9d9eb]/50 line-clamp-3">
                    {problem.problem_statement?.replace(/<[^>]*>/g, '').slice(0, 150) || 'No description available'}
                    {(problem.problem_statement?.length || 0) > 150 ? '...' : ''}
                  </p>

                  {problem.supported_languages && problem.supported_languages.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40">
                      <Code2 className="h-3 w-3" />
                      {problem.supported_languages.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className={SECTION_CARD_CLASS}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Code2 className="h-16 w-16 mb-4 text-[#f9d9eb]/20" />
              <p className="text-[#f9d9eb]/60">
                {search || difficultyFilter !== null 
                  ? 'No problems match your filters' 
                  : 'No problems available for this event'}
              </p>
              {(search || difficultyFilter !== null) && (
                <Button
                  onClick={() => { setSearch(''); setDifficultyFilter(null); }}
                  variant="ghost"
                  className="mt-4 text-[#f5c16c] hover:text-[#f5c16c]/80"
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
