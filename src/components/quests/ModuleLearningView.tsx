// roguelearn-web/src/components/quests/ModuleLearningView.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle,
    XCircle,
    Loader2,
    Link as LinkIcon,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    LearningPath,
    QuestChapter,
    QuestDetails,
    QuestStep,
    ReadingContent,
    InteractiveContent,
    CodingContent,
    QuizContent,
    SubmissionContent,
    ReflectionContent
} from "@/types/quest";
// MODIFICATION: Removed incorrect import and added the correct API clients.
import questApi from "@/api/questApi";
import userQuestProgressApi from "@/api/userQuestProgressApi";

// --- Sub-components (UNCHANGED) ---

const ReadingStepContent = ({ content }: { content: ReadingContent }) => (
    <Card className="bg-muted/30 border-white/10">
        <CardHeader>
            <CardTitle>{content.articleTitle || 'Reading Material'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 prose prose-invert max-w-none prose-p:text-foreground/80 prose-headings:text-white">
            <p className="whitespace-pre-wrap font-body">{content.summary}</p>
            {content.url && (
                <Button asChild variant="outline" className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20">
                    <a href={content.url} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Read Full Article
                    </a>
                </Button>
            )}
        </CardContent>
    </Card>
);

const InteractiveStepContent = ({ content }: { content: InteractiveContent }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleQuestionSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmitQuestions = () => {
        setSubmitted(true);
    };

    return (
        <Card className="bg-muted/30 border-white/10">
            <CardHeader><CardTitle>Challenge</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {content.challenge && (
                    <p className="whitespace-pre-wrap font-body text-foreground/80">{content.challenge}</p>
                )}

                {content.questions && (
                    <div className="space-y-6">
                        {content.questions.map((q, index) => {
                            const selectedAnswer = selectedAnswers[index];

                            return (
                                <div key={index} className="p-4 rounded-lg border border-white/10 bg-black/20">
                                    <p className="font-semibold text-white/90 mb-3">{q.task}</p>
                                    <div className="flex flex-col gap-2">
                                        {q.options.map(opt => {
                                            const isSelected = selectedAnswer === opt;
                                            const isCorrectOption = q.answer === opt;

                                            let buttonClass = "justify-start border-white/20 hover:bg-white/10";
                                            if (submitted) {
                                                if (isCorrectOption) {
                                                    buttonClass = "justify-start bg-green-500/20 border-green-500 text-white hover:bg-green-500/30";
                                                } else if (isSelected && !isCorrectOption) {
                                                    buttonClass = "justify-start bg-red-500/20 border-red-500 text-white hover:bg-red-500/30";
                                                }
                                            } else if (isSelected) {
                                                buttonClass = "justify-start bg-accent/20 border-accent text-white hover:bg-accent/30";
                                            }

                                            return (
                                                <Button
                                                    key={opt}
                                                    variant="outline"
                                                    className={buttonClass}
                                                    onClick={() => handleQuestionSelect(index, opt)}
                                                    disabled={submitted}
                                                >
                                                    {submitted && isCorrectOption && (
                                                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                                    )}
                                                    {submitted && isSelected && !isCorrectOption && (
                                                        <XCircle className="w-4 h-4 mr-2 text-red-400" />
                                                    )}
                                                    {opt}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {!submitted && (
                            <Button
                                onClick={handleSubmitQuestions}
                                className="bg-accent text-accent-foreground hover:bg-accent/90"
                                disabled={Object.keys(selectedAnswers).length !== content.questions.length}
                            >
                                Submit Answers
                            </Button>
                        )}

                        {submitted && (
                            <div className="mt-4 p-4 rounded-md bg-black/20 text-center">
                                <p className="text-lg font-bold text-white">
                                    You got {content.questions.filter((q, i) => selectedAnswers[i] === q.answer).length} out of {content.questions.length} correct!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const QuizStepContent = ({ content }: { content: QuizContent }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    }

    const checkAnswers = () => {
        setSubmitted(true);
    }

    const correctCount = content.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;

    return (
        <Card className="bg-muted/30 border-white/10">
            <CardHeader><CardTitle>Knowledge Check</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {content.questions.map((q, i) => (
                    <div key={i}>
                        <p className="font-semibold mb-2 text-white">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map(opt => {
                                const isSelected = selectedAnswers[i] === opt;
                                const isCorrect = q.correctAnswer === opt;
                                const buttonClass = submitted
                                    ? (isCorrect ? 'bg-green-500/20 border-green-500 text-white' : isSelected ? 'bg-red-500/20 border-red-500 text-white' : 'bg-transparent border-white/10')
                                    : (isSelected ? 'bg-accent/20 border-accent' : 'bg-transparent border-white/10');

                                return (
                                    <Button
                                        key={opt}
                                        variant="outline"
                                        className={`w-full justify-start text-left h-auto py-2 whitespace-normal ${buttonClass}`}
                                        onClick={() => handleSelect(i, opt)}
                                    >
                                        {opt}
                                    </Button>
                                );
                            })}
                        </div>
                        {submitted && <p className="text-xs mt-2 text-foreground/60">{q.explanation}</p>}
                    </div>
                ))}
                {!submitted && (
                    <Button
                        onClick={checkAnswers}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        disabled={Object.keys(selectedAnswers).length !== content.questions.length}
                    >
                        Submit Answers
                    </Button>
                )}
                {submitted && (
                    <div className="mt-4 p-4 rounded-md bg-black/20 text-center">
                        <p className="text-lg font-bold text-white">You scored {correctCount} out of {content.questions.length}!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const CodingStepContent = ({ content }: { content: CodingContent }) => (
    <Card className="bg-muted/30 border-white/10">
        <CardHeader><CardTitle>Coding Challenge</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap font-body">{content.challenge}</p>
            <h4 className="font-semibold text-white">Code Template:</h4>
            <pre className="bg-black/50 p-4 rounded-md text-sm font-mono overflow-x-auto text-white/90">
                <code>{content.template}</code>
            </pre>
            <h4 className="font-semibold text-white">Expected Outcome:</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.expectedOutput}</p>
        </CardContent>
    </Card>
);

const SubmissionStepContent = ({ content }: { content: SubmissionContent }) => (
    <Card className="bg-muted/30 border-white/10">
        <CardHeader><CardTitle>Submission Required</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <h4 className="font-semibold text-white">Challenge</h4>
            <p className="whitespace-pre-wrap font-body">{content.challenge}</p>
            <h4 className="font-semibold text-white">Submission Format</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.submissionFormat}</p>
            <Textarea placeholder="Enter your submission here..." rows={8} className="mt-4 bg-background/50 border-white/20" />
        </CardContent>
    </Card>
);

const ReflectionStepContent = ({ content }: { content: ReflectionContent }) => (
    <Card className="bg-muted/30 border-white/10">
        <CardHeader><CardTitle>Reflection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <h4 className="font-semibold text-white">Challenge</h4>
            <p className="whitespace-pre-wrap font-body">{content.challenge}</p>
            <h4 className="font-semibold text-white">Reflection Prompt</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.reflectionPrompt}</p>
            <h4 className="font-semibold text-white">Expected Outcome</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.expectedOutcome}</p>
            <Textarea placeholder="Write your reflection here..." rows={8} className="mt-4 bg-background/50 border-white/20" />
        </CardContent>
    </Card>
);

const PlaceholderContent = ({ type }: { type: string }) => (
    <Card className="bg-muted/30 border-white/10">
        <CardHeader><CardTitle>{type} Content</CardTitle></CardHeader>
        <CardContent><p>Content for this step type ({type}) is under construction.</p></CardContent>
    </Card>
);

// --- Main Component ---

interface ModuleLearningViewProps {
    learningPath: LearningPath;
    chapter: QuestChapter;
    questDetails: QuestDetails;
}

export function ModuleLearningView({ learningPath, chapter, questDetails: initialQuestDetails }: ModuleLearningViewProps) {
    const [questDetails, setQuestDetails] = useState(initialQuestDetails);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [stepProgress, setStepProgress] = useState<Record<string, 'Completed' | 'NotStarted'>>({});
    const [isCompleting, setIsCompleting] = useState<string | null>(null);

    useEffect(() => {
        const initializeAndFetchProgress = async () => {
            let currentDetails = questDetails;
            // Step 1: Generate steps if they don't exist.
            if (!currentDetails.steps || currentDetails.steps.length === 0) {
                setIsLoading(true);
                try {
                    // MODIFICATION: Call the correctly namespaced API function.
                    const response = await questApi.generateQuestSteps(currentDetails.id);
                    if (response.isSuccess && response.data) {
                        currentDetails = { ...currentDetails, steps: response.data };
                        setQuestDetails(currentDetails);
                    } else {
                        throw new Error("Failed to generate quest steps.");
                    }
                } catch (error) {
                    console.error("Error generating quest steps:", error);
                    alert("Could not load quest steps. Please try again.");
                    setIsLoading(false);
                    return;
                }
            }

            // Step 2: Always fetch the latest user progress for this quest.
            try {
                // MODIFICATION: Call the correctly namespaced API function.
                const progressResponse = await userQuestProgressApi.getUserQuestProgress(currentDetails.id);
                const progressData = progressResponse.data;

                const newStepProgress: Record<string, 'Completed' | 'NotStarted'> = {};
                currentDetails.steps.forEach(step => {
                    const status = progressData?.stepStatuses[step.id];
                    newStepProgress[step.id] = status === 'Completed' ? 'Completed' : 'NotStarted';
                });
                setStepProgress(newStepProgress);

            } catch (error) {
                console.warn("Could not fetch user progress, defaulting all steps to NotStarted:", error);
                // If progress fetch fails, default all to NotStarted.
                const defaultProgress: Record<string, 'Completed' | 'NotStarted'> = {};
                currentDetails.steps.forEach(step => {
                    defaultProgress[step.id] = 'NotStarted';
                });
                setStepProgress(defaultProgress);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAndFetchProgress();
    }, [questDetails.id, questDetails]); // Added questDetails to dependency array to handle re-fetches if it changes.

    const currentStep = questDetails?.steps?.[currentStepIndex];

    const handleNextStep = () => {
        if (questDetails && currentStepIndex < questDetails.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleCompleteStep = async (stepId: string) => {
        setIsCompleting(stepId);
        try {
            // MODIFICATION: Call the correctly namespaced API function.
            await questApi.updateQuestStepProgress(questDetails.id, stepId, 'Completed');

            setStepProgress(prev => ({ ...prev, [stepId]: 'Completed' }));

            if (questDetails && currentStepIndex < questDetails.steps.length - 1) {
                setTimeout(() => { handleNextStep(); }, 500);
            }
        } catch (error) {
            console.error("Failed to mark step as complete:", error);
            alert("There was an error saving your progress. Please try again.");
        } finally {
            setIsCompleting(null);
        }
    };

    const renderStepContent = (step: QuestStep) => {
        if (!step.content) {
            return <PlaceholderContent type={`${step.stepType} (No Content)`} />;
        }
        switch (step.stepType) {
            case 'Reading':
                return <ReadingStepContent content={step.content as ReadingContent} />;
            case 'Interactive':
                return <InteractiveStepContent content={step.content as InteractiveContent} />;
            case 'Quiz':
                return <QuizStepContent content={step.content as QuizContent} />;
            case 'Coding':
                return <CodingStepContent content={step.content as CodingContent} />;
            case 'Submission':
                return <SubmissionStepContent content={step.content as SubmissionContent} />;
            case 'Reflection':
                return <ReflectionStepContent content={step.content as ReflectionContent} />;
            case 'Video':
                return <PlaceholderContent type="Video" />;
            case 'Discussion':
                return <PlaceholderContent type="Discussion" />;
            default:
                return <p>Unknown step type: {step.stepType}</p>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-16 h-16 text-accent animate-spin" />
                <p className="text-xl text-foreground/70">Loading Quest Content...</p>
            </div>
        );
    }

    if (!currentStep) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-foreground/70">Could not load quest steps.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
                        <Link href={`/quests/${learningPath.id}`} className="hover:text-accent">
                            {learningPath.name}
                        </Link>
                        <span>/</span>
                        <Link href={`/quests/${learningPath.id}/${chapter.id}`} className="hover:text-accent">
                            {chapter.title}
                        </Link>
                    </div>
                    <h1 className="text-4xl font-bold font-heading flex items-center gap-3 text-white">
                        <BookOpen className="w-10 h-10 text-accent" />
                        {questDetails.title}
                    </h1>
                </div>
            </div>

            <Card className="border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                        <span className="flex-1">Step {currentStep.stepNumber}: {currentStep.title}</span>
                        <div className="flex items-center gap-4">
                            {currentStep.experiencePoints > 0 && (
                                <span className="flex items-center gap-2 text-sm font-semibold text-amber-300 bg-amber-900/50 border border-amber-700/30 rounded-full px-3 py-1">
                                    <Sparkles className="w-4 h-4" /> +{currentStep.experiencePoints} XP
                                </span>
                            )}
                            {stepProgress[currentStep.id] === 'Completed' && (
                                <span className="flex items-center gap-2 text-sm text-emerald-400">
                                    <CheckCircle className="w-4 h-4" /> Completed
                                </span>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground/80 leading-relaxed mb-6">{currentStep.description}</p>
                    {renderStepContent(currentStep)}
                </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Previous Step
                </Button>

                {stepProgress[currentStep.id] !== 'Completed' ? (
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-accent to-amber-400 text-primary-foreground font-bold"
                        onClick={() => handleCompleteStep(currentStep.id)}
                        disabled={isCompleting === currentStep.id}
                    >
                        {isCompleting === currentStep.id ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Mark as Complete
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold px-4">
                        <CheckCircle className="w-5 h-5" /> Step Completed
                    </div>
                )}

                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleNextStep}
                    disabled={!questDetails || currentStepIndex === questDetails.steps.length - 1}
                    className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                    Next Step <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}