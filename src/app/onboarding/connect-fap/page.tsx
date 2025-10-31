'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import academicApi from '@/api/academicApi';
import { FapRecordData, GapAnalysisResponse } from '@/types/academic';
import { useRouter } from 'next/navigation';

// Define the states for our multi-step flow
type FlowStep = 'upload' | 'verifying' | 'verify' | 'analyzing' | 'recommend' | 'forging' | 'complete';

export default function ConnectFapPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('upload');
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<FapRecordData | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResponse | null>(null);

  const handleExtract = async () => {
    if (!htmlContent.trim()) {
      setError('Please paste the HTML content from your FAP academic record.');
      return;
    }
    setError(null);
    setStep('verifying');
    try {
      const response = await academicApi.extractFapRecord(htmlContent);
      if (response.isSuccess && response.data) {
        setExtractedData(response.data);
        setStep('verify');
      } else {
        throw new Error(response.message || 'Failed to extract data from the provided HTML.');
      }
    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during extraction.";
      setError(errorMessage);
      setStep('upload');
    }
  };

  const handleAnalyze = async () => {
    if (!extractedData) return;
    setError(null);
    setStep('analyzing');
    try {
      const response = await academicApi.analyzeLearningGap(extractedData);
      if (response.isSuccess && response.data) {
        setGapAnalysis(response.data);
        setStep('recommend');
      } else {
        throw new Error(response.message || 'Failed to perform learning gap analysis.');
      }
    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred during analysis.";
      setError(errorMessage);
      setStep('verify');
    }
  };

  const handleForge = async () => {
    if (!gapAnalysis) return;
    setError(null);
    setStep('forging');
    try {
      const response = await academicApi.forgeLearningPath(gapAnalysis.forgingPayload);
      if (response.isSuccess && response.data) {
        setStep('complete');
        // Redirect to the new learning path or dashboard after a delay
        setTimeout(() => {
          router.push('/quests');
          router.refresh();
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to forge your learning path.');
      }
    } catch (err: any) {
      const errorMessage = (err.response?.data?.error?.message || err.message) ?? "An unexpected error occurred while creating your path.";
      setError(errorMessage);
      setStep('recommend');
    }
  };

  const isLoading = ['verifying', 'analyzing', 'forging'].includes(step);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Forge Your Learning Path</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6 pt-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-700/50 bg-red-950/30 p-4 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Step 1: Connect Your Academic Record</h3>
                <p className="text-sm text-foreground/70">
                  Please go to your FAP portal, view your academic record, right-click, select &quot;View Page Source&quot;, and paste the entire HTML content below.
                </p>
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste your FAP HTML content here..."
                  rows={15}
                  className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200 placeholder:text-amber-700"
                />
                <Button onClick={handleExtract} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Extract & Verify'}
                </Button>
              </div>
            )}

            {step === 'verify' && extractedData && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Step 2: Verify Your Data</h3>
                <p className="text-sm text-foreground/70">
                  We have extracted the following information. Please confirm it is correct before we proceed with the analysis.
                </p>
                <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4 space-y-2">
                  <p><strong>Calculated GPA:</strong> {extractedData.gpa?.toFixed(2) ?? 'Not Found'}</p>
                  <p><strong>Subjects Found:</strong> {extractedData.subjects.length}</p>
                  <p><strong>Subjects Passed:</strong> {extractedData.subjects.filter(s => s.status === 'Passed').length}</p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setStep('upload')} variant="outline" className="flex-1">Back</Button>
                  <Button onClick={handleAnalyze} disabled={isLoading} className="flex-1">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm & Analyze Gap'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'recommend' && gapAnalysis && (
              <div className="space-y-4 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-accent" />
                <h3 className="font-semibold text-white">Step 3: Your Personalized Recommendation</h3>
                <div className="rounded-lg border border-accent/30 bg-accent/10 p-6 text-left">
                  <p className="text-sm text-foreground/70">{gapAnalysis.reason}</p>
                  <p className="mt-4 font-bold text-lg text-white">
                    Next Quest: <span className="text-accent">{gapAnalysis.highestPrioritySubject}</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setStep('verify')} variant="outline" className="flex-1">Back</Button>
                  <Button onClick={handleForge} disabled={isLoading} className="flex-1">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Forge My Learning Path'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-4 text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Learning Path Forged!</h3>
                <p className="text-sm text-foreground/70">
                  Your personalized questline has been created. You will be redirected to your quests shortly.
                </p>
              </div>
            )}

            {(step === 'verifying' || step === 'analyzing' || step === 'forging') && (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <p className="text-foreground/70 animate-pulse">
                  {step === 'verifying' && 'Extracting academic data...'}
                  {step === 'analyzing' && 'Analyzing your learning gap...'}
                  {step === 'forging' && 'Forging your personalized questline...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
