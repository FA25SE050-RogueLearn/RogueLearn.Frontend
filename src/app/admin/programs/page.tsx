"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import curriculumProgramsApi from "@/api/curriculumProgramsApi";
import subjectsApi from "@/api/subjectsApi";
import adminManagementApi from "@/api/adminManagementApi";
import { CurriculumProgramDto } from "@/types/curriculum-programs";
import { Subject } from "@/types/subjects";

export default function ProgramsManagementPage() {
    const [programs, setPrograms] = useState<CurriculumProgramDto[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<CurriculumProgramDto | null>(null);
    const [programSubjects, setProgramSubjects] = useState<Subject[]>([]);
    const [structLoading, setStructLoading] = useState(false);
    const [addSubjectId, setAddSubjectId] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProgram, setNewProgram] = useState({
        programName: "",
        programCode: "",
        degreeLevel: "Bachelor" as const,
        totalCredits: 120,
        durationYears: 4
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([
                curriculumProgramsApi.getAll(),
                subjectsApi.getAll()
            ]);
            if (pRes.isSuccess && pRes.data) {
                const programData = pRes.data;
                setPrograms(Array.isArray(programData) ? programData : []);
            }
            if (sRes.isSuccess && sRes.data) {
                const subjectData = sRes.data.items;
                setSubjects(Array.isArray(subjectData) ? subjectData : []);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProgram = async () => {
        if (!newProgram.programName || !newProgram.programCode) return;
        try {
            await curriculumProgramsApi.create(newProgram);
            toast.success("Program created");
            setIsCreateOpen(false);
            setNewProgram({ programName: "", programCode: "", degreeLevel: "Bachelor", totalCredits: 120, durationYears: 4 });
            loadData();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to create program");
        }
    };

    const openStructure = async (prog: CurriculumProgramDto) => {
        setSelectedProgram(prog);
        setStructLoading(true);
        try {
            const res = await curriculumProgramsApi.getDetails(prog.id);
            if (res.isSuccess && res.data) {
                // Subjects are nested inside curriculumVersions
                const activeVersion = (res.data as any).curriculumVersions?.find((v: any) => v.isActive) 
                    || (res.data as any).curriculumVersions?.[0];
                const versionSubjects = activeVersion?.subjects || [];
                const subjectList = versionSubjects.map((ps: any) => ({
                    id: ps.subjectId,
                    subjectCode: ps.subjectCode || '',
                    subjectName: ps.subjectName || '',
                    credits: ps.credits || 0,
                    description: ps.description || '',
                    semesterNumber: ps.termNumber,
                } as Subject));
                setProgramSubjects(subjectList);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load program structure");
        } finally {
            setStructLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!selectedProgram || !addSubjectId) return;
        try {
            await adminManagementApi.addSubjectToProgram(selectedProgram.id, addSubjectId);
            toast.success("Subject added to program");
            openStructure(selectedProgram);
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to add subject");
        }
    };

    const handleRemoveSubject = async (subjectId: string) => {
        if (!selectedProgram) return;
        try {
            await adminManagementApi.removeSubjectFromProgram(selectedProgram.id, subjectId);
            toast.success("Subject removed");
            openStructure(selectedProgram);
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to remove");
        }
    };

    const getDegreeBadge = (level: string) => {
        const styles: Record<string, string> = {
            Bachelor: "bg-[#f5c16c]/10 text-[#f5c16c] border-[#7289da]/30",
            Master: "bg-purple-50 text-purple-700 border-purple-200",
            Associate: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
        return styles[level] || styles.Bachelor;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Programs Management</h1>
                        <p className="text-white/60">Manage academic programs and their subjects</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Create Program
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30">
                            <DialogHeader>
                                <DialogTitle className="text-white">Create New Program</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Program Name</Label>
                                    <Input value={newProgram.programName} onChange={e => setNewProgram({ ...newProgram, programName: e.target.value })} placeholder="Enter program name" className="border-[#f5c16c]/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Program Code</Label>
                                    <Input value={newProgram.programCode} onChange={e => setNewProgram({ ...newProgram, programCode: e.target.value })} placeholder="e.g., SE, IS" className="border-[#f5c16c]/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Degree Level</Label>
                                    <Select value={newProgram.degreeLevel} onValueChange={v => setNewProgram({ ...newProgram, degreeLevel: v as any })}>
                                        <SelectTrigger className="border-[#f5c16c]/30"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                                            <SelectItem value="Master">Master</SelectItem>
                                            <SelectItem value="Associate">Associate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-[#f5c16c]/30">Cancel</Button>
                                <Button onClick={handleCreateProgram} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Programs Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Array.isArray(programs) ? programs : []).map(prog => (
                            <Card key={prog.id} className="bg-[#1a1410] border border-[#f5c16c]/30 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-semibold text-white">{prog.programCode}</CardTitle>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getDegreeBadge(prog.degreeLevel)}`}>
                                            {prog.degreeLevel}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium text-white mb-1">{prog.programName}</p>
                                    <p className="text-sm text-white/60 mb-4">{prog.description || "No description"}</p>
                                    <Button
                                        variant="outline"
                                        className="w-full border-[#7289da]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                                        onClick={() => openStructure(prog)}
                                    >
                                        <ScrollText className="w-4 h-4 mr-2" /> Manage Structure
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Structure Manager Dialog */}
                <Dialog open={!!selectedProgram} onOpenChange={(o) => !o && setSelectedProgram(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Program Structure: <span className="text-[#f5c16c]">{selectedProgram?.programName}</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-[#f5c16c]/20 pb-4 mb-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-white/70">Add Subject</Label>
                                <Select onValueChange={setAddSubjectId}>
                                    <SelectTrigger className="border-[#f5c16c]/30"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                                    <SelectContent>
                                        {(Array.isArray(subjects) ? subjects : []).map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddSubject} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {structLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-[#f5c16c]" />
                                </div>
                            ) : (Array.isArray(programSubjects) ? programSubjects : []).length === 0 ? (
                                <p className="text-center text-white/40 py-8">No subjects in this program yet (or list unavailable).</p>
                            ) : (
                                (Array.isArray(programSubjects) ? programSubjects : []).map(sub => (
                                    <div key={sub.id} className="flex justify-between items-center bg-[#0a0506] p-3 rounded-lg border border-[#f5c16c]/20">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[#f5c16c] font-mono text-xs">{sub.subjectCode}</span>
                                            <span className="text-sm text-white">{sub.subjectName}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-[#e07a5f] hover:bg-[#e07a5f]/10" onClick={() => handleRemoveSubject(sub.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
