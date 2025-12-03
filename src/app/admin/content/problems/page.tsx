"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Database, Loader2, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import eventServiceApi from "@/api/eventServiceApi";
import type { Problem, ProblemDetails } from "@/types/event-service";
import { toast } from "sonner";

const DIFFICULTY_LABELS: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };
const DIFFICULTY_COLORS: Record<number, string> = { 1: "text-emerald-400", 2: "text-[#f5c16c]", 3: "text-red-400" };

export default function ProblemBankPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Golang");
  const AVAILABLE_LANGUAGES = ["Golang", "Python", "Javascript"];

  useEffect(() => { fetchProblems(currentPage); }, [currentPage]);

  const fetchProblems = async (page: number) => {
    setLoading(true);
    try {
      const response = await eventServiceApi.getAllProblems(page, pageSize);
      if (response.success && response.data) {
        setProblems(Array.isArray(response.data) ? response.data : []);
        if (response.pagination) setTotalPages(response.pagination.total_pages || 1);
      } else { toast.error(response.error?.message || "Failed to load problems"); }
    } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Error loading problems"); }
    finally { setLoading(false); }
  };

  const handleViewDetails = async (problem: Problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
    const firstLanguage = problem.supported_languages?.[0] || "Golang";
    setSelectedLanguage(firstLanguage);
    setLoadingDetails(true);
    setProblemDetails(null);
    try {
      const response = await eventServiceApi.getProblemDetails(problem.id, firstLanguage as "Golang" | "Python" | "Javascript");
      if (response.success && response.data) setProblemDetails(response.data);
      else toast.error(response.error?.message || "Failed to load problem details");
    } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Error loading problem details"); }
    finally { setLoadingDetails(false); }
  };

  const handleLanguageChange = async (language: string) => {
    if (!selectedProblem) return;
    setSelectedLanguage(language);
    setLoadingDetails(true);
    setProblemDetails(null);
    try {
      const response = await eventServiceApi.getProblemDetails(selectedProblem.id, language as "Golang" | "Python" | "Javascript");
      if (response.success && response.data) setProblemDetails(response.data);
      else toast.error(response.error?.message || "Failed to load problem details");
    } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Error loading problem details"); }
    finally { setLoadingDetails(false); }
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedProblem(null); setProblemDetails(null); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
            <Link href="/admin/content" className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#f5c16c]">Problem Bank</h1>
            <p className="text-sm text-white/60">Coding Exercises & Challenges</p>
          </div>
          <Button asChild className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]">
            <Link href="/admin/content/problems/create"><Plus className="mr-2 h-4 w-4" /> Create Problem</Link>
          </Button>
        </div>

        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10"><CardTitle className="text-[#f5c16c]">Available Problems</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" /></div>
            ) : problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-[#f5c16c]/40 mb-4" />
                <p className="text-white mb-2">No problems found</p>
                <p className="text-xs text-white/50">Create your first problem to get started</p>
              </div>
            ) : (
              <>
                {problems.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                        <Database className="h-5 w-5 text-[#f5c16c]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{problem.title}</h3>
                        <p className="text-xs text-white/50">
                          {problem.tags?.[0]?.name || "General"} • <span className={DIFFICULTY_COLORS[problem.difficulty]}>{DIFFICULTY_LABELS[problem.difficulty]}</span>
                          {problem.supported_languages && problem.supported_languages.length > 0 && (
                            <> • {problem.supported_languages.join(", ")}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10" onClick={() => handleViewDetails(problem)}>View Details</Button>
                      <Button asChild size="sm" variant="outline" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
                        <Link href={`/admin/content/problems/${problem.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10 disabled:opacity-50">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm text-white/60">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10 disabled:opacity-50">
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1410] border-[#f5c16c]/20">
          <DialogHeader><DialogTitle className="text-2xl font-bold text-[#f5c16c]">{selectedProblem?.title}</DialogTitle></DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" /></div>
          ) : selectedProblem && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold ${DIFFICULTY_COLORS[selectedProblem.difficulty]}`}>{DIFFICULTY_LABELS[selectedProblem.difficulty]}</span>
                {selectedProblem.tags?.map((tag) => (
                  <span key={tag.id} className="text-xs px-2 py-1 rounded bg-[#f5c16c]/10 text-white border border-[#f5c16c]/30">{tag.name}</span>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white/70">Supported Languages</h3>
                {selectedProblem.supported_languages && selectedProblem.supported_languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProblem.supported_languages.map((lang) => (
                      <span key={lang} className="text-xs px-3 py-1 rounded-full bg-[#f5c16c]/10 text-[#f5c16c] border border-[#f5c16c]/30">{lang}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/50">No language information available</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white/70">View Code Template</h3>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full border-[#f5c16c]/20 bg-[#0a0506] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1410] border-[#f5c16c]/20">
                    {(selectedProblem.supported_languages || AVAILABLE_LANGUAGES).map((lang) => <SelectItem key={lang} value={lang} className="text-white">{lang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Problem Statement</h3>
                <div className="rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4">
                  <pre className="whitespace-pre-wrap text-sm text-white/80 font-mono">{selectedProblem.problem_statement}</pre>
                </div>
              </div>

              {problemDetails && (
                <>
                  {problemDetails.solution_stub && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">Solution Stub</h3>
                      <div className="rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4">
                        <pre className="whitespace-pre-wrap text-xs text-white/80 font-mono">{problemDetails.solution_stub}</pre>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {problemDetails.time_constraint_ms && <div><h4 className="text-sm font-semibold text-white/70">Time Constraint</h4><p className="text-sm text-white">{problemDetails.time_constraint_ms} ms</p></div>}
                    {problemDetails.space_constraint_mb && <div><h4 className="text-sm font-semibold text-white/70">Space Constraint</h4><p className="text-sm text-white">{problemDetails.space_constraint_mb} MB</p></div>}
                  </div>

                  {problemDetails.test_cases?.filter(tc => tc.is_sample).length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">Sample Test Cases</h3>
                      <div className="space-y-3">
                        {problemDetails.test_cases.filter(tc => tc.is_sample).slice(0, 3).map((testCase, index) => (
                          <div key={index} className="rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4 space-y-2">
                            <div><h4 className="text-xs font-semibold text-[#f5c16c] mb-1">Input:</h4><pre className="whitespace-pre-wrap text-xs text-white/80 font-mono">{testCase.input}</pre></div>
                            <div><h4 className="text-xs font-semibold text-[#f5c16c] mb-1">Expected Output:</h4><pre className="whitespace-pre-wrap text-xs text-white/80 font-mono">{testCase.expected_output}</pre></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-[#f5c16c]/10">
            <Button onClick={handleCloseModal} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
