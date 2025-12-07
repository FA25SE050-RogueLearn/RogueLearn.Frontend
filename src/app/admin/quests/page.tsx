"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    Loader2, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    RefreshCw, 
    Eye,
    Trash2,
    CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import questApi, { AdminQuestListItem } from "@/api/questApi";
import { QuestGenerationModal } from "@/components/quests/QuestGenerationModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminQuestsPage() {
    const router = useRouter();
    const [quests, setQuests] = useState<AdminQuestListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Generation modal state
    const [generatingQuestId, setGeneratingQuestId] = useState<string | null>(null);
    const [generatingQuestTitle, setGeneratingQuestTitle] = useState("");
    const [generationJobId, setGenerationJobId] = useState<string | null>(null);
    const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<AdminQuestListItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadQuests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await questApi.adminListQuests({
                page,
                pageSize,
                search: debouncedSearch || undefined
            });
            if (res.isSuccess && res.data) {
                setQuests(res.data.items);
                setTotalPages(res.data.totalPages);
                setTotalCount(res.data.totalCount);
            } else {
                toast.error(res.message || "Failed to load quests");
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to load quests");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedSearch]);

    useEffect(() => {
        loadQuests();
    }, [loadQuests]);

    const handleGenerateSteps = async (quest: AdminQuestListItem) => {
        setGeneratingQuestId(quest.id);
        setGeneratingQuestTitle(quest.title);
        
        try {
            const res = await questApi.adminGenerateQuestSteps(quest.id);
            if (res.isSuccess && res.data?.jobId) {
                setGenerationJobId(res.data.jobId);
                setIsGenerationModalOpen(true);
                toast.success("Quest generation started!");
            } else {
                toast.error(res.message || "Failed to start generation");
                setGeneratingQuestId(null);
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to start generation");
            setGeneratingQuestId(null);
        }
    };

    const handleRegenerateSteps = async (quest: AdminQuestListItem) => {
        if (!confirm(`Are you sure you want to regenerate steps for "${quest.title}"? This will delete existing steps.`)) {
            return;
        }

        setGeneratingQuestId(quest.id);
        setGeneratingQuestTitle(quest.title);
        
        try {
            const res = await questApi.adminRegenerateQuestSteps(quest.id);
            if (res.isSuccess && res.data?.jobId) {
                setGenerationJobId(res.data.jobId);
                setIsGenerationModalOpen(true);
                toast.success("Quest regeneration started!");
            } else {
                toast.error(res.message || "Failed to start regeneration");
                setGeneratingQuestId(null);
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to start regeneration");
            setGeneratingQuestId(null);
        }
    };

    const handleDeleteSteps = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        
        try {
            const res = await questApi.adminDeleteQuestSteps(deleteTarget.id);
            if (res.isSuccess) {
                toast.success("Quest steps deleted successfully");
                setDeleteTarget(null);
                loadQuests();
            } else {
                toast.error(res.message || "Failed to delete steps");
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to delete steps");
        } finally {
            setDeleting(false);
        }
    };

    const handleGenerationComplete = () => {
        const questId = generatingQuestId;
        setIsGenerationModalOpen(false);
        setGeneratingQuestId(null);
        setGenerationJobId(null);
        
        // Navigate to the quest detail page
        if (questId) {
            router.push(`/admin/quests/${questId}`);
        } else {
            loadQuests();
        }
    };

    const handleGenerationClose = () => {
        setIsGenerationModalOpen(false);
        setGeneratingQuestId(null);
        setGenerationJobId(null);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Quest Management</h1>
                    <p className="text-white/60">Manage quests and generate learning content</p>
                </div>

                {/* Search and Stats */}
                <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <Input
                                    placeholder="Search by quest or subject name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 border-[#f5c16c]/30 bg-[#0a0506] text-white"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-white/60">
                                    {totalCount} quests total
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={loadQuests}
                                    className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quests Table */}
                <Card className="bg-[#1a1410] border-[#f5c16c]/20">
                    <CardHeader className="border-b border-[#f5c16c]/10">
                        <CardTitle className="text-white">All Quests</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                            </div>
                        ) : quests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/50">
                                    {search ? "No quests match your search." : "No quests found."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#f5c16c]/10">
                                            <TableHead className="text-white/60">Subject</TableHead>
                                            <TableHead className="text-white/60">Quest Title</TableHead>
                                            <TableHead className="text-white/60 text-center">Steps</TableHead>
                                            <TableHead className="text-white/60 text-center">Status</TableHead>
                                            <TableHead className="text-white/60 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quests.map((quest) => (
                                            <TableRow key={quest.id} className="border-[#f5c16c]/10 hover:bg-[#f5c16c]/5">
                                                <TableCell>
                                                    <div>
                                                        <span className="font-mono text-[#f5c16c] text-sm">{quest.subjectCode}</span>
                                                        <p className="text-white/70 text-sm truncate max-w-[200px]">{quest.subjectName}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-white">{quest.title}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-white/70">{quest.stepsCount}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {quest.stepsGenerated ? (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Generated
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-white/10 text-white/50 border-white/20">
                                                            <Sparkles className="w-3 h-3 mr-1" /> Not Generated
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-[#7289da]/30 text-white hover:bg-[#7289da]/10"
                                                        >
                                                            <Link href={`/admin/quests/${quest.id}`}>
                                                                <Eye className="w-3 h-3 mr-1" /> View
                                                            </Link>
                                                        </Button>
                                                        
                                                        {quest.stepsGenerated ? (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRegenerateSteps(quest)}
                                                                    disabled={generatingQuestId === quest.id}
                                                                    className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                                                >
                                                                    {generatingQuestId === quest.id ? (
                                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                    ) : (
                                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    Regenerate
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setDeleteTarget(quest)}
                                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleGenerateSteps(quest)}
                                                                disabled={generatingQuestId === quest.id}
                                                                className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                                                            >
                                                                {generatingQuestId === quest.id ? (
                                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                                )}
                                                                Generate
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                        </Button>
                                        <span className="text-sm text-white/60">
                                            Page {page} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                                        >
                                            Next <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Generation Modal */}
                <QuestGenerationModal
                    isOpen={isGenerationModalOpen}
                    jobId={generationJobId}
                    questTitle={generatingQuestTitle}
                    onClose={handleGenerationClose}
                    onComplete={handleGenerationComplete}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Delete Quest Steps</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Are you sure you want to delete all steps for{" "}
                                <span className="text-[#f5c16c] font-semibold">{deleteTarget?.title}</span>?
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setDeleteTarget(null)}
                                className="border-[#f5c16c]/30 text-white/70 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteSteps}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                                ) : (
                                    "Delete Steps"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
