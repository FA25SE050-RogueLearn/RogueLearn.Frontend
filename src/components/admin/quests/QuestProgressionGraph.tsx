"use client";

import { useMemo } from "react";
import { AdminQuestStepDto, AdminQuestDetailsDto } from "@/api/questApi";
import { 
    BookOpen, 
    BrainCircuit, 
    Code, 
    CheckCircle2, 
    Lock,
    Sparkles,
    Trophy,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestProgressionGraphProps {
    quest: AdminQuestDetailsDto;
    selectedTrack: 'Standard' | 'Supportive' | 'Challenging';
    onStepClick?: (step: AdminQuestStepDto) => void;
}

interface NodePosition {
    x: number;
    y: number;
    step: AdminQuestStepDto;
    isStart?: boolean;
    isBoss?: boolean;
}

export function QuestProgressionGraph({ 
    quest, 
    selectedTrack,
    onStepClick 
}: QuestProgressionGraphProps) {
    const steps = useMemo(() => {
        switch (selectedTrack) {
            case 'Supportive': return quest.supportiveSteps || [];
            case 'Challenging': return quest.challengingSteps || [];
            default: return quest.standardSteps || [];
        }
    }, [quest, selectedTrack]);

    const trackColors = {
        Standard: { primary: '#f5c16c', secondary: '#d4a855', glow: 'rgba(245, 193, 108, 0.3)' },
        Supportive: { primary: '#4ade80', secondary: '#22c55e', glow: 'rgba(74, 222, 128, 0.3)' },
        Challenging: { primary: '#f472b6', secondary: '#ec4899', glow: 'rgba(244, 114, 182, 0.3)' }
    };

    const colors = trackColors[selectedTrack];

    // Calculate node positions in a wave pattern
    const nodePositions: NodePosition[] = useMemo(() => {
        if (steps.length === 0) return [];

        const positions: NodePosition[] = [];
        const nodeWidth = 80;
        const nodeSpacing = 140;
        const verticalAmplitude = 60;
        const verticalLevels = 3;

        steps.forEach((step, index) => {
            const x = 100 + index * nodeSpacing;
            // Create wave pattern across vertical levels
            const levelIndex = index % verticalLevels;
            const direction = Math.floor(index / verticalLevels) % 2 === 0 ? 1 : -1;
            const y = 150 + (levelIndex - 1) * verticalAmplitude * direction;
            
            positions.push({
                x,
                y,
                step,
                isStart: index === 0,
                isBoss: index === steps.length - 1 && steps.length > 1
            });
        });

        return positions;
    }, [steps]);

    // Generate connection paths between nodes
    const connectionPaths = useMemo(() => {
        if (nodePositions.length < 2) return [];

        const paths: string[] = [];
        for (let i = 0; i < nodePositions.length - 1; i++) {
            const from = nodePositions[i];
            const to = nodePositions[i + 1];
            
            // Create curved path
            const midX = (from.x + to.x) / 2;
            const controlY = (from.y + to.y) / 2 + (i % 2 === 0 ? -20 : 20);
            
            paths.push(`M ${from.x + 35} ${from.y} Q ${midX} ${controlY} ${to.x - 35} ${to.y}`);
        }
        return paths;
    }, [nodePositions]);

    const getActivityCount = (step: AdminQuestStepDto) => {
        if (!step.content?.activities) return 0;
        return step.content.activities.length;
    };

    const getActivityIcons = (step: AdminQuestStepDto) => {
        if (!step.content?.activities) return [];
        const types = step.content.activities.map((a: any) => a.type);
        const uniqueTypes = [...new Set(types)] as string[];
        return uniqueTypes.slice(0, 3);
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'Reading': return BookOpen;
            case 'Quiz': return BrainCircuit;
            case 'Coding': return Code;
            case 'KnowledgeCheck': return CheckCircle2;
            default: return Sparkles;
        }
    };

    if (steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-white/40">
                <Lock className="w-12 h-12 mb-4" />
                <p className="text-sm">No steps generated for {selectedTrack} track</p>
            </div>
        );
    }

    const svgWidth = Math.max(800, nodePositions.length * 140 + 200);
    const svgHeight = 300;

    return (
        <div className="relative w-full overflow-x-auto">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 30%, ${colors.glow}, transparent 50%), 
                                         radial-gradient(circle at 80% 70%, ${colors.glow}, transparent 50%)`
                    }}
                />
                {/* Grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-5">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <svg 
                width={svgWidth} 
                height={svgHeight} 
                className="relative z-10"
                style={{ minWidth: svgWidth }}
            >
                <defs>
                    {/* Glow filter */}
                    <filter id={`glow-${selectedTrack}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>

                    {/* Gradient for connections */}
                    <linearGradient id={`lineGradient-${selectedTrack}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6"/>
                        <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.8"/>
                        <stop offset="100%" stopColor={colors.primary} stopOpacity="0.6"/>
                    </linearGradient>

                    {/* Node gradient */}
                    <radialGradient id={`nodeGradient-${selectedTrack}`} cx="30%" cy="30%">
                        <stop offset="0%" stopColor={colors.primary}/>
                        <stop offset="100%" stopColor={colors.secondary}/>
                    </radialGradient>
                </defs>

                {/* Connection lines */}
                <g className="connections">
                    {connectionPaths.map((path, index) => (
                        <g key={index}>
                            {/* Glow effect */}
                            <path
                                d={path}
                                fill="none"
                                stroke={colors.primary}
                                strokeWidth="4"
                                opacity="0.3"
                                filter={`url(#glow-${selectedTrack})`}
                            />
                            {/* Main line */}
                            <path
                                d={path}
                                fill="none"
                                stroke={`url(#lineGradient-${selectedTrack})`}
                                strokeWidth="2"
                                strokeDasharray="8 4"
                                className="animate-pulse"
                            />
                        </g>
                    ))}
                </g>

                {/* Nodes */}
                <g className="nodes">
                    {nodePositions.map((node, index) => {
                        const isStart = node.isStart;
                        const isBoss = node.isBoss;
                        const nodeSize = isBoss ? 50 : 35;
                        const activityIcons = getActivityIcons(node.step);
                        const activityCount = getActivityCount(node.step);

                        return (
                            <g 
                                key={node.step.id}
                                className="cursor-pointer transition-transform hover:scale-110"
                                onClick={() => onStepClick?.(node.step)}
                                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                            >
                                {/* Outer glow ring for start node */}
                                {isStart && (
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={nodeSize + 15}
                                        fill="none"
                                        stroke={colors.primary}
                                        strokeWidth="2"
                                        opacity="0.4"
                                        className="animate-ping"
                                        style={{ animationDuration: '2s' }}
                                    />
                                )}

                                {/* Boss glow */}
                                {isBoss && (
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={nodeSize + 10}
                                        fill={colors.glow}
                                        filter={`url(#glow-${selectedTrack})`}
                                    />
                                )}

                                {/* Node background */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={nodeSize}
                                    fill={`url(#nodeGradient-${selectedTrack})`}
                                    stroke={colors.primary}
                                    strokeWidth="3"
                                    className="drop-shadow-lg"
                                />

                                {/* Week number */}
                                <text
                                    x={node.x}
                                    y={node.y - nodeSize - 10}
                                    textAnchor="middle"
                                    className="fill-white/60 text-xs font-medium"
                                >
                                    Week {node.step.stepNumber}
                                </text>

                                {/* Icon */}
                                {isBoss ? (
                                    <Trophy 
                                        x={node.x - 16} 
                                        y={node.y - 16} 
                                        className="w-8 h-8 text-black"
                                    />
                                ) : (
                                    <Zap 
                                        x={node.x - 12} 
                                        y={node.y - 12} 
                                        className="w-6 h-6 text-black"
                                    />
                                )}

                                {/* Activity count badge */}
                                <circle
                                    cx={node.x + nodeSize - 5}
                                    cy={node.y - nodeSize + 5}
                                    r="12"
                                    fill="#1a1410"
                                    stroke={colors.primary}
                                    strokeWidth="2"
                                />
                                <text
                                    x={node.x + nodeSize - 5}
                                    y={node.y - nodeSize + 9}
                                    textAnchor="middle"
                                    className="fill-white text-xs font-bold"
                                >
                                    {activityCount}
                                </text>

                                {/* XP badge */}
                                <text
                                    x={node.x}
                                    y={node.y + nodeSize + 20}
                                    textAnchor="middle"
                                    className="fill-white/50 text-xs"
                                >
                                    {node.step.experiencePoints} XP
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/50">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-4 h-4 rounded-full"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    />
                    <span>Weekly Module</span>
                </div>
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" style={{ color: colors.primary }} />
                    <span>Final Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: colors.primary }} />
                    <span>Progression Path</span>
                </div>
            </div>
        </div>
    );
}

export default QuestProgressionGraph;
