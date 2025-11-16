"use client";

import { useState, useEffect, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';
import eventServiceApi from '@/api/eventServiceApi';
import type { Problem } from '@/types/event-service';

interface ProblemsListProps {
  apiBaseUrl: string;
  eventId: string | null;
  roomId: string | null;
  onProblemSelect: (problemId: string, title: string) => void;
  selectedProblemId: string | null;
}

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    default:
      return `Level ${difficulty}`;
  }
};

export default function ProblemsList({ apiBaseUrl, eventId, roomId, onProblemSelect, selectedProblemId }: ProblemsListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId || !roomId) {
      startTransition(() => {
        setProblems([]);
      });
      return;
    }

    const fetchProblems = async () => {
      setLoading(true);
      try {
        const response = await eventServiceApi.getEventProblems(eventId);

        console.log('Problems API Response:', response);

        if (response.success && response.data) {
          // Ensure data is an array
          if (Array.isArray(response.data)) {
            setProblems(response.data);
          } else {
            console.error('Problems data is not an array:', response.data);
            startTransition(() => {
              setProblems([]);
            });
          }
        } else {
          console.error('Failed to fetch problems:', response.error);
          startTransition(() => {
            setProblems([]);
          });
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        startTransition(() => {
          setProblems([]);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [apiBaseUrl, eventId, roomId]);

  return (
    <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-linear-to-br from-[#26120e]/88 via-[#150909]/94 to-[#080405]/97 p-6 shadow-[0_20px_60px_rgba(54,18,9,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.4),transparent_70%)] opacity-[0.35]" />
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d23187]/20 text-[#f5c16c]">
            <Code className="h-5 w-5" />
          </span>
          Arena Problems
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {!roomId ? (
          <p className="text-sm text-foreground/60">Select a room to reveal its problem set.</p>
        ) : loading ? (
          <p className="text-sm text-foreground/60">Generating challenge scripts...</p>
        ) : problems.length === 0 ? (
          <p className="text-sm text-foreground/60">No challenges bound to this room.</p>
        ) : (
          <ul className="space-y-3">
            {problems.map((problem) => (
              <li
                key={problem.id}
                onClick={() => onProblemSelect(problem.id, problem.title)}
                className={`rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                  selectedProblemId === problem.id
                    ? 'border-[#d23187]/55 bg-[#d23187]/25 text-white shadow-[0_12px_30px_rgba(210,49,135,0.35)]'
                    : 'border-[#f5c16c]/15 bg-white/5 text-foreground/70 hover:border-[#d23187]/40 hover:bg-[#d23187]/15 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{problem.title}</span>
                  <span className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/80">{getDifficultyLabel(problem.difficulty)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
