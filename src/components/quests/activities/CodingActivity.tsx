// roguelearn-web/src/components/quests/activities/CodingActivity.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Code, Play, RefreshCw, Cpu } from 'lucide-react';
import questApi from '@/api/questApi';
import { toast } from 'sonner';

interface CodingPayload {
    language: string;
    topic: string;
    description: string;
    starterCode: string;
    experiencePoints: number;
}

interface CodingActivityProps {
    questId: string;
    stepId: string;
    activityId: string;
    payload: CodingPayload;
    onComplete: () => void;
    isCompleted?: boolean;
}

const CodingActivity: React.FC<CodingActivityProps> = ({
    questId,
    stepId,
    activityId,
    payload,
    onComplete,
    isCompleted = false,
}) => {
    console.log("PAYLOAD WE RECEIVE FOR ACTIVTY", payload)
    // Fix: Handle AI generation quirk where newlines are literal strings
    const initialCode = payload.starterCode
        ? payload.starterCode.replace(/newline/g, '\n')
        : `// Write your ${payload.language} code here...`;

    const [code, setCode] = useState(initialCode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        passed: boolean;
        feedback: string;
    } | null>(null);

    // Map backend language strings to Monaco editor languages
    const getMonacoLanguage = (lang: string) => {
        const l = (lang || '').toLowerCase();
        if (l === 'csharp' || l === 'c#') return 'csharp';
        if (l === 'cpp' || l === 'c++') return 'cpp';
        if (l === 'javascript' || l === 'js') return 'javascript';
        if (l === 'python') return 'python';
        if (l === 'java') return 'java';
        return 'plaintext';
    };

    const handleReset = () => {
        setCode(initialCode);
        setResult(null);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setResult(null);

        try {
            const response = await questApi.submitCodingActivity(
                questId,
                stepId,
                activityId,
                {
                    code,
                    language: payload.language
                }
            );

            if (response.isSuccess && response.data) {
                setResult({
                    score: response.data.score,
                    passed: response.data.isPassed,
                    feedback: response.data.feedback,
                });

                if (response.data.isPassed) {
                    toast.success(`Coding Challenge Passed! +${payload.experiencePoints} XP`);
                    onComplete();
                } else {
                    toast.error('Solution did not pass. Check the feedback below.');
                }
            } else {
                toast.error(response.message || 'Failed to submit code.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit code. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className={`flex flex-col gap-6 p-6 border transition-all duration-500 overflow-hidden relative ${isCompleted ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-black/40 border-[#f5c16c]/20'}`}>
            {/* Background Texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#f5c16c]/20 text-[#f5c16c]'}`}>
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{payload.topic || 'Coding Challenge'}</h3>
                        <p className="text-xs text-white/50">{payload.language} • {payload.experiencePoints} XP</p>
                    </div>
                </div>
                {isCompleted && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                        <CheckCircle className="w-4 h-4" /> Completed
                    </div>
                )}
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Instructions */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">Instructions</h4>
                    <div className="prose prose-sm prose-invert max-w-none bg-black/50 p-4 rounded-xl border border-white/10 max-h-[500px] overflow-y-auto">
                        <ReactMarkdown>{payload.description || "**No instructions provided.**"}</ReactMarkdown>
                    </div>
                </div>

                {/* Right Column: Editor */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">Solution</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-6 text-xs text-white/40 hover:text-white"
                        >
                            <RefreshCw className="w-3 h-3 mr-1" /> Reset
                        </Button>
                    </div>

                    <div className="rounded-xl border border-white/20 overflow-hidden shadow-2xl h-[500px]">
                        <Editor
                            height="100%"
                            defaultLanguage={getMonacoLanguage(payload.language)}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex flex-wrap items-center justify-end gap-4 border-t border-white/10 pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (isCompleted && !result)}
                    className={`px-8 font-bold ${isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black hover:from-[#d4a855] hover:to-[#f5c16c]'}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Tests...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4 fill-current" />
                            {isCompleted ? 'Run Again' : 'Run Code'}
                        </>
                    )}
                </Button>
            </div>

            {/* AI Feedback Section */}
            {result && (
                <div className={`relative z-10 p-5 rounded-xl border-l-4 animate-in fade-in slide-in-from-top-2 duration-300 ${result.passed ? 'border-l-emerald-500 bg-emerald-950/40' : 'border-l-red-500 bg-red-950/40'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 p-1 rounded-full ${result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {result.passed ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-lg font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                {result.passed ? 'Test Cases Passed!' : 'Execution Failed'}
                                <span className="ml-3 text-sm font-medium opacity-80 text-white">
                                    Score: {result.score}/100
                                </span>
                            </h4>
                            <div className="mt-3 text-sm text-white/90 prose prose-sm prose-invert max-w-none">
                                <ReactMarkdown>{result.feedback}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CodingActivity;