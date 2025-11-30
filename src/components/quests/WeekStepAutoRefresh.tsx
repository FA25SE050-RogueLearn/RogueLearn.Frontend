'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import questApi from '@/api/questApi';

interface Props {
  questId: string;
  stepNumber: number;
}

export default function WeekStepAutoRefresh({ questId, stepNumber }: Props) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    for (let i = 0; i < 20; i++) {
      const res = await questApi.getQuestDetails(questId);
      const exists = res.isSuccess && !!res.data?.steps?.find(s => s.stepNumber === stepNumber);
      if (exists) {
        router.refresh();
        setChecking(false);
        return;
      }
      await new Promise(r => setTimeout(r, 800));
      setAttempts(a => a + 1);
    }
    setChecking(false);
  }, [questId, stepNumber, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void check();
    }, 0);
    return () => clearTimeout(timer);
  }, [check]);

  return (
    <div className="flex flex-col items-center gap-3">
      {checking ? (
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin text-[#f5c16c]" />
          <span>Preparing week content...</span>
        </div>
      ) : (
        <div className="text-sm text-white/70">Still preparing. You can retry.</div>
      )}
      <Button onClick={check} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
      <div className="text-xs text-white/50">Attempts: {attempts}</div>
    </div>
  );
}

