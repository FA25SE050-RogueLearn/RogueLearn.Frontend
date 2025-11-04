// roguelearn-web/src/app/admin/content/subjects/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, Loader2, PlusCircle, AlertCircle } from "lucide-react";
import adminContentApi from "@/api/adminContentApi";
import { Subject } from "@/types/curriculum";
import { AddSyllabusForm } from "./AddSyllabusForm";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminContentApi.getSubjects();
      if (response.isSuccess && response.data) {
        setSubjects(response.data);
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
  }, []);

  const handleAddSyllabusClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setSelectedSubject(null);
    // You might want to refresh the subject list or update the specific subject's data here
    // For simplicity, we'll just log it.
    console.log("Syllabus added successfully. Consider refreshing the data.");
  };

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
            <p className="text-sm text-amber-700">Manage all subjects and their syllabus versions</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Master Subject List</CardTitle>
          </CardHeader>
          <CardContent className="relative pt-6">
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
                          variant="outline"
                          size="sm"
                          className="border-emerald-700/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50"
                          onClick={() => handleAddSyllabusClick(subject)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Syllabus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-[#1f1812] to-[#1a1410] border-amber-900/30 text-amber-100">
          <DialogHeader>
            <DialogTitle className="text-amber-100">Add Syllabus for {selectedSubject?.subjectCode}</DialogTitle>
          </DialogHeader>
          {selectedSubject && (
            <AddSyllabusForm subjectId={selectedSubject.id} onSuccess={handleFormSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}