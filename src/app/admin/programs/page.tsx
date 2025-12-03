"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2, Plus, Trash2, ScrollText, ChevronsUpDown, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import curriculumProgramsApi from "@/api/curriculumProgramsApi";
import adminContentApi from "@/api/adminContentApi";
import adminManagementApi from "@/api/adminManagementApi";
import { CurriculumProgramDto, ProgramSubjectDto } from "@/types/curriculum-programs";
import { Subject } from "@/types/subjects";
import debounce from "lodash/debounce";

export default function ProgramsManagementPage() {
    const [programs, setPrograms] = useState<CurriculumProgramDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<CurriculumProgramDto | null>(null);
    const [programSubjects, setProgramSubjects] = useState<ProgramSubjectDto[]>([]);
    const [structLoading, setStructLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
    const [newProgram, setNewProgram] = useState({
        programName: "",
        programCode: "",
        degreeLevel: "Bachelor" as const,
        totalCredits: 120,
        durationYears: 4
    });

    // Subject search state for combobox
    const [subjectOpen, setSubjectOpen] = useState(false);
    const [subjectSearch, setSubjectSearch] = useState("");
    const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [subjectsPage, setSubjectsPage] = useState(1);
    const [subjectsHasMore, setSubjectsHasMore] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedSubjectLabel, setSelectedSubjectLabel] = useState("");

    useEffect(() => {
        loadPrograms();
    }, []);

    const loadPrograms = async () => {
        setLoading(true);
        try {
            const res = await curriculumProgramsApi.getAll();
            if (res.isSuccess && res.data) {
                setPrograms(Array.isArray(res.data) ? res.data : []);
            }
        } catch {
            toast.error("Failed to load programs");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (searchTerm: string, pageNum: number, append: boolean) => {
        setLoadingSubjects(true);
        try {
            const res = await adminContentApi.getSubjectsPaged({ page: pageNum, pageSize: 15, search: searchTerm || undefined });
            if (res.isSuccess && res.data) {
                const newItems = res.data.items || [];
                setSubjectOptions(prev => append ? [...prev, ...newItems] : newItems);
                setSubjectsPage(pageNum);
                setSubjectsHasMore(pageNum < (res.data.totalPages || 1));
            }
        } catch (err) { console.error('Failed to fetch subjects', err); }
        finally { setLoadingSubjects(false); }
    };

    const debouncedSubjectSearch = useCallback(debounce((query: string) => { fetchSubjects(query, 1, false); }, 300), []);
    const handleSubjectSearchInput = (val: string) => { setSubjectSearch(val); debouncedSubjectSearch(val); };
    const loadMoreSubjects = () => { if (!loadingSubjects && subjectsHasMore) fetchSubjects(subjectSearch, subjectsPage + 1, true); };

    const handleCreateProgram = async () => {
        if (!newProgram.programName || !newProgram.programCode) return;
        try {
            await curriculumProgramsApi.create(newProgram);
            toast.success("Program created");
            setIsCreateOpen(false);
            setNewProgram({ programName: "", programCode: "", degreeLevel: "Bachelor", totalCredits: 120, durationYears: 4 });
            loadPrograms();
        } catch {
            toast.error("Failed to create program");
        }
    };

    const openStructure = async (prog: CurriculumProgramDto) => {
        setSelectedProgram(prog);
        setStructLoading(true);
        setSelectedSubjectId("");
        setSelectedSubjectLabel("");
        fetchSubjects("", 1, false); // Load initial subjects for combobox
        try {
            const res = await curriculumProgramsApi.getDetails(prog.id);
            if (res.isSuccess && res.data && res.data.subjects) {
                setProgramSubjects(res.data.subjects);
            } else {
                setProgramSubjects([]);
            }
        } catch {
            toast.error("Failed to load program structure");
            setProgramSubjects([]);
        } finally {
            setStructLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!selectedProgram || !selectedSubjectId) return;
        try {
            await adminManagementApi.addSubjectToProgram(selectedProgram.id, selectedSubjectId);
            toast.success("Subject added to program");
            setSelectedSubjectId("");
            setSelectedSubjectLabel("");
            openStructure(selectedProgram);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            const message = error?.response?.data?.error?.message || "Failed to add subject";
            toast.error(message);
        }
    };

    const handleRemoveSubject = async (subjectId: string) => {
        if (!selectedProgram) return;
        try {
            await adminManagementApi.removeSubjectFromProgram(selectedProgram.id, subjectId);
            toast.success("Subject removed");
            openStructure(selectedProgram);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            const message = error?.response?.data?.error?.message || "Failed to remove subject";
            toast.error(message);
        }
    };

    const toggleDescription = (id: string) => {
        setExpandedDescriptions(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const truncateText = (text: string, maxLength: number = 80) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const getDegreeBadge = (level: string) => {
        const styles: Record<string, string> = {
            Bachelor: "bg-[#f5c16c]/20 text-[#f5c16c] border-[#f5c16c]/30",
            Master: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            Associate: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            Doctorate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
        return styles[level] || styles.Bachelor;
    };

    // Filter out already added subjects
    const availableSubjects = subjectOptions.filter(s => 
        !programSubjects.some(ps => ps.subjectId === s.id)
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Programs Management</h1>
                        <p className="text-white/50">Manage academic programs and their subjects</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">
                                <Plus className="w-4 h-4 mr-2" /> Create Program
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a0b08] border-[#f5c16c]/20">
                            <DialogHeader>
                                <DialogTitle className="text-white">Create New Program</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Program Name</Label>
                                    <Input value={newProgram.programName} onChange={e => setNewProgram({ ...newProgram, programName: e.target.value })} placeholder="Enter program name" className="border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Program Code</Label>
                                    <Input value={newProgram.programCode} onChange={e => setNewProgram({ ...newProgram, programCode: e.target.value })} placeholder="e.g., SE_K20, IS_K21" className="border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/70">Degree Level</Label>
                                    <Select value={newProgram.degreeLevel} onValueChange={v => setNewProgram({ ...newProgram, degreeLevel: v as any })}>
                                        <SelectTrigger className="border-[#f5c16c]/20 bg-black/30 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#1a0b08] border-[#f5c16c]/20">
                                            <SelectItem value="Associate">Associate</SelectItem>
                                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                                            <SelectItem value="Master">Master</SelectItem>
                                            <SelectItem value="Doctorate">Doctorate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-[#f5c16c]/20 text-white hover:bg-[#f5c16c]/10">Cancel</Button>
                                <Button onClick={handleCreateProgram} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">Create</Button>
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
                        {(Array.isArray(programs) ? programs : []).map(prog => {
                            const isExpanded = expandedDescriptions.has(prog.id);
                            const hasLongDesc = prog.description && prog.description.length > 80;
                            return (
                                <Card key={prog.id} className="bg-[#1a0b08]/80 border border-[#f5c16c]/20 hover:border-[#f5c16c]/40 transition-all">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base font-semibold text-[#f5c16c]">{prog.programCode}</CardTitle>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getDegreeBadge(prog.degreeLevel)}`}>
                                                {prog.degreeLevel}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm font-medium text-white mb-1">{prog.programName}</p>
                                        <div className="mb-4">
                                            <p className="text-sm text-white/50">
                                                {isExpanded ? prog.description : truncateText(prog.description || "No description")}
                                            </p>
                                            {hasLongDesc && (
                                                <button 
                                                    onClick={() => toggleDescription(prog.id)}
                                                    className="text-xs text-[#f5c16c] hover:underline mt-1 flex items-center gap-1"
                                                >
                                                    {isExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
                                                </button>
                                            )}
                                        </div>
                                        {prog.totalCredits && (
                                            <p className="text-xs text-white/40 mb-2">{prog.totalCredits} credits • {prog.durationYears || 4} years</p>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="w-full border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                                            onClick={() => openStructure(prog)}
                                        >
                                            <ScrollText className="w-4 h-4 mr-2" /> Manage Subjects
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Structure Manager Dialog */}
                <Dialog open={!!selectedProgram} onOpenChange={(o) => !o && setSelectedProgram(null)}>
                    <DialogContent className="bg-[#1a0b08] border-[#f5c16c]/20 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Program Subjects: <span className="text-[#f5c16c]">{selectedProgram?.programCode}</span>
                            </DialogTitle>
                            <p className="text-white/50 text-sm">{selectedProgram?.programName}</p>
                        </DialogHeader>

                        <div className="flex gap-4 items-end border-b border-[#f5c16c]/10 pb-4 mb-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-white/70">Add Subject</Label>
                                <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={subjectOpen} className="w-full justify-between border-[#f5c16c]/20 bg-black/30 text-white hover:bg-[#f5c16c]/10">
                                            {selectedSubjectLabel || "Search and select subject..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0 bg-[#1a0b08] border-[#f5c16c]/20">
                                        <Command shouldFilter={false}>
                                            <CommandInput placeholder="Search subjects..." value={subjectSearch} onValueChange={handleSubjectSearchInput} className="text-white" />
                                            <CommandList>
                                                <CommandEmpty className="text-white/50 py-4 text-center text-sm">No subjects found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableSubjects.map((subject) => (
                                                        <CommandItem 
                                                            key={subject.id} 
                                                            value={subject.id} 
                                                            onSelect={() => { 
                                                                setSelectedSubjectId(subject.id);
                                                                setSelectedSubjectLabel(`${subject.subjectCode} - ${subject.subjectName}`);
                                                                setSubjectOpen(false); 
                                                            }} 
                                                            className="cursor-pointer hover:bg-[#f5c16c]/10 text-white"
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", selectedSubjectId === subject.id ? "opacity-100" : "opacity-0")} />
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-xs text-[#f5c16c]">{subject.subjectCode}</span>
                                                                <span className="text-xs text-white/70 truncate max-w-[300px]">{subject.subjectName}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                {subjectsHasMore && (
                                                    <div className="p-2 border-t border-[#f5c16c]/20">
                                                        <Button variant="ghost" size="sm" className="w-full text-xs text-[#f5c16c] hover:bg-[#f5c16c]/10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); loadMoreSubjects(); }} disabled={loadingSubjects}>
                                                            {loadingSubjects && <Loader2 className="h-3 w-3 animate-spin mr-2" />} Load more...
                                                        </Button>
                                                    </div>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button onClick={handleAddSubject} disabled={!selectedSubjectId} className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {structLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-[#f5c16c]" />
                                </div>
                            ) : programSubjects.length === 0 ? (
                                <p className="text-center text-white/40 py-8">No subjects linked to this program yet.</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-[80px_1fr_60px_60px_48px] gap-2 px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider border-b border-[#f5c16c]/10">
                                        <div>Code</div>
                                        <div>Name</div>
                                        <div className="text-center">Sem</div>
                                        <div className="text-center">Cr</div>
                                        <div></div>
                                    </div>
                                    {programSubjects.map(sub => (
                                        <div key={sub.subjectId} className="grid grid-cols-[80px_1fr_60px_60px_48px] gap-2 items-center bg-black/30 px-3 py-2.5 rounded-lg border border-[#f5c16c]/20">
                                            <span className="text-[#f5c16c] font-mono text-xs">{sub.code}</span>
                                            <span className="text-sm text-white truncate" title={sub.name}>{sub.name}</span>
                                            <span className="text-xs text-white/60 text-center">{sub.semester ?? '-'}</span>
                                            <span className="text-xs text-white/60 text-center">{sub.credits ?? '-'}</span>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => handleRemoveSubject(sub.subjectId)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {programSubjects.length > 0 && (
                            <div className="pt-3 border-t border-[#f5c16c]/10 text-xs text-white/40 text-right">
                                {programSubjects.length} subject{programSubjects.length !== 1 ? 's' : ''} linked
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
