// roguelearn-web/src/app/admin/programs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, BookOpen, ScrollText } from "lucide-react";
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

    // Selection for Structure Logic
    const [selectedProgram, setSelectedProgram] = useState<CurriculumProgramDto | null>(null);
    const [programSubjects, setProgramSubjects] = useState<Subject[]>([]); // Note: The API might return Subject[] or a specific join DTO. Assuming Subject[] for now based on context.
    const [structLoading, setStructLoading] = useState(false);

    // Add Subject State
    const [addSubjectId, setAddSubjectId] = useState("");

    // Create Program State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProgram, setNewProgram] = useState({
        programName: "",
        programCode: "",
        degreeLevel: "Bachelor" as const, // Default
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
            if (pRes.isSuccess && pRes.data) setPrograms(pRes.data);
            if (sRes.isSuccess && sRes.data) setSubjects(sRes.data);
        } catch {
            toast.error("Failed to load initial data");
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
            // Reset
            setNewProgram({ programName: "", programCode: "", degreeLevel: "Bachelor", totalCredits: 120, durationYears: 4 });
            loadData();
        } catch {
            toast.error("Failed to create program");
        }
    };

    const openStructure = async (prog: CurriculumProgramDto) => {
        setSelectedProgram(prog);
        setStructLoading(true);
        try {
            // Note: curriculumProgramsApi.getDetails returns detailed info including analysis, 
            // but we might need a specific endpoint to get JUST the list of subjects efficiently or parse it from details.
            // Assuming getDetails returns an object where we can find subjects. 
            // However, typically 'getDetails' is for analysis. 
            // If adminManagementApi has a 'getProgramSubjects' it would be here.
            // Since it wasn't explicitly in the controller snippet provided (only Add/Remove), 
            // we might need to rely on 'getDetails' or assume we fetch 'curriculum_program_subjects' via an expansion.
            // For this implementation, I will use `curriculumProgramsApi.getDetails` and hope it includes the subject list or update `adminManagementApi` if a list endpoint exists.
            // Update: The Controller snippet does NOT have a GET. This implies we use the general Program Details endpoint.

            const res = await curriculumProgramsApi.getDetails(prog.id);
            if (res.isSuccess && res.data) {
                // We need the actual subject list here. If the DTO doesn't have it, we might need to fetch all subjects and filter?
                // Or the `curriculumVersions` in `getDetails` contains it. 
                // Given the new architecture "Simple Program Structure", likely we should have a list.
                // I will assume we might need to fetch it or it's missing from the DTO provided in types earlier.
                // Let's assume for now we can't easily get the list without a specific endpoint or expanding `getDetails`.
                // Placeholder logic:
                setProgramSubjects([]); // TODO: Bind to actual data source when available
                toast.info("Subject list fetching logic requires backend update or specific DTO mapping.");
            }
        } catch {
            toast.error("Failed to load program structure");
        } finally {
            setStructLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!selectedProgram || !addSubjectId) return;
        try {
            await adminManagementApi.addSubjectToProgram(selectedProgram.id, addSubjectId);
            toast.success("Subject added to program");
            openStructure(selectedProgram); // reload
        } catch {
            toast.error("Failed to add subject");
        }
    };

    const handleRemoveSubject = async (subjectId: string) => {
        if (!selectedProgram) return;
        try {
            await adminManagementApi.removeSubjectFromProgram(selectedProgram.id, subjectId);
            toast.success("Subject removed");
            openStructure(selectedProgram);
        } catch {
            toast.error("Failed to remove");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-100">Academic Programs</h1>
                        <p className="text-amber-700">Manage degrees and their constituent subjects.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Create Program
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1410] border-amber-900/30 text-amber-100">
                            <DialogHeader><DialogTitle>New Program</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div><Label>Name</Label><Input value={newProgram.programName} onChange={e => setNewProgram({ ...newProgram, programName: e.target.value })} className="bg-black/40 border-amber-900/30" /></div>
                                <div><Label>Code</Label><Input value={newProgram.programCode} onChange={e => setNewProgram({ ...newProgram, programCode: e.target.value })} className="bg-black/40 border-amber-900/30" /></div>
                                <div>
                                    <Label>Degree</Label>
                                    <Select value={newProgram.degreeLevel} onValueChange={v => setNewProgram({ ...newProgram, degreeLevel: v as any })}>
                                        <SelectTrigger className="bg-black/40 border-amber-900/30"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#1a1410] border-amber-900/30">
                                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                                            <SelectItem value="Master">Master</SelectItem>
                                            <SelectItem value="Associate">Associate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter><Button onClick={handleCreateProgram} className="bg-amber-600">Create</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? <Loader2 className="animate-spin text-amber-500" /> : programs.map(prog => (
                        <Card key={prog.id} className="bg-black/40 border-amber-900/20 hover:border-amber-700/50 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg text-amber-100">{prog.programCode}</CardTitle>
                                    <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400">
                                        {prog.degreeLevel}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 mb-1 font-semibold">{prog.programName}</p>
                                <p className="text-xs text-gray-500 mb-4">{prog.description || "No description"}</p>
                                <Button
                                    variant="outline"
                                    className="w-full border-amber-600/30 text-amber-500 hover:bg-amber-900/20"
                                    onClick={() => openStructure(prog)}
                                >
                                    <ScrollText className="w-4 h-4 mr-2" /> Manage Structure
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Structure Manager Dialog */}
                <Dialog open={!!selectedProgram} onOpenChange={(o) => !o && setSelectedProgram(null)}>
                    <DialogContent className="bg-[#1a1410] border-amber-900/30 text-amber-100 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Program Structure: <span className="text-amber-500">{selectedProgram?.programName}</span></DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-amber-900/20 pb-4 mb-4">
                            <div className="flex-1">
                                <Label>Add Subject</Label>
                                <Select onValueChange={setAddSubjectId}>
                                    <SelectTrigger className="bg-black/40 border-amber-900/30"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                                    <SelectContent className="bg-[#1a1410] border-amber-900/30">
                                        {subjects.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddSubject} className="bg-amber-600"><Plus className="w-4 h-4" /></Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {structLoading ? <Loader2 className="animate-spin mx-auto" /> : programSubjects.length === 0 ? (
                                <p className="text-center text-gray-600 italic py-8">No subjects in this program yet (or list unavailable).</p>
                            ) : (
                                programSubjects.map(sub => (
                                    <div key={sub.id} className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-amber-500 font-mono text-xs">{sub.subjectCode}</span>
                                            <span className="text-sm text-white/90">{sub.subjectName}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:bg-red-950/20" onClick={() => handleRemoveSubject(sub.id)}>
                                            <Trash2 className="w-3 h-3" />
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