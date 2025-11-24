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
  const isLocked = data.userLevel === 0 && data.userExperiencePoints === 0;
  const isComplete = data.userLevel >= 5; // Assuming level 5 is mastery

  return (
    // ⭐ MODIFIED: Added cursor-pointer to indicate clickability
    <div className="relative group cursor-pointer">
      {/* Handles are connection points for React Flow edges */}
      <Handle type="target" position={Position.Top} className="!bg-accent/60 !border-accent !w-3 !h-3" />

      {/* Glow effect for unlocked skills on hover */}
      {!isLocked && (
        <div className={`absolute -inset-2 rounded-2xl ${theme.glow} blur-xl opacity-0 
          group-hover:opacity-100 transition-opacity duration-300`} />
      )}

      {/* Main card */}
      <div className={cn(
        "relative w-56 h-32 rounded-2xl border-2 transition-all duration-300",
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

        {/* Progress ring for unlocked skills */}
        {!isLocked && data.userLevel > 0 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="112" cy="64" r="58"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="2"
            />
            <circle
              cx="112" cy="64" r="58"
              fill="none"
              stroke={theme.accentColor}
              strokeWidth="3"
              strokeDasharray={`${(data.userLevel / 5) * 364} 364`}
              className="transition-all duration-500"
            />
          </svg>
        )}

        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          {/* Header section of the node */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-bold text-sm line-clamp-2 leading-tight",
                isLocked ? "text-gray-500" : "text-white"
              )}>
                {data.name}
              </h3>
              {data.domain && (
                <p className="text-[10px] text-amber-700/70 mt-0.5 uppercase tracking-wider">
                  {data.domain}
                </p>
              )}
            </div>

            {/* Tier icon badge */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
              "bg-gradient-to-br", theme.gradient,
              "border", theme.border
            )}>
              {isLocked ? (
                <Lock className="w-5 h-5 text-gray-600" />
              ) : (
                <TierIcon className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          {/* Stats footer for unlocked skills */}
          {!isLocked && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Level</span>
                <span className="font-bold text-accent">{data.userLevel}/5</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span className="font-semibold">{data.userExperiencePoints}</span>
              </div>
            </div>
          )}

          {/* Completion badge for mastered skills */}
          {isComplete && (
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full 
              bg-gradient-to-br from-emerald-400 to-emerald-600 
              flex items-center justify-center border-2 border-[#0c0308]
              shadow-[0_0_12px_rgba(52,211,153,0.6)]">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent/60 !border-accent !w-3 !h-3" />
    </div>
  );
};