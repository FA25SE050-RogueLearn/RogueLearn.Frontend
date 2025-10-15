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
        <Button onClick={onSubmit} className="flex items-center gap-2">
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
          submissionResult.includes('Success') || submissionResult.includes('Accepted')
            ? 'bg-green-500/10 border border-green-500/30 text-green-500'
            : submissionResult.includes('Failed') || submissionResult.includes('error')
            ? 'bg-red-500/10 border border-red-500/30 text-red-500'
            : 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
        }`}>
          {submissionResult}
        </div>
      )}
    </div>
  );
}
