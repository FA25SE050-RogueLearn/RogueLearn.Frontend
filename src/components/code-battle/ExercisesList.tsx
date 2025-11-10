"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';
import { 
  mockCodeProblems, 
  CodeProblem, 
  getDifficultyLabel, 
  getDifficultyColor 
} from '@/lib/mockCodeBattleData';

interface ExercisesListProps {
  apiBaseUrl: string;
  onSubmit: (problemId: string, code: string, language: string) => Promise<any>;
}

const USE_MOCK_DATA = true; // Set to false when backend is ready

export default function ExercisesList({ apiBaseUrl, onSubmit }: ExercisesListProps) {
  const [problems, setProblems] = useState<CodeProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodeProblem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submissionResult, setSubmissionResult] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditor = useRef<any>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Use mock data
          setTimeout(() => {
            setProblems(mockCodeProblems);
            setLoading(false);
          }, 300); // Simulate network delay
        } else {
          // Use real API
          const response = await fetch(`${apiBaseUrl}/problems`);
          const data = await response.json();
          if (data.data) {
            setProblems(data.data);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setLoading(false);
      }
    };

    fetchProblems();
  }, [apiBaseUrl]);

  // Load Monaco Editor (only once when problem is first selected)
  useEffect(() => {
    if (typeof window !== 'undefined' && editorRef.current && !monacoEditor.current && selectedProblem) {
      // Check if Monaco is already loaded
      // @ts-ignore
      if (typeof window.monaco !== 'undefined') {
        // Monaco already loaded, create editor directly
        // @ts-ignore
        monacoEditor.current = monaco.editor.create(editorRef.current, {
          value: code || '// Select a problem to start coding...',
          language: language,
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
        });

        monacoEditor.current.onDidChangeModelContent(() => {
          setCode(monacoEditor.current.getValue());
        });
        
        setIsEditorReady(true);
      } else {
        // Load Monaco for the first time
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs/loader.js';
        script.onload = () => {
          // @ts-ignore
          window.require.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }
          });
          
          // @ts-ignore
          window.require(['vs/editor/editor.main'], () => {
            // @ts-ignore
            monacoEditor.current = monaco.editor.create(editorRef.current, {
              value: code || '// Select a problem to start coding...',
              language: language,
              theme: 'vs-dark',
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize: 14,
            });

            monacoEditor.current.onDidChangeModelContent(() => {
              setCode(monacoEditor.current.getValue());
            });
            
            // Mark editor as ready
            setIsEditorReady(true);
          });
        };
        document.body.appendChild(script);
      }
    }
    // We intentionally don't include code/language deps - they're handled by separate useEffects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProblem]);

  useEffect(() => {
    if (isEditorReady && monacoEditor.current) {
      const currentValue = monacoEditor.current.getValue();
      if (currentValue !== code) {
        monacoEditor.current.setValue(code);
      }
    }
  }, [code, isEditorReady]);

  useEffect(() => {
    if (isEditorReady && monacoEditor.current) {
      // @ts-ignore
      monaco.editor.setModelLanguage(monacoEditor.current.getModel(), language);
    }
  }, [language, isEditorReady]);

  // Load code stub when problem or language changes
  useEffect(() => {
    const loadCodeStub = async () => {
      if (!selectedProblem) return;
      
      try {
        if (USE_MOCK_DATA) {
          // Use mock data - load solution stub
          const { mockProblemLanguageDetails } = await import('@/lib/mockCodeBattleData');
          const normalizedLang = language === 'go' ? 'Golang' : 
                                language === 'python' ? 'Python' : 'Javascript';
          const problemDetails = mockProblemLanguageDetails[selectedProblem.ID]?.[normalizedLang];
          
          if (problemDetails) {
            setCode(problemDetails.SolutionStub);
          } else {
            setCode('// Start coding here\n// Solution stub not available for this problem/language combination');
          }
        } else {
          // Use real API
          const response = await fetch(`${apiBaseUrl}/problems/${selectedProblem.ID}/details?lang=${language}`);
          const data = await response.json();
          if (data.success && data.data) {
            setCode(data.data.SolutionStub || '// Start coding here');
          }
        }
      } catch (error) {
        console.error('Error fetching problem details:', error);
        setCode('// Error loading problem template');
      }
    };

    loadCodeStub();
  }, [selectedProblem, language, apiBaseUrl]);

  const handleProblemSelect = async (problem: CodeProblem) => {
    setSelectedProblem(problem);
    setSubmissionResult('');
    
    // Immediately load code stub
    try {
      if (USE_MOCK_DATA) {
        const { mockProblemLanguageDetails } = await import('@/lib/mockCodeBattleData');
        const normalizedLang = language === 'go' ? 'Golang' : 
                              language === 'python' ? 'Python' : 'Javascript';
        const problemDetails = mockProblemLanguageDetails[problem.ID]?.[normalizedLang];
        
        if (problemDetails) {
          setCode(problemDetails.SolutionStub);
        } else {
          setCode('// Start coding here\n// Solution stub not available for this problem/language combination');
        }
      } else {
        const response = await fetch(`${apiBaseUrl}/problems/${problem.ID}/details?lang=${language}`);
        const data = await response.json();
        if (data.success && data.data) {
          setCode(data.data.SolutionStub || '// Start coding here');
        }
      }
    } catch (error) {
      console.error('Error loading problem template:', error);
      setCode('// Error loading problem template');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProblem || !code.trim()) {
      alert('Please select a problem and write some code');
      return;
    }

    setSubmissionResult('Submitting...');
    const result = await onSubmit(selectedProblem.ID, code, language);
    
    if (result.success) {
      setSubmissionResult(`Success! All test cases passed. Execution time: ${result.data.execution_time_ms || 'N/A'}`);
    } else {
      setSubmissionResult(`Failed: ${result.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-linear-to-br from-[#26120d]/88 via-[#150908]/94 to-[#080404]/97 p-6 shadow-[0_22px_65px_rgba(52,18,9,0.55)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.4),transparent_70%)] opacity-[0.35]" />
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d23187]/20 text-[#f5c16c]">
              <BookOpen className="h-5 w-5" />
            </span>
            Practice Codex
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {loading ? (
            <p className="text-sm text-foreground/60">Compiling exercises...</p>
          ) : problems.length === 0 ? (
            <p className="text-sm text-foreground/60">No drills available.</p>
          ) : (
            <ul className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
              {problems.map((problem) => (
                <li
                  key={problem.ID}
                  onClick={() => handleProblemSelect(problem)}
                  className={`rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                    selectedProblem?.ID === problem.ID
                      ? 'border-[#d23187]/55 bg-[#d23187]/20 text-white shadow-[0_12px_30px_rgba(210,49,135,0.35)]'
                      : 'border-[#f5c16c]/15 bg-white/5 text-foreground/70 hover:border-[#d23187]/40 hover:bg-[#d23187]/15 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{problem.Title}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.35em] ${getDifficultyColor(
                        problem.Difficulty
                      )}`}
                    >
                      {getDifficultyLabel(problem.Difficulty)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-linear-to-br from-[#23110d]/88 via-[#140908]/94 to-[#080404]/97 p-6 shadow-[0_22px_65px_rgba(54,18,9,0.55)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,193,108,0.35),transparent_70%)] opacity-[0.35]" />
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            {selectedProblem ? `Solving: ${selectedProblem.Title}` : 'Select a Problem'}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {selectedProblem ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm uppercase tracking-[0.35em] text-foreground/80"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                </select>
                <Button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] px-6 text-xs uppercase tracking-[0.35em] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.4)] hover:from-[#f061a6] hover:via-[#f5c16c] hover:to-[#f0b26a]"
                >
                  <Play className="h-4 w-4" />
                  Run Trials
                </Button>
              </div>

              <div
                ref={editorRef}
                className="h-[400px] w-full overflow-hidden rounded-2xl border border-[#f5c16c]/22 bg-black/40 shadow-[inset_0_0_30px_rgba(210,49,135,0.25)]"
              />

              {submissionResult && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    submissionResult.includes('Success')
                      ? 'border-[#f5c16c]/35 bg-[#f5c16c]/15 text-[#2b130f]'
                      : submissionResult.includes('Failed')
                      ? 'border-rose-400/40 bg-rose-500/15 text-white'
                      : 'border-[#d23187]/40 bg-[#d23187]/15 text-white'
                  }`}
                >
                  <pre className="whitespace-pre-wrap leading-relaxed">{submissionResult}</pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">Select a problem from the codex to begin your drill.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
