"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Zap, Trophy, ArrowRight, Filter } from 'lucide-react';
import type { Problem } from '@/types/event-service';
import type { CSSProperties } from 'react';

interface ProblemSelectionViewProps {
  problems: Problem[];
  onSelectProblem: (problemId: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const HERO_CARD_CLASS = 'relative overflow-hidden rounded-[32px] border border-[#d23187]/35 bg-linear-to-br from-[#1c0906]/95 via-[#120605]/98 to-[#040101]';
const CARD_CLASS = 'relative overflow-hidden rounded-[28px] border border-[#f5c16c]/25 bg-linear-to-br from-[#1a0e0d]/92 via-[#130807]/97 to-[#080303]';
const CTA_CLASS = 'rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.4)] hover:shadow-[0_20px_50px_rgba(210,49,135,0.6)]';

const TEXTURE_OVERLAY: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  mixBlendMode: 'lighten',
  opacity: 0.35,
};

const CARD_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  opacity: 0.25,
};

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export default function ProblemSelectionView({
  problems,
  onSelectProblem,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: ProblemSelectionViewProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  const difficultyConfig = {
    easy: { label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-700/30', icon: Zap },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-700/30', icon: TrendingUp },
    hard: { label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-950/50', border: 'border-rose-700/30', icon: Trophy },
  };

  const getDifficultyInfo = (difficulty: string) => {
    const key = difficulty.toLowerCase() as keyof typeof difficultyConfig;
    return difficultyConfig[key] || difficultyConfig.medium;
  };

  const getDifficultyString = (difficulty: number | undefined): string => {
    if (!difficulty) return 'medium';
    if (difficulty <= 1) return 'easy';
    if (difficulty <= 2) return 'medium';
    return 'hard';
  };

  const filteredProblems = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    // Server-side pagination handles the page slicing, we just filter by difficulty
    let filtered = difficultyFilter === 'all'
      ? problems
      : problems.filter(p => getDifficultyString(p.difficulty) === difficultyFilter);

    return filtered;
  }, [problems, difficultyFilter]);

  const problemStats = useMemo(() => {
    const stats = {
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    };
    if (!Array.isArray(problems)) return stats;

    stats.total = problems.length;
    problems.forEach(p => {
      const diff = getDifficultyString(p.difficulty);
      if (diff === 'easy') stats.easy++;
      else if (diff === 'medium') stats.medium++;
      else if (diff === 'hard') stats.hard++;
    });
    return stats;
  }, [problems]);

  return (
    <div className="flex min-h-[80vh] flex-col gap-12">
      {/* Hero Header */}
      <Card className={HERO_CARD_CLASS}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
        <div aria-hidden="true" className="absolute inset-0" style={TEXTURE_OVERLAY} />
        <CardContent className="relative z-10 flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-[#f5c16c]/20 p-2">
                <Target className="h-6 w-6 text-[#f5c16c]" />
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]">Solo Practice</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
              Master Your <span className="bg-gradient-to-r from-[#d23187] via-[#f5c16c] to-[#f0b26a] bg-clip-text text-transparent">Coding Skills</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/75">
              Sharpen your algorithmic thinking and problem-solving abilities. Challenge yourself with problems ranging from beginner to advanced.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <Card className="relative overflow-hidden rounded-3xl border border-[#f5c16c]/20 bg-[#120806]/70 text-center">
              <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
              <CardContent className="relative flex flex-col items-center gap-2 p-6">
                <Trophy className="h-6 w-6 text-[#f5c16c]" />
                <span className="text-3xl font-bold text-white">{problemStats.total}</span>
                <span className="text-xs uppercase tracking-wide text-foreground/60">Total Problems</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-[#f5c16c]">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">Filter by Difficulty</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map((diff) => (
            <Button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              variant={difficultyFilter === diff ? 'default' : 'outline'}
              size="sm"
              className={`${
                difficultyFilter === diff
                  ? 'border-[#d23187]/50 bg-gradient-to-r from-[#d23187]/30 to-[#f5c16c]/30 text-white'
                  : 'border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10'
              }`}
            >
              {diff === 'all' ? `All (${problemStats.total})` : `${diff.charAt(0).toUpperCase() + diff.slice(1)} (${problemStats[diff]})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Problems Grid */}
      {filteredProblems.length === 0 ? (
        <Card className={CARD_CLASS}>
          <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />
          <CardContent className="relative flex flex-col items-center justify-center gap-4 py-20">
            <Target className="h-16 w-16 text-[#f5c16c]/40" />
            <p className="text-xl text-white/80">No problems found</p>
            <p className="text-foreground/60">Try adjusting your filters or check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => {
            const problemId = problem.id || '';
            const difficultyStr = getDifficultyString(problem.difficulty);
            const difficulty = getDifficultyInfo(difficultyStr);
            const DiffIcon = difficulty.icon;

            return (
              <Card
                key={problemId}
                className={`group ${CARD_CLASS} transition-all duration-300 hover:-translate-y-1 hover:border-[#d23187]/50 hover:shadow-[0_15px_40px_rgba(210,49,135,0.25)]`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,193,108,0.1),transparent_65%)] opacity-0 transition-opacity group-hover:opacity-100" />
                <div aria-hidden="true" className="absolute inset-0" style={CARD_TEXTURE} />

                <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-white flex-1">{problem.title || 'Untitled Problem'}</CardTitle>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficulty.color} ${difficulty.border} ${difficulty.bg}`}>
                      <DiffIcon className="h-3 w-3" />
                      {difficulty.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4 p-5">
                  <Button
                    onClick={() => onSelectProblem(problemId)}
                    className={`w-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider ${CTA_CLASS}`}
                  >
                    Start Challenge
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="border-[#f5c16c]/40 bg-white/5 text-[#f5c16c] hover:bg-[#f5c16c]/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <span className="text-sm text-white/80">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="border-[#f5c16c]/40 bg-white/5 text-[#f5c16c] hover:bg-[#f5c16c]/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
