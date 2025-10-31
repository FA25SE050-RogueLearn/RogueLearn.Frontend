// roguelearn-web/src/components/quests/ModuleLearningView.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, ArrowRight, BookOpen, CheckCircle, PlayCircle, Loader2, Lightbulb, Code, User, FileText, MessageSquare, Video
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LearningPath, QuestChapter, QuestDetails, QuestStep, ReadingContent, InteractiveContent, CodingContent, QuizContent, SubmissionContent, ReflectionContent } from "@/types/quest";
import academicApi from "@/api/academicApi";

// --- Sub-components for each Step Type ---

const ReadingStepContent = ({ content }: { content: ReadingContent }) => (
    <Card className="bg-muted/30">
        <CardHeader><CardTitle>Reading Material</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap font-body">{content.readingMaterial}</p>
            {content.recommendedExercises && (
                <div>
                    <h4 className="font-semibold mb-2">Recommended Exercises</h4>
                    <p className="whitespace-pre-wrap font-body text-foreground/80">{content.recommendedExercises}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

const InteractiveStepContent = ({ content }: { content: InteractiveContent }) => (
    <Card className="bg-muted/30">
        <CardHeader><CardTitle>{content.scenario ? 'Scenario' : 'Challenge'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap font-body">{content.scenario || content.challenge}</p>
            {content.prompt && (
                 <div>
                    <h4 className="font-semibold mb-2 mt-4">Your Task</h4>
                    <p className="whitespace-pre-wrap font-body text-foreground/80">{content.prompt}</p>
                </div>
            )}
            {(content.learningPoints || content.keyLearning) && (
                <div>
                    <h4 className="font-semibold mb-2 mt-4">Key Learning Points</h4>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80">
                        {(content.learningPoints || content.keyLearning)?.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                </div>
            )}
        </CardContent>
    </Card>
);

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
    
    const correctCount = content.questions.filter((q, i) => selectedAnswers[i] === q.answer).length;

    return (
        <Card className="bg-muted/30">
            <CardHeader><CardTitle>Knowledge Check</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {content.questions.map((q, i) => (
                    <div key={i}>
                        <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map(opt => {
                                const isSelected = selectedAnswers[i] === opt;
                                const isCorrect = q.answer === opt;
                                const buttonClass = submitted
                                    ? (isCorrect ? 'bg-green-500/20 border-green-500 text-white' : isSelected ? 'bg-red-500/20 border-red-500 text-white' : 'bg-transparent')
                                    : (isSelected ? 'bg-accent/20 border-accent' : 'bg-transparent');
                                
                                return (
                                    <Button key={opt} variant="outline" className={`w-full justify-start text-left h-auto py-2 whitespace-normal ${buttonClass}`} onClick={() => handleSelect(i, opt)}>
                                        {opt}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {!submitted && <Button onClick={checkAnswers}>Submit Answers</Button>}
                {submitted && (
                    <div className="mt-4 p-4 rounded-md bg-black/20 text-center">
                        <p className="text-lg font-bold">You scored {correctCount} out of {content.questions.length}!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const CodingStepContent = ({ content }: { content: CodingContent }) => (
    <Card className="bg-muted/30">
        <CardHeader><CardTitle>Coding Challenge</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap font-body">{content.challenge}</p>
            <h4 className="font-semibold">Code Template:</h4>
            <pre className="bg-black/50 p-4 rounded-md text-sm font-mono overflow-x-auto"><code>{content.template}</code></pre>
            <h4 className="font-semibold">Expected Outcome:</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.expectedOutput}</p>
        </CardContent>
    </Card>
);

const SubmissionStepContent = ({ content }: { content: SubmissionContent }) => (
    <Card className="bg-muted/30">
        <CardHeader><CardTitle>Submission Required</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <h4 className="font-semibold">Assignment</h4>
            <p className="whitespace-pre-wrap font-body">{content.assignment}</p>
            <h4 className="font-semibold">Submission Format</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.submissionFormat}</p>
            <h4 className="font-semibold">Evaluation Rubric</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.rubric}</p>
            <Textarea placeholder="Enter your submission here..." rows={8} className="mt-4" />
        </CardContent>
    </Card>
);

const ReflectionStepContent = ({ content }: { content: ReflectionContent }) => (
    <Card className="bg-muted/30">
        <CardHeader><CardTitle>Reflection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <h4 className="font-semibold">Challenge</h4>
            <p className="whitespace-pre-wrap font-body">{content.challenge}</p>
            <h4 className="font-semibold">Reflection Prompt</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.reflectionPrompt}</p>
            <h4 className="font-semibold">Expected Outcome</h4>
            <p className="whitespace-pre-wrap font-body text-foreground/80">{content.expectedOutcome}</p>
            <Textarea placeholder="Write your reflection here..." rows={8} className="mt-4" />
        </CardContent>
    </Card>
);

const PlaceholderContent = ({ type }: { type: string }) => (
    <Card className="bg-muted/30">
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
            <Link href={`/quests/${learningPath.id}`} className="hover:text-accent">{learningPath.name}</Link>
            <span>/</span>
            <Link href={`/quests/${learningPath.id}/${chapter.id}`} className="hover:text-accent">{chapter.title}</Link>
          </div>
          <h1 className="text-4xl font-bold font-heading flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-accent" />
            {questDetails.title}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step {currentStep.stepNumber}: {currentStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed mb-6">{currentStep.description}</p>
          {renderStepContent(currentStep)}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-8 border-t">
        <Button variant="outline" size="lg" onClick={handlePrevStep} disabled={currentStepIndex === 0}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Previous Step
        </Button>
        {stepProgress[currentStep.id] !== 'Completed' ? (
            <Button size="lg" className="bg-gradient-to-r from-accent to-accent/80 text-primary" onClick={() => handleCompleteStep(currentStep.id)} disabled={isCompleting === currentStep.id}>
                {isCompleting === currentStep.id ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Mark as Complete
            </Button>
        ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-5 h-5" /> Step Completed
            </div>
        )}
        <Button variant="outline" size="lg" onClick={handleNextStep} disabled={!questDetails || currentStepIndex === questDetails.steps.length - 1}>
          Next Step <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}