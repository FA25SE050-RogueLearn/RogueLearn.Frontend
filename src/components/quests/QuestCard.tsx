// roguelearn-web/src/components/quests/QuestCard.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  CheckCircle,
  Lock,
  ChevronRight,
  Sparkles,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react';
import { QuestSummary } from '@/types/quest';
import DifficultyBadge from './DifficultyBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import questApi, { GetQuestSkillsResponse } from '@/api/questApi';

interface QuestCardProps {
  quest: QuestSummary;
  chapterSequence: number;
  isLocked?: boolean;
  isGenerating?: boolean;
  onStartQuest: () => void;
}

// ... (Helper functions extractSubjectCode, extractSubjectName, getGradeColor, getStatusInfo remain unchanged) ...
// Extract subject code from title (e.g., "CEA201: Computer..." -> "CEA201")
function extractSubjectCode(title: string): string | null {
  const match = title.match(/^([A-Z]{2,4}\d{2,3}[a-z]?)/i);
  return match ? match[1].toUpperCase() : null;
}

// Extract subject name from title (after the colon)
function extractSubjectName(title: string): string {
  const colonIndex = title.indexOf(':');
  if (colonIndex !== -1) {
    return title.substring(colonIndex + 1).trim().split('_')[0].trim();
  }
  return title;
}

// Get grade color based on score
function getGradeColor(grade: string | undefined | null): {
  bg: string;
  border: string;
  text: string;
  icon: typeof TrendingUp;
} {
  if (!grade || grade === 'N/A') {
    return {
      bg: 'bg-slate-500/20',
      border: 'border-slate-500/40',
      text: 'text-slate-300',
      icon: Minus,
    };
  }

  const score = parseFloat(grade);
  if (isNaN(score)) {
    return {
      bg: 'bg-slate-500/20',
      border: 'border-slate-500/40',
      text: 'text-slate-300',
      icon: Minus,
    };
  }

  if (score >= 8.5) {
    return {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
      icon: TrendingUp,
    };
  } else if (score >= 7.0) {
    return {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/40',
      text: 'text-blue-300',
      icon: TrendingUp,
    };
  } else if (score >= 5.0) {
    return {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
      icon: Minus,
    };
  } else {
    return {
      bg: 'bg-red-500/20',
      border: 'border-red-500/40',
      text: 'text-red-300',
      icon: TrendingDown,
    };
  }
}

// Get status display info
function getStatusInfo(status: string | undefined): {
  label: string;
  bg: string;
  border: string;
  text: string;
  icon: typeof CheckCircle;
} {
  switch (status) {
    case 'Passed':
      return {
        label: 'Passed',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: CheckCircle,
      };
    case 'NotPassed':
      return {
        label: 'Failed',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: TrendingDown,
      };
    case 'Studying':
      return {
        label: 'Studying',
        bg: 'bg-violet-500/15',
        border: 'border-violet-500/30',
        text: 'text-violet-400',
        icon: Clock,
      };
    default:
      return {
        label: 'Not Started',
        bg: 'bg-slate-500/15',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        icon: BookOpen,
      };
  }
}

