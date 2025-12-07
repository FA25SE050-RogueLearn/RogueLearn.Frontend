"use client";

import { useState } from "react";
import { X, Sparkles, GraduationCap, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AcademicSyncBannerProps {
  hasAnyGrades: boolean;
}

export function AcademicSyncBanner({ hasAnyGrades }: AcademicSyncBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user already has grades synced or dismissed
  if (hasAnyGrades || dismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#7289da]/30 bg-gradient-to-r from-[#7289da]/10 via-[#1a1410] to-[#f5c16c]/10">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
          backgroundSize: "100px",
        }}
      />
      
      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors z-10"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-3 rounded-xl bg-[#7289da]/20 border border-[#7289da]/30">
          <GraduationCap className="w-6 h-6 text-[#7289da]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5c16c]" />
            Sync Your Academic Records
          </h3>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Import your FAP transcript to unlock XP based on your grades, personalized difficulty recommendations, and track your academic progress alongside quests.
          </p>
          
          {/* Benefits */}
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <Zap className="w-3 h-3" /> Earn XP from grades
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#f5c16c]">
              <TrendingUp className="w-3 h-3" /> Smart difficulty
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <Button
            asChild
            size="sm"
            className="w-full md:w-auto bg-[#7289da] hover:bg-[#7289da]/90 text-white font-medium"
          >
            <Link href="/onboarding/connect-fap">
              Sync FAP Records
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
