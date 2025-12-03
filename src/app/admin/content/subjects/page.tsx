"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import adminContentApi from "@/api/adminContentApi";
import { Subject } from "@/types/subjects";
import { Input } from "@/components/ui/input";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminContentApi.getSubjectsPaged({ page, pageSize, search: search || undefined });
      if (response.isSuccess && response.data) {
        setSubjects(response.data.items);
        setTotalPages(response.data.totalPages);
      } else { throw new Error("Failed to fetch subjects from the server."); }
    } catch (err: any) { setError(err.message || "An unexpected error occurred."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, [page, pageSize]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
            <Link href="/admin/content" className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Subject Catalog</h1>
            <p className="text-sm text-white/50">Manage all subjects and their syllabus content</p>
          </div>
        </div>

        <Card className="bg-[#1a0b08]/80 border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10"><CardTitle className="text-white">Master Subject List</CardTitle></CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Input placeholder="Search by Code or Name" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchSubjects(); } }} className="flex-1 border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
              <Button variant="outline" onClick={() => { setPage(1); fetchSubjects(); }} className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">Search</Button>
            </div>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
                <p className="ml-4 text-white/60">Loading subjects...</p>
              </div>
            )}
            {error && <div className="flex items-center justify-center p-8 text-red-400"><AlertCircle className="h-8 w-8" /><p className="ml-4">{error}</p></div>}
            {!isLoading && !error && (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#f5c16c]/10">
                    <TableHead className="text-white/60">Code</TableHead>
                    <TableHead className="text-white/60">Name</TableHead>
                    <TableHead className="text-white/60 text-center">Credits</TableHead>
                    <TableHead className="text-white/60">Last Updated</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} className="border-[#f5c16c]/10 hover:bg-[#f5c16c]/5">
                      <TableCell className="font-mono text-[#f5c16c]">{subject.subjectCode}</TableCell>
                      <TableCell className="font-medium text-white">{subject.subjectName}</TableCell>
                      <TableCell className="text-center text-white/70">{subject.credits}</TableCell>
                      <TableCell className="text-white/50">{new Date(subject.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
                          <Link href={`/admin/content/subjects/${subject.id}/edit`}>Edit Content</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="border-[#f5c16c]/20 text-white hover:bg-[#f5c16c]/10 disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-white/50">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="border-[#f5c16c]/20 text-white hover:bg-[#f5c16c]/10 disabled:opacity-50">
                  Next <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
