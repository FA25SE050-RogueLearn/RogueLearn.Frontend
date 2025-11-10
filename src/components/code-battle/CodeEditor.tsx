"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  submissionResult: string;
}

export default function CodeEditor({ code, setCode, language, setLanguage, onSubmit, submissionResult }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditor = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    // Load Monaco Editor
    if (typeof window !== 'undefined' && editorRef.current && !monacoEditor.current) {
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

    return () => {
      if (monacoEditor.current) {
        monacoEditor.current.dispose();
        monacoEditor.current = null;
        setIsEditorReady(false);
      }
    };
    // Initial setup only - code and language updates handled by separate useEffects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only update code when editor is ready
    if (isEditorReady && monacoEditor.current && code !== undefined) {
      const currentValue = monacoEditor.current.getValue();
      // Only update if the code is actually different
      if (currentValue !== code) {
        monacoEditor.current.setValue(code);
      }
    }
  }, [code, isEditorReady]);

  useEffect(() => {
    // Only update language when editor is ready
    if (isEditorReady && monacoEditor.current) {
      // @ts-ignore
      monaco.editor.setModelLanguage(monacoEditor.current.getModel(), language);
    }
  }, [language, isEditorReady]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-full border border-[#f5c16c]/25 bg-[#140707]/80 px-4 py-2 text-sm uppercase tracking-[0.35em] text-foreground/80"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
        </select>
        <Button
          onClick={onSubmit}
          className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#d23187] via-[#f5c16c] to-[#f5c16c] px-6 text-xs uppercase tracking-[0.35em] text-[#2b130f] shadow-[0_15px_40px_rgba(210,49,135,0.4)] hover:from-[#f061a6] hover:via-[#f5c16c] hover:to-[#f0b26a]"
        >
          <Play className="h-4 w-4" />
          Submit Invocation
        </Button>
      </div>

      <div
        ref={editorRef}
        className="h-[400px] w-full overflow-hidden rounded-2xl border border-[#f5c16c]/22 bg-black/40 shadow-[inset_0_0_35px_rgba(210,49,135,0.28)]"
      />

      {submissionResult && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            submissionResult.includes('Success') || submissionResult.includes('Accepted')
              ? 'border-[#f5c16c]/35 bg-[#f5c16c]/15 text-[#2b130f]'
              : submissionResult.includes('Failed') || submissionResult.includes('error')
              ? 'border-rose-400/40 bg-rose-500/20 text-white'
              : 'border-[#d23187]/40 bg-[#d23187]/20 text-white'
          }`}
        >
          {submissionResult}
        </div>
      )}
    </div>
  );
}
