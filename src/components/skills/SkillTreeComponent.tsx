/* eslint-disable react-hooks/static-components */
// roguelearn-web/src/components/skills/SkillTreeComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Crown, Star, Lock, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import skillsApi from '@/api/skillsApi';
import { SkillTree, SkillNode, SkillDependency } from '@/types/skill-tree';

// Convert numeric tier to string representation
const getTierName = (tier: number): 'Foundation' | 'Intermediate' | 'Advanced' => {
  switch (tier) {
    case 1: return 'Foundation';
    case 2: return 'Intermediate';
    case 3: return 'Advanced';
    default: return 'Foundation';
  }
};

const getTierIcon = (tier: number) => {
  switch (tier) {
    case 1: return Circle;
    case 2: return Zap;
    case 3: return Crown;
    default: return Star;
  }
};

const getTierColor = (tier: number) => {
  switch (tier) {
    case 1: return {
      glow: 'from-emerald-400 to-teal-500',
      border: 'border-emerald-400/60',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300'
    };
    case 2: return {
      glow: 'from-blue-400 to-cyan-500',
      border: 'border-blue-400/60',
      bg: 'bg-blue-500/20',
      text: 'text-blue-300'
    };
    case 3: return {
      glow: 'from-purple-400 to-pink-500',
      border: 'border-purple-400/60',
      bg: 'bg-purple-500/20',
      text: 'text-purple-300'
    };
    default: return {
      glow: 'from-gray-400 to-gray-500',
      border: 'border-gray-400/60',
      bg: 'bg-gray-500/20',
      text: 'text-gray-300'
    };
  }
};

