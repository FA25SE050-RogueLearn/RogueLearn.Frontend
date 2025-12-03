"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronLeft, RefreshCw, CheckCircle, AlertCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import adminContentApi from "@/api/adminContentApi";
import curriculumImportApi from "@/api/curriculumImportApi";
import { CurriculumProgramDto } from "@/types/curriculum-programs";

interface ProgramDisplayData extends CurriculumProgramDto {
  version?: string;
  status?: 'synced' | 'update-available';
  updated?: string;
}

export default function CourseDataPage() {
  const [courseData, setCourseData] = useState<ProgramDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rawText, setRawText] = useState("");
  const [semester, setSemester] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setImportStatus(null);
    setImportError(null);
    try {
      const response = await adminContentApi.getCurriculumPrograms();
      if (response.isSuccess && response.data) {
        const displayData = response.data.map(p => ({
          ...p, version: 'v1.0', status: 'synced' as const, updated: new Date(p.updatedAt).toLocaleDateString(),
        }));
        setCourseData(displayData);
      } else { setImportError("Failed to load curriculum catalog."); setCourseData([]); }
    } catch (error: any) {
      setImportError(error.response?.data?.message || "An unexpected error occurred.");
      setCourseData([]);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const handleImportCurriculum = async () => {
    setImportStatus("Importing curriculum... This may take a moment.");
    setImportError(null);
    try {
      await curriculumImportApi.importCurriculum({ rawText });
      setImportStatus(`Import successful! Refreshing catalog...`);
      setRawText("");
      setSemester("");
      setTimeout(() => fetchPrograms(), 2000);
    } catch (error: any) {
      setImportStatus(null);
      setImportError(`Import failed: ${error.response?.data?.message || 'An unexpected error occurred.'}`);
    }
  };

  const handleImportSubject = async () => {
    setImportStatus("Importing subject... This may take a moment.");
    setImportError(null);
    try {
      const semesterValue = semester.trim() ? parseInt(semester, 10) : undefined;
      await curriculumImportApi.importSubjectFromText({ 
        rawText, 
        semester: semesterValue 
      });
      setImportStatus(`Import successful! Refreshing catalog...`);
      setRawText("");
      setSemester("");
      setTimeout(() => fetchPrograms(), 2000);
    } catch (error: any) {
      setImportStatus(null);
      setImportError(`Import failed: ${error.response?.data?.message || 'An unexpected error occurred.'}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
            <Link href="/admin/content" className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#f5c16c]">Curriculum Import</h1>
            <p className="text-sm text-white/60">Curriculum & Subject Importer</p>
          </div>
        </div>

        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10"><CardTitle className="text-[#f5c16c]">Import New Data</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="rawText" className="text-sm text-white/70">Paste Raw Text Content</Label>
              <Textarea id="rawText" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste the raw HTML or text from FLM or a single subject document here..." className="mt-2 h-40 bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40" />
            </div>
            <div className="flex gap-4 items-end">
              <div className="w-32">
                <Label htmlFor="semester" className="text-sm text-white/70">Semester (Optional)</Label>
                <Input 
                  id="semester" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)} 
                  placeholder="e.g., 1" 
                  className="mt-2 bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40" 
                />
              </div>
              <p className="text-xs text-white/50 pb-2">Only used when importing a single subject</p>
            </div>
            {importStatus && <p className="text-emerald-400">{importStatus}</p>}
            {importError && <p className="text-red-400">{importError}</p>}
            <div className="flex gap-4">
              <Button onClick={handleImportCurriculum} disabled={!rawText || !!importStatus} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]">
                <UploadCloud className="mr-2 h-4 w-4" /> Import Full Curriculum
              </Button>
              <Button onClick={handleImportSubject} disabled={!rawText || !!importStatus} variant="outline" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
                <UploadCloud className="mr-2 h-4 w-4" /> Import Single Subject
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10 flex flex-row items-center justify-between">
            <CardTitle className="text-[#f5c16c]">Existing Catalog</CardTitle>
            <Button onClick={fetchPrograms} size="sm" variant="outline" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {isLoading ? <p className="text-center text-white/40">Loading catalog...</p> :
            courseData.length > 0 ? courseData.map((course) => (
              <div key={course.id} className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-[#0a0506] p-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{course.programCode} - {course.programName}</h3>
                  <p className="text-xs text-white/50">Version {course.version} • Updated {course.updated}</p>
                </div>
                <div className="flex items-center gap-3">
                  {course.status === "update-available" ? <AlertCircle className="h-5 w-5 text-[#f5c16c]" /> : <CheckCircle className="h-5 w-5 text-emerald-400" />}
                </div>
              </div>
            )) : <p className="text-center text-white/40">No curriculum programs have been imported yet.</p>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
