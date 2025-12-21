// roguelearn-web/src/components/skills/ConstellationNode.tsx
import { Handle, Position } from '@xyflow/react';
import { Crown, Zap, Circle, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkillNode as ApiSkillNode } from '@/types/skill-tree';

// Theming configuration for different skill tiers
const TIER_THEME = {
  1: { // Foundation
    gradient: 'from-emerald-600/20 via-teal-700/20 to-emerald-800/20',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    icon: Circle,
    accentColor: '#10b981'
  },
  2: { // Intermediate
    gradient: 'from-blue-600/20 via-cyan-700/20 to-blue-800/20',
    border: 'border-blue-500/40',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    icon: Zap,
    accentColor: '#3b82f6'
  },
  3: { // Advanced
    gradient: 'from-purple-600/20 via-pink-700/20 to-purple-800/20',
    border: 'border-purple-500/40',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    icon: Crown,
    accentColor: '#a855f7'
  }
};

export const ConstellationNode = ({ data }: { data: ApiSkillNode }) => {
  const theme = TIER_THEME[data.tier as keyof typeof TIER_THEME] || TIER_THEME[1];
  const TierIcon = theme.icon;

  // ✅ CORRECT: Use the actual level from the API (no derivation needed)
  const currentLevel = data.userLevel || 0;
  const currentXp = data.userExperiencePoints || 0;

  // ⭐ UNLIMITED PROGRESS: Calculate progress within current level, always cycling
  // Even after level 5, the ring continues to show XP progress
  const xpInCurrentLevel = currentXp % 1000;
  const progressPercent = (xpInCurrentLevel / 1000) * 100; // Always 0-100%, keeps cycling

  const isLocked = currentLevel === 0 && currentXp === 0;
  const isComplete = currentLevel >= 5;

  return (
    <div className="relative group cursor-pointer">
      {/* Handles for React Flow edges - positioned to not extend beyond card */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-accent/60 !border-accent !w-2 !h-2 !-top-1"
      />

      {/* Glow effect on hover */}
      {!isLocked && (
        <div className={`absolute -inset-2 rounded-2xl ${theme.glow} blur-xl opacity-0 
          group-hover:opacity-100 transition-opacity duration-300`} />
      )}

      {/* ⭐ INCREASED SIZE: w-72 h-40 for better readability */}
      <div className={cn(
        "relative w-72 h-40 rounded-2xl border-2 transition-all duration-300",
        "bg-gradient-to-br from-[#1f0d09]/95 via-[#14080f]/90 to-[#08030a]/95",
        "backdrop-blur-md",
        isLocked ? "border-gray-700/30 opacity-60" : `${theme.border} ${theme.glow}`,
        !isLocked && "hover:scale-105 hover:z-50"
      )}>

        {/* Texture overlay */}
        <div className="absolute inset-0 rounded-2xl opacity-[0.03]"
          style={{
            backgroundImage: 'url(https://www.transparenttextures.com/patterns/dark-embroidery.png)'
          }} />

        {/* ⭐ FIXED: Progress ring positioned in top-right, doesn't overlap text */}
        {!isLocked && currentLevel > 0 && (
          <div className="absolute top-3 right-3 w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3"
              />
              {/* Progress circle */}
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={theme.accentColor}
                strokeWidth="3"
                strokeDasharray={`${(progressPercent / 100) * 176} 176`}
                className="transition-all duration-500"
              />
            </svg>
            {/* Level number in center of ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{currentLevel}</span>
            </div>
          </div>
        )}

        <div className="relative z-10 p-5 h-full flex flex-col justify-between">
          {/* Header section */}
          <div className="flex items-start gap-3">
            {/* Text content - with padding to avoid overlap with ring */}
            <div className="flex-1 min-w-0 pr-16">
              <h3 className={cn(
                "font-bold text-base leading-tight mb-1",
                isLocked ? "text-gray-500" : "text-white"
              )}>
                {data.name}
              </h3>
              {data.domain && (
                <p className="text-xs text-amber-700/70 uppercase tracking-wider mb-1">
                  {data.domain}
                </p>
              )}
              {data.description && !isLocked && (
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {data.description}
                </p>
              )}
            </div>
          </div>

          {/* Footer section */}
          <div className="flex items-center justify-between">
            {/* Stats for unlocked skills */}
            {!isLocked ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Lv</span>
                  <span className="font-bold text-lg text-accent">{currentLevel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">{xpInCurrentLevel} XP</span>
                </div>
              </>
            ) : (
              /* Tier badge for locked skills */
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-gradient-to-br", theme.gradient,
                "border", theme.border
              )}>
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-500 font-semibold">Locked</span>
              </div>
            )}

            {/* Tier icon badge */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
              "bg-gradient-to-br", theme.gradient,
              "border", theme.border
            )}>
              <TierIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Mastery badge for completed skills */}
          {isComplete && (
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full 
              bg-gradient-to-br from-emerald-400 to-emerald-600 
              flex items-center justify-center border-2 border-[#0c0308]
              shadow-[0_0_12px_rgba(52,211,153,0.6)]">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-accent/60 !border-accent !w-2 !h-2 !-bottom-1"
      />
    </div>
  );
};