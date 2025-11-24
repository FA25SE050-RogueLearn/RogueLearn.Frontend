// roguelearn-web/src/app/admin/content/courses/page.tsx
"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, RefreshCw, CheckCircle, AlertCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
// MODIFIED: Import the new API object and the complete CurriculumProgram type
import adminContentApi from "@/api/adminContentApi";
import curriculumImportApi from "@/api/curriculumImportApi";
import { CurriculumProgramDto } from "@/types/curriculum-programs";

// A smaller type for what the UI component needs to display
interface ProgramDisplayData extends CurriculumProgramDto {
  version?: string;
  status?: 'synced' | 'update-available';
  updated?: string;
}

export default function CourseDataPage() {
  const [courseData, setCourseData] = useState<ProgramDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rawText, setRawText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setImportStatus(null);
    setImportError(null);
    
    try {
      // MODIFIED: Calling the new, structured API service
      const response = await adminContentApi.getCurriculumPrograms();
      if (response.isSuccess && response.data) {
          const displayData = response.data.map(p => ({
              ...p,
              version: 'v1.0',
              status: 'synced' as const,
              updated: new Date(p.updatedAt).toLocaleDateString(),
          }));
          setCourseData(displayData);
      } else {
        // This case is unlikely if the promise rejects, but good for type safety
        setImportError("Failed to load curriculum catalog.");
        setCourseData([]);
      }
    } catch (error: any) {
        console.error("Failed to fetch curriculum programs:", error);
        setImportError(error.response?.data?.message || "An unexpected error occurred while fetching.");
        setCourseData([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleImport = async (importer: (text: string) => Promise<any>) => {
    setImportStatus("Importing... This may take a moment.");
    setImportError(null);
    try {
      const response = await importer(rawText);
      setImportStatus(`Import successful! Refreshing catalog...`);
      setRawText("");
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
          <Button asChild variant="outline" size="sm" className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
            <Link href="/admin/content" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Tome Data Sync</h1>
            <p className="text-sm text-amber-700">Curriculum & Subject Importer</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Import New Scroll</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-6">
            <div>
                <Label htmlFor="rawText" className="text-sm text-amber-600">Paste Raw Text Content</Label>
                <Textarea
                    id="rawText"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the raw HTML or text from FLM or a single subject document here..."
                    className="mt-2 h-40 rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200 placeholder:text-amber-700"
                />
            </div>
            {importStatus && <p className="text-emerald-400">{importStatus}</p>}
            {importError && <p className="text-red-400">{importError}</p>}
            <div className="flex gap-4">
                <Button onClick={() => handleImport((text) => curriculumImportApi.importCurriculum({ rawText: text }))} disabled={!rawText || !!importStatus}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Import Full Curriculum
                </Button>
                <Button onClick={() => handleImport((text) => curriculumImportApi.importSubjectFromText({ rawText: text }))} disabled={!rawText || !!importStatus} variant="secondary">
                    <UploadCloud className="mr-2 h-4 w-4" /> Import Single Subject
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20 flex flex-row items-center justify-between">
            <CardTitle className="text-amber-100">Existing Tome Catalog</CardTitle>
            <Button onClick={fetchPrograms} size="sm" variant="outline" className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-6">
            {isLoading ? <p className="text-center text-amber-700">Loading catalog...</p> : 
            courseData.length > 0 ? courseData.map((course) => (
              <div key={course.id} className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-200">{course.programCode} - {course.programName}</h3>
                  <p className="text-xs text-amber-700">Version {course.version} • Updated {course.updated}</p>
                </div>
                <div className="flex items-center gap-3">
                  {course.status === "update-available" ? <AlertCircle className="h-5 w-5 text-amber-400" /> : <CheckCircle className="h-5 w-5 text-emerald-400" />}
                </div>
              </div>
            )) : (
              <p className="text-center text-amber-700">No curriculum programs have been imported yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}