const SkillOrb = ({ skill, position, onClick }: { 
  skill: SkillNode; 
  position: { x: number; y: number };
  onClick: () => void;
}) => {
  const tierColors = getTierColor(skill.tier);
  const TierIcon = getTierIcon(skill.tier);
  const tierName = getTierName(skill.tier);
  const isLocked = skill.userLevel === 0 && skill.userExperiencePoints === 0;
  const hasProgress = skill.userLevel > 0;

  return (
    <div
      className="absolute transition-all duration-300 cursor-pointer group"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
    >
      {/* Pulsing glow effect */}
      {!isLocked && (
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${tierColors.glow} blur-xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse`}
          style={{ width: '120px', height: '120px', left: '-10px', top: '-10px' }}
        />
      )}
      
      {/* Main orb container */}
      <div className="relative">
        {/* Outer ring with tier color */}
        <div 
          className={`w-24 h-24 rounded-full border-4 ${tierColors.border} ${isLocked ? 'opacity-30' : 'opacity-100'} transition-all duration-300 group-hover:scale-110`}
          style={{
            background: isLocked 
              ? 'radial-gradient(circle, rgba(30,30,30,0.9), rgba(10,10,10,0.95))'
              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 70%), linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7))`
          }}
        >
          {/* Inner glow ring */}
          <div className={`absolute inset-2 rounded-full border-2 border-white/20 ${!isLocked && 'animate-spin'}`} style={{ animationDuration: '20s' }} />
          
          {/* Content area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLocked ? (
              <Lock className="w-8 h-8 text-gray-600" />
            ) : (
              <div className="relative">
                <TierIcon className={`w-10 h-10 ${tierColors.text} drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`} />
                {hasProgress && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-black flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{skill.userLevel}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress ring */}
          {hasProgress && !isLocked && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="3"
                strokeDasharray={`${(skill.userLevel / 5) * 276} 276`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Tier badge */}
        <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full ${tierColors.bg} ${tierColors.border} border backdrop-blur-sm`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${tierColors.text}`}>
            {tierName[0]}
          </span>
        </div>

        {/* Completion checkmark */}
        {skill.userLevel >= 5 && !isLocked && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-black/95 border-2 border-white/20 rounded-lg px-4 py-3 min-w-[200px] shadow-2xl backdrop-blur-xl">
          <h3 className="font-bold text-white text-sm mb-1">{skill.name}</h3>
          <div className="space-y-1 text-xs">
            <p className={tierColors.text}>
              <span className="text-white/60">Tier:</span> {tierName}
            </p>
            {skill.domain && (
              <p className="text-white/80">
                <span className="text-white/60">Domain:</span> {skill.domain}
              </p>
            )}
            {skill.description && (
              <p className="text-white/70 text-xs mt-2">{skill.description}</p>
            )}
            {!isLocked && (
              <>
                <p className="text-white/80">
                  <span className="text-white/60">Level:</span> {skill.userLevel}/5
                </p>
                <p className="text-amber-400">
                  <span className="text-white/60">XP:</span> {skill.userExperiencePoints}
                </p>
              </>
            )}
            {isLocked && (
              <p className="text-red-400 text-xs mt-2">🔒 Complete prerequisites to unlock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillConnection = ({ from, to, isUnlocked }: { 
  from: { x: number; y: number }; 
  to: { x: number; y: number };
  isUnlocked: boolean;
}) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  const path = `M ${from.x} ${from.y} Q ${midX} ${midY - 5} ${to.x} ${to.y}`;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <linearGradient id={`line-gradient-${isUnlocked ? 'unlocked' : 'locked'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isUnlocked ? "#fbbf24" : "#374151"} stopOpacity={isUnlocked ? "0.6" : "0.3"} />
          <stop offset="100%" stopColor={isUnlocked ? "#f97316" : "#1f2937"} stopOpacity={isUnlocked ? "0.6" : "0.3"} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={`url(#line-gradient-${isUnlocked ? 'unlocked' : 'locked'})`}
        strokeWidth={isUnlocked ? "3" : "2"}
        strokeDasharray={isUnlocked ? "0" : "5,5"}
        className={isUnlocked ? "animate-pulse" : ""}
        style={{ animationDuration: '3s' }}
      />
    </svg>
  );
};

export function SkillTreeComponent() {
  const [treeData, setTreeData] = useState<SkillTree | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkillTree = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await skillsApi.getSkillTree();
        if (response.isSuccess && response.data) {
          setTreeData(response.data);
        } else {
          throw new Error('Failed to fetch skill tree data.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        console.error('Error fetching skill tree:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillTree();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading your skill constellation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 text-lg font-semibold mb-2">Failed to Load Skill Tree</p>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!treeData || treeData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <p className="text-white/60">No skills available yet. Complete some quests to unlock skills!</p>
        </div>
      </div>
    );
  }

  // Calculate positions in a tree-like structure
  const getNodePosition = (index: number, tier: number) => {
    const tierY = tier === 1 ? 25 : tier === 2 ? 50 : 75;
    const nodesInTier = treeData.nodes.filter(n => n.tier === tier).length;
    const tierIndex = treeData.nodes.filter(n => n.tier === tier).indexOf(treeData.nodes[index]);
    const spacing = 80 / (nodesInTier + 1);
    const x = 10 + spacing * (tierIndex + 1);
    
    return { x, y: tierY };
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden rounded-3xl">
      {/* Mystical background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Skill tree title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
          Astral Skill Tree
        </h1>
        <p className="text-white/60 text-sm mt-2">Chart your path through the constellation of knowledge</p>
      </div>

      {/* Main tree container */}
      <div className="relative w-full h-full" style={{ zIndex: 10 }}>
        {/* Draw connections first (lower z-index) */}
        {treeData.dependencies.map((dep, i) => {
          const fromNode = treeData.nodes.find(n => n.skillId === dep.prerequisiteSkillId);
          const toNode = treeData.nodes.find(n => n.skillId === dep.skillId);
          if (!fromNode || !toNode) return null;

          const fromPos = getNodePosition(treeData.nodes.indexOf(fromNode), fromNode.tier);
          const toPos = getNodePosition(treeData.nodes.indexOf(toNode), toNode.tier);

          const isFromUnlocked = fromNode.userLevel > 0 || fromNode.userExperiencePoints > 0;
          const isToUnlocked = toNode.userLevel > 0 || toNode.userExperiencePoints > 0;

          return (
            <SkillConnection
              key={i}
              from={fromPos}
              to={toPos}
              isUnlocked={isFromUnlocked && isToUnlocked}
            />
          );
        })}

        {/* Draw skill orbs */}
        {treeData.nodes.map((node, i) => (
          <SkillOrb
            key={node.skillId}
            skill={node}
            position={getNodePosition(i, node.tier)}
            onClick={() => setSelectedSkill(node)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
        <h3 className="text-white font-bold text-sm mb-3">Skill Tiers</h3>
        <div className="space-y-2">
          {[
            { tier: 1, name: 'Foundation' },
            { tier: 2, name: 'Intermediate' },
            { tier: 3, name: 'Advanced' }
          ].map(({ tier, name }) => {
            const colors = getTierColor(tier);
            const Icon = getTierIcon(tier);
            return (
              <div key={tier} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <span className="text-white/80 text-xs">{name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats panel */}
      <div className="absolute bottom-8 right-8 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 min-w-[200px]">
        <h3 className="text-white font-bold text-sm mb-3">Your Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/60 text-xs">Skills Unlocked</span>
            <span className="text-emerald-400 font-bold text-sm">
              {treeData.nodes.filter(n => n.userLevel > 0 || n.userExperiencePoints > 0).length}/{treeData.nodes.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60 text-xs">Average Level</span>
            <span className="text-blue-400 font-bold text-sm">
              {(treeData.nodes.reduce((acc, n) => acc + n.userLevel, 0) / treeData.nodes.length).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60 text-xs">Total XP</span>
            <span className="text-amber-400 font-bold text-sm">
              {treeData.nodes.reduce((acc, n) => acc + n.userExperiencePoints, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}