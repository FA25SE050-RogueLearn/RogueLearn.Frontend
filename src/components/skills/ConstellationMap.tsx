// roguelearn-web/src/components/skills/ConstellationMap.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // ⭐ NEW
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
    Edge,
    NodeMouseHandler // ⭐ NEW
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
    const router = useRouter(); // ⭐ NEW
    const [rawData, setRawData] = useState<SkillTree | null>(null);
    const [filterMode, setFilterMode] = useState<FilterMode>('available');
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [trackedIds, setTrackedIds] = useState<Set<string> | null>(null);

    // Add explicit type parameters here
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<ApiSkillNode>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial skill tree data on mount only
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [treeRes, mySkillsRes] = await Promise.all([
                    skillsApi.getSkillTree(),
                    skillsApi.getMySkills()
                ]);
                if (treeRes.isSuccess && treeRes.data) {
                    setRawData(treeRes.data);
                }
                if (mySkillsRes.isSuccess && mySkillsRes.data) {
                    const ids = new Set((mySkillsRes.data.skills || []).map(s => s.skillId));
                    setTrackedIds(ids);
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
            selectedDomain,
            trackedIds
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
    }, [rawData, filterMode, selectedDomain, trackedIds, setNodes, setEdges]);

    // ⭐ NEW: Handle node clicks
    const onNodeClick: NodeMouseHandler = (event, node) => {
        router.push(`/skills/${node.id}`);
    };

    // Extract unique domains for the filter dropdown
    const domains = useMemo(() => {
        if (!rawData) return [];
        return Array.from(new Set(rawData.nodes.map(n => n.domain).filter(Boolean))) as string[];
    }, [rawData]);

    // Calculate statistics for the stats panel
    const stats = useMemo(() => {
        if (!rawData) return { total: 0, unlocked: 0, available: 0 };
        const unlocked = rawData.nodes.filter(
            n => (n.userLevel > 0 || n.userExperiencePoints > 0) || (trackedIds?.has(n.skillId))
        ).length;
        const { filteredNodes } = filterSkillTree(
            rawData.nodes,
            rawData.dependencies,
            'available',
            null,
            trackedIds
        );
        return { total: rawData.nodes.length, unlocked, available: filteredNodes.length };
    }, [rawData, trackedIds]);

    if (isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-[28px] border border-[#f5c16c]/20 bg-black/40">
                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
            </div>
        );
    }

    return (
        <div className="h-[85vh] w-full relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#0a0506] via-[#120806] to-[#0a0506]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick} // ⭐ NEW: Attach handler
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
                    className="!bg-[#1a0a08]/90 !border-[#f5c16c]/30 backdrop-blur-md"
                />

                <MiniMap
                    nodeColor={(node) => {
                        const tier = (node.data as ApiSkillNode).tier;
                        return tier === 1 ? '#10b981' : tier === 2 ? '#3b82f6' : '#a855f7';
                    }}
                    className="!bg-[#1a0a08]/95 !border-2 !border-[#f5c16c]/40 backdrop-blur-md"
                    maskColor="rgba(10, 5, 6, 0.7)"
                />

                {/* Filter Controls Panel */}
                <Panel position="top-right" className="space-y-3">
                    {/* View mode filters */}
                    <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#f5c16c]/30 bg-[#1a0a08]/95 p-4 backdrop-blur-xl">
                        <div className="mb-2 text-xs uppercase tracking-widest text-[#f5c16c]/70">
                            View Mode
                        </div>
                        {(['all', 'unlocked', 'available', 'next'] as FilterMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
                                    filterMode === mode
                                        ? "bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black"
                                        : "bg-white/5 text-[#f5c16c]/70 hover:bg-white/10 border border-[#f5c16c]/30"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Domain filter dropdown */}
                    {domains.length > 0 && (
                        <div className="rounded-2xl border-2 border-[#f5c16c]/30 bg-[#1a0a08]/95 p-4 backdrop-blur-xl">
                            <div className="mb-2 text-xs uppercase tracking-widest text-[#f5c16c]/70">
                                Domain
                            </div>
                            <select
                                value={selectedDomain || ''}
                                onChange={(e) => setSelectedDomain(e.target.value || null)}
                                className="w-full rounded-lg border border-[#f5c16c]/30 bg-black/40 px-3 py-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/30"
                            >
                                <option value="">All Domains</option>
                                {domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Stats display */}
                    <div className="rounded-2xl border-2 border-[#f5c16c]/30 bg-gradient-to-br from-[#1a0a08]/95 to-[#120806]/90 p-4 backdrop-blur-xl">
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-white/60">Unlocked</span>
                                <span className="font-bold text-emerald-400">
                                    {stats.unlocked}/{stats.total}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Available</span>
                                <span className="font-bold text-blue-400">{stats.available}</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
