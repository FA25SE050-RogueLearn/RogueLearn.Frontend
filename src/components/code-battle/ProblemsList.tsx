"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';
import { mockEventCodeProblems, EventCodeProblem } from '@/lib/mockCodeBattleData';

interface ProblemsListProps {
  apiBaseUrl: string;
  eventId: string | null;
  roomId: string | null;
  onProblemSelect: (problemId: string, title: string) => void;
  selectedProblemId: string | null;
}

const USE_MOCK_DATA = true; // Set to false when backend is ready

export default function ProblemsList({ apiBaseUrl, eventId, roomId, onProblemSelect, selectedProblemId }: ProblemsListProps) {
  const [problems, setProblems] = useState<EventCodeProblem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId || !roomId) {
      setProblems([]);
      return;
    }

    const fetchProblems = async () => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          // Use mock data - get problems for this event
          setTimeout(() => {
            const eventProblems = mockEventCodeProblems[eventId] || [];
            setProblems(eventProblems);
            setLoading(false);
          }, 200); // Simulate network delay
        } else {
          // Use real API
          const response = await fetch(`${apiBaseUrl}/events/${eventId}/rooms/${roomId}/problems`);
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setProblems(data.data);
          } else {
            setProblems([]);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]);
        setLoading(false);
      }
    };

    fetchProblems();
  }, [apiBaseUrl, eventId, roomId]);

  return (
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Code className="w-5 h-5" />
          Problems
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!roomId ? (
          <p className="text-muted-foreground">Select a room to see problems</p>
        ) : loading ? (
          <p className="text-muted-foreground">Loading problems...</p>
        ) : problems.length === 0 ? (
          <p className="text-muted-foreground">No problems found for this room</p>
        ) : (
          <ul className="space-y-2">
            {problems.map((problem) => (
              <li
                key={problem.CodeProblemID}
                onClick={() => onProblemSelect(problem.CodeProblemID, problem.Title)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedProblemId === problem.CodeProblemID
                    ? 'bg-accent text-primary font-semibold'
                    : 'bg-card hover:bg-accent/10 border border-border'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{problem.Title}</span>
                  <span className="text-sm text-accent">{problem.Score} pts</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
