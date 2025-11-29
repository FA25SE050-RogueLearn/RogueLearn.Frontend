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
  const [pageSize, setPageSize] = useState(10);
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
      } else {
        throw new Error("Failed to fetch subjects from the server.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [page, pageSize]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
            <Link href="/admin/content" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Subject Catalog</h1>
            <p className="text-sm text-amber-700">Manage all subjects and their syllabus content</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Master Subject List</CardTitle>
          </CardHeader>
          <CardContent className="relative pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by Code or Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchSubjects(); } }}
                className="flex-1 bg-black/20 border-amber-900/30 text-sm"
              />
              <Button variant="outline" onClick={() => { setPage(1); fetchSubjects(); }} className="border-amber-700/50 text-amber-300">Search</Button>
            </div>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="ml-4 text-amber-600">Loading subjects...</p>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center p-8 text-red-400">
                <AlertCircle className="h-8 w-8" />
                <p className="ml-4">{error}</p>
              </div>
            )}
            {!isLoading && !error && (
              <Table>
                <TableHeader>
                  <TableRow className="border-amber-900/30 hover:bg-transparent">
                    <TableHead className="text-amber-300">Code</TableHead>
                    <TableHead className="text-amber-300">Name</TableHead>
                    <TableHead className="text-amber-300 text-center">Credits</TableHead>
                    <TableHead className="text-amber-300">Last Updated</TableHead>
                    <TableHead className="text-amber-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} className="border-amber-900/20 hover:bg-amber-950/20">
                      <TableCell className="font-mono text-amber-400">{subject.subjectCode}</TableCell>
                      <TableCell className="font-medium text-amber-100">{subject.subjectName}</TableCell>
                      <TableCell className="text-center text-amber-300">{subject.credits}</TableCell>
                      <TableCell className="text-amber-700">{new Date(subject.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-blue-700/50 bg-blue-950/30 text-blue-300 hover:bg-blue-900/50"
                        >
                          <Link href={`/admin/content/subjects/${subject.id}/edit`}>
                            Edit Content
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-amber-300">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
