// roguelearn-web/src/app/admin/mappings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, Link as LinkIcon, Plus, X, Search, Circle, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import subjectsApi from "@/api/subjectsApi";
import adminManagementApi from "@/api/adminManagementApi";
import { Subject } from "@/types/subjects";
import { Skill } from "@/types/skills";
import { SubjectSkillMappingDto } from "@/types/admin-management";
import { ReactFlow, Background, Controls, Node, Edge, Handle, Position, MarkerType } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

// --- Custom Node Components (Unchanged) ---

const SubjectNode = ({ data }: { data: { label: string; code: string } }) => (
    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-900/90 to-black border-4 border-amber-500/50 flex flex-col items-center justify-center text-center p-4 shadow-[0_0_30px_rgba(245,193,108,0.3)] z-50 relative">
        <div className="text-xs font-mono text-amber-400 mb-1">{data.code}</div>
        <div className="text-sm font-bold text-white leading-tight">{data.label}</div>
        <Handle type="source" position={Position.Bottom} className="opacity-0" />
        <Handle type="source" position={Position.Top} className="opacity-0" />
        <Handle type="source" position={Position.Left} className="opacity-0" />
        <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
);

const SkillNode = ({ data }: { data: { label: string; tier: number; onDelete: () => void } }) => {
    const tierConfig = {
        1: { color: "border-emerald-500 text-emerald-400 bg-emerald-950/80", icon: Circle },
        2: { color: "border-blue-500 text-blue-400 bg-blue-950/80", icon: Zap },
        3: { color: "border-purple-500 text-purple-400 bg-purple-950/80", icon: Crown },
    }[data.tier as 1 | 2 | 3] || { color: "border-gray-500 text-gray-400 bg-gray-950/80", icon: Circle };

    const Icon = tierConfig.icon;

    return (
        <div className={`relative group min-w-[140px] px-4 py-3 rounded-xl border-2 ${tierConfig.color} shadow-lg flex items-center gap-3 backdrop-blur-sm z-10`}>
            {/* Handles for incoming/outgoing connections */}
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-white/50 border-none" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-white/50 border-none" />
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-white/50 border-none" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-white/50 border-none" />

            <Icon className="w-5 h-5 shrink-0" />
            <div className="text-xs font-semibold">{data.label}</div>

            <button
                onClick={(e) => { e.stopPropagation(); data.onDelete(); }}
                className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-700"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

const nodeTypes = {
    subject: SubjectNode,
    skill: SkillNode,
};

export default function CurriculumMapPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [subjectSearch, setSubjectSearch] = useState("");

    // Selection State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [mappedSkills, setMappedSkills] = useState<SubjectSkillMappingDto[]>([]);
    const [loadingMappings, setLoadingMappings] = useState(false);
    const [skillSearch, setSkillSearch] = useState("");

    // React Flow State
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Update graph whenever mappedSkills or selectedSubject changes
    useEffect(() => {
        if (!selectedSubject) {
            setNodes([]);
            setEdges([]);
            return;
        }

        // 1. Central Subject Node
        const centerNode: Node = {
            id: 'subject-center',
            type: 'subject',
            position: { x: 0, y: 0 },
            data: { label: selectedSubject.subjectName, code: selectedSubject.subjectCode },
        };

        // 2. Satellite Skill Nodes (Radial Layout)
        const skillNodes: Node[] = mappedSkills.map((mapping, index) => {
            const count = mappedSkills.length;
            const radius = 350; // Increased radius
            // Start from -90deg (top)
            const angle = (index / count) * 2 * Math.PI - (Math.PI / 2);

            // Find full skill info to get Tier
            const fullSkill = allSkills.find(s => s.id === mapping.skillId);
            const tier = fullSkill?.tier || 1;

            return {
                id: mapping.skillId,
                type: 'skill',
                position: {
                    x: radius * Math.cos(angle),
                    y: radius * Math.sin(angle),
                },
                data: {
                    label: mapping.skillName,
                    tier,
                    onDelete: () => handleRemoveMapping(mapping.skillId)
                },
            };
        });

        // 3. Edges from Subject to Skills (Radial spokes)
        const subjectEdges: Edge[] = mappedSkills.map((mapping) => ({
            id: `edge-subject-${mapping.skillId}`,
            source: 'subject-center',
            target: mapping.skillId,
            type: 'default',
            animated: false,
            style: { stroke: '#f5c16c', strokeWidth: 1, opacity: 0.2, strokeDasharray: '5,5' },
        }));

        // 4. ⭐ NEW: Dependency Edges from mapped data
        const dependencyEdges: Edge[] = [];
        const mappedSkillIds = new Set(mappedSkills.map(m => m.skillId));

        mappedSkills.forEach(skill => {
            if (skill.prerequisites) {
                skill.prerequisites.forEach(prereq => {
                    // Only draw edge if the prerequisite is also mapped to this subject
                    if (mappedSkillIds.has(prereq.prerequisiteSkillId)) {
                        dependencyEdges.push({
                            id: `dep-${prereq.prerequisiteSkillId}-${skill.skillId}`,
                            source: prereq.prerequisiteSkillId,
                            target: skill.skillId,
                            type: 'default',
                            animated: true,
                            style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.8 }, // Blue
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: '#3b82f6',
                            },
                            label: 'Requires',
                            labelStyle: { fill: '#3b82f6', fontWeight: 700, fontSize: 10 },
                            labelBgStyle: { fill: '#000', fillOpacity: 0.7 },
                        });
                    }
                });
            }
        });

        setNodes([centerNode, ...skillNodes]);
        setEdges([...subjectEdges, ...dependencyEdges]);

    }, [selectedSubject, mappedSkills, allSkills]);

    const loadInitialData = async () => {
        setLoadingSubjects(true);
        try {
            const [subRes, skillsRes] = await Promise.all([
                subjectsApi.getAll(),
                adminManagementApi.getAllSkills(),
            ]);

            if (subRes.isSuccess && subRes.data) {
                setSubjects(subRes.data);
            }

            if (skillsRes.isSuccess && skillsRes.data) {
                setAllSkills(skillsRes.data.skills || []);
            }

        } catch (e) {
            toast.error("Failed to load initial catalog.");
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleSelectSubject = async (subject: Subject) => {
        setSelectedSubject(subject);
        setLoadingMappings(true);
        try {
            const res = await adminManagementApi.getSubjectSkills(subject.id);
            if (res.isSuccess && res.data) {
                setMappedSkills(res.data);
            } else {
                setMappedSkills([]);
            }
        } catch {
            toast.error("Failed to load mappings.");
            setMappedSkills([]);
        } finally {
            setLoadingMappings(false);
        }
    };

    const handleAddMapping = async (skillId: string) => {
        if (!selectedSubject) return;
        try {
            await adminManagementApi.addSubjectSkill(selectedSubject.id, skillId);
            toast.success("Skill mapped");
            // Refresh
            const res = await adminManagementApi.getSubjectSkills(selectedSubject.id);
            if (res.isSuccess) setMappedSkills(res.data);
        } catch {
            toast.error("Failed to map skill");
        }
    };

    const handleRemoveMapping = async (skillId: string) => {
        if (!selectedSubject) return;
        try {
            await adminManagementApi.removeSubjectSkill(selectedSubject.id, skillId);
            toast.success("Skill unmapped");
            // Refresh
            const res = await adminManagementApi.getSubjectSkills(selectedSubject.id);
            if (res.isSuccess) setMappedSkills(res.data);
        } catch {
            toast.error("Failed to remove mapping");
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.subjectName.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.subjectCode.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    const availableSkills = allSkills.filter(s =>
        !mappedSkills.some(mapped => mapped.skillId === s.id) &&
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-amber-100 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-amber-500" />
                        Curriculum Map
                    </h1>
                    <p className="text-amber-700 mt-1">
                        Visualize subject composition. Blue lines indicate skill prerequisites within this subject.
                    </p>
                </div>

                <div className="flex flex-1 gap-6 min-h-0">
                    {/* Left Column: Subjects List */}
                    <Card className="w-1/4 bg-black/40 border-amber-900/30 flex flex-col min-h-0">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-amber-100">Subjects</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-amber-700" />
                                <Input
                                    placeholder="Search..."
                                    value={subjectSearch}
                                    onChange={e => setSubjectSearch(e.target.value)}
                                    className="pl-8 bg-black/20 border-amber-900/30 text-sm"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {loadingSubjects ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-amber-500" /></div>
                            ) : (
                                filteredSubjects.map(subject => (
                                    <button
                                        key={subject.id}
                                        onClick={() => handleSelectSubject(subject)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group
                      ${selectedSubject?.id === subject.id
                                                ? "bg-amber-900/30 border-amber-600/50 text-amber-100"
                                                : "bg-black/20 border-transparent hover:bg-amber-900/10 text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        <div className="truncate">
                                            <span className="font-mono text-xs opacity-70 mr-2">{subject.subjectCode}</span>
                                            <span className="font-medium text-sm">{subject.subjectName}</span>
                                        </div>
                                        <LinkIcon className={`w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity ${selectedSubject?.id === subject.id ? 'opacity-100 text-amber-500' : ''}`} />
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Center: Graph Visualization */}
                    <Card className="flex-1 bg-[#1a1410] border-amber-900/30 flex flex-col min-h-0 relative overflow-hidden">
                        {selectedSubject ? (
                            <>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    nodeTypes={nodeTypes}
                                    fitView
                                    minZoom={0.2}
                                    maxZoom={2}
                                >
                                    <Background color="#f5c16c" gap={20} size={1} style={{ opacity: 0.05 }} />
                                    <Controls className="bg-black/80 border-amber-900/30" />
                                </ReactFlow>
                                {/* Legend */}
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur border border-amber-900/30 p-3 rounded-lg text-xs space-y-2">
                                    <div className="font-bold text-amber-500 mb-1">Legend</div>
                                    <div className="flex items-center gap-2 text-emerald-400"><Circle className="w-3 h-3" /> Foundation</div>
                                    <div className="flex items-center gap-2 text-blue-400"><Zap className="w-3 h-3" /> Intermediate</div>
                                    <div className="flex items-center gap-2 text-purple-400"><Crown className="w-3 h-3" /> Advanced</div>
                                    <div className="h-px bg-white/10 my-1" />
                                    <div className="flex items-center gap-2 text-amber-500/50"><span className="w-4 h-0.5 bg-amber-500/50 border-dashed border-t border-amber-500" /> Subject Link</div>
                                    <div className="flex items-center gap-2 text-blue-400"><span className="w-4 h-0.5 bg-blue-400" /> Prerequisite</div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <div className="bg-amber-900/10 p-6 rounded-full mb-4 border border-amber-900/20">
                                    <BookOpen className="w-12 h-12 text-amber-800/50" />
                                </div>
                                <p>Select a subject to view its constellation.</p>
                            </div>
                        )}
                    </Card>

                    {/* Right Column: Available Skills */}
                    <Card className="w-1/4 bg-black/40 border-amber-900/30 flex flex-col min-h-0">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Skills
                            </CardTitle>
                            <Input
                                placeholder="Filter skills..."
                                value={skillSearch}
                                onChange={e => setSkillSearch(e.target.value)}
                                className="h-8 bg-black/20 border-amber-900/30 text-xs mt-2"
                            />
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-1">
                            {availableSkills.slice(0, 50).map(skill => (
                                <button
                                    key={skill.id}
                                    onClick={() => handleAddMapping(skill.id)}
                                    disabled={!selectedSubject}
                                    className="w-full flex items-center justify-between p-2 rounded border border-transparent hover:bg-amber-900/20 hover:border-amber-900/30 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div>
                                        <div className="text-sm text-gray-400 group-hover:text-amber-200">{skill.name}</div>
                                        <div className="text-[10px] text-gray-600">Tier {skill.tier} • {skill.domain}</div>
                                    </div>
                                    <Plus className="w-3 h-3 text-gray-600 group-hover:text-amber-500" />
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}