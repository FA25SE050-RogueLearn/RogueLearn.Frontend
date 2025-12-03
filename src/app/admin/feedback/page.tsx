"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MessageSquare, CheckCircle2, ChevronsUpDown, Check, Eye, BookOpen, HelpCircle, Code, FileText } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import questApi from "@/api/questApi";
import { toast } from "sonner";
import subjectsApi from "@/api/subjectsApi";
import adminContentApi from "@/api/adminContentApi";
import type { Subject } from "@/types/subjects";
import type { WeeklyModuleContent, Activity } from "@/types/quest";
import debounce from "lodash/debounce";

type Category = 'ContentError' | 'TechnicalIssue' | 'TooDifficult' | 'TooEasy' | 'Other' | 'all';

interface FeedbackItem {
  id: string;
  questId: string;
  stepId: string;
  subjectId: string;
  authUserId: string;
  rating: number;
  category: Category;
  comment?: string;
  adminNotes?: string | null;
  isResolved: boolean;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);
  const [subjectId, setSubjectId] = useState<string>('');
  const [questId, setQuestId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectsPage, setSubjectsPage] = useState(1);
  const [subjectsHasMore, setSubjectsHasMore] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Quest step content dialog state
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<FeedbackItem | null>(null);
  const [stepContent, setStepContent] = useState<WeeklyModuleContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const filtered = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return arr.filter(it => {
      if (category !== 'all' && it.category !== category) return false;
      if (unresolvedOnly && it.isResolved) return false;
      if (subjectId && it.subjectId !== subjectId) return false;
      if (questId && it.questId !== questId) return false;
      if (search) {
        const s = search.toLowerCase();
        const text = `${it.comment || ''} ${it.adminNotes || ''}`.toLowerCase();
        if (!text.includes(s)) return false;
      }
      return true;
    });
  }, [items, category, unresolvedOnly, subjectId, questId, search]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await questApi.adminListFeedback({ subjectId: subjectId || undefined, questId: questId || undefined, unresolvedOnly });
      if (res.isSuccess && res.data) {
        const dataAny = res.data as any;
        const list: FeedbackItem[] = Array.isArray(dataAny) ? dataAny : Array.isArray(dataAny?.items) ? dataAny.items : [];
        setItems(list);
        setTotalPages(Number.isFinite(dataAny?.totalPages) ? dataAny.totalPages : 1);
        const ids = Array.from(new Set(list.map(i => i.subjectId).filter(Boolean)));
        const missing = ids.filter(id => !subjectMap[id]);
        if (missing.length > 0) {
          const results = await Promise.all(missing.map(id => subjectsApi.getById(id)));
          const mapUpdate: Record<string, Subject> = {};
          results.forEach((r, idx) => { if (r.isSuccess && r.data) mapUpdate[missing[idx]] = r.data; });
          setSubjectMap(prev => ({ ...prev, ...mapUpdate }));
        }
      } else { toast.error(res.message || 'Failed to load feedback'); }
    } catch (e: any) { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async (searchTerm: string, pageNum: number, append: boolean) => {
    setLoadingSubjects(true);
    try {
      const res = await adminContentApi.getSubjectsPaged({ page: pageNum, pageSize: 10, search: searchTerm || undefined });
      if (res.isSuccess && res.data) {
        const newItems = res.data.items || [];
        setSubjectOptions(prev => append ? [...prev, ...newItems] : newItems);
        setSubjectsPage(pageNum);
        setSubjectsHasMore(pageNum < (res.data.totalPages || 1));
        const newMap: Record<string, Subject> = {};
        newItems.forEach(s => newMap[s.id] = s);
        setSubjectMap(prev => ({ ...prev, ...newMap }));
      }
    } catch (err) { console.error('Failed to fetch subjects', err); }
    finally { setLoadingSubjects(false); }
  };

  const debouncedSubjectSearch = useCallback(debounce((query: string) => { fetchSubjects(query, 1, false); }, 300), []);
  const handleSubjectSearchInput = (val: string) => { setSubjectSearch(val); debouncedSubjectSearch(val); };
  const loadMoreSubjects = () => { if (!loadingSubjects && subjectsHasMore) fetchSubjects(subjectSearch, subjectsPage + 1, true); };

  useEffect(() => { fetchFeedback(); fetchSubjects("", 1, false); }, [category, unresolvedOnly, page, subjectId, questId]);

  const markResolved = async (id: string, resolved: boolean) => {
    const res = await questApi.adminUpdateFeedback(id, { isResolved: resolved });
    if (res.isSuccess) { setItems(prev => prev.map(it => it.id === id ? { ...it, isResolved: resolved } : it)); toast.success(resolved ? 'Marked resolved' : 'Marked unresolved'); }
    else { toast.error(res.message || 'Failed to update'); }
  };

  const saveNotes = async (id: string, notes: string) => {
    const res = await questApi.adminUpdateFeedback(id, { adminNotes: notes });
    if (res.isSuccess) { setItems(prev => prev.map(it => it.id === id ? { ...it, adminNotes: notes } : it)); toast.success('Notes saved'); }
    else { toast.error(res.message || 'Failed to save notes'); }
  };

  const viewStepContent = async (item: FeedbackItem) => {
    setSelectedFeedbackItem(item);
    setContentDialogOpen(true);
    setLoadingContent(true);
    setStepContent(null);
    try {
      const res = await adminContentApi.getQuestStepContent(item.stepId);
      if (res.isSuccess && res.data) {
        setStepContent(res.data);
      } else {
        toast.error(res.message || 'Failed to load step content');
      }
    } catch (e: any) {
      toast.error('Failed to load step content');
    } finally {
      setLoadingContent(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Reading': return <FileText className="h-4 w-4" />;
      case 'KnowledgeCheck': return <HelpCircle className="h-4 w-4" />;
      case 'Quiz': return <BookOpen className="h-4 w-4" />;
      case 'Coding': return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Reading': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'KnowledgeCheck': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Quiz': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Coding': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="p-6 rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/80">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#f5c16c]/20 p-2">
              <MessageSquare className="h-5 w-5 text-[#f5c16c]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Quest Feedback</h1>
          </div>
          <p className="text-white/50 mt-2">Review and resolve user-reported issues across quests</p>
        </div>

        <Card className="bg-[#1a0b08]/80 border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10"><CardTitle className="text-white">Filters</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-6">
            <Input placeholder="Search comments/notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />

            <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={subjectOpen} className="w-[300px] justify-between border-[#f5c16c]/20 bg-black/30 text-white hover:bg-[#f5c16c]/10">
                  {subjectId ? (subjectMap[subjectId] ? `${subjectMap[subjectId].subjectCode} - ${subjectMap[subjectId].subjectName.substring(0, 20)}...` : "Loading...") : "Filter by Subject..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 bg-[#1a0b08] border-[#f5c16c]/20">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search subjects..." value={subjectSearch} onValueChange={handleSubjectSearchInput} className="text-white" />
                  <CommandList>
                    <CommandEmpty className="text-white/50">No subject found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all_subjects" onSelect={() => { setSubjectId(""); setSubjectOpen(false); }} className="cursor-pointer hover:bg-[#f5c16c]/10 text-white">
                        <Check className={cn("mr-2 h-4 w-4", subjectId === "" ? "opacity-100" : "opacity-0")} /> All Subjects
                      </CommandItem>
                      {subjectOptions.map((subject) => (
                        <CommandItem key={subject.id} value={subject.id} onSelect={(v) => { setSubjectId(v === subjectId ? "" : v); setSubjectOpen(false); }} className="cursor-pointer hover:bg-[#f5c16c]/10 text-white">
                          <Check className={cn("mr-2 h-4 w-4", subjectId === subject.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#f5c16c]">{subject.subjectCode}</span>
                            <span className="text-xs text-white/60">{subject.subjectName}</span>
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

            <Input placeholder="Exact Quest ID" value={questId} onChange={(e) => setQuestId(e.target.value)} className="w-48 border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />

            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="w-40 border-[#f5c16c]/20 bg-black/30 text-white"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent className="bg-[#1a0b08] border-[#f5c16c]/20">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ContentError">Content Error</SelectItem>
                <SelectItem value="TechnicalIssue">Technical Issue</SelectItem>
                <SelectItem value="TooDifficult">Too Difficult</SelectItem>
                <SelectItem value="TooEasy">Too Easy</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 px-2 bg-black/30 rounded border border-[#f5c16c]/20 h-10">
              <Checkbox id="unresolved" checked={unresolvedOnly} onCheckedChange={(v) => setUnresolvedOnly(!!v)} className="border-[#f5c16c] data-[state=checked]:bg-[#f5c16c]" />
              <label htmlFor="unresolved" className="text-sm text-white cursor-pointer select-none">Unresolved Only</label>
            </div>

            <Button variant="outline" onClick={() => { setPage(1); fetchFeedback(); }} className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">Refresh</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0b08]/80 border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10"><CardTitle className="text-white">Feedback Entries</CardTitle></CardHeader>
          <CardContent className="pt-6">
            {loading && <div className="flex justify-center items-center h-32 text-[#f5c16c] gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Loading...</div>}
            {!loading && (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#f5c16c]/10">
                    <TableHead className="text-white/60">Date</TableHead>
                    <TableHead className="text-white/60">Subject</TableHead>
                    <TableHead className="text-white/60">Category</TableHead>
                    <TableHead className="text-white/60">Rating</TableHead>
                    <TableHead className="text-white/60 w-[30%]">Comment</TableHead>
                    <TableHead className="text-white/60 w-[20%]">Admin Notes</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-white/40 py-8">No feedback found matching filters.</TableCell></TableRow>
                  ) : filtered.map((it) => (
                    <TableRow key={it.id} className="border-[#f5c16c]/10 hover:bg-[#f5c16c]/5 transition-colors">
                      <TableCell className="whitespace-nowrap text-xs text-white/50">{new Date(it.createdAt).toLocaleDateString()}<br />{new Date(it.createdAt).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-xs">
                        {subjectMap[it.subjectId] ? (
                          <div className="flex flex-col"><span className="font-medium text-[#f5c16c]">{subjectMap[it.subjectId].subjectCode}</span><span className="text-white/50 text-[10px]">{subjectMap[it.subjectId].subjectName}</span></div>
                        ) : <span className="font-mono text-[10px] text-white/40">{it.subjectId}</span>}
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border",
                          it.category === 'ContentError' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          it.category === 'TechnicalIssue' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                          "bg-[#f5c16c]/20 text-[#f5c16c] border-[#f5c16c]/30"
                        )}>{it.category}</span>
                      </TableCell>
                      <TableCell><div className="flex gap-0.5">{[...Array(5)].map((_, i) => <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < it.rating ? "bg-[#f5c16c]" : "bg-white/20")} />)}</div></TableCell>
                      <TableCell className="text-sm text-white/80 leading-relaxed min-w-[250px]">
                        {it.comment}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/40">Q: {it.questId.substring(0, 8)}...</span>
                          <span className="text-[10px] font-mono text-white/40">S: {it.stepId.substring(0, 8)}...</span>
                          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-[#f5c16c] hover:bg-[#f5c16c]/10" onClick={() => viewStepContent(it)}>
                            <Eye className="h-3 w-3 mr-1" /> View Content
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell><Input defaultValue={it.adminNotes ?? ''} onBlur={(e) => saveNotes(it.id, e.target.value)} placeholder="Add notes..." className="h-8 border-[#f5c16c]/20 bg-black/30 text-white text-xs focus:border-[#f5c16c] placeholder:text-white/40" /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => markResolved(it.id, !it.isResolved)} className={cn("h-8 text-xs border", it.isResolved ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" : "bg-black/30 text-white border-[#f5c16c]/20 hover:bg-[#f5c16c]/10")}>
                          <CheckCircle2 className={cn("h-3 w-3 mr-1.5", it.isResolved && "fill-current")} /> {it.isResolved ? 'Resolved' : 'Mark Done'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-[#f5c16c]/10">
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="text-[#f5c16c] hover:bg-[#f5c16c]/10 disabled:opacity-30">Previous</Button>
                <span className="text-xs text-white/50">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-[#f5c16c] hover:bg-[#f5c16c]/10 disabled:opacity-30">Next</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quest Step Content Dialog */}
        <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-[#1a0b08] border-[#f5c16c]/20">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#f5c16c]" />
                Quest Step Content
              </DialogTitle>
              {selectedFeedbackItem && (
                <div className="text-xs text-white/50 font-mono mt-1">
                  Step ID: {selectedFeedbackItem.stepId}
                </div>
              )}
            </DialogHeader>
            
            <div className="max-h-[70vh] overflow-y-auto pr-4">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                  <span className="ml-3 text-white/60">Loading content...</span>
                </div>
              ) : stepContent?.activities ? (
                <div className="space-y-4">
                  {stepContent.activities.map((activity, index) => (
                    <div key={activity.activityId} className="border border-[#f5c16c]/20 rounded-lg overflow-hidden">
                      {/* Activity Header */}
                      <div className={cn("px-4 py-2 flex items-center gap-2 border-b border-[#f5c16c]/10", getActivityColor(activity.type))}>
                        {getActivityIcon(activity.type)}
                        <span className="font-semibold text-sm">{activity.type}</span>
                        <span className="text-xs opacity-70">#{index + 1}</span>
                        {activity.payload && 'experiencePoints' in activity.payload && (
                          <span className="ml-auto text-xs font-medium">+{activity.payload.experiencePoints} XP</span>
                        )}
                      </div>
                      
                      {/* Activity Content */}
                      <div className="p-4 bg-black/30">
                        {/* Topic if available */}
                        {activity.payload && 'topic' in activity.payload && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Topic</span>
                            <p className="text-sm font-medium text-white">{(activity.payload as any).topic}</p>
                          </div>
                        )}
                        
                        {/* Questions for KnowledgeCheck/Quiz */}
                        {activity.payload && 'questions' in activity.payload && (
                          <div className="space-y-3">
                            <span className="text-xs font-medium text-white/50 uppercase tracking-wide">
                              Questions ({(activity.payload as any).questions.length})
                            </span>
                            {(activity.payload as any).questions.map((q: any, qIdx: number) => (
                              <div key={qIdx} className="bg-black/20 border border-[#f5c16c]/10 rounded-lg p-3">
                                <p className="text-sm font-medium text-white mb-2">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="space-y-1 mb-2">
                                  {q.options?.map((opt: string, oIdx: number) => (
                                    <div 
                                      key={oIdx} 
                                      className={cn(
                                        "text-xs px-2 py-1 rounded",
                                        opt === q.correctAnswer 
                                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                          : "bg-white/5 text-white/70"
                                      )}
                                    >
                                      {String.fromCharCode(65 + oIdx)}. {opt}
                                      {opt === q.correctAnswer && <span className="ml-2 font-semibold">(Correct)</span>}
                                    </div>
                                  ))}
                                </div>
                                {q.explanation && (
                                  <div className="text-xs text-[#f5c16c] bg-[#f5c16c]/10 p-2 rounded border border-[#f5c16c]/20">
                                    <span className="font-semibold">Explanation:</span> {q.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reading content */}
                        {activity.type === 'Reading' && activity.payload && 'articleTitle' in activity.payload && (
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Article</span>
                              <p className="text-sm font-medium text-white">{(activity.payload as any).articleTitle}</p>
                            </div>
                            {(activity.payload as any).summary && (
                              <div>
                                <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Summary</span>
                                <p className="text-sm text-white/70">{(activity.payload as any).summary}</p>
                              </div>
                            )}
                            {(activity.payload as any).url && (
                              <a href={(activity.payload as any).url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#f5c16c] hover:underline">
                                Open Article →
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Coding content */}
                        {activity.type === 'Coding' && activity.payload && (
                          <div className="space-y-2">
                            {'problemTitle' in activity.payload && (
                              <div>
                                <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Problem</span>
                                <p className="text-sm font-medium text-white">{(activity.payload as any).problemTitle}</p>
                              </div>
                            )}
                            {'problemDescription' in activity.payload && (
                              <div>
                                <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Description</span>
                                <p className="text-sm text-white/70 whitespace-pre-wrap">{(activity.payload as any).problemDescription}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Activity ID */}
                        <div className="mt-3 pt-2 border-t border-[#f5c16c]/10">
                          <span className="text-[10px] font-mono text-white/30">ID: {activity.activityId}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white/40">
                  <MessageSquare className="h-12 w-12 mb-3" />
                  <p>No content found for this quest step</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
