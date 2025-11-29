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
import { cn } from "@/lib/utils"; // Ensure you have this utility
import questApi from "@/api/questApi";
import { toast } from "sonner";
import subjectsApi from "@/api/subjectsApi";
import adminContentApi from "@/api/adminContentApi";
import type { Subject } from "@/types/subjects";
import debounce from "lodash/debounce"; // You might need to install lodash: npm i lodash @types/lodash

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
  // --- Main Feedback State ---
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

  // --- Subject Selector State ---
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({}); // For displaying table cells
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectsPage, setSubjectsPage] = useState(1);
  const [subjectsHasMore, setSubjectsHasMore] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // --- Logic ---

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
        const list: FeedbackItem[] = Array.isArray(dataAny)
          ? (dataAny as FeedbackItem[])
          : Array.isArray(dataAny?.items)
            ? (dataAny.items as FeedbackItem[])
            : [];
        setItems(list);
        setTotalPages(Number.isFinite(dataAny?.totalPages) ? dataAny.totalPages : 1);

        // Resolve missing subject names for the table display
        const ids = Array.from(new Set(list.map(i => i.subjectId).filter(Boolean)));
        const missing = ids.filter(id => !subjectMap[id]);

        if (missing.length > 0) {
          // Batch fetch logic or individual fetches (Optimized to prevent waterfall if possible)
          const results = await Promise.all(missing.map(id => subjectsApi.getById(id)));
          const mapUpdate: Record<string, Subject> = {};
          results.forEach((r, idx) => { if (r.isSuccess && r.data) { mapUpdate[missing[idx]] = r.data; } });
          setSubjectMap(prev => ({ ...prev, ...mapUpdate }));
        }
      } else {
        toast.error(res.message || 'Failed to load feedback');
      }
    } catch (e: any) {
      console.error('[AdminFeedback] Error', e);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  // --- Subject Search Logic (Combobox) ---

  const fetchSubjects = async (searchTerm: string, pageNum: number, append: boolean) => {
    setLoadingSubjects(true);
    try {
      const res = await adminContentApi.getSubjectsPaged({
        page: pageNum,
        pageSize: 10,
        search: searchTerm || undefined
      });

      if (res.isSuccess && res.data) {
        const newItems = res.data.items || [];
        setSubjectOptions(prev => append ? [...prev, ...newItems] : newItems);
        setSubjectsPage(pageNum);
        setSubjectsHasMore(pageNum < (res.data.totalPages || 1));

        // Also update the map so the dropdown displays correct info immediately
        const newMap: Record<string, Subject> = {};
        newItems.forEach(s => newMap[s.id] = s);
        setSubjectMap(prev => ({ ...prev, ...newMap }));
      }
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Debounce the search input for subjects
  const debouncedSubjectSearch = useCallback(
    debounce((query: string) => {
      fetchSubjects(query, 1, false);
    }, 300),
    []
  );

  const handleSubjectSearchInput = (val: string) => {
    setSubjectSearch(val);
    debouncedSubjectSearch(val);
  };

  const loadMoreSubjects = () => {
    if (!loadingSubjects && subjectsHasMore) {
      fetchSubjects(subjectSearch, subjectsPage + 1, true);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFeedback();
    fetchSubjects("", 1, false); // Pre-load some subjects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, unresolvedOnly, page, subjectId, questId]);

  // Actions
  const markResolved = async (id: string, resolved: boolean) => {
    const res = await questApi.adminUpdateFeedback(id, { isResolved: resolved });
    if (res.isSuccess) {
      setItems(prev => prev.map(it => it.id === id ? { ...it, isResolved: resolved } : it));
      toast.success(resolved ? 'Marked resolved' : 'Marked unresolved');
    } else {
      toast.error(res.message || 'Failed to update');
    }
  };

  const saveNotes = async (id: string, notes: string) => {
    const res = await questApi.adminUpdateFeedback(id, { adminNotes: notes });
    if (res.isSuccess) {
      setItems(prev => prev.map(it => it.id === id ? { ...it, adminNotes: notes } : it));
      toast.success('Notes saved');
    } else {
      toast.error(res.message || 'Failed to save notes');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 rounded-lg blur-xl" />
          <div className="relative p-6 rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-950/50 to-amber-900/30 p-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-amber-100">Quest Feedback</h1>
            </div>
            <p className="text-amber-700">Review and resolve user-reported issues across quests</p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Filters</CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-wrap gap-3 pt-6">

            {/* Text Search */}
            <Input
              placeholder="Search comments/notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] bg-black/20 border-amber-900/30 text-sm text-amber-100 placeholder:text-amber-800"
            />

            {/* Subject Async Combobox */}
            <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subjectOpen}
                  className="w-[300px] justify-between bg-black/20 border-amber-900/30 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"
                >
                  {subjectId
                    ? subjectMap[subjectId]
                      ? `${subjectMap[subjectId].subjectCode} - ${subjectMap[subjectId].subjectName.substring(0, 20)}...`
                      : "Loading subject..."
                    : "Filter by Subject..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 bg-[#1a1410] border-amber-900/30 text-amber-200">
                <Command shouldFilter={false}> {/* Disable client-side filtering because we do it server-side */}
                  <CommandInput
                    placeholder="Search subjects..."
                    value={subjectSearch}
                    onValueChange={handleSubjectSearchInput}
                    className="text-amber-100 placeholder:text-amber-700"
                  />
                  <CommandList>
                    <CommandEmpty>No subject found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all_subjects"
                        onSelect={() => {
                          setSubjectId("");
                          setSubjectOpen(false);
                        }}
                        className="cursor-pointer hover:bg-amber-900/20 aria-selected:bg-amber-900/30"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            subjectId === "" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All Subjects
                      </CommandItem>
                      {subjectOptions.map((subject) => (
                        <CommandItem
                          key={subject.id}
                          value={subject.id}
                          onSelect={(currentValue) => {
                            setSubjectId(currentValue === subjectId ? "" : currentValue);
                            setSubjectOpen(false);
                          }}
                          className="cursor-pointer hover:bg-amber-900/20 aria-selected:bg-amber-900/30"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              subjectId === subject.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{subject.subjectCode}</span>
                            <span className="text-xs text-amber-400/70">{subject.subjectName}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>

                    {/* Load More Button inside Dropdown */}
                    {subjectsHasMore && (
                      <div className="p-2 border-t border-amber-900/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-amber-400 hover:text-amber-200 hover:bg-amber-900/20"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            loadMoreSubjects();
                          }}
                          disabled={loadingSubjects}
                        >
                          {loadingSubjects ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                          Load more subjects...
                        </Button>
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Quest ID Filter */}
            <Input
              placeholder="Exact Quest ID"
              value={questId}
              onChange={(e) => setQuestId(e.target.value)}
              className="w-48 bg-black/20 border-amber-900/30 text-sm text-amber-100 placeholder:text-amber-800"
            />

            {/* Category Filter */}
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="w-40 bg-black/20 border-amber-900/30 text-amber-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1410] border-amber-900/30 text-amber-200">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ContentError">Content Error</SelectItem>
                <SelectItem value="TechnicalIssue">Technical Issue</SelectItem>
                <SelectItem value="TooDifficult">Too Difficult</SelectItem>
                <SelectItem value="TooEasy">Too Easy</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Resolved Toggle */}
            <div className="flex items-center gap-2 px-2 bg-black/20 rounded border border-amber-900/30 h-10">
              <Checkbox
                id="unresolved"
                checked={unresolvedOnly}
                onCheckedChange={(v) => setUnresolvedOnly(!!v)}
                className="border-amber-600 data-[state=checked]:bg-amber-600 data-[state=checked]:text-black"
              />
              <label htmlFor="unresolved" className="text-sm text-amber-200 cursor-pointer select-none">Unresolved Only</label>
            </div>

            <Button variant="outline" onClick={() => { setPage(1); fetchFeedback(); }} className="border-amber-700/50 text-amber-300 hover:bg-amber-900/20">
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Feedback Entries</CardTitle>
          </CardHeader>
          <CardContent className="relative pt-6">
            {loading && (
              <div className="flex justify-center items-center h-32 text-amber-300 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" /> Loading...
              </div>
            )}
            {!loading && (
              <Table className="text-amber-200">
                <TableHeader className="hover:bg-transparent">
                  <TableRow className="border-amber-900/20 hover:bg-transparent">
                    <TableHead className="text-amber-500">Date</TableHead>
                    <TableHead className="text-amber-500">Subject</TableHead>
                    <TableHead className="text-amber-500">Category</TableHead>
                    <TableHead className="text-amber-500">Rating</TableHead>
                    <TableHead className="text-amber-500 w-[30%]">Comment</TableHead>
                    <TableHead className="text-amber-500 w-[20%]">Admin Notes</TableHead>
                    <TableHead className="text-amber-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow className="hover:bg-transparent"><TableCell colSpan={7} className="text-center text-amber-700 py-8">No feedback found matching filters.</TableCell></TableRow>
                  ) : filtered.map((it) => (
                    <TableRow key={it.id} className="border-amber-900/10 hover:bg-amber-900/10 transition-colors">
                      <TableCell className="whitespace-nowrap text-xs text-amber-400/70">
                        {new Date(it.createdAt).toLocaleDateString()}
                        <br />
                        {new Date(it.createdAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {subjectMap[it.subjectId] ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-amber-200">{subjectMap[it.subjectId].subjectCode}</span>
                            <span className="text-amber-500/70 text-[10px]">{subjectMap[it.subjectId].subjectName}</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] text-amber-800">{it.subjectId}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider",
                          it.category === 'ContentError' ? "bg-red-900/30 text-red-400 border border-red-900/50" :
                            it.category === 'TechnicalIssue' ? "bg-orange-900/30 text-orange-400 border border-orange-900/50" :
                              "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                        )}>
                          {it.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < it.rating ? "bg-amber-400" : "bg-amber-900/40")} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-amber-100/80 leading-relaxed min-w-[250px]">
                        {it.comment}
                        <div className="mt-1 flex gap-2 text-[10px] font-mono text-amber-700">
                          <span>Q: {it.questId.substring(0, 8)}...</span>
                          <span>S: {it.stepId.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            defaultValue={it.adminNotes ?? ''}
                            onBlur={(e) => saveNotes(it.id, e.target.value)}
                            placeholder="Add notes..."
                            className="h-8 bg-black/40 border-amber-900/20 text-xs focus:border-amber-600"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => markResolved(it.id, !it.isResolved)}
                          className={cn(
                            "h-8 text-xs border",
                            it.isResolved
                              ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/50"
                              : "bg-amber-950/30 text-amber-400 border-amber-900/50 hover:bg-amber-900/50"
                          )}
                        >
                          <CheckCircle2 className={cn("h-3 w-3 mr-1.5", it.isResolved && "fill-current")} />
                          {it.isResolved ? 'Resolved' : 'Mark Done'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-amber-900/20">
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/20 disabled:opacity-30">Previous</Button>
                <span className="text-xs text-amber-500">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/20 disabled:opacity-30">Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
