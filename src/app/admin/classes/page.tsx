"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BookOpen, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import classesApi from "@/api/classesApi";
import subjectsApi from "@/api/subjectsApi";
import adminManagementApi from "@/api/adminManagementApi";
import { ClassEntity } from "@/types/classes";
import { Subject } from "@/types/subjects";
import { SpecializationSubjectEntry } from "@/types/admin-management";
import debounce from "lodash/debounce";

export default function ClassesManagementPage() {
    const [classList, setClassList] = useState<ClassEntity[]>([]);
    // This state now holds the results of the dropdown search
    const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);
    const [specSubjects, setSpecSubjects] = useState<SpecializationSubjectEntry[]>([]);
    const [specLoading, setSpecLoading] = useState(false);
    const [addSpecId, setAddSpecId] = useState("");
    const [addSemester, setAddSemester] = useState(1);

    // Search state for the dropdown
    const [subjectSearch, setSubjectSearch] = useState("");
    const [searchingSubjects, setSearchingSubjects] = useState(false);

    // Cache map for resolving IDs in the list view
    const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const cRes = await classesApi.getAll();
            if (cRes.isSuccess && cRes.data) {
                setClassList(Array.isArray(cRes.data) ? cRes.data : []);
            }
            // Load initial subject options (no search term)
            fetchSubjects("");
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (search: string) => {
        setSearchingSubjects(true);
        try {
            const res = await subjectsApi.getAll(1, 20, search);
            if (res.isSuccess && res.data) {
                const items = res.data.items || [];
                setSubjectOptions(items);

                // Update our cache map with any new subjects found in search results
                setSubjectMap(prev => {
                    const next = { ...prev };
                    items.forEach(s => next[s.id] = s);
                    return next;
                });
            }
        } catch (error) {
            console.error("Failed to search subjects", error);
        } finally {
            setSearchingSubjects(false);
        }
    };

    // Debounce the search call
    const debouncedFetchSubjects = useCallback(
        debounce((query: string) => fetchSubjects(query), 300),
        []
    );

    const handleSubjectSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSubjectSearch(query);
        debouncedFetchSubjects(query);
    };

    // Effect to fetch missing subjects whenever specSubjects changes
    useEffect(() => {
        const fetchMissingSubjects = async () => {
            if (specSubjects.length === 0) return;

            const missingIds = specSubjects
                .map(s => s.subjectId)
                .filter(id => !subjectMap[id]);

            if (missingIds.length === 0) return;

            // Deduplicate IDs
            const uniqueIds = Array.from(new Set(missingIds));

            // Create a temporary map to accumulate results
            const newSubjects: Record<string, Subject> = {};

            await Promise.all(uniqueIds.map(async (id) => {
                try {
                    const res = await subjectsApi.getById(id);
                    if (res.isSuccess && res.data) {
                        newSubjects[id] = res.data;
                    }
                } catch (err) {
                    console.error(`Failed to resolve subject ${id}`, err);
                }
            }));

            if (Object.keys(newSubjects).length > 0) {
                setSubjectMap(prev => ({ ...prev, ...newSubjects }));
            }
        };

        fetchMissingSubjects();
    }, [specSubjects, subjectMap]); // Run when list changes or map changes (to stop once resolved)

    const openSpecialization = async (cls: ClassEntity) => {
        setSelectedClass(cls);
        setSpecLoading(true);
        setAddSpecId(""); // Reset selection

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
            // Refresh the list
            const res = await adminManagementApi.getClassSpecialization(selectedClass.id);
            if (res.isSuccess && res.data) {
                setSpecSubjects(Array.isArray(res.data) ? res.data : []);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to add subject");
        }
    };

    const handleRemoveSpec = async (subjectId: string) => {
        if (!selectedClass) return;
        try {
            await adminManagementApi.removeClassSpecialization(selectedClass.id, subjectId);
            toast.success("Subject removed");
            // Refresh list
            const res = await adminManagementApi.getClassSpecialization(selectedClass.id);
            if (res.isSuccess && res.data) {
                setSpecSubjects(Array.isArray(res.data) ? res.data : []);
            }
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
                                <div className="space-y-2">
                                    {/* Search Input for filtering subjects */}
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                                        <Input
                                            placeholder="Search subjects..."
                                            value={subjectSearch}
                                            onChange={handleSubjectSearchChange}
                                            className="pl-8 border-[#f5c16c]/30 bg-[#0a0506] text-sm"
                                        />
                                        {searchingSubjects && (
                                            <div className="absolute right-2 top-2.5">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#f5c16c]" />
                                            </div>
                                        )}
                                    </div>

                                    <Select value={addSpecId} onValueChange={setAddSpecId}>
                                        <SelectTrigger className="border-[#f5c16c]/30 bg-[#0a0506]">
                                            <SelectValue placeholder="Select from results..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto bg-[#1a1410] border-[#f5c16c]/30">
                                            {subjectOptions.length === 0 ? (
                                                <div className="p-2 text-sm text-white/50 text-center">No subjects found</div>
                                            ) : (
                                                subjectOptions.map(s => (
                                                    <SelectItem key={s.id} value={s.id} className="focus:bg-[#f5c16c]/20 focus:text-[#f5c16c]">
                                                        {/* FIX: Ensure subject code color contrasts well or changes on hover/focus */}
                                                        <span className="font-mono font-bold mr-2 text-[#f5c16c] group-focus:text-inherit group-hover:text-inherit">
                                                            {s.subjectCode}
                                                        </span>
                                                        <span>{s.subjectName}</span>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="w-32 space-y-2">
                                <Label className="text-white/70">Semester</Label>
                                <Input
                                    type="number"
                                    value={addSemester}
                                    onChange={e => setAddSemester(parseInt(e.target.value))}
                                    className="border-[#f5c16c]/30 bg-[#0a0506]"
                                    min={1}
                                    max={10}
                                />
                            </div>
                            <Button onClick={handleAddSpec} disabled={!addSpecId} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-white">
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
                                            // Resolve subject details from our cache
                                            const resolvedSubject = subjectMap[sub.subjectId];
                                            const code = sub.subjectCode || resolvedSubject?.subjectCode || 'Loading...';
                                            const name = sub.subjectName || resolvedSubject?.subjectName || '';

                                            return (
                                                <div key={sub.id} className="grid grid-cols-[1fr_100px_48px] items-center bg-[#0a0506] p-3 rounded-lg border border-[#f5c16c]/20">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="text-[#f5c16c] font-mono text-xs font-bold shrink-0">{code}</span>
                                                        <span className="text-sm text-white truncate" title={name}>{name}</span>
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