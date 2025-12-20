// roguelearn-web/src/components/quests/DifficultyBadge.tsx
"use client";

import { Zap, Shield, Heart, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DifficultyLevel = 'Challenging' | 'Standard' | 'Supportive' | 'Adaptive';

interface DifficultyBadgeProps {
  difficulty?: DifficultyLevel;
  reason?: string;
  subjectGrade?: string;
  subjectStatus?: string;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const difficultyConfig: Record<DifficultyLevel, {
  icon: typeof Zap;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
}> = {
  Challenging: {
    icon: Zap,
    label: 'Challenging',
    bgClass: 'bg-red-500/20',        // Changed from orange to red/fire
    borderClass: 'border-red-500/40',
    textClass: 'text-red-300',
    glowClass: 'shadow-red-500/20',
  },
  Standard: {
    icon: Shield,
    label: 'Standard',
    bgClass: 'bg-amber-500/20',      // Changed from blue to amber/yellow
    borderClass: 'border-amber-500/40',
    textClass: 'text-amber-300',
    glowClass: 'shadow-amber-500/20',
  },
  Supportive: {
    icon: Heart,
    label: 'Supportive',
    bgClass: 'bg-emerald-500/20',    // Emerald (Green) matches supportive
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-300',
    glowClass: 'shadow-emerald-500/20',
  },
  Adaptive: {
    icon: Sparkles,
    label: 'Adaptive',
    bgClass: 'bg-violet-500/20',
    borderClass: 'border-violet-500/40',
    textClass: 'text-violet-300',
    glowClass: 'shadow-violet-500/20',
  },
};

export function DifficultyBadge({
  difficulty,
  reason,
  subjectGrade,
  subjectStatus,
  size = 'sm',
  showTooltip = true,
}: DifficultyBadgeProps) {
  if (!difficulty) return null;

  const config = difficultyConfig[difficulty];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  const badge = (
    <span
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${config.bgClass} ${config.borderClass} ${config.textClass} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  );

  if (!showTooltip || !reason) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-slate-900 border-slate-700 text-white"
        >
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{reason}</p>
            {(subjectGrade || subjectStatus) && (
              <div className="flex items-center gap-2 text-xs text-white/70">
                {subjectGrade && <span>Grade: {subjectGrade}</span>}
                {subjectStatus && <span>Status: {subjectStatus}</span>}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default DifficultyBadge;