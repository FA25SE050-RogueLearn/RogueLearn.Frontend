"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Imported Label
import { Loader2, BookOpen, Link as LinkIcon, Plus, X, Search, Circle, Zap, Crown, Scale } from "lucide-react";
import { toast } from "sonner";
import subjectsApi from "@/api/subjectsApi";
import adminManagementApi from "@/api/adminManagementApi";
import { Subject } from "@/types/subjects";
import { Skill } from "@/types/skills";
import { SubjectSkillMappingDto } from "@/types/admin-management";
import { ReactFlow, Background, Controls, Node, Edge, Handle, Position, MarkerType } from "@xyflow/react";
import '@xyflow/react/dist/style.css';

const SubjectNode = ({ data }: { data: { label: string; code: string } }) => (
    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#7289da] to-[#5b6eae] border-4 border-[#7289da]/50 flex flex-col items-center justify-center text-center p-4 shadow-lg z-50 relative">
        <div className="text-xs font-mono text-white/80 mb-1">{data.code}</div>
        <div className="text-sm font-bold text-white leading-tight">{data.label}</div>
        <Handle type="source" position={Position.Bottom} className="opacity-0" />
        <Handle type="source" position={Position.Top} className="opacity-0" />
        <Handle type="source" position={Position.Left} className="opacity-0" />
        <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
);

