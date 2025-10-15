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
    console.log('ExercisesList code useEffect:', { isEditorReady, hasEditor: !!monacoEditor.current, codeLength: code?.length });
    if (isEditorReady && monacoEditor.current) {
      const currentValue = monacoEditor.current.getValue();
      if (currentValue !== code) {
        console.log('Updating Monaco editor in ExercisesList with new code');
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
    console.log('ExercisesList handleProblemSelect:', { problemId: problem.ID, title: problem.Title, language });
    setSelectedProblem(problem);
    setSubmissionResult('');
    
    // Immediately load code stub
    try {
      if (USE_MOCK_DATA) {
        const { mockProblemLanguageDetails } = await import('@/lib/mockCodeBattleData');
        const normalizedLang = language === 'go' ? 'Golang' : 
                              language === 'python' ? 'Python' : 'Javascript';
        const problemDetails = mockProblemLanguageDetails[problem.ID]?.[normalizedLang];
        
        console.log('Exercise problem details:', { hasDetails: !!problemDetails, normalizedLang });
        
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <BookOpen className="w-5 h-5" />
            All Problems
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading problems...</p>
          ) : problems.length === 0 ? (
            <p className="text-muted-foreground">No problems available</p>
          ) : (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto">
              {problems.map((problem) => (
                <li
                  key={problem.ID}
                  onClick={() => handleProblemSelect(problem)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedProblem?.ID === problem.ID
                      ? 'bg-accent text-primary font-semibold'
                      : 'bg-card hover:bg-accent/10 border border-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{problem.Title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(problem.Difficulty)}`}>
                      {getDifficultyLabel(problem.Difficulty)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="text-accent">
            {selectedProblem ? `Solving: ${selectedProblem.Title}` : 'Select a Problem'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProblem ? (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                </select>
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Submit Solution
                </Button>
              </div>
              
              <div 
                ref={editorRef} 
                className="w-full h-[400px] border-2 border-accent/20 rounded-lg overflow-hidden"
              />
              
              {submissionResult && (
                <div className={`p-4 rounded-lg ${
                  submissionResult.includes('Success')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                    : submissionResult.includes('Failed')
                    ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                    : 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                }`}>
                  <pre className="whitespace-pre-wrap">{submissionResult}</pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Select a problem to start coding</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
