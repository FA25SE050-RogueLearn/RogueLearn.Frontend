"use client";

import { useState, useEffect, useMemo } from "react";
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

    // Cache map for subject details to avoid repeated lookups or missing data
    const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch classes
            const cRes = await classesApi.getAll();
            if (cRes.isSuccess && cRes.data) {
                const classData = cRes.data;
                setClassList(Array.isArray(classData) ? classData : []);
            }

            // Fetch initial batch of subjects (page 1, large size to get most)
            // Note: In a real app with thousands of subjects, you'd want a search-based selector
            const sRes = await subjectsApi.getAll(1, 100);
            if (sRes.isSuccess && sRes.data) {
                const subjectData = sRes.data.items;
                setSubjects(Array.isArray(subjectData) ? subjectData : []);

                // Build initial map
                const map: Record<string, Subject> = {};
                if (Array.isArray(subjectData)) {
                    subjectData.forEach(s => map[s.id] = s);
                }
                setSubjectMap(prev => ({ ...prev, ...map }));
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load initial data");
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
                const entries = Array.isArray(res.data) ? res.data : [];
                setSpecSubjects(entries);

                // Identify missing subjects in our map
                const missingIds = entries
                    .map(e => e.subjectId)
                    .filter(id => !subjectMap[id]);

                // Fetch missing subjects individually if needed
                if (missingIds.length > 0) {
                    const uniqueMissingIds = Array.from(new Set(missingIds));
                    const newSubjects: Record<string, Subject> = {};

                    await Promise.all(uniqueMissingIds.map(async (id) => {
                        try {
                            const subRes = await subjectsApi.getById(id);
                            if (subRes.isSuccess && subRes.data) {
                                newSubjects[id] = subRes.data;
                            }
                        } catch (err) {
                            console.error(`Failed to load subject ${id}`, err);
                        }
                    }));

                    setSubjectMap(prev => ({ ...prev, ...newSubjects }));
                }
            } else {
                setSpecSubjects([]);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load specialization subjects");
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
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to add subject");
        }
    };

    const handleRemoveSpec = async (subjectId: string) => {
        if (!selectedClass) return;
        try {
            await adminManagementApi.removeClassSpecialization(selectedClass.id, subjectId);
            toast.success("Subject removed");
            openSpecialization(selectedClass);
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to remove");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Classes Management</h1>
                    <p className="text-white/60">Manage career classes and their curriculum paths</p>
                </div>

                {/* Classes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Array.isArray(classList) ? classList : []).map(cls => (
                            <Card key={cls.id} className="bg-[#1a1410] border border-[#f5c16c]/30 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-semibold text-white">{cls.name}</CardTitle>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cls.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#beaca3]/20 text-white/50 border border-[#f5c16c]/30'}`}>
                                            {cls.isActive ? 'Active' : 'Archived'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-white/60 mb-4">{cls.difficultyLevel}</p>
                                    <Button
                                        variant="outline"
                                        className="w-full border-[#7289da]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
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
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Curriculum: <span className="text-[#f5c16c]">{selectedClass?.name}</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-[#f5c16c]/20 pb-4 mb-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-white/70">Add Subject</Label>
                                <Select onValueChange={setAddSpecId}>
                                    <SelectTrigger className="border-[#f5c16c]/30"><SelectValue placeholder="Select Subject..." /></SelectTrigger>
                                    <SelectContent className="max-h-[300px] overflow-y-auto">
                                        {(Array.isArray(subjects) ? subjects : []).map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32 space-y-2">
                                <Label className="text-white/70">Semester</Label>
                                <Input type="number" value={addSemester} onChange={e => setAddSemester(parseInt(e.target.value))} className="border-[#f5c16c]/30" />
                            </div>
                            <Button onClick={handleAddSpec} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {specLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-[#f5c16c]" />
                                </div>
                            ) : (Array.isArray(specSubjects) ? specSubjects : []).length === 0 ? (
                                <p className="text-center text-white/40 py-8">No subjects assigned to this class yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[1fr_100px_48px] items-center px-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <div>Subject</div>
                                        <div className="text-right">Semester</div>
                                        <div className="text-right">Action</div>
                                    </div>
                                    {(Array.isArray(specSubjects) ? specSubjects : [])
                                        .slice()
                                        .sort((a, b) => ((a.semester ?? 0) - (b.semester ?? 0)))
                                        .map(sub => {
                                            // Try to find the subject in our cache map using the subjectId
                                            const resolvedSubject = subjectMap[sub.subjectId];

                                            // Fallback logic: check DTO fields -> check map -> default
                                            const code = sub.subjectCode || resolvedSubject?.subjectCode|| 'N/A';
                                            const name = sub.subjectName || resolvedSubject?.subjectName || 'Unknown Subject';

                                            return (
                                                <div key={sub.id} className="grid grid-cols-[1fr_100px_48px] items-center bg-[#0a0506] p-3 rounded-lg border border-[#f5c16c]/20">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[#f5c16c] font-mono text-xs">{code}</span>
                                                        <span className="text-sm text-white">{name}</span>
                                                    </div>
                                                    <div className="text-sm text-white/70 text-right">{sub.semester}</div>
                                                    <div className="flex justify-end">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-[#e07a5f] hover:bg-[#e07a5f]/10" onClick={() => handleRemoveSpec(sub.subjectId)}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}