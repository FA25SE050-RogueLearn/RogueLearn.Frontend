// roguelearn-web/src/app/onboarding/connect-fap/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle, Sparkles, BookCopy } from 'lucide-react';
import { getMyContext, processMyAcademicRecord } from '@/api/usersApi';

type FlowStep = 'form' | 'processing' | 'complete';
type VersionOption = { id: string; versionCode: string; effectiveYear: number };

export default function ConnectFapPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('form');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [curriculumVersions, setCurriculumVersions] = useState<VersionOption[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch consolidated user context to get current enrollment version
      const contextResponse = await getMyContext();
      const enrollment = contextResponse.data?.enrollment;
      if (!contextResponse.isSuccess || !enrollment) {
        throw new Error("Could not load your academic enrollment. Please complete onboarding to select your curriculum.");
      }

      // Pre-populate with the currently enrolled curriculum version
      const versionOption: VersionOption = {
        id: enrollment.versionId,
        versionCode: enrollment.versionCode,
        effectiveYear: enrollment.effectiveYear,
      };
      setCurriculumVersions([versionOption]);
      setSelectedVersionId(enrollment.versionId);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading page data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleProcessRecord = async () => {
    if (!htmlContent.trim()) {
      setError('Please paste the HTML content from your FAP academic record.');
      return;
    }
    if (!selectedVersionId) {
        setError('Please select a curriculum version.');
        return;
    }
    setError(null);
    setStep('processing');
    try {
      const response = await processMyAcademicRecord({
        fapHtmlContent: htmlContent,
        curriculumVersionId: selectedVersionId,
        authUserId: ''
      });

      if (response.isSuccess && response.data) {
        setStep('complete');
        setTimeout(() => {
          router.push('/quests');
          router.refresh();
        }, 3000);
      } else {
        throw new Error('Failed to process your academic record.');
      }
    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during processing.";
      setError(errorMessage);
      setStep('form');
    }
  };

  const isSubmitting = step === 'processing';

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
                <Button onClick={handleProcessRecord} disabled={isSubmitting || !selectedVersionId || !htmlContent} className="w-full h-12 text-sm uppercase tracking-widest">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Sync & Forge Skill Tree
                </Button>
            </div>
        );
    }

    if (step === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-foreground/70 animate-pulse">
            Processing academic record and forging your skill tree...
          </p>
        </div>
      );
    }

    if (step === 'complete') {
        return (
            <div className="space-y-4 text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Synchronization Complete!</h3>
                <p className="text-sm text-foreground/70">
                    Your quests and skill tree have been updated. You will be redirected to your questline shortly.
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
                <CardTitle className="text-amber-100">Sync Academic Record</CardTitle>
                <CardDescription>Update your questline and skill tree with your latest progress from FAP.</CardDescription>
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