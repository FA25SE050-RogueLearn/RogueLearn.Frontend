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
import questApi from "@/api/questApi";
import userQuestProgressApi from "@/api/userQuestProgressApi";
// ADDED: Import the new modal component.
import { CodingChallengeModal } from "./CodingChallengeModal";

// --- Sub-components ---

const ReadingStepContent = ({ content }: { content: ReadingContent }) => (
    <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <CardHeader className="relative z-10">
            <CardTitle className="text-white">{content.articleTitle || 'Reading Material'}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4 prose prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white">
            <p className="whitespace-pre-wrap font-body text-white/80">{content.summary}</p>
            {content.url && (
                <Button asChild variant="outline" className="border-[#f5c16c]/40 bg-[#f5c16c]/10 text-[#f5c16c] hover:bg-[#f5c16c]/20">
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
        <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
            <div
              className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: 'url(/images/asfalt-dark.png)',
                backgroundSize: '350px 350px',
                backgroundRepeat: 'repeat'
              }}
            />
            <CardHeader className="relative z-10"><CardTitle className="text-white">Challenge</CardTitle></CardHeader>
            <CardContent className="relative z-10 space-y-6">
                {content.challenge && (
                    <p className="whitespace-pre-wrap font-body text-white/80">{content.challenge}</p>
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
                                className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
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
        <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
            <div
              className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: 'url(/images/asfalt-dark.png)',
                backgroundSize: '350px 350px',
                backgroundRepeat: 'repeat'
              }}
            />
            <CardHeader className="relative z-10"><CardTitle className="text-white">Knowledge Check</CardTitle></CardHeader>
            <CardContent className="relative z-10 space-y-6">
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
                        className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
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

// MODIFIED: This component now accepts an `onStartChallenge` callback.
const CodingStepContent = ({ content, onStartChallenge }: { content: CodingContent, onStartChallenge: (content: CodingContent) => void }) => (
    <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <CardHeader className="relative z-10"><CardTitle className="text-white">Coding Challenge</CardTitle></CardHeader>
        <CardContent className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold">
                    {content.language}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-semibold">
                    {content.difficulty}
                </span>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-2">Topic:</h4>
                <p className="text-white/80">{content.topic}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30">
                <p className="text-sm text-[#f5c16c]">
                    This coding challenge will be generated dynamically when you start working on it.
                    The challenge will be tailored to the <strong>{content.topic}</strong> topic at a <strong>{content.difficulty}</strong> level using <strong>{content.language}</strong>.
                </p>
            </div>
            {/* MODIFIED: The button now triggers the onStartChallenge callback. */}
            <Button 
                className="w-full bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]"
                onClick={() => onStartChallenge(content)}
            >
                Start Coding Challenge
            </Button>
        </CardContent>
    </Card>
);


const SubmissionStepContent = ({ content }: { content: SubmissionContent }) => (
    <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <CardHeader className="relative z-10"><CardTitle className="text-white">Submission Required</CardTitle></CardHeader>
        <CardContent className="relative z-10 space-y-4">
            <h4 className="font-semibold text-white">Challenge</h4>
            <p className="whitespace-pre-wrap font-body text-white/80">{content.challenge}</p>
            <h4 className="font-semibold text-white">Submission Format</h4>
            <p className="whitespace-pre-wrap font-body text-white/80">{content.submissionFormat}</p>
            <Textarea placeholder="Enter your submission here..." rows={8} className="mt-4 bg-background/50 border-[#f5c16c]/20" />
        </CardContent>
    </Card>
);

const ReflectionStepContent = ({ content }: { content: ReflectionContent }) => (
    <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <CardHeader className="relative z-10"><CardTitle className="text-white">Reflection</CardTitle></CardHeader>
        <CardContent className="relative z-10 space-y-4">
            <h4 className="font-semibold text-white">Challenge</h4>
            <p className="whitespace-pre-wrap font-body text-white/80">{content.challenge}</p>
            <h4 className="font-semibold text-white">Reflection Prompt</h4>
            <p className="whitespace-pre-wrap font-body text-white/80">{content.reflectionPrompt}</p>
            <h4 className="font-semibold text-white">Expected Outcome</h4>
            <p className="whitespace-pre-wrap font-body text-white/80">{content.expectedOutcome}</p>
            <Textarea placeholder="Write your reflection here..." rows={8} className="mt-4 bg-background/50 border-[#f5c16c]/20" />
        </CardContent>
    </Card>
);

const PlaceholderContent = ({ type }: { type: string }) => (
    <Card className="relative overflow-hidden bg-black/40 border-[#f5c16c]/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/asfalt-dark.png)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat'
          }}
        />
        <CardHeader className="relative z-10"><CardTitle className="text-white">{type} Content</CardTitle></CardHeader>
        <CardContent className="relative z-10"><p className="text-white/80">Content for this step type ({type}) is under construction.</p></CardContent>
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
    // ADDED: State to manage the coding challenge modal.
    const [activeCodingChallenge, setActiveCodingChallenge] = useState<CodingContent | null>(null);

    useEffect(() => {
        const initializeAndFetchProgress = async () => {
            let currentDetails = questDetails;
            if (!currentDetails.steps || currentDetails.steps.length === 0) {
                setIsLoading(true);
                try {
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

            try {
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
    }, [questDetails.id]);

    const handleNextStep = () => {
        setCurrentStepIndex(prev => {
            const maxIndex = (questDetails?.steps?.length || 1) - 1;
            const nextIndex = prev + 1;
            return nextIndex <= maxIndex ? nextIndex : prev;
        });
    };

    const handlePrevStep = () => {
        setCurrentStepIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex >= 0 ? prevIndex : 0;
        });
    };

    const handleCompleteStep = async (stepId: string) => {
        setIsCompleting(stepId);
        try {
            await questApi.updateQuestStepProgress(questDetails.id, stepId, 'Completed');
            setStepProgress(prev => ({ ...prev, [stepId]: 'Completed' }));
            if (questDetails && currentStepIndex < questDetails.steps.length - 1) {
                setTimeout(() => { 
                    handleNextStep(); 
                }, 500);
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
            // MODIFIED: Pass the callback to open the modal.
            case 'Coding':
                return <CodingStepContent content={step.content as CodingContent} onStartChallenge={setActiveCodingChallenge} />;
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

    const currentStep = questDetails?.steps?.[currentStepIndex];
    const totalSteps = questDetails?.steps?.length || 0;
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === totalSteps - 1;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-16 h-16 text-[#f5c16c] animate-spin" />
                <p className="text-xl text-white/70">Loading Quest Content...</p>
            </div>
        );
    }

    if (!currentStep) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <p className="text-xl text-white/70">Could not load quest steps.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-40">
            {/* ADDED: Render the modal conditionally. */}
            {activeCodingChallenge && (
                <CodingChallengeModal
                    challengeContent={activeCodingChallenge}
                    onClose={() => setActiveCodingChallenge(null)}
                    onComplete={() => {
                        handleCompleteStep(currentStep.id);
                        setActiveCodingChallenge(null);
                    }}
                />
            )}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                        <Link href={`/quests/${learningPath.id}`} className="hover:text-[#f5c16c]">
                            {learningPath.name}
                        </Link>
                        <span>/</span>
                        <Link href={`/quests/${learningPath.id}/${chapter.id}`} className="hover:text-[#f5c16c]">
                            {chapter.title}
                        </Link>
                    </div>
                    <h1 className="text-4xl font-bold font-heading flex items-center gap-3 text-white">
                        <BookOpen className="w-10 h-10 text-[#f5c16c]" />
                        {questDetails.title}
                    </h1>
                    <p className="text-sm text-white/60 mt-2">
                        Step {currentStepIndex + 1} of {totalSteps}
                    </p>
                </div>
            </div>

            <Card className="relative overflow-hidden border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-[#0a0506]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage: 'url(/images/asfalt-dark.png)',
                    backgroundSize: '350px 350px',
                    backgroundRepeat: 'repeat'
                  }}
                />
                <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center justify-between text-white">
                        <span className="flex-1">Step {currentStep.stepNumber}: {currentStep.title}</span>
                        <div className="flex items-center gap-4">
                            {currentStep.experiencePoints > 0 && (
                                <span className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c] bg-[#f5c16c]/10 border border-[#f5c16c]/30 rounded-full px-3 py-1">
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
                <CardContent className="relative z-10">
                    <p className="text-white/80 leading-relaxed mb-6">{currentStep.description}</p>
                    {renderStepContent(currentStep)}
                </CardContent>
            </Card>

            <div className="fixed bottom-36 left-0 right-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handlePrevStep}
                            disabled={isFirstStep}
                            className="border-[#f5c16c]/20 bg-black/40 hover:bg-[#f5c16c]/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Previous Step
                        </Button>

                        {stepProgress[currentStep.id] !== 'Completed' ? (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-bold hover:from-[#d4a855] hover:to-[#f5c16c]"
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
                            disabled={isLastStep}
                            className="border-[#f5c16c]/20 bg-black/40 hover:bg-[#f5c16c]/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Step <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}