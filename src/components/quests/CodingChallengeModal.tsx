// roguelearn-web/src/components/quests/CodingChallengeModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Code, Cpu } from "lucide-react";
import CodeEditor from "@/components/code-battle/CodeEditor";
import eventServiceApi from "@/api/eventServiceApi";
import { CodingContent } from "@/types/quest";
import { Problem, ProblemDetails, SubmitSolutionResponse } from "@/types/event-service";

interface CodingChallengeModalProps {
  challengeContent: CodingContent;
  onClose: () => void;
  onComplete: () => void;
}

type LoadingState = "idle" | "loading_problem" | "problem_loaded" | "submitting" | "submitted";

export function CodingChallengeModal({ challengeContent, onClose, onComplete }: CodingChallengeModalProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState(challengeContent.language.toLowerCase());
  const [code, setCode] = useState("");
  const [submissionResult, setSubmissionResult] = useState<string>("");

  const loadProblem = useCallback(async () => {
    setLoadingState("loading_problem");
    setError(null);
    try {
      // Step 1: Find a suitable problem based on quest metadata.
      // This assumes a new `/problems/find` endpoint exists on the CodeBattle service.
      const problemResponse = await eventServiceApi.findProblem(
        challengeContent.topic,
        challengeContent.difficulty
      );

      if (!problemResponse.success || !problemResponse.data) {
        throw new Error(problemResponse.error?.message || "Could not find a suitable coding problem.");
      }
      setProblem(problemResponse.data);

      // Step 2: Fetch the detailed problem info, including the code stub for the correct language.
      const lang = challengeContent.language === "Kotlin" ? "Go" : challengeContent.language; // Mapping to available backend languages
      const detailsResponse = await eventServiceApi.getProblemDetails(problemResponse.data.id, lang as any);

      if (!detailsResponse.success || !detailsResponse.data) {
        throw new Error(detailsResponse.error?.message || "Could not load problem details.");
      }

      setProblemDetails(detailsResponse.data);
      setCode(detailsResponse.data.solution_stub || `// Start your ${challengeContent.language} code here`);
      setLoadingState("problem_loaded");
    } catch (err: any) {
      setError(err.message);
      setLoadingState("idle");
    }
  }, [challengeContent]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  const handleSubmit = async () => {
    if (!problem || !code.trim()) return;

    setLoadingState("submitting");
    setSubmissionResult("SUBMITTING|⏳ Evaluating your solution...");

    try {
      const langName = language === "go" ? "Golang" : language.charAt(0).toUpperCase() + language.slice(1);

      const response = await eventServiceApi.submitSolution({
        problem_id: problem.id,
        language: langName,
        code,
      });

      setLoadingState("submitted");

      const resultData = response.data as SubmitSolutionResponse | undefined;

      // This logic now works correctly because the SubmitSolutionResponse type includes the 'success' property.
      if (response.success && resultData?.success) {
        setSubmissionResult(`SUCCESS|✅ Accepted!|${resultData.message}`);
        setTimeout(() => {
          onComplete(); // Call the onComplete callback to mark the step as done.
        }, 2000); // Close modal after 2 seconds on success.
      } else {
        const errorMsg = resultData?.message || response.error?.message || "Submission failed";
        setSubmissionResult(`ERROR|❌ Failed|${errorMsg}`);
      }
    } catch (err: any) {
      setError(err.message);
      setSubmissionResult(`ERROR|❌ Submission Error|${err.message}`);
      setLoadingState("problem_loaded");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-gradient-to-br from-[#120806] via-[#1a0a08] to-black border-2 border-[#f5c16c]/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-[#f5c16c]">
            <Cpu className="w-7 h-7" />
            Coding Challenge: {problem?.title || challengeContent.topic}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Prove your mastery by solving this challenge. Your solution will be tested against hidden test cases.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-4">
          {/* Problem Statement Section */}
          <div className="flex flex-col space-y-4">
            <Card className="flex-1 relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
              <CardHeader>
                <CardTitle className="text-white">Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingState === "loading_problem" && (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-[#f5c16c]" />
                  </div>
                )}
                {error && (
                  <div className="text-red-400 p-4 bg-red-500/10 rounded-md">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    {error}
                  </div>
                )}
                {problemDetails && (
                  <div className="prose prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white prose-code:text-amber-300 prose-code:before:content-none prose-code:after:content-none">
                    <p>{problemDetails.problem_statement}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Code Editor Section */}
          <div className="flex flex-col">
            {loadingState === "loading_problem" ? (
              <div className="flex items-center justify-center flex-1 rounded-lg bg-black/20">
                <Loader2 className="w-8 h-8 animate-spin text-[#f5c16c]" />
              </div>
            ) : (
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmit={handleSubmit}
                submissionResult={submissionResult}
                isSubmitting={loadingState === "submitting"}
                spaceConstraintMb={problemDetails?.space_constraint_mb || null}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#f5c16c]/30 bg-transparent text-[#f5c16c] hover:bg-[#f5c16c]/10">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}