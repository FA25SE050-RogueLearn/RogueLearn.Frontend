// roguelearn-web/src/app/onboarding/connect-fap/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, RefreshCw, GitBranch, Sparkles, CheckCircle2, Copy, ExternalLink, FileText, Map, Trophy, ChevronDown, ChevronUp, Zap, Star, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserProfileDto } from '@/types/user-profile';
import profileApi, { invalidateMyProfileCache } from '@/api/profileApi';
import { processAcademicRecord } from '@/api/usersApi';
import { CharacterCreationWizard } from '@/components/features/character-creation/CharacterCreationWizard';
import { XpAwardedSummary, SkillXpAward } from '@/types/student';

type FlowStep = 'form' | 'processing' | 'xp-summary' | 'complete';

const HERO_CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 shadow-2xl";
const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

export default function ConnectFapPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('form');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCharacterWizard, setShowCharacterWizard] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [xpAwarded, setXpAwarded] = useState<XpAwardedSummary | null>(null);
  const [calculatedGpa, setCalculatedGpa] = useState<number | null>(null);
  const [subjectsProcessed, setSubjectsProcessed] = useState<number>(0);

  const isUpdateFlow = userProfile?.onboardingCompleted ?? false;
  const hasContent = htmlContent.trim().length > 0;
  const contentLength = htmlContent.length;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileResponse = await profileApi.getMyProfile({ forceRefresh: true });
      if (!profileResponse.isSuccess || !profileResponse.data) {
        throw new Error("Could not load your user profile.");
      }
      setUserProfile(profileResponse.data);
      if (!profileResponse.data.routeId || !profileResponse.data.classId) {
        setShowCharacterWizard(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading page data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessAndInitialize = async () => {
    if (!htmlContent.trim() || !userProfile?.routeId) {
      setError('Please paste the HTML content from your FAP academic record.');
      return;
    }
    setError(null);

    try {
      setStep('processing');
      setProcessingStep(1);
      
      // Simulate processing steps for better UX
      await new Promise(r => setTimeout(r, 500));
      setProcessingStep(2);
      
      const recordResult = await processAcademicRecord(htmlContent, userProfile.routeId);

      if (!recordResult.isSuccess || !recordResult.data) {
        throw new Error(recordResult.message || 'Failed to process academic record.');
      }
      
      setProcessingStep(3);
      await new Promise(r => setTimeout(r, 500));
      setProcessingStep(4);

      // Store processing results
      setCalculatedGpa(recordResult.data.calculatedGpa ?? null);
      setSubjectsProcessed(recordResult.data.subjectsProcessed);
      
      // Check if XP was awarded
      if (recordResult.data.xpAwarded && recordResult.data.xpAwarded.totalXp > 0) {
        setXpAwarded(recordResult.data.xpAwarded);
        setStep('xp-summary');
      } else {
        setStep('complete');
        setTimeout(() => {
          router.push('/skills');
          router.refresh();
        }, 1500);
      }

    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during processing.";
      setError(errorMessage);
      setStep('form');
      setProcessingStep(0);
    }
  };

  const isSubmitting = step !== 'form';

  const handleOnboardingComplete = async () => {
    setShowCharacterWizard(false);
    invalidateMyProfileCache();
    await fetchData();
  };

  const handleContinueFromXpSummary = () => {
    setStep('complete');
    setTimeout(() => {
      router.push('/skills');
      router.refresh();
    }, 1500);
  };

  const processingSteps = [
    { label: 'Reading academic data', icon: FileText },
    { label: 'Analyzing subjects & grades', icon: FileText },
    { label: 'Building skill tree & awarding XP', icon: Zap },
    { label: 'Creating your questline', icon: Trophy },
  ];

  // Group XP awards by skill for display
  const groupedXpAwards = xpAwarded?.skillAwards.reduce((acc, award) => {
    const existing = acc.find(a => a.skillId === award.skillId);
    if (existing) {
      existing.totalXp += award.xpAwarded;
      existing.sources.push({ subjectCode: award.sourceSubjectCode, xp: award.xpAwarded, grade: award.grade });
    } else {
      acc.push({
        skillId: award.skillId,
        skillName: award.skillName,
        totalXp: award.xpAwarded,
        newLevel: award.newLevel,
        sources: [{ subjectCode: award.sourceSubjectCode, xp: award.xpAwarded, grade: award.grade }],
      });
    }
    return acc;
  }, [] as { skillId: string; skillName: string; totalXp: number; newLevel: number; sources: { subjectCode: string; xp: number; grade: string }[] }[]) || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="rounded-full bg-[#f5c16c]/10 p-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#f5c16c]" />
          </div>
          <p className="text-white/60">Loading your academic context...</p>
        </div>
      );
    }

    if (error && !isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Failed to Load Data</h3>
          <p className="max-w-md text-white/60">{error}</p>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            className="mt-4 border-[#f5c16c]/50 text-[#f5c16c] hover:bg-[#f5c16c]/10"
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (step === 'form') {
      return (
        <div className="space-y-6">
          {/* Textarea area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Paste your FAP page source here</span>
              {hasContent && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {contentLength.toLocaleString()} characters
                </span>
              )}
            </div>
            <div className={`rounded-2xl p-px transition-all duration-300 ${hasContent ? 'bg-gradient-to-r from-emerald-500/40 via-emerald-400/30 to-[#f5c16c]/40' : 'bg-gradient-to-r from-[#d23187]/30 via-[#f061a6]/20 to-[#f5c16c]/30'}`}>
              <Textarea
                id="fap-html"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Paste the HTML content here... (Ctrl+V)"
                rows={10}
                className="rounded-2xl border-0 bg-[#1a0a08]/90 text-white placeholder:text-white/40 font-mono text-sm focus:ring-2 focus:ring-[#f5c16c]/30 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleProcessAndInitialize} 
            disabled={isSubmitting || !userProfile?.routeId || !hasContent} 
            className={`w-full h-14 rounded-2xl text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
              hasContent 
                ? 'bg-gradient-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-[#1a0b08] shadow-lg shadow-[#d23187]/30 hover:shadow-[#d23187]/50' 
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
          >
            {isUpdateFlow ? <RefreshCw className="mr-2 h-5 w-5" /> : <GitBranch className="mr-2 h-5 w-5" />}
            {hasContent 
              ? (isUpdateFlow ? "Sync & Update Progress" : "Build My Skill Tree") 
              : "Paste HTML to continue"
            }
          </Button>
        </div>
      );
    }

    if (isSubmitting) {
      return (
        <div className="space-y-8 py-8">
          {/* Progress Steps */}
          <div className="space-y-3">
            {processingSteps.map((s, i) => {
              const isActive = processingStep === i + 1;
              const isComplete = processingStep > i + 1;
              const Icon = s.icon;
              
              return (
                <div 
                  key={i}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-500 ${
                    isComplete 
                      ? 'border-emerald-500/30 bg-emerald-500/10' 
                      : isActive 
                        ? 'border-[#f5c16c]/50 bg-[#f5c16c]/10' 
                        : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-500 ${
                    isComplete 
                      ? 'bg-emerald-500/20' 
                      : isActive 
                        ? 'bg-[#f5c16c]/20' 
                        : 'bg-white/10'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#f5c16c]" />
                    ) : (
                      <Icon className={`h-5 w-5 ${isActive ? 'text-[#f5c16c]' : 'text-white/40'}`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-500 ${
                    isComplete ? 'text-emerald-400' : isActive ? 'text-white' : 'text-white/40'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {step === 'complete' && (
            <div className="flex flex-col items-center gap-3 pt-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-[0.2em]">All Done!</span>
              </div>
              <p className="text-sm text-white/60">Redirecting to your skill tree...</p>
            </div>
          )}

          {step === 'xp-summary' && xpAwarded && (
            <div className="space-y-6 pt-4">
              {/* Summary Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5c16c]/20 border border-[#f5c16c]/40 px-4 py-2">
                  <Zap className="h-5 w-5 text-[#f5c16c]" />
                  <span className="text-lg font-bold text-[#f5c16c]">+{xpAwarded.totalXp.toLocaleString()} XP Earned!</span>
                </div>
                <p className="text-sm text-white/60">
                  Based on your academic performance across {subjectsProcessed} subjects
                </p>
                {calculatedGpa && (
                  <p className="text-xs text-white/50">
                    Current GPA: <span className="text-[#f5c16c] font-semibold">{calculatedGpa.toFixed(2)}</span>
                  </p>
                )}
              </div>

              {/* Skills Summary */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {groupedXpAwards.slice(0, 10).map((skill) => (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#f5c16c]/20 bg-black/30 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{skill.skillName}</span>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                          <Star className="h-3 w-3" /> Lv.{skill.newLevel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skill.sources.map((source, idx) => (
                          <span key={idx} className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
                            {source.subjectCode} ({source.grade})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">+{skill.totalXp.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {groupedXpAwards.length > 10 && (
                  <p className="text-center text-xs text-white/40">
                    ...and {groupedXpAwards.length - 10} more skills
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinueFromXpSummary}
                className="w-full h-14 rounded-2xl text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] text-[#1a0b08] shadow-lg shadow-[#d23187]/30 hover:shadow-[#d23187]/50"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Continue to Skill Tree
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Step Indicator - only show during form step */}
        {step === 'form' && !isLoading && !error && (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${hasContent ? 'bg-emerald-500 text-white' : 'bg-[#f5c16c] text-[#1a0b08]'}`}>
                {hasContent ? <CheckCircle2 className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm text-white/70">Paste HTML</span>
            </div>
            <div className={`h-px w-8 ${hasContent ? 'bg-emerald-500/50' : 'bg-white/20'}`} />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/40">2</div>
              <span className="text-sm text-white/40">Process</span>
            </div>
            <div className="h-px w-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/40">3</div>
              <span className="text-sm text-white/40">Done</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className={HERO_CARD_CLASS}>
          {/* Texture overlay */}
          <div 
            aria-hidden="true" 
            className="pointer-events-none absolute inset-0" 
            style={CARD_TEXTURE as React.CSSProperties} 
          />
          {/* Glows */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,49,135,0.18),transparent_55%)]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,193,108,0.12),transparent_55%)]" />
          {/* Decorative runes */}
          <div className="absolute right-6 top-6 text-[#f5c16c]/10 text-2xl">◆</div>
          
          {/* Header */}
          <div className="relative z-10 border-b border-[#f5c16c]/20 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#f5c16c] md:text-3xl">
                  {isUpdateFlow ? "Update Your Progress" : "Connect Your FAP"}
                </h1>
                <p className="mt-1 text-sm text-white/60">
                  {isUpdateFlow
                    ? "Sync your latest grades to update your skill tree"
                    : "Import your academic record to unlock your personalized learning journey"}
                </p>
              </div>
              {/* What you'll get badges - only on form */}
              {step === 'form' && !isLoading && (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c16c]/20 bg-[#f5c16c]/10 px-3 py-1 text-xs text-[#f5c16c]">
                    <Map className="h-3 w-3" /> Skill Tree
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d23187]/20 bg-[#d23187]/10 px-3 py-1 text-xs text-[#d23187]">
                    <Trophy className="h-3 w-3" /> Quests
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <CardContent className="relative z-10 p-6 md:p-8">
            {renderContent()}
          </CardContent>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f5c16c]/30 to-transparent" />
        </Card>

        {/* Collapsible Instructions */}
        {step === 'form' && !isLoading && !error && (
          <Card className="relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95">
            <div 
              aria-hidden="true" 
              className="pointer-events-none absolute inset-0" 
              style={{ ...CARD_TEXTURE, opacity: 0.15 } as React.CSSProperties} 
            />
            
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="relative z-10 flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f5c16c]/30 bg-[#f5c16c]/10">
                  <ExternalLink className="h-4 w-4 text-[#f5c16c]" />
                </div>
                <span className="text-sm font-medium text-white">Need help getting the HTML?</span>
              </div>
              {showInstructions ? (
                <ChevronUp className="h-5 w-5 text-white/50" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white/50" />
              )}
            </button>
            
            {showInstructions && (
              <CardContent className="relative z-10 border-t border-[#f5c16c]/10 p-4 pt-4">
                <ol className="grid gap-2 text-sm md:grid-cols-2">
                  {[
                    { step: 1, text: 'Open FAP portal & log in', icon: ExternalLink },
                    { step: 2, text: 'Go to Academic Record', icon: FileText },
                    { step: 3, text: 'Press Ctrl+U (View Source)', icon: FileText },
                    { step: 4, text: 'Press Ctrl+A then Ctrl+C', icon: Copy },
                  ].map((item) => (
                    <li key={item.step} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5c16c]/20 text-xs font-bold text-[#f5c16c]">
                        {item.step}
                      </span>
                      <span className="text-white/70">{item.text}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-center text-xs text-white/40">
                  Then come back here and paste with Ctrl+V
                </p>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {/* Character Creation Wizard Dialog */}
      <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
        <DialogContent 
          aria-describedby="character-wizard-description" 
          className="max-w-[1200px] w-[95vw] h-[90vh] overflow-hidden rounded-[40px] border border-white/12 bg-gradient-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Character Creation</DialogTitle>
            <p id="character-wizard-description" className="sr-only">
              Complete your character setup by choosing your academic route and career class before syncing your FAP record.
            </p>
          </DialogHeader>
          <div className="h-full overflow-hidden bg-gradient-to-br from-[#1d0a10] via-[#240d14] to-[#090307]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.32),transparent_70%)] opacity-45" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(240,177,90,0.26),transparent_72%)] opacity-50" />
            <div className="relative z-10 h-full">
              <CharacterCreationWizard onOnboardingComplete={handleOnboardingComplete} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}