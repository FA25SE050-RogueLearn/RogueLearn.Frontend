"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Database, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import eventServiceApi from "@/api/eventServiceApi";
import type { Problem, ProblemDetails } from "@/types/event-service";
import { toast } from "sonner";

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "text-emerald-400",
  2: "text-amber-400",
  3: "text-rose-400",
};

export default function ProblemBankPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Modal state
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Golang");

  const AVAILABLE_LANGUAGES = ["Golang", "Python", "Javascript"];

  useEffect(() => {
    fetchProblems(currentPage);
  }, [currentPage]);

  const fetchProblems = async (page: number) => {
    setLoading(true);
    try {
      const response = await eventServiceApi.getAllProblems(page, pageSize);

      if (response.success && response.data) {
        const problemsArray = Array.isArray(response.data) ? response.data : [];
        setProblems(problemsArray);

        if (response.pagination) {
          setTotalPages(response.pagination.total_pages || 1);
        }
      } else {
        toast.error("Failed to load problems", {
          description: response.error?.message || "Please try again later"
        });
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      toast.error("Error loading problems");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (problem: Problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
    setSelectedLanguage("Golang"); // Reset to default language
    setLoadingDetails(true);
    setProblemDetails(null);

    try {
      // Fetch full problem details with first available language
      const response = await eventServiceApi.getProblemDetails(problem.id, "Golang");

      if (response.success && response.data) {
        setProblemDetails(response.data);
      } else {
        toast.error("Failed to load problem details");
      }
    } catch (error) {
      console.error("Error fetching problem details:", error);
      toast.error("Error loading problem details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    if (!selectedProblem) return;

    setSelectedLanguage(language);
    setLoadingDetails(true);
    setProblemDetails(null);

    try {
      const response = await eventServiceApi.getProblemDetails(
        selectedProblem.id,
        language as "Golang" | "Python" | "Javascript"
      );

      if (response.success && response.data) {
        setProblemDetails(response.data);
      } else {
        toast.error("Failed to load problem details");
      }
    } catch (error) {
      console.error("Error fetching problem details:", error);
      toast.error("Error loading problem details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProblem(null);
    setProblemDetails(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* RPG-styled Header */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 hover:text-amber-200"
          >
            <Link href="/admin/content" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Challenge Arsenal</h1>
            <p className="text-sm text-amber-700">Trials & Coding Exercises</p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50 shadow-lg shadow-amber-900/50"
          >
            <Link href="/admin/content/problems/create">
              <Plus className="mr-2 h-4 w-4" />
              Forge Challenge
            </Link>
          </Button>
        </div>

        {/* Problem List - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Available Trials</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-amber-700/50 mb-4" />
                <p className="text-amber-300 mb-2">No challenges found</p>
                <p className="text-xs text-amber-700">Create your first challenge to get started</p>
              </div>
            ) : (
              <>
                {problems.map((problem) => {
                  const difficultyLabel = DIFFICULTY_LABELS[problem.difficulty] || "Unknown";
                  const difficultyColor = DIFFICULTY_COLORS[problem.difficulty] || "text-amber-400";

                  // Get first tag name if available
                  const tagName = problem.tags && problem.tags.length > 0
                    ? problem.tags[0].name
                    : "General";

                  return (
                    <div
                      key={problem.id}
                      className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-950/50 to-amber-900/30 border border-amber-800/30">
                          <Database className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-amber-200">{problem.title}</h3>
                          <p className="text-xs text-amber-700">
                            {tagName} • <span className={difficultyColor}>{difficultyLabel}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30"
                          onClick={() => handleViewDetails(problem)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-amber-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Problem Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-100">
              {selectedProblem?.title}
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : selectedProblem && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${DIFFICULTY_COLORS[selectedProblem.difficulty]}`}>
                    {DIFFICULTY_LABELS[selectedProblem.difficulty]}
                  </span>
                  {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                    <div className="flex gap-2">
                      {selectedProblem.tags.map((tag) => (
                        <span key={tag.id} className="text-xs px-2 py-1 rounded bg-amber-900/30 text-amber-300 border border-amber-700/50">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-amber-300">Programming Language</h3>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full border-amber-900/30 bg-amber-950/20 text-amber-100 focus:border-amber-600 focus:ring-amber-600/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-amber-900/30 bg-[#1f1812]">
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang}
                        value={lang}
                        className="text-amber-100 focus:bg-amber-900/30 focus:text-amber-100"
                      >
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-amber-200">Problem Statement</h3>
                <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-amber-100 font-mono">
                    {selectedProblem.problem_statement}
                  </pre>
                </div>
              </div>

              {/* Language Details (if loaded) */}
              {problemDetails && (
                <>
                  {/* Solution Stub */}
                  {problemDetails.solution_stub && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-amber-200">Solution Stub</h3>
                      <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
                        <pre className="whitespace-pre-wrap text-xs text-amber-100 font-mono">
                          {problemDetails.solution_stub}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  <div className="grid grid-cols-2 gap-4">
                    {problemDetails.time_constraint_ms && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-amber-300">Time Constraint</h4>
                        <p className="text-sm text-amber-100">{problemDetails.time_constraint_ms} ms</p>
                      </div>
                    )}
                    {problemDetails.space_constraint_mb && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-amber-300">Space Constraint</h4>
                        <p className="text-sm text-amber-100">{problemDetails.space_constraint_mb} MB</p>
                      </div>
                    )}
                  </div>

                  {/* Test Cases */}
                  {problemDetails.test_cases && problemDetails.test_cases.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-amber-200">Sample Test Cases</h3>
                      <div className="space-y-3">
                        {problemDetails.test_cases.filter(tc => !tc.is_hidden).slice(0, 3).map((testCase, index) => (
                          <div key={index} className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4 space-y-2">
                            <div>
                              <h4 className="text-xs font-semibold text-amber-400 mb-1">Input:</h4>
                              <pre className="whitespace-pre-wrap text-xs text-amber-100 font-mono">
                                {testCase.input}
                              </pre>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-amber-400 mb-1">Expected Output:</h4>
                              <pre className="whitespace-pre-wrap text-xs text-amber-100 font-mono">
                                {testCase.expected_output}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-amber-900/20">
            <Button
              onClick={handleCloseModal}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
