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
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import academicApi from "@/api/academicApi";

// --- Sub-components for each Step Type ---

const ReadingStepContent = ({ content }: { content: ReadingContent }) => (
    <Card className="bg-muted/30 border-white/10">
        <CardHeader>
            <CardTitle>{content.articleTitle || 'Reading Material'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 prose prose-invert max-w-none prose-p:text-foreground/80 prose-headings:text-white">
            <p className="whitespace-pre-wrap font-body">{content.summary || content.readingMaterial}</p>
            {content.url && (
                <Button asChild variant="outline" className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20">
                    <a href={content.url} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Read Full Article
                    </a>
                </Button>
            )}
            {content.recommendedExercises && (
                <div>
                    <h4 className="font-semibold mb-2">Recommended Exercises</h4>
                    <p className="whitespace-pre-wrap font-body text-foreground/80">{content.recommendedExercises}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

const InteractiveStepContent = ({ content }: { content: InteractiveContent }) => {
    // State for handling question-based interactions (Step 2)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    
    // State for handling backlog selection (Step 3)
    const [selectedBacklogItems, setSelectedBacklogItems] = useState<Set<string>>(new Set());
    
    // State for handling user story ranking (Step 4)
    const [rankedStories, setRankedStories] = useState<string[]>([]);

    // Handler for question selection
    const handleQuestionSelect = (qIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({...prev, [qIndex]: option}));
    };

    // Handler for submitting question answers
    const handleSubmitQuestions = () => {
        setSubmitted(true);
    };

    // Handler for backlog item selection
    const toggleBacklogItem = (itemId: string) => {
        setSelectedBacklogItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Calculate total effort for selected backlog items
    const getTotalEffort = () => {
        if (!content.backlogItems) return 0;
        return content.backlogItems
            .filter(item => selectedBacklogItems.has(item.id))
            .reduce((sum, item) => sum + item.effortEstimate, 0);
    };

    // Handler for user story ranking
    const handleRankStory = (storyId: string, rank: number) => {
        setRankedStories(prev => {
            const newRanked = [...prev];
            // Remove the story if it's already ranked
            const currentIndex = newRanked.indexOf(storyId);
            if (currentIndex !== -1) {
                newRanked.splice(currentIndex, 1);
            }
            // Insert at the new position (rank-1 because array is 0-indexed)
            newRanked.splice(rank - 1, 0, storyId);
            return newRanked;
        });
    };

    return (
        <Card className="bg-muted/30 border-white/10">
            <CardHeader><CardTitle>Challenge</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {content.challenge && (
                    <p className="whitespace-pre-wrap font-body text-foreground/80">{content.challenge}</p>
                )}
                
                {/* Question-based interaction (Step 2) */}
                {content.questions && (
                    <div className="space-y-6">
                        {content.questions.map((q, index) => {
                            const selectedAnswer = selectedAnswers[index];
                            const isCorrect = selectedAnswer === q.answer;
                            
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
                                                } else if (isSelected && !isCorrect) {
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
                                                    {submitted && isSelected && !isCorrect && (
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

                {/* Backlog item selection (Step 3) */}
                {content.backlogItems && (
                    <div>
                        <h4 className="font-semibold mb-3 text-white">Backlog Items</h4>
                        <p className="text-sm text-foreground/60 mb-4">
                            Select items for your sprint (Target: ~20 points | Current: {getTotalEffort()} points)
                        </p>
                        <div className="space-y-3">
                            {content.backlogItems.map(item => {
                                const isSelected = selectedBacklogItems.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-accent bg-accent/10'
                                                : 'border-white/10 bg-black/20 hover:bg-black/30'
                                        }`}
                                        onClick={() => toggleBacklogItem(item.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="mt-1"
                                                    />
                                                    <p className="text-foreground/80">{item.story}</p>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xs text-foreground/60">
                                                    Priority: <span className="font-bold text-white/80">{item.priority}</span>
                                                </p>
                                                <p className="text-xs text-foreground/60">
                                                    Effort: <span className="font-bold text-white/80">{item.effortEstimate} pts</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* User story ranking (Step 4) */}
                {content.userStories && (
                    <div>
                        <h4 className="font-semibold mb-3 text-white">User Stories to Prioritize</h4>
                        <p className="text-sm text-foreground/60 mb-4">
                            Click a rank button (1-5) next to each story to set its priority
                        </p>
                        <div className="space-y-3">
                            {content.userStories.map(item => {
                                const currentRank = rankedStories.indexOf(item.id) + 1;
                                
                                return (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-lg border border-white/10 bg-black/20"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <p className="text-foreground/80">{item.story}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <p className="text-xs text-foreground/60">
                                                        Value: <span className="font-bold text-white/80">{item.value}</span>
                                                    </p>
                                                    <p className="text-xs text-foreground/60">
                                                        Effort: <span className="font-bold text-white/80">{item.effort}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(rank => (
                                                        <Button
                                                            key={rank}
                                                            variant="outline"
                                                            size="sm"
                                                            className={`w-8 h-8 p-0 ${
                                                                currentRank === rank
                                                                    ? 'bg-accent border-accent text-white'
                                                                    : 'border-white/20'
                                                            }`}
                                                            onClick={() => handleRankStory(item.id, rank)}
                                                        >
                                                            {rank}
                                                        </Button>
                                                    ))}
                                                </div>
                                                {currentRank > 0 && (
                                                    <p className="text-xs text-center text-accent">Rank: {currentRank}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Guidance section */}
                {(content.guidance || content.task || content.answerExplanation) && (
                    <div className="mt-4 p-4 rounded-lg border border-amber-300/20 bg-amber-400/10 text-amber-200/80 text-sm">
                        {content.guidance && <p><strong>Guidance:</strong> {content.guidance}</p>}
                        {content.task && <p className="mt-2"><strong>Task:</strong> {content.task}</p>}
                        {content.answerExplanation && <p className="mt-2"><strong>Hint:</strong> {content.answerExplanation}</p>}
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
        setSelectedAnswers(prev => ({...prev, [qIndex]: option}));
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
            {content.exampleUserStory && (
                <div>
                    <h4 className="font-semibold text-white">Example User Story</h4>
                    <p className="whitespace-pre-wrap font-body text-foreground/80 italic">&quot;{content.exampleUserStory}&quot;</p>
                </div>
            )}
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

export function ModuleLearningView({ learningPath, chapter, questDetails }: ModuleLearningViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState<Record<string, 'Completed' | 'Pending'>>(() => {
    const initialProgress: Record<string, 'Completed' | 'Pending'> = {};
    if (questDetails && questDetails.steps) {
        questDetails.steps.forEach(step => {
            initialProgress[step.id] = 'Pending';
        });
    }
    return initialProgress;
  });
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

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
      await academicApi.updateQuestStepProgress(questDetails.id, stepId, 'Completed');
      setStepProgress(prev => ({...prev, [stepId]: 'Completed'}));
      
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

  if (!currentStep) {
    return <div>Step not found or quest data is loading.</div>;
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
            <span>Step {currentStep.stepNumber}: {currentStep.title}</span>
            {stepProgress[currentStep.id] === 'Completed' && (
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Completed
                </span>
            )}
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