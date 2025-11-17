"use client";

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { EditorView } from '@codemirror/view';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  submissionResult: string;
  isSubmitting: boolean;
  spaceConstraintMb: number | null;
}

export default function CodeEditor({ code, setCode, language, setLanguage, onSubmit, submissionResult, isSubmitting, spaceConstraintMb }: CodeEditorProps) {
  // Get language extension
  const getLanguageExtension = () => {
    switch (language) {
      case 'python':
        return [python()];
      case 'go':
        return [go()];
      default:
        return [];
    }
  };

  // Calculate code memory usage
  const codeMemoryMb = useMemo(() => {
    // Calculate approximate memory usage in MB
    // JavaScript uses UTF-16, so 2 bytes per character
    const bytes = new Blob([code]).size;
    return bytes / (1024 * 1024);
  }, [code]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-full border border-[#f5c16c]/25 bg-[#140707]/80 px-4 py-2 text-sm uppercase tracking-[0.35em] text-foreground/80"
        >
          <option value="python">Python</option>
          <option value="go">Go</option>
        </select>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] px-6 text-xs uppercase tracking-[0.35em] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.4)] hover:from-[#f061a6] hover:via-[#f5c16c] hover:to-[#f0b26a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#d23187] disabled:hover:via-[#f5c16c] disabled:hover:to-[#f5c16c]"
        >
          <Play className="h-4 w-4" />
          {isSubmitting ? 'Evaluating...' : 'Submit Invocation'}
        </Button>

        {/* Constraints Display */}
        <div className="ml-auto flex items-center gap-4">
          {spaceConstraintMb !== null && (
            <div className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
              codeMemoryMb > spaceConstraintMb
                ? 'border-rose-400/40 bg-rose-500/20'
                : 'border-[#f5c16c]/25 bg-[#140707]/80'
            }`}>
              <svg className={`h-4 w-4 ${codeMemoryMb > spaceConstraintMb ? 'text-rose-400' : 'text-[#f5c16c]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="text-xs text-foreground/80">
                {codeMemoryMb.toFixed(4)} / {spaceConstraintMb} MB
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#f5c16c]/22 bg-black/40 shadow-[inset_0_0_35px_rgba(210,49,135,0.28)]">
        <CodeMirror
          value={code}
          height="400px"
          theme="dark"
          extensions={[
            getLanguageExtension(),
            EditorView.lineWrapping,
          ]}
          onChange={(value) => {
            setCode(value);
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          style={{
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
          }}
        />
      </div>

      {submissionResult && (() => {
        // Parse the submission result to extract structured data
        const lines = submissionResult.split('|');
        const firstLine = lines[1] || submissionResult;
        
        // Check if the message contains inline test case data (all in one line)
        const hasInlineTestData = firstLine.includes('Input:') && firstLine.includes('Expected Output:') && firstLine.includes('Your Output:');
        
        let parsedData: {
          mainMessage: string;
          input?: string;
          expectedOutput?: string;
          yourOutput?: string;
          executionTime?: string;
          status?: string;
        } = { mainMessage: '' };
        
        if (hasInlineTestData) {
          // Extract main message (everything before "Input:")
          const inputIndex = firstLine.indexOf('Input:');
          parsedData.mainMessage = firstLine.substring(0, inputIndex).trim();
          
          // Extract test case data using regex
          const inputMatch = firstLine.match(/Input:\s*([^E]+?)(?=\s+Expected Output:)/);
          const expectedMatch = firstLine.match(/Expected Output:\s*([^Y]+?)(?=\s+Your Output:)/);
          const yourOutputMatch = firstLine.match(/Your Output:\s*(.+?)(?:\s+Execution Time:|$)/);
          const executionTimeMatch = firstLine.match(/Execution Time:\s*([^S]+?)(?=\s+Status:|$)/);
          const statusMatch = firstLine.match(/Status:\s*(.+)$/);
          
          parsedData.input = inputMatch?.[1]?.trim();
          parsedData.expectedOutput = expectedMatch?.[1]?.trim();
          parsedData.yourOutput = yourOutputMatch?.[1]?.trim();
          parsedData.executionTime = executionTimeMatch?.[1]?.trim();
          parsedData.status = statusMatch?.[1]?.trim();
        } else {
          // For pipe-separated format, extract data from lines
          let scoreValue = '';
          lines.forEach((line, index) => {
            if (index === 0) return; // Skip status prefix
            
            const executionTimeMatch = line.match(/^Execution Time:\s*(.+)$/);
            const statusMatch = line.match(/^Status:\s*(.+)$/);
            const scoreMatch = line.match(/^Score:\s*(.+)$/);
            
            if (executionTimeMatch) {
              parsedData.executionTime = executionTimeMatch[1];
            } else if (statusMatch) {
              parsedData.status = statusMatch[1];
            } else if (scoreMatch) {
              scoreValue = scoreMatch[1];
            } else if (index === 1 && !parsedData.mainMessage) {
              parsedData.mainMessage = line;
            }
          });
          
          // Store score separately for display
          if (scoreValue) {
            parsedData.yourOutput = scoreValue; // Reuse field for score display
          }
        }
        
        const isError = submissionResult.startsWith('ERROR') || submissionResult.includes('Execution failed');
        const isSuccess = submissionResult.startsWith('SUCCESS');
        
        return (
          <div
            className={`rounded-2xl border px-4 py-4 text-sm transition-all ${
              isSuccess
                ? 'border-emerald-400/50 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : isError
                ? 'border-rose-400/50 bg-rose-500/20 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : submissionResult.startsWith('SUBMITTING')
                ? 'border-[#f5c16c]/50 bg-[#f5c16c]/15 text-white animate-pulse shadow-[0_0_20px_rgba(245,193,108,0.4)]'
                : submissionResult.startsWith('INFO')
                ? 'border-blue-400/50 bg-blue-500/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-[#d23187]/40 bg-[#d23187]/20 text-white'
            }`}
          >
            <div className="space-y-3">
              {/* Header with Main message (no metadata on right for success to avoid duplication) */}
              <div className={`${parsedData.mainMessage ? 'pb-3 border-b border-white/10' : ''}`}>
                {parsedData.mainMessage && (
                  <div className="text-lg font-bold">
                    {parsedData.mainMessage}
                  </div>
                )}
              </div>
              
              {/* Input */}
              {parsedData.input && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Input</div>
                  <div className="rounded-lg bg-black/50 px-4 py-2.5 font-mono text-sm border border-white/10 shadow-inner">
                    {parsedData.input}
                  </div>
                </div>
              )}
              
              {/* Expected Output */}
              {parsedData.expectedOutput && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Expected Output</div>
                  <div className="rounded-lg bg-black/50 px-4 py-2.5 font-mono text-sm border border-emerald-400/20 shadow-inner">
                    {parsedData.expectedOutput}
                  </div>
                </div>
              )}
              
              {/* Your Output */}
              {parsedData.yourOutput && (
                <div className="flex flex-col gap-1.5">
                  <div className={`text-xs font-semibold uppercase tracking-wide ${isSuccess ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                    {isSuccess && !parsedData.input ? 'Score Earned' : 'Your Output'}
                  </div>
                  <div className={`rounded-lg bg-black/50 px-4 py-2.5 font-mono text-sm border shadow-inner ${
                    isSuccess ? 'border-emerald-400/20' : 'border-rose-400/20'
                  }`}>
                    {parsedData.yourOutput}
                  </div>
                </div>
              )}
              
              {/* Additional success details */}
              {isSuccess && parsedData.status && (
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-emerald-100">Submission Status</p>
                      <p className="text-sm text-emerald-200/80">{parsedData.status}</p>
                      {parsedData.executionTime && (
                        <p className="text-xs text-emerald-300/70">Executed in {parsedData.executionTime}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Removed duplicate Execution Time and Status from bottom since they're now in header */}
              
              {/* Fallback: If no inline test data was found, display remaining lines */}
              {!hasInlineTestData && lines.map((line, index) => {
                if (index === 0) return null; // Skip status prefix
                
                // Skip lines that are already displayed in header
                const executionTimeMatch = line.match(/^Execution Time:\s*(.+)$/);
                const statusMatch = line.match(/^Status:\s*(.+)$/);
                const scoreMatch = line.match(/^Score:\s*(.+)$/);
                
                if (executionTimeMatch || statusMatch || scoreMatch) {
                  return null; // Already shown in header
                }
                
                // Check for separate line patterns
                const inputMatch = line.match(/^Input:\s*(.+)$/);
                const expectedMatch = line.match(/^Expected Output:\s*(.+)$/);
                const yourOutputMatch = line.match(/^Your Output:\s*(.+)$/);
                
                if (inputMatch) {
                  return (
                    <div key={index} className="flex flex-col gap-1.5">
                      <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Input</div>
                      <div className="rounded-lg bg-black/50 px-4 py-2.5 font-mono text-sm border border-white/10 shadow-inner">
                        {inputMatch[1]}
                      </div>
                    </div>
                  );
                }
                
                if (expectedMatch) {
                  return (
                    <div key={index} className="flex flex-col gap-1.5">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Expected Output</div>
                      <div className="rounded-lg bg-black/50 px-4 py-2.5 font-mono text-sm border border-emerald-400/20 shadow-inner">
                        {expectedMatch[1]}
                      </div>
                    </div>
                  );
                }
                
                if (yourOutputMatch) {
                  return (
                    <div key={index} className="flex flex-col gap-1.5">
                      <div className={`text-xs font-semibold uppercase tracking-wide ${isSuccess ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                        Your Output
                      </div>
                      <div className={`rounded-lg bg-black/50 px-4 py-2.5 font-mono text-sm border shadow-inner ${
                        isSuccess ? 'border-emerald-400/20' : 'border-rose-400/20'
                      }`}>
                        {yourOutputMatch[1]}
                      </div>
                    </div>
                  );
                }
                
                // Main message (first line after status prefix, if not already set)
                if (index === 1 || line.includes('Execution failed') || line.includes('Wrong Answer') || line.includes('Solution is correct')) {
                  // Skip if already in header
                  if (parsedData.mainMessage === line) return null;
                  
                  return (
                    <div key={index} className="text-base font-bold">
                      {line}
                    </div>
                  );
                }
                
                return (
                  <div key={index} className="text-sm opacity-90">
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