const SkillNode = ({ data }: { data: { label: string; tier: number; weight: number; onDelete: () => void } }) => {
    const tierConfig = {
        1: { color: "border-emerald-500 text-emerald-600 bg-emerald-50", icon: Circle },
        2: { color: "border-[#7289da] text-[#f5c16c] bg-[#f5c16c]/10", icon: Zap },
        3: { color: "border-purple-500 text-purple-600 bg-purple-50", icon: Crown },
    }[data.tier as 1 | 2 | 3] || { color: "border-gray-400 text-gray-600 bg-gray-50", icon: Circle };

    const Icon = tierConfig.icon;

    // Visual indicator for weight (opacity or size could be used, here just a badge)
    const weightPercent = Math.round(data.weight * 100);

    return (
        <div className={`relative group min-w-[140px] px-4 py-3 rounded-xl border-2 ${tierConfig.color} shadow-md flex items-center gap-3 z-10`}>
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-[#beaca3] border-none" />
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-[#beaca3] border-none" />
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#beaca3] border-none" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#beaca3] border-none" />

            <Icon className="w-5 h-5 shrink-0" />
            <div className="flex flex-col">
                <div className="text-xs font-semibold">{data.label}</div>
                <div className="text-[9px] opacity-70 flex items-center gap-1">
                    <Scale className="w-3 h-3" /> {weightPercent}%
                </div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); data.onDelete(); }}
                className="absolute -top-2 -right-2 bg-[#e07a5f] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-[#d06a4f]"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

const nodeTypes = { subject: SubjectNode, skill: SkillNode };

export default function CurriculumMapPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [subjectSearch, setSubjectSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [mappedSkills, setMappedSkills] = useState<SubjectSkillMappingDto[]>([]);
    const [loadingMappings, setLoadingMappings] = useState(false);
    const [skillSearch, setSkillSearch] = useState("");

    // ⭐ NEW: Relevance Weight State
    const [relevance, setRelevance] = useState(1.0);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => { loadInitialData(); }, []);

    useEffect(() => {
        if (!selectedSubject) { setNodes([]); setEdges([]); return; }

        const centerNode: Node = {
            id: 'subject-center', type: 'subject', position: { x: 0, y: 0 },
            data: { label: selectedSubject.subjectName, code: selectedSubject.subjectCode },
        };

        const safeMappedSkills = Array.isArray(mappedSkills) ? mappedSkills : [];
        const skillNodes: Node[] = safeMappedSkills.map((mapping, index) => {
            const count = safeMappedSkills.length;
            const radius = 350;
            const angle = (index / count) * 2 * Math.PI - (Math.PI / 2);
            const safeAllSkills = Array.isArray(allSkills) ? allSkills : [];
            const fullSkill = safeAllSkills.find(s => s.id === mapping.skillId);
            const tier = fullSkill?.tier || 1;

            return {
                id: mapping.skillId, type: 'skill',
                position: { x: radius * Math.cos(angle), y: radius * Math.sin(angle) },
                data: {
                    label: mapping.skillName,
                    tier,
                    weight: mapping.relevanceWeight,
                    onDelete: () => handleRemoveMapping(mapping.skillId)
                },
            };
        });

        const subjectEdges: Edge[] = safeMappedSkills.map((mapping) => ({
            id: `edge-subject-${mapping.skillId}`, source: 'subject-center', target: mapping.skillId,
            type: 'default', animated: false,
            // Adjust opacity based on weight to visualize relevance
            style: { stroke: '#beaca3', strokeWidth: 1 + mapping.relevanceWeight * 2, opacity: 0.3 + (mapping.relevanceWeight * 0.7), strokeDasharray: '5,5' },
        }));

        const dependencyEdges: Edge[] = [];
        const mappedSkillIds = new Set(safeMappedSkills.map(m => m.skillId));

        safeMappedSkills.forEach(skill => {
            if (skill.prerequisites) {
                skill.prerequisites.forEach(prereq => {
                    if (mappedSkillIds.has(prereq.prerequisiteSkillId)) {
                        dependencyEdges.push({
                            id: `dep-${prereq.prerequisiteSkillId}-${skill.skillId}`,
                            source: prereq.prerequisiteSkillId, target: skill.skillId,
                            type: 'default', animated: true,
                            style: { stroke: '#7289da', strokeWidth: 2, opacity: 0.8 },
                            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#7289da' },
                            label: 'Requires',
                            labelStyle: { fill: '#7289da', fontWeight: 700, fontSize: 10 },
                            labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
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
            const [subRes, skillsRes] = await Promise.all([subjectsApi.getAll(), adminManagementApi.getAllSkills()]);
            if (subRes.isSuccess && subRes.data) {
                const items = subRes.data.items;
                setSubjects(Array.isArray(items) ? items : []);
            }
            if (skillsRes.isSuccess && skillsRes.data) setAllSkills(Array.isArray(skillsRes.data?.skills) ? skillsRes.data.skills : []);
        } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Failed to load initial catalog."); }
        finally { setLoadingSubjects(false); }
    };

    const handleSelectSubject = async (subject: Subject) => {
        setSelectedSubject(subject);
        setLoadingMappings(true);
        try {
            const res = await adminManagementApi.getSubjectSkills(subject.id);
            setMappedSkills(res.isSuccess && res.data ? (Array.isArray(res.data) ? res.data : []) : []);
        } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Failed to load mappings."); setMappedSkills([]); }
        finally { setLoadingMappings(false); }
    };

    const handleAddMapping = async (skillId: string) => {
        if (!selectedSubject) return;
        try {
            // ⭐ Use the state relevance value
            await adminManagementApi.addSubjectSkill(selectedSubject.id, skillId, relevance);
            toast.success("Skill mapped");
            const res = await adminManagementApi.getSubjectSkills(selectedSubject.id);
            if (res.isSuccess) setMappedSkills(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Failed to map skill"); }
    };

    const handleRemoveMapping = async (skillId: string) => {
        if (!selectedSubject) return;
        try {
            await adminManagementApi.removeSubjectSkill(selectedSubject.id, skillId);
            toast.success("Skill unmapped");
            const res = await adminManagementApi.getSubjectSkills(selectedSubject.id);
            if (res.isSuccess) setMappedSkills(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) { toast.error(e?.normalized?.message || e?.message || "Failed to remove mapping"); }
    };

    const filteredSubjects = (Array.isArray(subjects) ? subjects : []).filter(s =>
        s.subjectName?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.subjectCode?.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    const availableSkills = (Array.isArray(allSkills) ? allSkills : []).filter(s =>
        !(Array.isArray(mappedSkills) ? mappedSkills : []).some(mapped => mapped.skillId === s.id) &&
        s.name?.toLowerCase().includes(skillSearch.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-[#f5c16c]" />
                        Subject Skill Mappings
                    </h1>
                    <p className="text-white/60 mt-1">
                        Visualize subject composition. Use the slider to set skill relevance before adding.
                    </p>
                </div>

                <div className="flex flex-1 gap-6 min-h-0">
                    {/* Left Column: Subjects List */}
                    <Card className="w-1/4 bg-[#1a1410] border-[#f5c16c]/30 flex flex-col min-h-0">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white">Subjects</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                                <Input placeholder="Search..." value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)} className="pl-8 border-[#f5c16c]/30 text-sm" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {loadingSubjects ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#f5c16c]" /></div>
                            ) : (
                                filteredSubjects.map(subject => (
                                    <button key={subject.id} onClick={() => handleSelectSubject(subject)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group
                                            ${selectedSubject?.id === subject.id
                                                ? "bg-[#f5c16c]/10 border-[#7289da]/30 text-white"
                                                : "bg-[#0a0506] border-transparent hover:bg-[#f5c16c]/20 text-white/70 hover:text-white"}`}>
                                        <div className="truncate">
                                            <span className="font-mono text-xs opacity-70 mr-2">{subject.subjectCode}</span>
                                            <span className="font-medium text-sm">{subject.subjectName}</span>
                                        </div>
                                        <LinkIcon className={`w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity ${selectedSubject?.id === subject.id ? 'opacity-100 text-[#f5c16c]' : ''}`} />
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Center: Graph Visualization */}
                    <Card className="flex-1 bg-[#1a1410] border-[#f5c16c]/30 flex flex-col min-h-0 relative overflow-hidden">
                        {selectedSubject ? (
                            <>
                                <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.2} maxZoom={2}>
                                    <Background color="#beaca3" gap={20} size={1} style={{ opacity: 0.1 }} />
                                    <Controls className="bg-[#1a1410] border-[#f5c16c]/30" />
                                </ReactFlow>
                                <div className="absolute bottom-4 left-4 bg-[#1a1410]/90 backdrop-blur border border-[#f5c16c]/30 p-3 rounded-lg text-xs space-y-2 shadow-sm">
                                    <div className="font-bold text-white mb-1">Legend</div>
                                    <div className="flex items-center gap-2 text-emerald-600"><Circle className="w-3 h-3" /> Foundation</div>
                                    <div className="flex items-center gap-2 text-[#f5c16c]"><Zap className="w-3 h-3" /> Intermediate</div>
                                    <div className="flex items-center gap-2 text-purple-600"><Crown className="w-3 h-3" /> Advanced</div>
                                    <div className="h-px bg-[#beaca3]/30 my-1" />
                                    <div className="flex items-center gap-2 text-white/70"><Scale className="w-3 h-3" /> Relevance Weight (0-1)</div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/40">
                                <div className="bg-[#beaca3]/20 p-6 rounded-full mb-4 border border-[#f5c16c]/30">
                                    <BookOpen className="w-12 h-12 text-[#beaca3]" />
                                </div>
                                <p>Select a subject to view its skill constellation.</p>
                            </div>
                        )}
                    </Card>

                    {/* Right Column: Available Skills */}
                    <Card className="w-1/4 bg-[#1a1410] border-[#f5c16c]/30 flex flex-col min-h-0">
                        <CardHeader className="pb-3 space-y-3">
                            <CardTitle className="text-sm font-bold text-[#f5c16c] uppercase tracking-wider flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Skills
                            </CardTitle>

                            {/* ⭐ NEW: Relevance Weight Slider */}
                            <div className="bg-[#0a0506]/60 rounded-lg p-3 border border-[#f5c16c]/10">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-[10px] text-white/60 uppercase tracking-widest">Relevance Weight</Label>
                                    <span className="text-xs font-bold text-[#f5c16c]">{relevance.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={relevance}
                                    onChange={(e) => setRelevance(parseFloat(e.target.value))}
                                    className="w-full accent-[#d23187] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-white/30 mt-1 px-1">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>

                            <Input placeholder="Filter skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} className="h-8 border-[#f5c16c]/30 text-xs" />
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-1">
                            {availableSkills.slice(0, 50).map(skill => (
                                <button key={skill.id} onClick={() => handleAddMapping(skill.id)} disabled={!selectedSubject}
                                    className="w-full flex items-center justify-between p-2 rounded border border-transparent hover:bg-[#f5c16c]/10 hover:border-[#7289da]/20 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div>
                                        <div className="text-sm text-white/70 group-hover:text-white">{skill.name}</div>
                                        <div className="text-[10px] text-white/40">Tier {skill.tier} • {skill.domain}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Preview of weight being added */}
                                        <span className="text-[10px] text-[#f5c16c] opacity-0 group-hover:opacity-100 transition-opacity">
                                            {relevance.toFixed(1)}
                                        </span>
                                        <Plus className="w-3 h-3 text-white/30 group-hover:text-[#f5c16c]" />
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}