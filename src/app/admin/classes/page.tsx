// roguelearn-web/src/app/admin/classes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, GraduationCap, BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import classesApi from "@/api/classesApi";
import subjectsApi from "@/api/subjectsApi";
import adminManagementApi from "@/api/adminManagementApi";
import { ClassEntity } from "@/types/classes";
import { Subject } from "@/types/subjects";
import { SpecializationSubjectEntry } from "@/types/admin-management";

export default function ClassesManagementPage() {
    const [classList, setClassList] = useState<ClassEntity[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection for Specialization Logic
    const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);
    const [specSubjects, setSpecSubjects] = useState<SpecializationSubjectEntry[]>([]);
    const [specLoading, setSpecLoading] = useState(false);

    // Add Spec State
    const [addSpecId, setAddSpecId] = useState("");
    const [addSemester, setAddSemester] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cRes, sRes] = await Promise.all([
                classesApi.getAll(),
                subjectsApi.getAll()
            ]);
            if (cRes.isSuccess && cRes.data) setClassList(cRes.data);
            if (sRes.isSuccess && sRes.data) setSubjects(sRes.data);
        } catch {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const openSpecialization = async (cls: ClassEntity) => {
        setSelectedClass(cls);
        setSpecLoading(true);
        try {
            const res = await adminManagementApi.getClassSpecialization(cls.id);
            if (res.isSuccess && res.data) {
                setSpecSubjects(res.data);
            }
        } catch {
            toast.error("Failed to load specialization subjects");
        } finally {
            setSpecLoading(false);
        }
    };

    const handleAddSpec = async () => {
        if (!selectedClass || !addSpecId) return;
        try {
            await adminManagementApi.addClassSpecialization({
                classId: selectedClass.id,
                subjectId: addSpecId,
                semester: addSemester,
                isRequired: true
            });
            toast.success("Subject added to curriculum");
            openSpecialization(selectedClass); // reload
        } catch {
            toast.error("Failed to add subject");
        }
    };

    const handleRemoveSpec = async (subjectId: string) => {
        if (!selectedClass) return;
        try {
            await adminManagementApi.removeClassSpecialization(selectedClass.id, subjectId);
            toast.success("Subject removed");
            openSpecialization(selectedClass);
        } catch {
            toast.error("Failed to remove");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-100">Career Classes</h1>
                        <p className="text-amber-700">Manage job roles and their required curriculum path.</p>
                    </div>
                    {/* (Create Class Button would go here - simplified for this example) */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? <Loader2 className="animate-spin text-amber-500" /> : classList.map(cls => (
                        <Card key={cls.id} className="bg-black/40 border-amber-900/20 hover:border-amber-700/50 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg text-amber-100">{cls.name}</CardTitle>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${cls.isActive ? 'border-emerald-500/30 text-emerald-400' : 'border-gray-500/30 text-gray-500'}`}>
                                        {cls.isActive ? 'Active' : 'Archived'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-gray-500 mb-4">{cls.difficultyLevel}</p>
                                <Button
                                    variant="outline"
                                    className="w-full border-amber-600/30 text-amber-500 hover:bg-amber-900/20"
                                    onClick={() => openSpecialization(cls)}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" /> Manage Curriculum
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Specialization Manager Sheet/Dialog */}
                <Dialog open={!!selectedClass} onOpenChange={(o) => !o && setSelectedClass(null)}>
                    <DialogContent className="bg-[#1a1410] border-amber-900/30 text-amber-100 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Curriculum: <span className="text-amber-500">{selectedClass?.name}</span></DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-amber-900/20 pb-4 mb-4">
                            <div className="flex-1">
                                <Label>Add Subject</Label>
                                <Select onValueChange={setAddSpecId}>
                                    <SelectTrigger className="bg-black/40 border-amber-900/30"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32">
                                <Label>Semester</Label>
                                <Input type="number" value={addSemester} onChange={e => setAddSemester(parseInt(e.target.value))} className="bg-black/40 border-amber-900/30" />
                            </div>
                            <Button onClick={handleAddSpec} className="bg-amber-600"><Plus className="w-4 h-4" /></Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {specLoading ? <Loader2 className="animate-spin mx-auto" /> : specSubjects.length === 0 ? (
                                <p className="text-center text-gray-600 italic py-8">No subjects assigned to this class yet.</p>
                            ) : (
                                // Group by semester for better view
                                Array.from(new Set(specSubjects.map(s => s.semester))).sort().map(sem => (
                                    <div key={sem} className="mb-4">
                                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Semester {sem}</h4>
                                        <div className="space-y-1">
                                            {specSubjects.filter(s => s.semester === sem).map(sub => (
                                                <div key={sub.id} className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-amber-500 font-mono text-xs">{sub.subjectCode}</span>
                                                        <span className="text-sm text-white/90">{sub.subjectName}</span>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:bg-red-950/20" onClick={() => handleRemoveSpec(sub.subjectId)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
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