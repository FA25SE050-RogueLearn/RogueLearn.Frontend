// roguelearn-web/src/components/skills/ConstellationMap.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    useNodesState,
    useEdgesState,
    MarkerType,
    Node,
    Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConstellationNode } from './ConstellationNode';
import { layoutSkills } from '@/lib/skillTreeLayout';
import { filterSkillTree, FilterMode } from '@/lib/skillFilters';
import skillsApi from '@/api/skillsApi';
import { SkillTree, SkillNode as ApiSkillNode } from '@/types/skill-tree';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const nodeTypes = { constellation: ConstellationNode };

export function ConstellationMap() {
    const [rawData, setRawData] = useState<SkillTree | null>(null);
    const [filterMode, setFilterMode] = useState<FilterMode>('available');
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    // Add explicit type parameters here
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<ApiSkillNode>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial skill tree data on mount only
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await skillsApi.getSkillTree();
                if (res.isSuccess && res.data) {
                    setRawData(res.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Update layout whenever rawData, filterMode, or selectedDomain changes
    useEffect(() => {
        if (!rawData) return;

        const { filteredNodes, visibleEdges } = filterSkillTree(
            rawData.nodes, 
            rawData.dependencies, 
            filterMode, 
            selectedDomain
        );

        const positioned = layoutSkills(filteredNodes, visibleEdges);

        const flowNodes: Node<ApiSkillNode>[] = positioned.map(p => ({
            id: p.id,
            type: 'constellation',
            data: p.data,
            position: p.position,
        }));

        const flowEdges: Edge[] = visibleEdges.map(d => ({
            id: `${d.prerequisiteSkillId}-${d.skillId}`,
            source: d.prerequisiteSkillId,
            target: d.skillId,
            animated: true,
            style: {
                stroke: '#f5c16c',
                strokeWidth: 2,
                opacity: 0.4,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#f5c16c',
            },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
    }, [rawData, filterMode, selectedDomain, setNodes, setEdges]);

    // Extract unique domains for the filter dropdown
    const domains = useMemo(() => {
        if (!rawData) return [];
        return Array.from(new Set(rawData.nodes.map(n => n.domain).filter(Boolean))) as string[];
    }, [rawData]);

    // Calculate statistics for the stats panel
    const stats = useMemo(() => {
        if (!rawData) return { total: 0, unlocked: 0, available: 0 };
        const unlocked = rawData.nodes.filter(
            n => n.userLevel > 0 || n.userExperiencePoints > 0
        ).length;
        const { filteredNodes } = filterSkillTree(
            rawData.nodes,
            rawData.dependencies,
            'available',
            null
        );
        return { total: rawData.nodes.length, unlocked, available: filteredNodes.length };
    }, [rawData]);

    if (isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-lg bg-black/20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="h-[85vh] w-full relative bg-gradient-to-br from-[#0c0308] via-[#14080f] to-[#08030a]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
                <Background
                    color="#f5c16c"
                    gap={20}
                    size={1}
                    style={{ opacity: 0.05 }}
                />

                <Controls
                    className="!bg-[#1f0d09]/90 !border-amber-900/30 backdrop-blur-md"
                />

                <MiniMap
                    nodeColor={(node) => {
                        const tier = (node.data as ApiSkillNode).tier;
                        return tier === 1 ? '#10b981' : tier === 2 ? '#3b82f6' : '#a855f7';
                    }}
                    className="!bg-[#1f0d09]/95 !border-2 !border-amber-900/40 backdrop-blur-md"
                    maskColor="rgba(12, 3, 8, 0.7)"
                />

                {/* Filter Controls Panel */}
                <Panel position="top-right" className="space-y-3">
                    {/* View mode filters */}
                    <div className="flex flex-col gap-2 bg-[#1f0d09]/95 border-2 border-amber-900/30 
            rounded-2xl p-4 backdrop-blur-xl">
                        <div className="text-xs uppercase tracking-widest text-amber-700/70 mb-2">
                            View Mode
                        </div>
                        {(['all', 'unlocked', 'available', 'next'] as FilterMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
                                    filterMode === mode
                                        ? "bg-gradient-to-r from-accent to-amber-500 text-[#0c0308]"
                                        : "bg-white/5 text-amber-300/70 hover:bg-white/10 border border-amber-900/30"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Domain filter dropdown */}
                    {domains.length > 0 && (
                        <div className="bg-[#1f0d09]/95 border-2 border-amber-900/30 
              rounded-2xl p-4 backdrop-blur-xl">
                            <div className="text-xs uppercase tracking-widest text-amber-700/70 mb-2">
                                Domain
                            </div>
                            <select
                                value={selectedDomain || ''}
                                onChange={(e) => setSelectedDomain(e.target.value || null)}
                                className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-3 py-2 
                  text-sm text-amber-200 focus:border-accent focus:outline-none"
                            >
                                <option value="">All Domains</option>
                                {domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Stats display */}
                    <div className="bg-gradient-to-br from-[#1f0d09]/95 to-[#14080f]/90 
            border-2 border-accent/30 rounded-2xl p-4 backdrop-blur-xl">
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Unlocked</span>
                                <span className="font-bold text-emerald-400">
                                    {stats.unlocked}/{stats.total}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Available</span>
                                <span className="font-bold text-blue-400">{stats.available}</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
