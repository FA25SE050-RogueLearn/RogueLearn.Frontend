"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import eventServiceApi from '@/api/eventServiceApi';
import type { Problem } from '@/types/event-service';
import ProblemSelectionView from './ProblemSelectionView';
import PracticeArenaView from './PracticeArenaView';
import { toast } from 'sonner';

type View = 'problems' | 'arena';

export default function PracticePage() {
  const [currentView, setCurrentView] = useState<View>('problems');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all problems on mount and when page changes
  useEffect(() => {
    fetchAllProblems(currentPage);
  }, [currentPage]);

  const fetchAllProblems = async (page: number) => {
    setLoading(true);
    try {
      console.log('Fetching problems, page:', page);
      const response = await eventServiceApi.getAllProblems(page, 12); // 12 items per page
      console.log('Problems response:', response);

      if (response.success && response.data) {
        const problemsArray = Array.isArray(response.data) ? response.data : [];
        console.log('Problems fetched:', problemsArray.length, problemsArray);
        setProblems(problemsArray);

        // Use pagination info from response
        if (response.pagination) {
          console.log('📊 Pagination info:', response.pagination);
          setTotalPages(response.pagination.total_pages || 1);
        }
      } else {
        console.error('Failed to fetch problems:', response.error);
        toast.error('Failed to load problems', {
          description: response.error?.message || 'Please try again later'
        });
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Error loading problems', {
        description: 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = (problemId: string) => {
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblemId(problemId);
      setSelectedProblem(problem);
      setCurrentView('arena');
    }
  };

  const handleBackToProblems = () => {
    setCurrentView('problems');
    setSelectedProblemId(null);
    setSelectedProblem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#f5c16c]" />
        <span className="ml-3 text-xl text-[#f9d9eb]/70">Loading practice arena...</span>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32">
      {currentView === 'problems' && (
        <ProblemSelectionView
          problems={problems}
          onSelectProblem={handleSelectProblem}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {currentView === 'arena' && selectedProblem && (
        <PracticeArenaView
          problem={selectedProblem}
          onBack={handleBackToProblems}
        />
      )}
    </div>
  );
}
