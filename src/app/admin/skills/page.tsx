"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Link as LinkIcon, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import adminManagementApi from "@/api/adminManagementApi";
import { Skill } from "@/types/skills";
import { SkillDependencyDto } from "@/types/skill-dependencies";

export default function SkillsManagementPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: "", domain: "", tier: 1, description: "" });
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
            const res = await adminManagementApi.getAllSkills();
            if (res.isSuccess && res.data) {
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
            openDependencyManager(selectedSkill);
        } catch {
            toast.error("Failed to link dependency");
        }
    };

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

    const filteredSkills = (Array.isArray(skills) ? skills : []).filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

    const handleDeleteSkill = async (skillId: string, skillName: string) => {
        if (!confirm(`Are you sure you want to delete "${skillName}"? This action cannot be undone.`)) return;
        try {
            await adminManagementApi.deleteSkill(skillId);
            toast.success("Skill deleted successfully");
            loadSkills();
        } catch {
            toast.error("Failed to delete skill");
        }
    };

    const getTierBadge = (tier: number) => {
        const styles = {
            1: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            2: "bg-[#f5c16c]/20 text-[#f5c16c] border-[#f5c16c]/30",
            3: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        };
        const labels = { 1: "Foundation", 2: "Intermediate", 3: "Advanced" };
        return { style: styles[tier as keyof typeof styles] || styles[1], label: labels[tier as keyof typeof labels] || "Foundation" };
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Skills Management</h1>
                        <p className="text-white/50">Manage learning skills and their prerequisites</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">
                                <Plus className="w-4 h-4 mr-2" /> Create Skill
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a0b08] border-[#f5c16c]/20">
                            <DialogHeader>
                                <DialogTitle className="text-white">Create New Skill</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Name</Label>
                                    <Input value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="Enter skill name" className="border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Domain</Label>
                                    <Input value={newSkill.domain} onChange={e => setNewSkill({ ...newSkill, domain: e.target.value })} placeholder="e.g., Programming, Database" className="border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Tier</Label>
                                    <Select value={newSkill.tier.toString()} onValueChange={v => setNewSkill({ ...newSkill, tier: parseInt(v) })}>
                                        <SelectTrigger className="border-[#f5c16c]/20 bg-black/30 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#1a0b08] border-[#f5c16c]/20">
                                            <SelectItem value="1">1 - Foundation</SelectItem>
                                            <SelectItem value="2">2 - Intermediate</SelectItem>
                                            <SelectItem value="3">3 - Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Description</Label>
                                    <Input value={newSkill.description} onChange={e => setNewSkill({ ...newSkill, description: e.target.value })} placeholder="Brief description" className="border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-[#f5c16c]/20 text-white hover:bg-[#f5c16c]/10">Cancel</Button>
                                <Button onClick={handleCreateSkill} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input 
                        placeholder="Search skills..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="pl-10 border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40"
                    />
                </div>

                {/* Skills Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSkills.map(skill => {
                            const tier = getTierBadge(skill.tier);
                            return (
                                <Card key={skill.id} className="bg-[#1a0b08]/80 border border-[#f5c16c]/20 hover:border-[#f5c16c]/40 transition-all">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-base font-semibold text-white">{skill.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-white/50">{skill.domain}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${tier.style}`}>{tier.label}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="sm" variant="ghost" className="text-white/40 hover:text-[#f5c16c] hover:bg-[#f5c16c]/10" onClick={() => openDependencyManager(skill)}>
                                                    <LinkIcon className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-white/40 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteSkill(skill.id, skill.name)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-white/60 line-clamp-2">{skill.description || "No description"}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Dependency Manager Dialog */}
                <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
                    <DialogContent className="bg-[#1a0b08] border-[#f5c16c]/20 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Manage Dependencies: <span className="text-[#f5c16c]">{selectedSkill?.name}</span>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 min-h-[300px]">
                            <div className="border-r border-[#f5c16c]/10 pr-4">
                                <h4 className="text-sm font-semibold mb-3 text-white/70">Current Prerequisites</h4>
                                {depLoading ? (
                                    <Loader2 className="animate-spin text-[#f5c16c]" />
                                ) : (
                                    <div className="space-y-2">
                                        {(Array.isArray(dependencies) ? dependencies : []).map(dep => (
                                            <div key={dep.prerequisiteSkillId} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-[#f5c16c]/20">
                                                <span className="text-sm text-white">{(Array.isArray(skills) ? skills : []).find(s => s.id === dep.prerequisiteSkillId)?.name || "Unknown Skill"}</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => removeDependency(dep.prerequisiteSkillId)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(Array.isArray(dependencies) ? dependencies : []).length === 0 && (
                                            <p className="text-sm text-white/40">No prerequisites defined</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-3 text-white/70">Add Prerequisite</h4>
                                <Input
                                    placeholder="Search skills..."
                                    value={prereqSearch}
                                    onChange={e => setPrereqSearch(e.target.value)}
                                    className="mb-3 h-9 border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40"
                                />
                                <div className="space-y-1 max-h-[250px] overflow-y-auto">
                                    {(Array.isArray(skills) ? skills : [])
                                        .filter(s => s.id !== selectedSkill?.id && s.name?.toLowerCase().includes(prereqSearch.toLowerCase()) && !(Array.isArray(dependencies) ? dependencies : []).some(d => d.prerequisiteSkillId === s.id))
                                        .slice(0, 10)
                                        .map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => addDependency(s.id)}
                                                className="w-full text-left text-sm p-2.5 hover:bg-[#f5c16c]/10 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-[#f5c16c]" />
                                                <span className="text-white">{s.name}</span>
                                                <span className="text-white/40 text-xs">({s.domain})</span>
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
