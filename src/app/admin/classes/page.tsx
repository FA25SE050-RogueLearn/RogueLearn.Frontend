"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BookOpen, Trash2 } from "lucide-react";
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
    const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);
    const [specSubjects, setSpecSubjects] = useState<SpecializationSubjectEntry[]>([]);
    const [specLoading, setSpecLoading] = useState(false);
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
            if (cRes.isSuccess && cRes.data) {
                const classData = cRes.data;
                setClassList(Array.isArray(classData) ? classData : []);
            }
            if (sRes.isSuccess && sRes.data) {
                const subjectData = sRes.data;
                setSubjects(Array.isArray(subjectData) ? subjectData : []);
            }
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
                setSpecSubjects(Array.isArray(res.data) ? res.data : []);
            } else {
                setSpecSubjects([]);
            }
        } catch {
            toast.error("Failed to load specialization subjects");
            setSpecSubjects([]);
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
            openSpecialization(selectedClass);
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
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-[#2c2f33]">Classes Management</h1>
                    <p className="text-[#2c2f33]/60">Manage career classes and their curriculum paths</p>
                </div>

                {/* Classes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#7289da]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Array.isArray(classList) ? classList : []).map(cls => (
                            <Card key={cls.id} className="bg-white border border-[#beaca3]/30 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-semibold text-[#2c2f33]">{cls.name}</CardTitle>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cls.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#beaca3]/20 text-[#2c2f33]/50 border border-[#beaca3]/30'}`}>
                                            {cls.isActive ? 'Active' : 'Archived'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[#2c2f33]/60 mb-4">{cls.difficultyLevel}</p>
                                    <Button
                                        variant="outline"
                                        className="w-full border-[#7289da]/30 text-[#7289da] hover:bg-[#7289da]/10"
                                        onClick={() => openSpecialization(cls)}
                                    >
                                        <BookOpen className="w-4 h-4 mr-2" /> Manage Curriculum
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Specialization Manager Dialog */}
                <Dialog open={!!selectedClass} onOpenChange={(o) => !o && setSelectedClass(null)}>
                    <DialogContent className="bg-white border-[#beaca3]/30 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#2c2f33]">
                                Curriculum: <span className="text-[#7289da]">{selectedClass?.name}</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-[#beaca3]/20 pb-4 mb-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-[#2c2f33]/70">Add Subject</Label>
                                <Select onValueChange={setAddSpecId}>
                                    <SelectTrigger className="border-[#beaca3]/30"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                                    <SelectContent>
                                        {(Array.isArray(subjects) ? subjects : []).map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32 space-y-2">
                                <Label className="text-[#2c2f33]/70">Semester</Label>
                                <Input type="number" value={addSemester} onChange={e => setAddSemester(parseInt(e.target.value))} className="border-[#beaca3]/30" />
                            </div>
                            <Button onClick={handleAddSpec} className="bg-[#7289da] hover:bg-[#7289da]/90 text-white">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {specLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-[#7289da]" />
                                </div>
                            ) : (Array.isArray(specSubjects) ? specSubjects : []).length === 0 ? (
                                <p className="text-center text-[#2c2f33]/40 py-8">No subjects assigned to this class yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[1fr_100px_48px] items-center px-3 text-xs font-medium text-[#2c2f33]/50 uppercase tracking-wider">
                                        <div>Subject</div>
                                        <div className="text-right">Semester</div>
                                        <div className="text-right">Action</div>
                                    </div>
                                    {(Array.isArray(specSubjects) ? specSubjects : [])
                                        .slice()
                                        .sort((a, b) => ((a.semester ?? 0) - (b.semester ?? 0)) || ((a.subjectCode ?? '').localeCompare(b.subjectCode ?? '')))
                                        .map(sub => (
                                            <div key={sub.id} className="grid grid-cols-[1fr_100px_48px] items-center bg-[#f4f6f8] p-3 rounded-lg border border-[#beaca3]/20">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[#7289da] font-mono text-xs">{sub.subjectCode ?? 'N/A'}</span>
                                                    {sub.subjectName && <span className="text-sm text-[#2c2f33]">{sub.subjectName}</span>}
                                                </div>
                                                <div className="text-sm text-[#2c2f33]/70 text-right">{sub.semester}</div>
                                                <div className="flex justify-end">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-[#e07a5f] hover:bg-[#e07a5f]/10" onClick={() => handleRemoveSpec(sub.subjectId)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
