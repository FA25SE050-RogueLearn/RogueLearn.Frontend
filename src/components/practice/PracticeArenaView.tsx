"use client";

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import eventServiceApi from '@/api/eventServiceApi';
import CodeEditor from '@/components/code-battle/CodeEditor';
import type { Problem } from '@/types/event-service';
import { toast } from 'sonner';

interface PracticeArenaViewProps {
  problem: Problem;
  onBack: () => void;
}

const BACKDROP_GRADIENT: CSSProperties = {
  background: 'radial-gradient(circle at top, rgba(210,49,135,0.25), transparent 60%), linear-gradient(180deg, #100414 0%, #06020b 60%, #010103 100%)',
};

const BACKDROP_TEXTURE: CSSProperties = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
  opacity: 0.08,
  mixBlendMode: 'screen',
};

export default function PracticeArenaView({ problem, onBack }: PracticeArenaViewProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  const problemId = problem.id || '';

  const getDifficultyString = (difficulty: number | undefined): string => {
    if (!difficulty) return 'medium';
    if (difficulty <= 1) return 'easy';
    if (difficulty <= 2) return 'medium';
    return 'hard';
  };

  const getLanguageParam = (lang: string): 'Golang' | 'Python' | 'Javascript' => {
    if (lang === 'go') return 'Golang';
    if (lang === 'javascript' || lang === 'js') return 'Javascript';
    return 'Python'; // Default to Python for 'python' or any other language
  };

  const loadProblemDetails = useCallback(async () => {
    try {
      // Use getProblemDetails with language parameter to get stub code
      const langParam = getLanguageParam(language);
      const response = await eventServiceApi.getProblemDetails(problemId, langParam);

      if (response.success && response.data) {
        setProblemStatement(response.data.problem_statement || problem.problem_statement || '');

        // Set the solution stub code if available
        if (response.data.solution_stub) {
          setCode(response.data.solution_stub);
        }
      }
    } catch (error) {
      console.error('Error loading problem details:', error);
      // Fallback to basic problem data
      try {
        const fallbackResponse = await eventServiceApi.getProblem(problemId);
        if (fallbackResponse.success && fallbackResponse.data) {
          setProblemStatement(fallbackResponse.data.problem_statement || problem.problem_statement || '');
        }
      } catch (fallbackError) {
        console.error('Error loading fallback problem:', fallbackError);
      }
    }
  }, [problemId, language, problem.problem_statement]);

  const loadSubmissions = useCallback(async () => {
    try {
      const response = await eventServiceApi.getProblemSubmissions(problemId);
      if (response.success && response.data) {
        // Sort submissions by submitted_at descending (most recent first)
        const sortedSubmissions = response.data.sort((a: any, b: any) => {
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
        });
        setSubmissions(sortedSubmissions);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  }, [problemId]);

  const handleLoadSubmission = (submission: any) => {
    // Load the submission code into the editor
    // API returns: code_submitted, language_name, submitted_at
    const code = submission.code_submitted || submission.code;
    const language = submission.language_name || submission.language;
    const submittedAt = submission.submitted_at || submission.created_at;

    if (code) {
      setCode(code);
      // Update language if different
      const submissionLang = language?.toLowerCase();
      if (submissionLang === 'golang') {
        setLanguage('go');
      } else if (submissionLang === 'python') {
        setLanguage('python');
      } else if (submissionLang === 'javascript') {
        setLanguage('javascript');
      }
      toast.success('Submission loaded', {
        description: `Loaded ${language} code from ${new Date(submittedAt).toLocaleString()}`
      });
    }
  };

  // Load problem details and submissions when component mounts or dependencies change
  useEffect(() => {
    loadProblemDetails();
    loadSubmissions();
  }, [loadProblemDetails, loadSubmissions]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult('');

    try {
      const langParam = getLanguageParam(language);
      const response = await eventServiceApi.submitSolution({
        problem_id: problemId,
        language: langParam,
        code: code,
      });

      if (response.success && response.data) {
        // The backend returns: { success: true, data: { actual submission result }, message: "..." }
        // So response.data is the wrapper, and response.data.data is the actual submission result
        const wrapper = response.data as any;
        const result = wrapper.data || wrapper; // Fallback to wrapper if data doesn't exist

        console.log('🔍 Full API response:', response.data);
        console.log('🔍 Submission result:', result);

        // Check if the submission was successful
        // The API returns success=true at wrapper level even for wrong answers
        // We need to check for errors in the actual result object
        const hasError = result.error || result.stderr || (result.message && result.message.includes('Wrong Answer'));
        const isAccepted = !hasError && (result.success === true || result.status === 'accepted' || result.message === 'All test cases passed!');

        console.log('🔍 Error detection:', {
          hasError,
          isAccepted,
          error: result.error,
          stderr: result.stderr,
          message: result.message,
          success: result.success
        });

        if (isAccepted) {
          // Format detailed success result
          let resultString = 'SUCCESS';
          if (result.execution_time_ms) {
            resultString += ` | Execution Time: ${result.execution_time_ms}`;
          }
          if (result.stdout) {
            resultString += ` | Output: ${result.stdout}`;
          }
          if (result.message && result.message !== result.stdout) {
            resultString += ` | Message: ${result.message}`;
          }

          setSubmissionResult(resultString);
          toast.success('Solution accepted!', {
            description: result.execution_time_ms ? `Completed in ${result.execution_time_ms}` : 'All test cases passed!'
          });
          // Reload submissions after successful submission
          loadSubmissions();
        } else {
          // Format detailed error result - submission was successful but code output shows wrong answer
          let errorString = 'ERROR';
          if (result.execution_time_ms) {
            errorString += ` | Execution Time: ${result.execution_time_ms}`;
          }
          if (result.error) {
            errorString += ` | Error: ${result.error}`;
          }
          // Show the actual output from the code (stdout/stderr contains the test case details)
          if (result.stdout) {
            errorString += ` | Output: ${result.stdout}`;
          }
          if (result.stderr && result.stderr !== result.stdout) {
            errorString += ` | Stderr: ${result.stderr}`;
          }
          if (result.message && result.message !== result.stdout && result.message !== result.stderr) {
            errorString += ` | Message: ${result.message}`;
          }

          setSubmissionResult(errorString);
          // Submission API call was successful, but the code produced wrong answer
          toast.success('Submitted successfully', {
            description: 'Check output below for results'
          });
          // Reload submissions after submission (even if wrong answer)
          loadSubmissions();
        }
      } else {
        setSubmissionResult('ERROR | Failed to evaluate submission');
        toast.error('Submission failed', {
          description: response.error?.message || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult('ERROR | An error occurred during submission');
      toast.error('Submission error', {
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_GRADIENT} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={BACKDROP_TEXTURE} />

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 border-b border-[#f5c16c]/20 bg-[#0b0504]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="rounded-lg border-[#f5c16c]/30 bg-[#140707]/80 px-4 text-[10px] uppercase tracking-wider hover:bg-[#f5c16c]/10"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Practice Mode</span>
              <span className="text-xs text-foreground/50">•</span>
              <span className="text-xs text-foreground/70">{problem.title || 'Problem'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-[#f5c16c]/30 bg-[#140707]/80 px-4 text-xs hover:bg-[#f5c16c]/10"
                >
                  Language: {language === 'python' ? 'Python' : language === 'go' ? 'Go' : language === 'javascript' ? 'Javascript' : language}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-[#140707]/95 border-[#f5c16c]/30 backdrop-blur-xl">
                <DropdownMenuItem
                  onClick={() => setLanguage('python')}
                  className="text-xs text-white cursor-pointer hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                >
                  Python
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('go')}
                  className="text-xs text-white cursor-pointer hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                >
                  Go
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('javascript')}
                  className="text-xs text-white cursor-pointer hover:bg-[#f5c16c]/10 focus:bg-[#f5c16c]/10"
                >
                  Javascript
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area - LeetCode Style */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="flex w-[35%] flex-col border-r border-[#f5c16c]/20">
          {/* Problem Description */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{problem.title || 'Problem'}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-foreground/60">Difficulty:</span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    getDifficultyString(problem.difficulty) === 'easy'
                      ? 'text-emerald-400 border-emerald-700/30 bg-emerald-950/50'
                      : getDifficultyString(problem.difficulty) === 'hard'
                      ? 'text-rose-400 border-rose-700/30 bg-rose-950/50'
                      : 'text-amber-400 border-amber-700/30 bg-amber-950/50'
                  }`}>
                    {getDifficultyString(problem.difficulty).charAt(0).toUpperCase() + getDifficultyString(problem.difficulty).slice(1)}
                  </span>
                </div>
              </div>

              {problemStatement && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#f5c16c]/10 px-2 py-1 text-xs font-medium text-[#f5c16c]">
                      Problem Description
                    </span>
                  </div>
                  <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
                    {problemStatement.split('```').map((part, index) => {
                      if (index % 2 === 1) {
                        const lines = part.split('\n');
                        const lang = lines[0].trim();
                        const code = lines.slice(1).join('\n').trim();
                        return (
                          <div key={index} className="space-y-1">
                            {lang && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-[#f5c16c]/5 rounded-t-lg">
                                <span className="text-[10px] font-medium text-[#f5c16c]/70 uppercase tracking-wide">{lang}</span>
                              </div>
                            )}
                            <pre className="overflow-x-auto rounded-lg border border-[#f5c16c]/20 bg-black/60 p-3 text-xs font-mono text-white">
                              <code>{code}</code>
                            </pre>
                          </div>
                        );
                      }
                      if (part.trim()) {
                        const lines = part.trim().split('\n');
                        return (
                          <div key={index} className="space-y-2">
                            {lines.map((line, lineIndex) => {
                              if (line.startsWith('### ')) {
                                return (
                                  <h4 key={lineIndex} className="text-base font-semibold text-[#f5c16c] mt-3">
                                    {line.substring(4)}
                                  </h4>
                                );
                              }
                              if (line.startsWith('## ')) {
                                return (
                                  <h3 key={lineIndex} className="text-lg font-bold text-[#f5c16c] mt-4">
                                    {line.substring(3)}
                                  </h3>
                                );
                              }
                              const processedLine = line.split('`').map((segment, i) =>
                                i % 2 === 1 ? (
                                  <code key={i} className="px-1.5 py-0.5 bg-[#f5c16c]/10 rounded text-[#f5c16c] font-mono text-xs">
                                    {segment}
                                  </code>
                                ) : segment
                              );

                              return line ? (
                                <p key={lineIndex} className="text-foreground/70">
                                  {processedLine}
                                </p>
                              ) : (
                                <div key={lineIndex} className="h-2" />
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Submissions History Section */}
              {submissions.length > 0 && (
                <div className="space-y-3 border-t border-[#f5c16c]/20 pt-4">
                  <button
                    onClick={() => setShowSubmissions(!showSubmissions)}
                    className="flex w-full items-center justify-between rounded bg-[#f5c16c]/10 px-2 py-1 text-xs font-medium text-[#f5c16c] hover:bg-[#f5c16c]/20 transition-colors"
                  >
                    <span>Submission History ({submissions.length})</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showSubmissions ? 'rotate-180' : ''}`} />
                  </button>

                  {showSubmissions && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {submissions.map((submission: any, index: number) => {
                        // API returns: status, language_name, submitted_at, execution_time_ms
                        const status = submission.status || 'N/A';
                        const language = submission.language_name || submission.language || 'Unknown';
                        const submittedAt = submission.submitted_at || submission.created_at;
                        const executionTime = submission.execution_time_ms;

                        const statusColor = status === 'accepted' || status === 'success'
                          ? 'text-emerald-400 bg-emerald-950/50 border-emerald-700/30'
                          : 'text-red-400 bg-red-950/50 border-red-700/30';

                        return (
                          <button
                            key={submission.id || index}
                            onClick={() => handleLoadSubmission(submission)}
                            className="w-full text-left rounded-lg border border-[#f5c16c]/20 bg-black/40 p-3 hover:bg-[#f5c16c]/5 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${statusColor}`}>
                                {status}
                              </span>
                              <span className="text-[10px] text-foreground/50">
                                {new Date(submittedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-foreground/70">{language}</span>
                              {executionTime && (
                                <span className="text-foreground/60">{executionTime}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor and Output */}
        <div className="flex w-[65%] flex-col">
          {/* Code Editor */}
          <div className="flex-1 bg-[#0a0a0a]">
            <div className="h-full">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onSubmit={handleSubmit}
                submissionResult=""
                isSubmitting={isSubmitting}
                spaceConstraintMb={null}
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="h-[40%] overflow-y-auto border-t border-[#f5c16c]/20 bg-[#0f0504]/40 px-4 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f5c16c]">Execution Result</h3>
              {submissionResult ? (
                <div className="space-y-2">
                  {(() => {
                    // Parse the submission result
                    const parts = submissionResult.split('|').map(p => p.trim());
                    const status = parts[0];
                    const isSuccess = status === 'SUCCESS';
                    const isError = status === 'ERROR';

                    // Parse details into a structured object
                    const details: Record<string, string> = {};

                    parts.slice(1).forEach(part => {
                      const colonIndex = part.indexOf(':');
                      if (colonIndex > 0) {
                        const key = part.substring(0, colonIndex).trim();
                        const value = part.substring(colonIndex + 1).trim();
                        details[key] = value;
                      }
                    });

                    return (
                      <div className="space-y-3">
                        {/* Status Banner */}
                        <div className={`flex items-center justify-between rounded-lg border p-3 ${
                          isSuccess
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : isError
                            ? 'border-red-500/30 bg-red-500/10'
                            : 'border-amber-500/30 bg-amber-500/10'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {isSuccess ? '✅' : isError ? '❌' : '⚠️'}
                            </span>
                            <span className={`font-bold text-sm ${
                              isSuccess
                                ? 'text-emerald-400'
                                : isError
                                ? 'text-red-400'
                                : 'text-amber-400'
                            }`}>
                              {isSuccess ? 'Accepted' : isError ? 'Wrong Answer' : status}
                            </span>
                          </div>
                          {details['Status'] && details['Status'] !== 'Wrong Answer' && (
                            <span className="text-xs text-foreground/60">{details['Status']}</span>
                          )}
                        </div>

                        {/* Execution Time */}
                        {details['Execution Time'] && (
                          <div className="rounded-lg border border-[#f5c16c]/20 bg-black/40 px-3 py-2 text-xs">
                            <span className="text-foreground/60">Execution Time: </span>
                            <span className="text-white font-mono">{details['Execution Time']}</span>
                          </div>
                        )}

                        {/* Success Details */}
                        {isSuccess && Object.keys(details).length > 0 && (
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                            {Object.entries(details)
                              .filter(([key]) => key !== 'Status' && key !== 'Execution Time')
                              .map(([key, value], idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <span className="font-semibold text-emerald-400 min-w-[120px]">{key}:</span>
                                  <span className="text-white font-mono">{value}</span>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Raw output for debugging */}
                        <details className="text-xs">
                          <summary className="cursor-pointer text-foreground/50 hover:text-foreground/80">
                            View Raw Output
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded-lg border border-[#f5c16c]/20 bg-black/60 p-3 text-xs font-mono text-white whitespace-pre-wrap">
                            {submissionResult}
                          </pre>
                        </details>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <div className="text-4xl opacity-30">💻</div>
                  <p className="text-xs text-foreground/50">
                    Submit your code to see execution results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
