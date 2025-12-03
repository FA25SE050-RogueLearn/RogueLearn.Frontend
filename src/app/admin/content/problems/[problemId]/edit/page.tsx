"use client";

import { useState, useEffect, use, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2, Plus, Minus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import eventServiceApi from "@/api/eventServiceApi";
import type { Tag, UpdateProblemRequest } from "@/types/event-service";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ problemId: string }>;
}

export default function EditProblemPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchProblem = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventServiceApi.getProblem(resolvedParams.problemId);
      if (response.success && response.data) {
        const problem = response.data;
        setTitle(problem.title);
        setProblemStatement(problem.problem_statement);
        setDifficulty(problem.difficulty);
        setSelectedTags(problem.tags?.map(t => t.id) || []);
      } else {
        toast.error("Failed to load problem");
        router.push("/admin/content/problems");
      }
    } catch {
      toast.error("Error loading problem");
      router.push("/admin/content/problems");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.problemId, router]);

  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const response = await eventServiceApi.getAllTags();
      if (response.success && response.data) {
        setAvailableTags(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      console.error("Error fetching tags");
    } finally {
      setLoadingTags(false);
    }
  }, []);

  useEffect(() => {
    fetchProblem();
    fetchTags();
  }, [fetchProblem, fetchTags]);

  const handleAddTag = () => {
    setSelectedTags([...selectedTags, ""]);
  };

  const handleRemoveTag = (index: number) => {
    setSelectedTags(selectedTags.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, value: string) => {
    if (selectedTags.includes(value) && selectedTags[index] !== value) {
      toast.error("Tag already selected");
      return;
    }
    const newTags = [...selectedTags];
    newTags[index] = value;
    setSelectedTags(newTags);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!problemStatement.trim()) {
      toast.error("Problem statement is required");
      return;
    }

    const validTags = selectedTags.filter(t => t.trim());

    const payload: UpdateProblemRequest = {
      title: title.trim(),
      problem_statement: problemStatement.trim(),
      difficulty,
      tag_ids: validTags,
    };

    setSubmitting(true);
    try {
      const response = await eventServiceApi.updateProblem(resolvedParams.problemId, payload);
      if (response.success) {
        toast.success("Problem updated successfully");
        router.push("/admin/content/problems");
      } else {
        toast.error(response.error?.message || "Failed to update problem");
      }
    } catch {
      toast.error("Error updating problem");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#f5c16c]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
            <Link href="/admin/content/problems" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#f5c16c]">Edit Problem</h1>
            <p className="text-sm text-white/60">Update problem details and tags</p>
          </div>
        </div>

        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10">
            <CardTitle className="text-[#f5c16c]">Problem Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Two Sum"
                className="bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemStatement" className="text-white">Problem Statement *</Label>
              <Textarea
                id="problemStatement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the problem..."
                className="min-h-[200px] bg-[#0a0506] border-[#f5c16c]/20 text-white placeholder:text-white/40 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Difficulty *</Label>
              <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(parseInt(value))}>
                <SelectTrigger className="bg-[#0a0506] border-[#f5c16c]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1410] border-[#f5c16c]/20">
                  <SelectItem value="1" className="text-white">Easy</SelectItem>
                  <SelectItem value="2" className="text-white">Medium</SelectItem>
                  <SelectItem value="3" className="text-white">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">
                  Tags {loadingTags && <span className="text-xs text-white/50">(Loading...)</span>}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={loadingTags || availableTags.length === 0}
                  className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {selectedTags.map((tagId, index) => (
                  <div key={index} className="flex gap-2">
                    <Select value={tagId} onValueChange={(value) => handleTagChange(index, value)}>
                      <SelectTrigger className="bg-[#0a0506] border-[#f5c16c]/20 text-white">
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1410] border-[#f5c16c]/20">
                        {availableTags.map((tag) => {
                          const isAlreadySelected = selectedTags.includes(tag.id) && selectedTags[index] !== tag.id;
                          if (isAlreadySelected) return null;
                          return (
                            <SelectItem key={tag.id} value={tag.id} className="text-white">
                              {tag.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTag(index)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {selectedTags.length === 0 && (
                  <p className="text-xs italic text-white/50">Click + to add tags</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#f5c16c]/10">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/content/problems")}
                className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-[#0a0506]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
