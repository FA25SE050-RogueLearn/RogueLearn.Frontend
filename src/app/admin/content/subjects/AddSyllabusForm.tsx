// roguelearn-web/src/app/admin/content/subjects/AddSyllabusForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import adminContentApi from "@/api/adminContentApi";

interface AddSyllabusFormProps {
  subjectId: string;
  onSuccess: () => void;
}

export function AddSyllabusForm({ subjectId, onSuccess }: AddSyllabusFormProps) {
  const [versionNumber, setVersionNumber] = useState(1);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate that content is valid JSON before submitting
      JSON.parse(content);

      await adminContentApi.createSyllabusVersion({
        subjectId,
        versionNumber,
        effectiveDate,
        content,
        isActive,
      });
      onSuccess();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON in content. Please ensure the content is a valid JSON object.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to create syllabus version.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="versionNumber" className="text-amber-300">Version Number</Label>
          <Input
            id="versionNumber"
            type="number"
            value={versionNumber}
            onChange={(e) => setVersionNumber(parseInt(e.target.value, 10))}
            className="bg-amber-950/20 border-amber-800/50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="effectiveDate" className="text-amber-300">Effective Date</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="bg-amber-950/20 border-amber-800/50"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content" className="text-amber-300">Syllabus Content (JSON)</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='{ "courseDescription": "...", "weeklySchedule": [...] }'
          className="min-h-[200px] font-mono text-sm bg-amber-950/20 border-amber-800/50"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="isActive" className="text-amber-300">Set as Active</Label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-300 bg-red-950/50 border border-red-800/50 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating..." : "Create Syllabus Version"}
        </Button>
      </div>
    </form>
  );
}