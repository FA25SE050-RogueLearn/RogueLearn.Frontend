// roguelearn-web/src/app/admin/skills/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Link as LinkIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import adminManagementApi from "@/api/adminManagementApi"; // Use Admin API for all mutations
import { Skill } from "@/types/skills";
import { SkillDependencyDto } from "@/types/skill-dependencies";

export default function SkillsManagementPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create/Edit State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: "", domain: "", tier: 1, description: "" });

    // Dependency Management State
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [dependencies, setDependencies] = useState<SkillDependencyDto[]>([]);
    const [depLoading, setDepLoading] = useState(false);
    const [prereqSearch, setPrereqSearch] = useState("");

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        setLoading(true);
        try {
            // Use Admin API to get flat list
            const res = await adminManagementApi.getAllSkills();
            if (res.isSuccess && res.data) {
                // Ensure data.skills exists, otherwise fallback to empty array
                setSkills(res.data.skills || []);
            }
        } catch (e) {
            toast.error("Failed to load skills");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSkill = async () => {
        if (!newSkill.name) return;
        try {
            // Use Admin API to create
            await adminManagementApi.createSkill(newSkill);
            toast.success("Skill created");
            setIsCreateOpen(false);
            setNewSkill({ name: "", domain: "", tier: 1, description: "" });
            loadSkills();
        } catch (e) {
            toast.error("Failed to create skill");
        }
    };

    const openDependencyManager = async (skill: Skill) => {
        setSelectedSkill(skill);
        setDepLoading(true);
        try {
            // Use Admin API to get dependencies
            const res = await adminManagementApi.getSkillDependencies(skill.id);
            if (res.isSuccess && res.data) {
                setDependencies(res.data.dependencies || []);
            }
        } catch {
            toast.error("Could not load dependencies");
        } finally {
            setDepLoading(false);
        }
    };

    const addDependency = async (prereqId: string) => {
        if (!selectedSkill) return;
        try {
            await adminManagementApi.addDependency({
                skillId: selectedSkill.id,
                prerequisiteSkillId: prereqId,
                relationshipType: "Prerequisite"
            });
            toast.success("Dependency linked");
            openDependencyManager(selectedSkill); // Reload
        } catch {
            toast.error("Failed to link dependency");
        }
    };

    // Safely remove dependency needs the exact API call
    const removeDependency = async (prereqId: string) => {
        if (!selectedSkill) return;
        try {
            await adminManagementApi.removeDependency(selectedSkill.id, prereqId);
            toast.success("Dependency removed");
            openDependencyManager(selectedSkill);
        } catch {
            toast.error("Failed to remove dependency");
        }
    }

    const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-100">Skill Constellation</h1>
                        <p className="text-amber-700">Manage atomic learning units and their prerequisites.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Create Skill
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1410] border-amber-900/30 text-amber-100">
                            <DialogHeader><DialogTitle>Forge New Skill</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div><Label>Name</Label><Input value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} className="bg-black/40 border-amber-900/30" /></div>
                                <div><Label>Domain</Label><Input value={newSkill.domain} onChange={e => setNewSkill({ ...newSkill, domain: e.target.value })} className="bg-black/40 border-amber-900/30" /></div>
                                <div>
                                    <Label>Tier (1-3)</Label>
                                    <Select value={newSkill.tier.toString()} onValueChange={v => setNewSkill({ ...newSkill, tier: parseInt(v) })}>
                                        <SelectTrigger className="bg-black/40 border-amber-900/30"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#1a1410] border-amber-900/30">
                                            <SelectItem value="1">1 - Foundation</SelectItem>
                                            <SelectItem value="2">2 - Intermediate</SelectItem>
                                            <SelectItem value="3">3 - Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Description</Label><Input value={newSkill.description} onChange={e => setNewSkill({ ...newSkill, description: e.target.value })} className="bg-black/40 border-amber-900/30" /></div>
                            </div>
                            <DialogFooter><Button onClick={handleCreateSkill} className="bg-amber-600">Create</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex gap-4 mb-4">
                    <Input placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md bg-black/20 border-amber-900/30 text-amber-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? <Loader2 className="animate-spin text-amber-500" /> : filteredSkills.map(skill => (
                        <Card key={skill.id} className="bg-black/40 border-amber-900/20 hover:border-amber-700/50 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base text-amber-100">{skill.name}</CardTitle>
                                        <span className="text-xs text-amber-600 font-mono uppercase">{skill.domain} • Tier {skill.tier}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-amber-500 hover:bg-amber-900/20" onClick={() => openDependencyManager(skill)}>
                                        <LinkIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Dependency Manager Dialog */}
                <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
                    <DialogContent className="bg-[#1a1410] border-amber-900/30 text-amber-100 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Manage Dependencies: <span className="text-amber-500">{selectedSkill?.name}</span></DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 min-h-[300px]">
                            <div className="border-r border-amber-900/30 pr-4">
                                <h4 className="text-sm font-bold mb-2 text-amber-600">Current Prerequisites</h4>
                                {depLoading ? <Loader2 className="animate-spin" /> : (
                                    <div className="space-y-2">
                                        {dependencies.map(dep => (
                                            <div key={dep.prerequisiteSkillId} className="flex justify-between items-center bg-black/30 p-2 rounded border border-amber-900/10">
                                                <span className="text-sm">{skills.find(s => s.id === dep.prerequisiteSkillId)?.name || "Unknown Skill"}</span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:bg-red-950/30" onClick={() => removeDependency(dep.prerequisiteSkillId)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {dependencies.length === 0 && <p className="text-xs text-gray-600">No prerequisites.</p>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold mb-2 text-amber-600">Add Prerequisite</h4>
                                <Input
                                    placeholder="Search to add..."
                                    value={prereqSearch}
                                    onChange={e => setPrereqSearch(e.target.value)}
                                    className="bg-black/40 border-amber-900/30 mb-2 h-8 text-sm"
                                />
                                <div className="space-y-1 max-h-[250px] overflow-y-auto">
                                    {skills
                                        .filter(s => s.id !== selectedSkill?.id && s.name.toLowerCase().includes(prereqSearch.toLowerCase()) && !dependencies.some(d => d.prerequisiteSkillId === s.id))
                                        .slice(0, 10)
                                        .map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => addDependency(s.id)}
                                                className="w-full text-left text-xs p-2 hover:bg-amber-900/20 rounded flex items-center gap-2"
                                            >
                                                <Plus className="w-3 h-3 text-amber-500" />
                                                {s.name} <span className="text-gray-600 text-[10px]">({s.domain})</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}