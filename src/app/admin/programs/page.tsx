// src/app/admin/programs/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader2, Plus, Trash2, ScrollText, Pencil, MoreVertical, UploadCloud, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import curriculumProgramsApi from "@/api/curriculumProgramsApi";
import curriculumImportApi from "@/api/curriculumImportApi";
import subjectsApi from "@/api/subjectsApi";
import adminManagementApi from "@/api/adminManagementApi";
import { CurriculumProgramDto, DegreeLevel } from "@/types/curriculum-programs";
import { Subject } from "@/types/subjects";
import { createClient } from "@/utils/supabase/client";

type ProgramFormData = {
    programName: string;
    programCode: string;
    description: string;
    degreeLevel: DegreeLevel;
    totalCredits: number;
    durationYears: number;
};

const defaultFormData: ProgramFormData = {
    programName: "",
    programCode: "",
    description: "",
    degreeLevel: "Bachelor",
    totalCredits: 120,
    durationYears: 4
};

export default function ProgramsManagementPage() {
    const [programs, setPrograms] = useState<CurriculumProgramDto[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Structure dialog state
    const [selectedProgram, setSelectedProgram] = useState<CurriculumProgramDto | null>(null);
    const [programSubjects, setProgramSubjects] = useState<Subject[]>([]);
    const [structLoading, setStructLoading] = useState(false);
    const [addSubjectId, setAddSubjectId] = useState("");

    // Create/Edit dialog state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<CurriculumProgramDto | null>(null);
    const [formData, setFormData] = useState<ProgramFormData>(defaultFormData);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<CurriculumProgramDto | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Import state
    const [rawText, setRawText] = useState("");
    const [importSemester, setImportSemester] = useState<string>("");
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

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
                setPrograms(Array.isArray(pRes.data) ? pRes.data : []);
            }
            if (sRes.isSuccess && sRes.data) {
                setSubjects(Array.isArray(sRes.data.items) ? sRes.data.items : []);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingProgram(null);
        setFormData(defaultFormData);
        setIsFormOpen(true);
    };

    const openEditDialog = (prog: CurriculumProgramDto) => {
        setEditingProgram(prog);
        setFormData({
            programName: prog.programName,
            programCode: prog.programCode,
            description: prog.description || "",
            degreeLevel: prog.degreeLevel,
            totalCredits: prog.totalCredits || 120,
            durationYears: prog.durationYears || 4
        });
        setIsFormOpen(true);
    };

    const handleSaveProgram = async () => {
        if (!formData.programName || !formData.programCode) {
            toast.error("Program name and code are required");
            return;
        }
        setSaving(true);
        try {
            if (editingProgram) {
                await curriculumProgramsApi.update(editingProgram.id, formData);
                toast.success("Program updated successfully");
            } else {
                await curriculumProgramsApi.create(formData);
                toast.success("Program created successfully");
            }
            setIsFormOpen(false);
            setEditingProgram(null);
            setFormData(defaultFormData);
            loadData();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to save program");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await curriculumProgramsApi.remove(deleteTarget.id);
            toast.success("Program deleted successfully");
            setDeleteTarget(null);
            loadData();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to delete program");
        } finally {
            setDeleting(false);
        }
    };

    const handleImportCurriculum = async () => {
        setImportStatus("Importing curriculum... This may take a moment.");
        setImportError(null);
        try {
            await curriculumImportApi.importCurriculum({ rawText });
            setImportStatus("Import successful! Refreshing catalog...");
            setRawText("");
            setImportSemester("");
            toast.success("Curriculum imported successfully");
            setTimeout(() => {
                loadData();
                setImportStatus(null);
            }, 2000);
        } catch (error: any) {
            setImportStatus(null);
            setImportError(`Import failed: ${error.response?.data?.message || error?.normalized?.message || 'An unexpected error occurred.'}`);
        }
    };

    const handleImportSubject = async () => {
        setImportStatus("Importing subject... This may take a moment.");
        setImportError(null);
        try {
            const semesterValue = importSemester.trim() ? parseInt(importSemester, 10) : undefined;
            await curriculumImportApi.importSubjectFromText({
                rawText,
                semester: semesterValue
            });
            setImportStatus("Import successful! Refreshing catalog...");
            setRawText("");
            setImportSemester("");
            toast.success("Subject imported successfully");
            setTimeout(() => {
                loadData();
                setImportStatus(null);
            }, 2000);
        } catch (error: any) {
            setImportStatus(null);
            setImportError(`Import failed: ${error.response?.data?.message || error?.normalized?.message || 'An unexpected error occurred.'}`);
        }
    };

    const openStructure = async (prog: CurriculumProgramDto) => {
        setSelectedProgram(prog);
        setStructLoading(true);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("Not authenticated");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/programs/${prog.id}/subjects`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProgramSubjects(Array.isArray(data) ? data : []);
            } else {
                console.warn("Failed to fetch subjects");
                setProgramSubjects([]);
            }
        } catch (e: any) {
            console.error("Error loading program structure:", e);
            toast.error("Failed to load program structure");
            setProgramSubjects([]);
        } finally {
            setStructLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!selectedProgram || !addSubjectId) return;
        try {
            await adminManagementApi.addSubjectToProgram(selectedProgram.id, addSubjectId);
            toast.success("Subject added to program");
            setAddSubjectId("");
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
            Bachelor: "bg-[#f5c16c]/10 text-[#f5c16c] border-[#f5c16c]/30",
            Master: "bg-purple-500/10 text-purple-400 border-purple-500/30",
            Associate: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            Doctorate: "bg-rose-500/10 text-rose-400 border-rose-500/30",
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
                        <p className="text-white/60">Manage academic programs, subjects, and import curriculum data</p>
                    </div>
                </div>

                <Tabs defaultValue="programs" className="w-full">
                    <TabsList className="bg-[#1a1410] border border-[#f5c16c]/20">
                        <TabsTrigger value="programs" className="data-[state=active]:bg-[#f5c16c] data-[state=active]:text-black">
                            <ScrollText className="w-4 h-4 mr-2" /> Programs
                        </TabsTrigger>
                        <TabsTrigger value="import" className="data-[state=active]:bg-[#f5c16c] data-[state=active]:text-black">
                            <UploadCloud className="w-4 h-4 mr-2" /> Import Curriculum
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="programs" className="space-y-6 mt-6">
                        {/* Create Button */}
                        <div className="flex justify-end">
                            <Button onClick={openCreateDialog} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                                <Plus className="w-4 h-4 mr-2" /> Create Program
                            </Button>
                        </div>

                        {/* Programs Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                            </div>
                        ) : programs.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/50">No programs found. Create your first program to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {programs.map(prog => (
                                    <Card key={prog.id} className="bg-[#1a1410] border border-[#f5c16c]/30 shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base font-semibold text-white">{prog.programCode}</CardTitle>
                                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${getDegreeBadge(prog.degreeLevel)}`}>
                                                        {prog.degreeLevel}
                                                    </span>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-[#1a1410] border-[#f5c16c]/30">
                                                        <DropdownMenuItem onClick={() => openEditDialog(prog)} className="text-white hover:bg-[#f5c16c]/10 cursor-pointer">
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeleteTarget(prog)} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium text-white mb-1">{prog.programName}</p>
                                            <p className="text-sm text-white/60 mb-2 line-clamp-2">{prog.description || "No description"}</p>
                                            <div className="flex gap-4 text-xs text-white/50 mb-4">
                                                <span>{prog.totalCredits || 0} credits</span>
                                                <span>{prog.durationYears || 0} years</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full border-[#7289da]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                                                onClick={() => openStructure(prog)}
                                            >
                                                <ScrollText className="w-4 h-4 mr-2" /> Manage Subjects
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="import" className="space-y-6 mt-6">
                        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                            <CardHeader className="border-b border-[#f5c16c]/10">
                                <CardTitle className="text-white">Import Curriculum Data</CardTitle>
                                <p className="text-sm text-white/60">Import curriculum programs or individual subjects from raw HTML/text</p>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <Label htmlFor="rawText" className="text-sm text-white/70">Paste Raw Text Content</Label>
                                    <Textarea
                                        id="rawText"
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Paste the raw HTML or text from FLM or a single subject document here..."
                                        className="mt-2 h-40 bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
                                    />
                                </div>
                                <div className="flex gap-4 items-end">
                                    <div className="w-32">
                                        <Label htmlFor="semester" className="text-sm text-white/70">Semester (Optional)</Label>
                                        <Input
                                            id="semester"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={importSemester}
                                            onChange={(e) => setImportSemester(e.target.value)}
                                            placeholder="e.g., 1"
                                            className="mt-2 bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
                                        />
                                    </div>
                                    <p className="text-xs text-white/50 pb-2">Only used when importing a single subject</p>
                                </div>
                                {importStatus && (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle className="w-4 h-4" />
                                        <p>{importStatus}</p>
                                    </div>
                                )}
                                {importError && (
                                    <div className="flex items-center gap-2 text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <p>{importError}</p>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleImportCurriculum}
                                        disabled={!rawText || !!importStatus}
                                        className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold"
                                    >
                                        <UploadCloud className="mr-2 h-4 w-4" /> Import Full Curriculum
                                    </Button>
                                    <Button
                                        onClick={handleImportSubject}
                                        disabled={!rawText || !!importStatus}
                                        variant="outline"
                                        className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                    >
                                        <UploadCloud className="mr-2 h-4 w-4" /> Import Single Subject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                            <CardHeader className="border-b border-[#f5c16c]/10 flex flex-row items-center justify-between">
                                <CardTitle className="text-white">Existing Programs</CardTitle>
                                <Button onClick={loadData} size="sm" variant="outline" className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6">
                                {loading ? (
                                    <p className="text-center text-white/40">Loading catalog...</p>
                                ) : programs.length > 0 ? (
                                    programs.map((prog) => (
                                        <div key={prog.id} className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-white">{prog.programCode} - {prog.programName}</h3>
                                                <p className="text-xs text-white/50">{prog.degreeLevel} • {prog.totalCredits || 0} credits</p>
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-white/40">No curriculum programs have been imported yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create/Edit Dialog */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                {editingProgram ? "Edit Program" : "Create New Program"}
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                {editingProgram ? "Update the program details below." : "Fill in the details to create a new academic program."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Program Code *</Label>
                                    <Input
                                        value={formData.programCode}
                                        onChange={e => setFormData({ ...formData, programCode: e.target.value })}
                                        placeholder="e.g., SE, IS"
                                        className="border-[#f5c16c]/30 bg-[#0a0506]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Degree Level *</Label>
                                    <Select value={formData.degreeLevel} onValueChange={v => setFormData({ ...formData, degreeLevel: v as DegreeLevel })}>
                                        <SelectTrigger className="border-[#f5c16c]/30 bg-[#0a0506]"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#1a1410] border-[#f5c16c]/30">
                                            <SelectItem value="Associate">Associate</SelectItem>
                                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                                            <SelectItem value="Master">Master</SelectItem>
                                            <SelectItem value="Doctorate">Doctorate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Program Name *</Label>
                                <Input
                                    value={formData.programName}
                                    onChange={e => setFormData({ ...formData, programName: e.target.value })}
                                    placeholder="e.g., Software Engineering"
                                    className="border-[#f5c16c]/30 bg-[#0a0506]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the program..."
                                    className="border-[#f5c16c]/30 bg-[#0a0506] min-h-[80px] resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Total Credits</Label>
                                    <Input
                                        type="number"
                                        value={formData.totalCredits}
                                        onChange={e => setFormData({ ...formData, totalCredits: parseInt(e.target.value) || 0 })}
                                        className="border-[#f5c16c]/30 bg-[#0a0506]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Duration (Years)</Label>
                                    <Input
                                        type="number"
                                        value={formData.durationYears}
                                        onChange={e => setFormData({ ...formData, durationYears: parseInt(e.target.value) || 0 })}
                                        className="border-[#f5c16c]/30 bg-[#0a0506]"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="border-[#f5c16c]/30 text-white/70 hover:text-white">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveProgram} disabled={saving} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : (editingProgram ? "Update" : "Create")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Delete Program</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Are you sure you want to delete <span className="text-[#f5c16c] font-semibold">{deleteTarget?.programName}</span>?
                                This action cannot be undone and will remove all associated subject mappings.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#f5c16c]/30 text-white/70 hover:text-white">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteProgram}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Structure Manager Dialog */}
                <Dialog open={!!selectedProgram} onOpenChange={(open: boolean) => !open && setSelectedProgram(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Program Subjects: <span className="text-[#f5c16c]">{selectedProgram?.programName}</span>
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                Manage subjects for this program. Add or remove subjects as needed.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-[#f5c16c]/20 pb-4 mb-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-white/70">Add Subject</Label>
                                <Select value={addSubjectId} onValueChange={setAddSubjectId}>
                                    <SelectTrigger className="border-[#f5c16c]/30 bg-[#0a0506]"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                                    <SelectContent className="max-h-[300px] overflow-y-auto bg-[#1a1410] border-[#f5c16c]/30">
                                        {subjects.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddSubject} disabled={!addSubjectId} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {structLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-[#f5c16c]" />
                                </div>
                            ) : programSubjects.length === 0 ? (
                                <p className="text-center text-white/40 py-8">No subjects in this program yet.</p>
                            ) : (
                                programSubjects.map(sub => (
                                    <div key={sub.id} className="flex justify-between items-center bg-[#0a0506] p-3 rounded-lg border border-[#f5c16c]/20">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[#f5c16c] font-mono text-xs">{sub.subjectCode}</span>
                                            <span className="text-sm text-white">{sub.subjectName}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => handleRemoveSubject(sub.id)}>
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