export function QuestCard({
  quest,
  chapterSequence,
  isLocked = false,
  isGenerating = false,
  onStartQuest,
}: QuestCardProps) {
  const [skillsData, setSkillsData] = useState<GetQuestSkillsResponse | null>(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const subjectCode = quest.subjectCode || extractSubjectCode(quest.title);
  const subjectName = extractSubjectName(quest.title);
  const gradeInfo = getGradeColor(quest.subjectGrade);
  const statusInfo = getStatusInfo(quest.subjectStatus);
  const isQuestActive = quest.status === 'InProgress';
  const GradeIcon = gradeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const handleLoadSkills = async () => {
    if (skillsLoaded) return;
    setLoadingSkills(true);
    try {
      const res = await questApi.getQuestSkills(quest.id);
      if (res.isSuccess && res.data) {
        setSkillsData(res.data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingSkills(false);
      setSkillsLoaded(true);
    }
  };

  const handleStartClick = async (e: React.MouseEvent) => {
    // Prevent event bubbling if wrapped in other click handlers
    e.stopPropagation();

    if (isStarting || isLocked || isGenerating) return;

    setIsStarting(true);
    try {
      // Explicitly call the start API if the quest is NotStarted
      if (quest.status === 'NotStarted') {
        console.log("Starting quest:", quest.id); // Debug log
        await questApi.startQuest(quest.id);
      }

      // Call the parent handler to navigate
      onStartQuest();
    } catch (error) {
      console.error("Failed to start quest:", error);
      // Still attempt navigation so user isn't stuck
      onStartQuest();
    } finally {
      // We don't necessarily set isStarting false here if we navigate away immediately,
      // but it's safe to do so.
      setIsStarting(false);
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-[24px] border transition-all duration-300
        ${isLocked
          ? 'border-white/5 bg-white/5'
          : quest.status === 'Completed'
            ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-black hover:border-emerald-500/50'
            : isQuestActive
              ? 'border-[#f5c16c]/60 bg-gradient-to-br from-[#2d1810] to-black shadow-[0_0_30px_rgba(245,193,108,0.15)]'
              : 'border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/80 to-black hover:border-[#f5c16c]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,193,108,0.15)]'
        }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url(/images/asfalt-dark.png)' }} />

      <CardContent className="p-5 flex flex-col h-full gap-3">
        {/* Top Row: Subject Code + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {subjectCode && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5c16c]/10 border border-[#f5c16c]/30 text-[#f5c16c] text-sm font-bold tracking-wide">
                <GraduationCap className="h-3.5 w-3.5" />
                {subjectCode}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-end">
            {quest.isRecommended && !isLocked && quest.status !== 'Completed' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30 animate-pulse">
                <Sparkles className="h-3 w-3" /> Priority
              </span>
            )}
            {!isLocked && (
              <DifficultyBadge
                difficulty={quest.expectedDifficulty}
                reason={quest.difficultyReason}
                subjectGrade={quest.subjectGrade}
                subjectStatus={quest.subjectStatus}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Subject Name */}
        <div className="flex-1">
          <h3 className={`font-semibold text-base leading-tight mb-1 line-clamp-2 ${isLocked ? 'text-white/40' : 'text-white'}`}>
            {subjectName}
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            Quest {chapterSequence}.{quest.sequenceOrder}
          </p>
        </div>

        {/* Academic Score Section */}
        {!isLocked && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${gradeInfo.bg} ${gradeInfo.border}`}>
                    <GradeIcon className={`h-3.5 w-3.5 ${gradeInfo.text}`} />
                    <span className={`text-sm font-bold ${gradeInfo.text}`}>
                      {quest.subjectGrade || 'N/A'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 border-slate-700">
                  <p className="text-sm">
                    {quest.subjectGrade && quest.subjectGrade !== 'N/A'
                      ? `Your grade: ${quest.subjectGrade}/10`
                      : 'No grade recorded'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${statusInfo.bg} ${statusInfo.border}`}>
                    <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.text}`} />
                    <span className={`text-xs font-medium ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 border-slate-700">
                  <p className="text-sm">{quest.difficultyReason || 'Academic status'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={handleLoadSkills}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-violet-500/20 border-violet-500/40 hover:bg-violet-500/30 transition-colors"
                >
                  <Zap className="h-3.5 w-3.5 text-violet-300" />
                  <span className="text-xs font-medium text-violet-300">Skills</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-80 p-0 bg-slate-900/95 border-slate-700 backdrop-blur-sm"
              >
                <div className="p-3 border-b border-slate-700/50">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-400" />
                    Quest Skills
                  </h4>
                  {skillsData?.subjectName && (
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {skillsData.subjectName}
                    </p>
                  )}
                </div>
                <div className="p-2 max-h-60 overflow-y-auto">
                  {loadingSkills ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                    </div>
                  ) : skillsData && skillsData.skills.length > 0 ? (
                    <div className="space-y-2">
                      {skillsData.skills.map((skill) => (
                        <div
                          key={skill.skillId}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">{skill.skillName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              {Math.round(skill.relevanceWeight * 100)}%
                            </span>
                          </div>
                          {skill.domain && (
                            <span className="text-[10px] text-white/40">{skill.domain}</span>
                          )}
                          {skill.prerequisites.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {skill.prerequisites.map((prereq) => (
                                <span
                                  key={prereq.skillId}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/70 border border-amber-500/20"
                                >
                                  Requires: {prereq.skillName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-white/50 py-4">
                      No skills mapped yet
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-1">
          {isLocked ? (
            <Button disabled variant="ghost" className="w-full justify-start pl-0 text-white/30 hover:bg-transparent cursor-not-allowed">
              <Lock className="mr-2 h-4 w-4" /> Locked
            </Button>
          ) : (
            <Button
              onClick={handleStartClick}
              disabled={isGenerating || isStarting}
              className={`w-full justify-between group-hover:pl-6 transition-all duration-300
                ${quest.status === 'Completed'
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  : 'bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:shadow-lg'}`}
            >
              {isGenerating || isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isGenerating ? 'Forging...' : 'Starting...'}
                </>
              ) : (
                <>
                  {quest.status === 'Completed' ? 'Review Quest' :
                    quest.status === 'InProgress' ? 'Continue' : 'Start Quest'}
                  <ChevronRight className="h-4 w-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestCard;