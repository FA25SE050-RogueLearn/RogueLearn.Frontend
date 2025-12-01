// roguelearn-web/src/app/onboarding/connect-fap/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, BookCopy, RefreshCw, GitBranch } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserProfileDto } from '@/types/user-profile';
import profileApi, { invalidateMyProfileCache } from '@/api/profileApi';
// MODIFICATION: The API call now comes from the refactored usersApi.
import { processAcademicRecord } from '@/api/usersApi';
import { CharacterCreationWizard } from '@/components/features/character-creation/CharacterCreationWizard';

// MODIFICATION: The flow is simplified. We only process the record and then complete.
type FlowStep = 'form' | 'processing' | 'complete';
type ProgressMessage = {
  [key in FlowStep]?: string;
};

const progressMessages: ProgressMessage = {
  processing: 'Processing academic record, forging quests, and building your skill tree...',
  complete: 'Synchronization complete! Redirecting to your skill tree...'
};

export default function ConnectFapPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('form');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCharacterWizard, setShowCharacterWizard] = useState(false);

  const isUpdateFlow = userProfile?.onboardingCompleted ?? false;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileResponse = await profileApi.getMyProfile({ forceRefresh: true });
      if (!profileResponse.isSuccess || !profileResponse.data) {
        throw new Error("Could not load your user profile.");
      }
      setUserProfile(profileResponse.data);
      // Show wizard if routeId or classId is missing
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
    // MODIFICATION: The logic now correctly checks for the program ID (routeId) from the profile.
    if (!htmlContent.trim() || !userProfile?.routeId) {
      setError('Please paste the HTML content from your FAP academic record.');
      return;
    }
    setError(null);

    try {
      setStep('processing');
      // MODIFICATION: A single API call now orchestrates the entire backend process.
      const recordResult = await processAcademicRecord(htmlContent, userProfile.routeId);

      if (!recordResult.isSuccess || !recordResult.data) {
        throw new Error(recordResult.message || 'Failed to process academic record.');
      }
      console.log(`✓ Processed ${recordResult.data.subjectsProcessed} subjects, GPA: ${recordResult.data.calculatedGpa}`);

      setStep('complete');
      setTimeout(() => {
        router.push('/skills'); // Redirect to the skill tree page to see the results.
        router.refresh();
      }, 2000);

    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during processing.";
      setError(errorMessage);
      setStep('form');
    }
  };

  const isSubmitting = step !== 'form';

  const handleOnboardingComplete = async () => {
    setShowCharacterWizard(false);
    // Refresh profile data after onboarding is complete
    invalidateMyProfileCache();
    await fetchData();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-foreground/70">Loading your academic context...</p>
        </div>
      );
    }
    if (error && !isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h3 className="text-xl font-semibold text-red-300">Failed to Load Data</h3>
          <p className="text-foreground/70">{error}</p>
          <Button onClick={fetchData} variant="outline" className="mt-4">Retry</Button>
        </div>
      );
    }

    if (step === 'form') {
      return (
        <div className="space-y-6">
          {/* REMOVED: The curriculum version dropdown is obsolete. */}
          <div className="space-y-2">
            <Label htmlFor="fap-html" className="text-amber-300">Paste FAP Academic Record HTML</Label>
            <Textarea
              id="fap-html"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Go to your FAP portal, view your academic record, right-click, select 'View Page Source', and paste the entire HTML content here..."
              rows={15}
              className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200 placeholder:text-amber-700 font-mono text-sm"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-700/50 bg-red-950/30 p-3 text-red-400 text-sm">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          <Button onClick={handleProcessAndInitialize} disabled={isSubmitting || !userProfile?.routeId || !htmlContent} className="w-full h-12 text-sm uppercase tracking-widest">
            {isUpdateFlow ? <RefreshCw className="mr-2 h-4 w-4" /> : <GitBranch className="mr-2 h-4 w-4" />}
            {isUpdateFlow ? "Sync & Update Progress" : "Sync & Build Skill Tree"}
          </Button>
        </div>
      );
    }

    if (isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-foreground/70 animate-pulse">
            {progressMessages[step]}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <div className="flex items-center gap-4">
              <BookCopy className="h-8 w-8 text-accent" />
              <div>
                <CardTitle className="text-amber-100">
                  {isUpdateFlow ? "Update Academic Record" : "Sync Academic Record"}
                </CardTitle>
                <CardDescription>
                  {isUpdateFlow
                    ? "Update your questline and skill tree with your latest progress from FAP."
                    : "Forge your personalized questline by connecting your FAP academic record."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>

      {/* Character Creation Wizard Dialog - shows when routeId or classId is missing */}
      <Dialog open={showCharacterWizard} onOpenChange={setShowCharacterWizard}>
        <DialogContent 
          aria-describedby="character-wizard-description" 
          className="max-w-[1200px] w-[95vw] h-[90vh] overflow-hidden rounded-[40px] border border-white/12 bg-linear-to-br from-[#12060a] via-[#1d0a11] to-[#060205] p-0 shadow-[0_32px_140px_rgba(20,2,16,0.85)] backdrop-blur-2xl"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Character Creation</DialogTitle>
            <p id="character-wizard-description" className="sr-only">
              Complete your character setup by choosing your academic route and career class before syncing your FAP record.
            </p>
          </DialogHeader>
          <div className="h-full overflow-hidden bg-linear-to-br from-[#1d0a10] via-[#240d14] to-[#090307]">
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