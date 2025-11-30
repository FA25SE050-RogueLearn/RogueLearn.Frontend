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
import { Loader2, MessageSquare, CheckCircle2, ChevronsUpDown, Check } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import questApi from "@/api/questApi";
import { toast } from "sonner";
import subjectsApi from "@/api/subjectsApi";
import adminContentApi from "@/api/adminContentApi";
import type { Subject } from "@/types/subjects";
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="p-6 rounded-lg border border-[#beaca3]/30 bg-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#7289da]/10 p-2">
              <MessageSquare className="h-5 w-5 text-[#7289da]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2c2f33]">Quest Feedback</h1>
          </div>
          <p className="text-[#2c2f33]/60 mt-2">Review and resolve user-reported issues across quests</p>
        </div>

        <Card className="bg-white border-[#beaca3]/30">
          <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-[#2c2f33]">Filters</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-6">
            <Input placeholder="Search comments/notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] border-[#beaca3]/30" />

            <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={subjectOpen} className="w-[300px] justify-between border-[#beaca3]/30 text-[#2c2f33] hover:bg-[#beaca3]/20">
                  {subjectId ? (subjectMap[subjectId] ? `${subjectMap[subjectId].subjectCode} - ${subjectMap[subjectId].subjectName.substring(0, 20)}...` : "Loading...") : "Filter by Subject..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 bg-white border-[#beaca3]/30">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search subjects..." value={subjectSearch} onValueChange={handleSubjectSearchInput} />
                  <CommandList>
                    <CommandEmpty>No subject found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all_subjects" onSelect={() => { setSubjectId(""); setSubjectOpen(false); }} className="cursor-pointer hover:bg-[#beaca3]/20">
                        <Check className={cn("mr-2 h-4 w-4", subjectId === "" ? "opacity-100" : "opacity-0")} /> All Subjects
                      </CommandItem>
                      {subjectOptions.map((subject) => (
                        <CommandItem key={subject.id} value={subject.id} onSelect={(v) => { setSubjectId(v === subjectId ? "" : v); setSubjectOpen(false); }} className="cursor-pointer hover:bg-[#beaca3]/20">
                          <Check className={cn("mr-2 h-4 w-4", subjectId === subject.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#2c2f33]">{subject.subjectCode}</span>
                            <span className="text-xs text-[#2c2f33]/60">{subject.subjectName}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {subjectsHasMore && (
                      <div className="p-2 border-t border-[#beaca3]/30">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-[#7289da] hover:bg-[#7289da]/10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); loadMoreSubjects(); }} disabled={loadingSubjects}>
                          {loadingSubjects && <Loader2 className="h-3 w-3 animate-spin mr-2" />} Load more...
                        </Button>
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Input placeholder="Exact Quest ID" value={questId} onChange={(e) => setQuestId(e.target.value)} className="w-48 border-[#beaca3]/30" />

            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="w-40 border-[#beaca3]/30"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent className="bg-white border-[#beaca3]/30">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ContentError">Content Error</SelectItem>
                <SelectItem value="TechnicalIssue">Technical Issue</SelectItem>
                <SelectItem value="TooDifficult">Too Difficult</SelectItem>
                <SelectItem value="TooEasy">Too Easy</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 px-2 bg-[#f4f6f8] rounded border border-[#beaca3]/30 h-10">
              <Checkbox id="unresolved" checked={unresolvedOnly} onCheckedChange={(v) => setUnresolvedOnly(!!v)} className="border-[#7289da] data-[state=checked]:bg-[#7289da]" />
              <label htmlFor="unresolved" className="text-sm text-[#2c2f33] cursor-pointer select-none">Unresolved Only</label>
            </div>

            <Button variant="outline" onClick={() => { setPage(1); fetchFeedback(); }} className="border-[#7289da]/50 text-[#7289da] hover:bg-[#7289da]/10">Refresh</Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#beaca3]/30">
          <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-[#2c2f33]">Feedback Entries</CardTitle></CardHeader>
          <CardContent className="pt-6">
            {loading && <div className="flex justify-center items-center h-32 text-[#7289da] gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Loading...</div>}
            {!loading && (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#beaca3]/20">
                    <TableHead className="text-[#2c2f33]/60">Date</TableHead>
                    <TableHead className="text-[#2c2f33]/60">Subject</TableHead>
                    <TableHead className="text-[#2c2f33]/60">Category</TableHead>
                    <TableHead className="text-[#2c2f33]/60">Rating</TableHead>
                    <TableHead className="text-[#2c2f33]/60 w-[30%]">Comment</TableHead>
                    <TableHead className="text-[#2c2f33]/60 w-[20%]">Admin Notes</TableHead>
                    <TableHead className="text-[#2c2f33]/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-[#2c2f33]/40 py-8">No feedback found matching filters.</TableCell></TableRow>
                  ) : filtered.map((it) => (
                    <TableRow key={it.id} className="border-[#beaca3]/10 hover:bg-[#f4f6f8]/50 transition-colors">
                      <TableCell className="whitespace-nowrap text-xs text-[#2c2f33]/50">{new Date(it.createdAt).toLocaleDateString()}<br />{new Date(it.createdAt).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-xs">
                        {subjectMap[it.subjectId] ? (
                          <div className="flex flex-col"><span className="font-medium text-[#2c2f33]">{subjectMap[it.subjectId].subjectCode}</span><span className="text-[#2c2f33]/50 text-[10px]">{subjectMap[it.subjectId].subjectName}</span></div>
                        ) : <span className="font-mono text-[10px] text-[#2c2f33]/40">{it.subjectId}</span>}
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border",
                          it.category === 'ContentError' ? "bg-[#e07a5f]/10 text-[#e07a5f] border-[#e07a5f]/30" :
                          it.category === 'TechnicalIssue' ? "bg-orange-50 text-orange-600 border-orange-200" :
                          "bg-[#7289da]/10 text-[#7289da] border-[#7289da]/30"
                        )}>{it.category}</span>
                      </TableCell>
                      <TableCell><div className="flex gap-0.5">{[...Array(5)].map((_, i) => <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < it.rating ? "bg-[#7289da]" : "bg-[#beaca3]/40")} />)}</div></TableCell>
                      <TableCell className="text-sm text-[#2c2f33]/80 leading-relaxed min-w-[250px]">{it.comment}<div className="mt-1 flex gap-2 text-[10px] font-mono text-[#2c2f33]/40"><span>Q: {it.questId.substring(0, 8)}...</span><span>S: {it.stepId.substring(0, 8)}...</span></div></TableCell>
                      <TableCell><Input defaultValue={it.adminNotes ?? ''} onBlur={(e) => saveNotes(it.id, e.target.value)} placeholder="Add notes..." className="h-8 border-[#beaca3]/30 text-xs focus:border-[#7289da]" /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => markResolved(it.id, !it.isResolved)} className={cn("h-8 text-xs border", it.isResolved ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-[#beaca3]/20 text-[#2c2f33] border-[#beaca3]/30 hover:bg-[#beaca3]/30")}>
                          <CheckCircle2 className={cn("h-3 w-3 mr-1.5", it.isResolved && "fill-current")} /> {it.isResolved ? 'Resolved' : 'Mark Done'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-[#beaca3]/20">
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="text-[#7289da] hover:bg-[#7289da]/10 disabled:opacity-30">Previous</Button>
                <span className="text-xs text-[#2c2f33]/50">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-[#7289da] hover:bg-[#7289da]/10 disabled:opacity-30">Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
