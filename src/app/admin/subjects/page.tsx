// roguelearn-web/src/app/admin/subjects/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Pencil, Search, ChevronLeft, ChevronRight, BookOpen, FileText, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import subjectsApi from "@/api/subjectsApi";
import { Subject } from "@/types/subjects";
import { useSubjectImport } from "@/contexts/SubjectImportContext";

type SubjectFormData = {
    subjectCode: string;
    subjectName: string;
    credits: number;
    description: string;
};

const defaultFormData: SubjectFormData = {
    subjectCode: "",
    subjectName: "",
    credits: 3,
    description: ""
};

export default function SubjectsManagementPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Create/Edit dialog state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState<SubjectFormData>(defaultFormData);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Import state - Managed via context now
    const [rawText, setRawText] = useState("");
    const [importSemester, setImportSemester] = useState<string>("");

    // Access global import context
    const { startImport, isImporting } = useSubjectImport();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await subjectsApi.getAll(page, pageSize, debouncedSearch);
            if (res.isSuccess && res.data) {
                setSubjects(res.data.items || []);
                setTotalCount(res.data.totalCount || 0);
                setTotalPages(res.data.totalPages || 1);
            }
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to load subjects");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch]);

    useEffect(() => {
        loadData();

        // Listen for global completion event to refresh grid
        const onImportComplete = () => {
            loadData();
            // Switch tab to list automatically on success
            const tabTrigger = document.querySelector('[data-value="subjects"]') as HTMLElement;
            if (tabTrigger) tabTrigger.click();
        };
        window.addEventListener("subject-import-completed", onImportComplete);
        return () => window.removeEventListener("subject-import-completed", onImportComplete);
    }, [loadData]);

    const openCreateDialog = () => {
        setEditingSubject(null);
        setFormData(defaultFormData);
        setIsFormOpen(true);
    };

    const openEditDialog = (subject: Subject) => {
        setEditingSubject(subject);
        setFormData({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            credits: subject.credits,
            description: subject.description || ""
        });
        setIsFormOpen(true);
    };

    const handleSaveSubject = async () => {
        if (!formData.subjectCode || !formData.subjectName) {
            toast.error("Subject code and name are required");
            return;
        }
        setSaving(true);
        try {
            if (editingSubject) {
                await subjectsApi.update(editingSubject.id, formData);
                toast.success("Subject updated successfully");
            } else {
                await subjectsApi.create(formData);
                toast.success("Subject created successfully");
            }
            setIsFormOpen(false);
            setEditingSubject(null);
            setFormData(defaultFormData);
            loadData();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to save subject");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSubject = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await subjectsApi.remove(deleteTarget.id);
            toast.success("Subject deleted successfully");
            setDeleteTarget(null);
            loadData();
        } catch (e: any) {
            toast.error(e?.normalized?.message || e?.message || "Failed to delete subject");
        } finally {
            setDeleting(false);
        }
    };

    // --- Import Handler ---
    const handleStartImport = async () => {
        if (!rawText.trim() || !importSemester.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        const semesterValue = parseInt(importSemester, 10);

        // Trigger import via context
        const success = await startImport(rawText, semesterValue);

        if (success) {
            // Reset form fields immediately, progress handled globally
            setRawText("");
            setImportSemester("");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 relative">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Subjects Management</h1>
                        <p className="text-white/60">Manage academic subjects and import from syllabus</p>
                    </div>
                </div>

                <Tabs defaultValue="subjects" className="w-full">
                    <TabsList className="bg-[#0a0506] border border-[#f5c16c]/20">
                        <TabsTrigger value="subjects" className="data-[state=active]:bg-[#f5c16c] data-[state=active]:text-black">
                            <BookOpen className="w-4 h-4 mr-2" /> Subjects
                        </TabsTrigger>
                        <TabsTrigger value="import" className="data-[state=active]:bg-[#f5c16c] data-[state=active]:text-black">
                            <UploadCloud className="w-4 h-4 mr-2" /> Import from Syllabus
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="subjects" className="space-y-6 mt-6">
                        <div className="flex justify-end">
                            <Button onClick={openCreateDialog} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                                <Plus className="w-4 h-4 mr-2" /> Create Subject
                            </Button>
                        </div>

                        {/* Search and Stats */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <Input
                                    placeholder="Search by code or name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 border-[#f5c16c]/30 bg-[#0a0506]"
                                />
                            </div>
                            <div className="text-sm text-white/60">
                                Showing {subjects.length} of {totalCount} subjects
                            </div>
                        </div>

                        {/* Subjects Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-4" />
                                <p className="text-white/50">
                                    {searchQuery ? "No subjects match your search." : "No subjects found. Create your first subject to get started."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {subjects.map(subject => (
                                    <Card key={subject.id} className="bg-[#1a1410] border border-[#f5c16c]/30 shadow-sm hover:shadow-md transition-shadow group">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[#f5c16c] font-mono text-sm font-semibold">{subject.subjectCode}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#7289da]/20 text-[#7289da] border border-[#7289da]/30">
                                                    {subject.credits} credits
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">{subject.subjectName}</h3>
                                            <p className="text-xs text-white/50 line-clamp-2 mb-4">{subject.description || "No description"}</p>

                                            <div className="space-y-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full h-8 border-[#7289da]/30 text-white hover:bg-[#7289da]/10"
                                                >
                                                    <Link href={`/admin/content/subjects/${subject.id}/edit`}>
                                                        <FileText className="w-3 h-3 mr-1" /> Edit Syllabus
                                                    </Link>
                                                </Button>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(subject)}
                                                        className="flex-1 h-8 border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                                    >
                                                        <Pencil className="w-3 h-3 mr-1" /> Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDeleteTarget(subject)}
                                                        className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="border-[#f5c16c]/30 text-white/70 hover:text-white disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-white/60 mx-2">Page {page} of {totalPages}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="border-[#f5c16c]/30 text-white/70 hover:text-white disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Import Tab */}
                    <TabsContent value="import" className="space-y-6 mt-6">
                        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                            <CardContent className="space-y-4 pt-6">
                                <div>
                                    <Label htmlFor="rawText" className="text-sm text-white/70">Paste Raw Syllabus Content</Label>
                                    <Textarea
                                        id="rawText"
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Paste HTML or text..."
                                        className="min-h-[250px] bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="semester" className="text-sm text-white/70">Semester</Label>
                                    <Input
                                        id="semester"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={importSemester}
                                        onChange={(e) => setImportSemester(e.target.value)}
                                        placeholder="e.g., 1"
                                        className="w-32 bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
                                    />
                                </div>
                                <Button
                                    onClick={handleStartImport}
                                    disabled={isImporting}
                                    className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold"
                                >
                                    {isImporting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                                    ) : (
                                        <><UploadCloud className="mr-2 h-4 w-4" /> Start Import</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialogs */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                {editingSubject ? "Edit Subject" : "Create New Subject"}
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                {editingSubject ? "Update the subject details below." : "Fill in the details to create a new subject."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Subject Code *</Label>
                                    <Input
                                        value={formData.subjectCode}
                                        onChange={e => setFormData({ ...formData, subjectCode: e.target.value })}
                                        placeholder="e.g., SWE101"
                                        className="border-[#f5c16c]/30 bg-[#0a0506]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Credits *</Label>
                                    <Input
                                        type="number"
                                        value={formData.credits}
                                        onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                                        min={0}
                                        max={10}
                                        className="border-[#f5c16c]/30 bg-[#0a0506]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Subject Name *</Label>
                                <Input
                                    value={formData.subjectName}
                                    onChange={e => setFormData({ ...formData, subjectName: e.target.value })}
                                    placeholder="e.g., Introduction to Software Engineering"
                                    className="border-[#f5c16c]/30 bg-[#0a0506]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the subject..."
                                    className="border-[#f5c16c]/30 bg-[#0a0506] min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="border-[#f5c16c]/30 text-white/70 hover:text-white">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveSubject} disabled={saving} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Delete Subject</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Are you sure you want to delete <span className="text-[#f5c16c] font-semibold">{deleteTarget?.subjectCode} - {deleteTarget?.subjectName}</span>?
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#f5c16c]/30 text-white/70 hover:text-white">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteSubject}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}