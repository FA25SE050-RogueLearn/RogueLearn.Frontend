// roguelearn-web/src/app/onboarding/connect-fap/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Sparkles, BookCopy, RefreshCw, GitBranch } from 'lucide-react'; // Added GitBranch icon
import { UserProfileDto } from '@/types/user-profile';
import { OnboardingVersion as CurriculumVersion } from '@/types/onboarding';
import profileApi from '@/api/profileApi';
import onboardingApi from '@/api/onboardingApi';
// UPDATED IMPORT: Added 'establishSkillDependencies'.
import { processAcademicRecord, initializeSkills, establishSkillDependencies } from '@/api/usersApi';

// MODIFICATION: Added a new step to the flow state.
type FlowStep = 'form' | 'processingRecord' | 'initializingSkills' | 'buildingTree' | 'complete';
type ProgressMessage = {
    [key in FlowStep]?: string;
};

const progressMessages: ProgressMessage = {
    processingRecord: 'Processing your academic record, forging quests...',
    initializingSkills: 'Analyzing curriculum and initializing your skill tree...',
    // ADDED: Message for the new step.
    buildingTree: 'Establishing skill dependencies and building your skill tree...',
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

  const isUpdateFlow = userProfile?.onboardingCompleted ?? false;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileResponse = await profileApi.getMyProfile();
      if (!profileResponse.isSuccess || !profileResponse.data || !profileResponse.data.routeId) {
        throw new Error("Could not load your user profile or you haven't selected an academic route. Please complete onboarding first.");
      }
      setUserProfile(profileResponse.data);

      const versionsResponse = await onboardingApi.getVersionsForProgram(profileResponse.data.routeId);
      if (!versionsResponse.isSuccess || !versionsResponse.data) {
        throw new Error("Could not load curriculum versions for your program.");
      }
      setCurriculumVersions(versionsResponse.data);
      
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
  
  const handleProcessAndInitialize = async () => {
    if (!htmlContent.trim() || !selectedVersionId) {
      setError('Please select a version and paste the HTML content from your FAP academic record.');
      return;
    }
    setError(null);

    try {
        setStep('processingRecord');
        const recordResult = await processAcademicRecord(htmlContent, selectedVersionId);
        if (!recordResult.isSuccess || !recordResult.data) {
            throw new Error(recordResult.message || 'Failed to process academic record.');
        }
        console.log(`✓ Processed ${recordResult.data.subjectsProcessed} subjects, GPA: ${recordResult.data.calculatedGpa}`);
        
        setStep('initializingSkills');
        const skillResult = await initializeSkills(selectedVersionId);
        if (!skillResult.isSuccess || !skillResult.data) {
            throw new Error(skillResult.message || 'Failed to initialize skills.');
        }
        console.log(`✓ Initialized ${skillResult.data.skillsInitialized} skills. Skipped ${skillResult.data.skillsSkipped} existing skills.`);
        
        // --- ADDED: PHASE 3 - Establish Skill Dependencies ---
        setStep('buildingTree');
        const dependencyResult = await establishSkillDependencies(selectedVersionId);
        if (!dependencyResult.isSuccess || !dependencyResult.data) {
            // This is a non-critical step, so we log a warning but don't block the user.
            console.warn(dependencyResult.message || 'Failed to establish skill dependencies.');
        } else {
            console.log(`✓ Established ${dependencyResult.data.totalDependenciesCreated} skill dependencies.`);
        }

        // --- PHASE 4: Completion and Redirect ---
        setStep('complete');
        setTimeout(() => {
            router.push('/skills'); // MODIFICATION: Redirect to the skill tree page.
            router.refresh();
        }, 2000);

    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during processing.";
      setError(errorMessage);
      setStep('form');
    }
  };

  const isSubmitting = step !== 'form';

  const renderContent = () => {
    // ... (rest of the renderContent function is unchanged) ...
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
  );
}