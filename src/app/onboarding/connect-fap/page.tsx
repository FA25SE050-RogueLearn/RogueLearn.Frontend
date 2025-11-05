// roguelearn-web/src/app/onboarding/connect-fap/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Sparkles, BookCopy, RefreshCw } from 'lucide-react';
import { UserProfileDto } from '@/types/user-profile';
// MODIFICATION: The curriculum version type is now the simpler onboarding-specific one.
import { OnboardingVersion as CurriculumVersion } from '@/types/onboarding';
import profileApi from '@/api/profileApi';
// MODIFICATION: Replaced adminContentApi with the correct onboardingApi.
import onboardingApi from '@/api/onboardingApi';
import { processAcademicRecord, initializeSkills } from '@/api/usersApi';

type FlowStep = 'form' | 'processingRecord' | 'initializingSkills' | 'complete';
type ProgressMessage = {
    [key in FlowStep]?: string;
};

// User-facing messages for each step of the process.
const progressMessages: ProgressMessage = {
    processingRecord: 'Processing your academic record, forging quests...',
    initializingSkills: 'Analyzing curriculum and initializing your skill tree...',
    complete: 'Synchronization complete! Redirecting...'
};

export default function ConnectFapPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('form');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [curriculumVersions, setCurriculumVersions] = useState<CurriculumVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Logic to determine if the user is updating or doing a first-time sync.
  const isUpdateFlow = userProfile?.onboardingCompleted ?? false;

  // Fetches the user profile and available curriculum versions on page load.
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileResponse = await profileApi.getMyProfile();
      if (!profileResponse.isSuccess || !profileResponse.data || !profileResponse.data.routeId) {
        throw new Error("Could not load your user profile or you haven't selected an academic route. Please complete onboarding first.");
      }
      setUserProfile(profileResponse.data);

      // MODIFICATION: Switched from the admin API to the new, correct onboarding API.
      const versionsResponse = await onboardingApi.getVersionsForProgram(profileResponse.data.routeId);
      if (!versionsResponse.isSuccess || !versionsResponse.data) {
        throw new Error("Could not load curriculum versions for your program.");
      }
      setCurriculumVersions(versionsResponse.data);
      
      // Default to the first version if available.
      if (versionsResponse.data.length > 0) {
        setSelectedVersionId(versionsResponse.data[0].id);
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
  
  // Main handler for the two-phase onboarding/sync process.
  const handleProcessAndInitialize = async () => {
    if (!htmlContent.trim()) {
      setError('Please paste the HTML content from your FAP academic record.');
      return;
    }
    if (!selectedVersionId) {
        setError('Please select a curriculum version.');
        return;
    }
    setError(null);

    try {
        // --- PHASE 1: Process Academic Record (Fast) ---
        setStep('processingRecord');
        const recordResult = await processAcademicRecord(htmlContent, selectedVersionId);
        if (!recordResult.isSuccess || !recordResult.data) {
            throw new Error(recordResult.message || 'Failed to process academic record.');
        }
        console.log(`✓ Processed ${recordResult.data.subjectsProcessed} subjects, GPA: ${recordResult.data.calculatedGpa}`);
        
        // --- PHASE 2: Initialize Skills (Slow) ---
        setStep('initializingSkills');
        const skillResult = await initializeSkills(selectedVersionId);
        if (!skillResult.isSuccess || !skillResult.data) {
            throw new Error(skillResult.message || 'Failed to initialize skills.');
        }
        console.log(`✓ Initialized ${skillResult.data.skillsInitialized} skills. Skipped ${skillResult.data.skillsSkipped} existing skills.`);
        
        // --- PHASE 3: Completion and Redirect ---
        setStep('complete');
        setTimeout(() => {
            router.push('/quests');
            router.refresh();
        }, 2000);

    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during processing.";
      setError(errorMessage);
      setStep('form');
    }
  };

  const isSubmitting = step !== 'form';

  // Renders different content based on the current step of the flow.
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
        )
    }

    // The main form for uploading the FAP HTML.
    if (step === 'form') {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="curriculum-version" className="text-amber-300">Select Your Curriculum Version</Label>
                    <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                        <SelectTrigger className="w-full bg-amber-950/20 border-amber-800/50">
                            <SelectValue placeholder="Select a version..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1f1812] border-amber-900/30 text-amber-100">
                            {curriculumVersions.map(v => (
                                <SelectItem key={v.id} value={v.id} className="focus:bg-amber-900/50">
                                    {v.versionCode} (Effective {v.effectiveYear})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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
                <Button onClick={handleProcessAndInitialize} disabled={isSubmitting || !selectedVersionId || !htmlContent} className="w-full h-12 text-sm uppercase tracking-widest">
                    {/* Differentiate button text for new vs. returning users. */}
                    {isUpdateFlow ? <RefreshCw className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isUpdateFlow ? "Sync & Update Progress" : "Sync & Forge Skill Tree"}
                </Button>
            </div>
        );
    }

    // The loading overlay shown during processing.
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
    <div className="mx-auto max-w-3xl">
      <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
        <CardHeader className="relative border-b border-amber-900/20">
          <div className="flex items-center gap-4">
            <BookCopy className="h-8 w-8 text-accent" />
            <div>
                {/* Differentiate title/description for new vs. returning users. */}
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
  );
}