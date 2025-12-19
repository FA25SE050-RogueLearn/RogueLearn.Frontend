// roguelearn-web/src/app/admin/skills/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Link as LinkIcon, Trash2, Search, Pencil } from "lucide-react";
import { toast } from "sonner";
import adminManagementApi from "@/api/adminManagementApi";
import { Skill } from "@/types/skills";
import { SkillDependencyDto } from "@/types/skill-dependencies";

export default function SkillsManagementPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create/Edit Dialog State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [formData, setFormData] = useState({ name: "", domain: "", tier: 1, description: "" });
    const [submitting, setSubmitting] = useState(false);

    // Delete Dialog State
    const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Dependency Manager State
    const [selectedSkillForDeps, setSelectedSkillForDeps] = useState<Skill | null>(null);
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
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load skills");
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingSkill(null);
        setFormData({ name: "", domain: "", tier: 1, description: "" });
        setIsFormOpen(true);
    };

    const openEditDialog = (skill: Skill) => {
        setEditingSkill(skill);
        setFormData({
            name: skill.name,
            domain: skill.domain || "",
            tier: skill.tier,
            description: skill.description || ""
        });
        setIsFormOpen(true);
    };

    const handleSaveSkill = async () => {
        if (!formData.name) return;
        setSubmitting(true);
        try {
            if (editingSkill) {
                await adminManagementApi.updateSkill(editingSkill.id, formData);
                toast.success("Skill updated successfully");
            } else {
                await adminManagementApi.createSkill(formData);
                toast.success("Skill created successfully");
            }
            setIsFormOpen(false);
            setEditingSkill(null);
            setFormData({ name: "", domain: "", tier: 1, description: "" });
            loadSkills();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to save skill");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSkill = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminManagementApi.deleteSkill(deleteTarget.id);
            toast.success("Skill deleted successfully");
            setDeleteTarget(null);
            loadSkills();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to delete skill");
        } finally {
            setDeleting(false);
        }
    };

    const openDependencyManager = async (skill: Skill) => {
        setSelectedSkillForDeps(skill);
        setDepLoading(true);
        try {
            const res = await adminManagementApi.getSkillDependencies(skill.id);
            if (res.isSuccess && res.data) {
                setDependencies(res.data.dependencies || []);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Could not load dependencies");
        } finally {
            setDepLoading(false);
        }
    };

    const addDependency = async (prereqId: string) => {
        if (!selectedSkillForDeps) return;
        try {
            await adminManagementApi.addDependency({
                skillId: selectedSkillForDeps.id,
                prerequisiteSkillId: prereqId,
                relationshipType: "Prerequisite"
            });
            toast.success("Dependency linked");
            openDependencyManager(selectedSkillForDeps);
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to link dependency");
        }
    };

    const removeDependency = async (prereqId: string) => {
        if (!selectedSkillForDeps) return;
        try {
            await adminManagementApi.removeDependency(selectedSkillForDeps.id, prereqId);
            toast.success("Dependency removed");
            openDependencyManager(selectedSkillForDeps);
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to remove dependency");
        }
    }

    const filteredSkills = (Array.isArray(skills) ? skills : []).filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

    const getTierBadge = (tier: number) => {
        const styles = {
            1: "bg-emerald-50 text-emerald-700 border-emerald-200",
            2: "bg-[#f5c16c]/10 text-[#f5c16c] border-[#7289da]/30",
            3: "bg-purple-50 text-purple-700 border-purple-200",
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
                        <p className="text-white/60">Manage learning skills and their prerequisites</p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Create Skill
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                        placeholder="Search skills..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 border-[#f5c16c]/30"
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
                                <Card key={skill.id} className="bg-[#1a1410] border border-[#f5c16c]/30 shadow-sm hover:shadow-md transition-shadow group">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-base font-semibold text-white">{skill.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-white/50">{skill.domain}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${tier.style}`}>{tier.label}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-white/40 hover:text-[#f5c16c] hover:bg-[#f5c16c]/10" onClick={() => openDependencyManager(skill)} title="Manage Dependencies">
                                                <LinkIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-white/60 line-clamp-2 min-h-[2.5em]">{skill.description || "No description"}</p>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                                onClick={() => openEditDialog(skill)}
                                            >
                                                <Pencil className="w-3 h-3 mr-2" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                onClick={() => setDeleteTarget(skill)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Create/Edit Skill Dialog */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                {editingSkill ? "Edit Skill" : "Create New Skill"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-white/70">Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter skill name"
                                    className="border-[#f5c16c]/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Domain</Label>
                                <Input
                                    value={formData.domain}
                                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                    placeholder="e.g., Programming, Database"
                                    className="border-[#f5c16c]/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Tier</Label>
                                <Select value={formData.tier.toString()} onValueChange={v => setFormData({ ...formData, tier: parseInt(v) })}>
                                    <SelectTrigger className="border-[#f5c16c]/30"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-[#1a1410] border-[#f5c16c]/30">
                                        <SelectItem value="1">1 - Foundation</SelectItem>
                                        <SelectItem value="2">2 - Intermediate</SelectItem>
                                        <SelectItem value="3">3 - Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Description</Label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description"
                                    className="border-[#f5c16c]/30"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="border-[#f5c16c]/30">Cancel</Button>
                            <Button onClick={handleSaveSkill} disabled={submitting} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {editingSkill ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Delete Skill</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Are you sure you want to delete <span className="text-[#f5c16c] font-semibold">{deleteTarget?.name}</span>?
                                This action cannot be undone and may affect associated quests.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#f5c16c]/30 text-white/70 hover:text-white">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteSkill}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dependency Manager Dialog */}
                <Dialog open={!!selectedSkillForDeps} onOpenChange={(open) => !open && setSelectedSkillForDeps(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Manage Dependencies: <span className="text-[#f5c16c]">{selectedSkillForDeps?.name}</span>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 min-h-[300px]">
                            <div className="border-r border-[#f5c16c]/30 pr-4">
                                <h4 className="text-sm font-semibold mb-3 text-white/70">Current Prerequisites</h4>
                                {depLoading ? (
                                    <Loader2 className="animate-spin text-[#f5c16c]" />
                                ) : (
                                    <div className="space-y-2">
                                        {(Array.isArray(dependencies) ? dependencies : []).map(dep => (
                                            <div key={dep.prerequisiteSkillId} className="flex justify-between items-center bg-[#0a0506] p-2.5 rounded-lg border border-[#f5c16c]/20">
                                                <span className="text-sm text-white">{(Array.isArray(skills) ? skills : []).find(s => s.id === dep.prerequisiteSkillId)?.name || "Unknown Skill"}</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-[#e07a5f] hover:bg-[#e07a5f]/10" onClick={() => removeDependency(dep.prerequisiteSkillId)}>
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
                                    className="mb-3 h-9 border-[#f5c16c]/30"
                                />
                                <div className="space-y-1 max-h-[250px] overflow-y-auto">
                                    {(Array.isArray(skills) ? skills : [])
                                        .filter(s => s.id !== selectedSkillForDeps?.id && s.name?.toLowerCase().includes(prereqSearch.toLowerCase()) && !(Array.isArray(dependencies) ? dependencies : []).some(d => d.prerequisiteSkillId === s.id))
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