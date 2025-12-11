"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Loader2, 
    ChevronLeft,
    Zap,
    Shield,
    Flame,
    BookOpen,
    BrainCircuit,
    Code,
    CheckCircle,
    ExternalLink,
    Sparkles,
    RefreshCw,
    Pencil
} from "lucide-react";
import { toast } from "sonner";
import questApi, { AdminQuestDetailsDto, AdminQuestStepDto } from "@/api/questApi";
import QuestProgressionGraph from "@/components/admin/quests/QuestProgressionGraph";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { QuestGenerationModal } from "@/components/quests/QuestGenerationModal";
import { EditQuestStepDialog } from "@/components/admin/quests/EditQuestStepDialog";

export default function AdminQuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const questId = params.questId as string;

    const [quest, setQuest] = useState<AdminQuestDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState<'Standard' | 'Supportive' | 'Challenging'>('Standard');
    const [selectedStep, setSelectedStep] = useState<AdminQuestStepDto | null>(null);

    // Generation state
    const [generationJobId, setGenerationJobId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);

    // Edit step state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<AdminQuestStepDto | null>(null);

    const handleEditStep = (step: AdminQuestStepDto) => {
        setEditingStep(step);
        setIsEditDialogOpen(true);
    };

    const handleEditSaved = async () => {
        const editedStepId = editingStep?.id;
        try {
            const res = await questApi.adminGetQuestDetails(questId);
            if (res.isSuccess && res.data) {
                setQuest(res.data);
                // Find and select the updated step
                if (editedStepId) {
                    const allSteps = [
                        ...(res.data.standardSteps || []),
                        ...(res.data.supportiveSteps || []),
                        ...(res.data.challengingSteps || []),
                    ];
                    const updated = allSteps.find(s => s.id === editedStepId);
                    if (updated) {
                        setSelectedStep(updated);
                    }
                }
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to refresh quest data");
        }
    };

    const loadQuest = useCallback(async () => {
        setLoading(true);
        try {
            const res = await questApi.adminGetQuestDetails(questId);
            if (res.isSuccess && res.data) {
                setQuest(res.data);
                // Auto-select first step if available
                const steps = res.data.standardSteps || res.data.supportiveSteps || res.data.challengingSteps || [];
                if (steps.length > 0) {
                    setSelectedStep(prev => prev || steps[0]);
                }
            } else {
                toast.error(res.message || "Failed to load quest");
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to load quest");
        } finally {
            setLoading(false);
        }
    }, [questId]);

    useEffect(() => {
        loadQuest();
    }, [loadQuest]);

    const handleStepClick = (step: AdminQuestStepDto) => {
        setSelectedStep(step);
    };

    const handleTrackChange = (track: 'Standard' | 'Supportive' | 'Challenging') => {
        setSelectedTrack(track);
        // Select first step of new track
        if (quest) {
            const steps = track === 'Standard' ? quest.standardSteps :
                         track === 'Supportive' ? quest.supportiveSteps :
                         quest.challengingSteps;
            if (steps && steps.length > 0) {
                setSelectedStep(steps[0]);
            } else {
                setSelectedStep(null);
            }
        }
    };

    const handleGenerate = async () => {
        if (!quest) return;
        setIsGenerating(true);
        try {
            const res = await questApi.adminGenerateQuestSteps(questId);
            if (res.isSuccess && res.data?.jobId) {
                setGenerationJobId(res.data.jobId);
                setIsGenerationModalOpen(true);
            } else {
                toast.error(res.message || "Failed to start generation");
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to start generation");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerationComplete = () => {
        setIsGenerationModalOpen(false);
        setGenerationJobId(null);
        loadQuest();
    };

    const getStepsForTrack = () => {
        if (!quest) return [];
        switch (selectedTrack) {
            case 'Supportive': return quest.supportiveSteps || [];
            case 'Challenging': return quest.challengingSteps || [];
            default: return quest.standardSteps || [];
        }
    };

    const totalSteps = quest ? 
        (quest.standardSteps?.length || 0) + 
        (quest.supportiveSteps?.length || 0) + 
        (quest.challengingSteps?.length || 0) : 0;

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                </div>
            </AdminLayout>
        );
    }

    if (!quest) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-white/50">Quest not found.</p>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/admin/quests')}
                        className="mt-4"
                    >
                        Back to Quests
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/admin/quests')}
                            className="text-white/60 hover:text-white -ml-2"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Quests
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-white">{quest.title}</h1>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    {quest.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[#f5c16c] font-mono">{quest.subjectCode}</span>
                                <span className="text-white/40">•</span>
                                <span className="text-white/60">{quest.subjectName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {totalSteps === 0 ? (
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Generate Steps
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="border-[#f5c16c]/30 text-white"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Regenerate
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#f5c16c]/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-[#f5c16c]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{quest.standardSteps?.length || 0}</p>
                                    <p className="text-xs text-white/50">Standard Steps</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1a1410] border-emerald-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{quest.supportiveSteps?.length || 0}</p>
                                    <p className="text-xs text-white/50">Supportive Steps</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1a1410] border-pink-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{quest.challengingSteps?.length || 0}</p>
                                    <p className="text-xs text-white/50">Challenging Steps</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1a1410] border-[#7289da]/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#7289da]/20 flex items-center justify-center">
                                    <BrainCircuit className="w-5 h-5 text-[#7289da]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{quest.questType}</p>
                                    <p className="text-xs text-white/50">Quest Type</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {totalSteps > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Progression Graph */}
                        <div className="lg:col-span-2">
                            <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                                <CardHeader className="border-b border-[#f5c16c]/10">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white">Quest Progression</CardTitle>
                                        <Tabs value={selectedTrack} onValueChange={(v) => handleTrackChange(v as any)}>
                                            <TabsList className="bg-[#0a0506] border border-[#f5c16c]/20">
                                                <TabsTrigger 
                                                    value="Standard" 
                                                    className="data-[state=active]:bg-[#f5c16c] data-[state=active]:text-black text-xs"
                                                >
                                                    <Zap className="w-3 h-3 mr-1" /> Standard
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="Supportive" 
                                                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black text-xs"
                                                >
                                                    <Shield className="w-3 h-3 mr-1" /> Supportive
                                                </TabsTrigger>
                                                <TabsTrigger 
                                                    value="Challenging" 
                                                    className="data-[state=active]:bg-pink-500 data-[state=active]:text-black text-xs"
                                                >
                                                    <Flame className="w-3 h-3 mr-1" /> Challenging
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <QuestProgressionGraph 
                                        quest={quest} 
                                        selectedTrack={selectedTrack}
                                        onStepClick={handleStepClick}
                                    />
                                </CardContent>
                            </Card>

                            {/* Steps List */}
                            <Card className="bg-[#1a1410] border-[#f5c16c]/20 mt-6">
                                <CardHeader className="border-b border-[#f5c16c]/10">
                                    <CardTitle className="text-white text-sm">
                                        {selectedTrack} Track - All Weeks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-2">
                                        {getStepsForTrack().map((step) => (
                                            <button
                                                key={step.id}
                                                onClick={() => handleStepClick(step)}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-lg border transition-all",
                                                    selectedStep?.id === step.id
                                                        ? "bg-[#f5c16c]/10 border-[#f5c16c]/30"
                                                        : "bg-[#0a0506] border-transparent hover:border-white/10"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[#f5c16c] font-semibold text-sm">
                                                            Week {step.stepNumber}
                                                        </span>
                                                        <span className="text-white text-sm truncate max-w-[300px]">
                                                            {step.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white/40 text-xs">
                                                            {step.content?.activities?.length || 0} activities
                                                        </span>
                                                        <Badge className="bg-[#7289da]/20 text-[#7289da] border-[#7289da]/30 text-xs">
                                                            {step.experiencePoints} XP
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Step Details */}
                        <div className="lg:col-span-1">
                            {selectedStep ? (
                                <StepDetailPanel step={selectedStep} onEdit={handleEditStep} />
                            ) : (
                                <Card className="bg-[#1a1410] border-[#f5c16c]/20 h-full">
                                    <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                                        <p className="text-white/40 text-sm">Select a week to view details</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                ) : (
                    <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                        <CardContent className="py-16 text-center">
                            <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/50 mb-4">No steps generated yet for this quest.</p>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Generate Quest Steps
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Generation Modal */}
                <QuestGenerationModal
                    isOpen={isGenerationModalOpen}
                    jobId={generationJobId}
                    questTitle={quest.title}
                    onClose={() => setIsGenerationModalOpen(false)}
                    onComplete={handleGenerationComplete}
                />

                {/* Edit Step Dialog */}
                <EditQuestStepDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingStep(null);
                    }}
                    step={editingStep}
                    questId={quest.id}
                    onSaved={handleEditSaved}
                />
            </div>
        </AdminLayout>
    );
}

// Step Detail Panel Component
function StepDetailPanel({ step, onEdit }: { step: AdminQuestStepDto; onEdit?: (step: AdminQuestStepDto) => void }) {
    return (
        <Card className="bg-[#1a1410] border-[#f5c16c]/20 sticky top-6">
            <CardHeader className="border-b border-[#f5c16c]/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[#f5c16c] font-bold">Week {step.stepNumber}</span>
                        <Badge 
                            className={cn(
                                "text-xs",
                                step.difficultyVariant === 'Standard' && "bg-[#f5c16c]/20 text-[#f5c16c] border-[#f5c16c]/30",
                                step.difficultyVariant === 'Supportive' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                                step.difficultyVariant === 'Challenging' && "bg-pink-500/20 text-pink-400 border-pink-500/30"
                            )}
                        >
                            {step.difficultyVariant}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-[#7289da]/20 text-[#7289da] border-[#7289da]/30">
                            {step.experiencePoints} XP
                        </Badge>
                        {onEdit && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(step)}
                                className="h-7 px-2 border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                            >
                                <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                        )}
                    </div>
                </div>
                <CardTitle className="text-white text-base mt-2">{step.title}</CardTitle>
                <p className="text-white/50 text-sm">{step.description}</p>
            </CardHeader>
            <CardContent className="pt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                <div className="space-y-4">
                    {step.content?.activities?.map((activity: any, idx: number) => (
                        <ActivityCard key={idx} activity={activity} index={idx} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Activity Card Component - Shows full activity content
function ActivityCard({ activity, index }: { activity: any; index: number }) {
    const [expanded, setExpanded] = useState(index === 0);

    // Helper to get property value regardless of casing (camelCase or PascalCase)
    const get = (obj: any, ...keys: string[]) => {
        if (!obj) return undefined;
        for (const key of keys) {
            if (obj[key] !== undefined) return obj[key];
            // Try PascalCase
            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
            if (obj[pascalKey] !== undefined) return obj[pascalKey];
        }
        return undefined;
    };

    const activityType = get(activity, 'type') || 'Unknown';
    const payload = get(activity, 'payload') || {};
    const skillId = get(activity, 'skillId');

    const getActivityIcon = () => {
        switch (activityType) {
            case 'Reading': return <BookOpen className="w-4 h-4 text-blue-400" />;
            case 'Quiz': return <BrainCircuit className="w-4 h-4 text-purple-400" />;
            case 'Coding': return <Code className="w-4 h-4 text-green-400" />;
            case 'KnowledgeCheck': return <CheckCircle className="w-4 h-4 text-amber-400" />;
            default: return <Sparkles className="w-4 h-4 text-white/40" />;
        }
    };

    const getActivityColor = () => {
        switch (activityType) {
            case 'Reading': return 'border-blue-500/30 bg-blue-500/5';
            case 'Quiz': return 'border-purple-500/30 bg-purple-500/5';
            case 'Coding': return 'border-green-500/30 bg-green-500/5';
            case 'KnowledgeCheck': return 'border-amber-500/30 bg-amber-500/5';
            default: return 'border-white/10 bg-white/5';
        }
    };

    const experiencePoints = get(payload, 'experiencePoints');
    const articleTitle = get(payload, 'articleTitle');
    const summary = get(payload, 'summary');
    const url = get(payload, 'url');
    const questions = get(payload, 'questions') || [];
    const topic = get(payload, 'topic');
    const language = get(payload, 'language');
    const difficulty = get(payload, 'difficulty');

    return (
        <div className={cn("border rounded-lg overflow-hidden", getActivityColor())}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {getActivityIcon()}
                    <span className="text-white font-medium text-sm">{activityType}</span>
                    {experiencePoints && (
                        <span className="text-white/40 text-xs">+{experiencePoints} XP</span>
                    )}
                </div>
                <ChevronLeft className={cn(
                    "w-4 h-4 text-white/40 transition-transform",
                    expanded ? "-rotate-90" : "rotate-180"
                )} />
            </button>

            {/* Content */}
            {expanded && (
                <div className="px-3 pb-3 space-y-3">
                    {/* Reading Activity */}
                    {activityType === 'Reading' && (
                        <>
                            {articleTitle && (
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Article</p>
                                    <p className="text-white font-medium text-sm">{articleTitle}</p>
                                </div>
                            )}
                            {summary && (
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Summary</p>
                                    <p className="text-white/70 text-sm leading-relaxed">{summary}</p>
                                </div>
                            )}
                            {url && (
                                <div>
                                    <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Open Resource
                                    </a>
                                </div>
                            )}
                        </>
                    )}

                    {/* Knowledge Check / Quiz */}
                    {(activityType === 'KnowledgeCheck' || activityType === 'Quiz') && questions.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-xs text-white/40 uppercase tracking-wider">
                                {questions.length} Questions
                            </p>
                            {questions.map((q: any, qIdx: number) => {
                                const question = get(q, 'question');
                                const options = get(q, 'options') || [];
                                const answer = get(q, 'answer');
                                const explanation = get(q, 'explanation');
                                return (
                                    <div key={qIdx} className="bg-black/20 rounded-lg p-3 space-y-2">
                                        <p className="text-white text-sm font-medium">
                                            Q{qIdx + 1}: {question}
                                        </p>
                                        <div className="space-y-1">
                                            {options.map((opt: string, oIdx: number) => (
                                                <div 
                                                    key={oIdx}
                                                    className={cn(
                                                        "px-2 py-1 rounded text-xs",
                                                        opt === answer 
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-white/5 text-white/60"
                                                    )}
                                                >
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                        {explanation && (
                                            <div className="pt-2 border-t border-white/10">
                                                <p className="text-xs text-white/40 mb-1">Explanation:</p>
                                                <p className="text-xs text-white/60">{explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Coding Activity */}
                    {activityType === 'Coding' && (
                        <>
                            {topic && (
                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Topic</p>
                                    <p className="text-white text-sm">{topic}</p>
                                </div>
                            )}
                            <div className="flex gap-4">
                                {language && (
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Language</p>
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                            {language}
                                        </Badge>
                                    </div>
                                )}
                                {difficulty && (
                                    <div>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Difficulty</p>
                                        <Badge className="bg-white/10 text-white/60 border-white/20">
                                            {difficulty}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Skill ID */}
                    {skillId && (
                        <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-white/30">
                                Skill: <span className="font-mono">{skillId.slice(0, 8)}...</span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
