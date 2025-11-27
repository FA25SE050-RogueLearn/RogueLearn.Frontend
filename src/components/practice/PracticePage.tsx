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
      const response = await eventServiceApi.getAllProblems();
      console.log('Problems response:', response);
      console.log('Response data type:', typeof response.data, 'Is array?', Array.isArray(response.data));
      console.log('Response data:', response.data);

      if (response.success && response.data) {
        let problemsArray: Problem[] = [];
        const dataObj = response.data as any;

        // Check if it's a paginated response with items
        if ('items' in dataObj && Array.isArray(dataObj.items)) {
          problemsArray = dataObj.items;

          // Use server-side pagination info if available
          if ('total_pages' in dataObj && typeof dataObj.total_pages === 'number') {
            setTotalPages(dataObj.total_pages);
          } else if ('total_count' in dataObj && 'page_size' in dataObj) {
            const total = Math.ceil(dataObj.total_count / dataObj.page_size);
            setTotalPages(total || 1);
          }
        } else if (Array.isArray(response.data)) {
          // Direct array response
          problemsArray = response.data;
          const itemsPerPage = 9;
          const total = Math.ceil(problemsArray.length / itemsPerPage);
          setTotalPages(total || 1);
        } else if ('problems' in dataObj && Array.isArray(dataObj.problems)) {
          // Alternative structure with problems property
          problemsArray = dataObj.problems;
          const itemsPerPage = 9;
          const total = Math.ceil(problemsArray.length / itemsPerPage);
          setTotalPages(total || 1);
        } else if (Object.keys(dataObj).length === 0) {
          console.log('Empty object returned, no problems available');
          problemsArray = [];
        }

        console.log('Problems fetched:', problemsArray.length, problemsArray);
        setProblems(problemsArray);
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
    <div className="relative min-h-screen overflow-x-hidden p-6 pb-32">
      {/* Background effects */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[30%] -top-[15%] h-[900px] w-[900px] rounded-full bg-[#d23187] opacity-[0.07] blur-[140px]" />
        <div className="absolute -right-[25%] top-[30%] h-[750px] w-[750px] rounded-full bg-[#f5c16c] opacity-[0.06] blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[15%] h-[650px] w-[650px] rounded-full bg-[#d23187] opacity-[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10">
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
    </div>
  );
}
