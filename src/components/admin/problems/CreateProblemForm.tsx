"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Minus,
  Loader2,
  Code,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import eventServiceApi from "@/api/eventServiceApi";
import type {
  Tag,
  CreateProblemRequest,
  ProblemLanguageDetail,
  ProblemTestCase,
  CreateProblemResponse
} from "@/types/event-service";

const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-embroidery.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.05,
};

const CARD_CLASS = "relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]";

// Available programming languages (these IDs should match your backend)
// NOTE: If language IDs are incorrect, they should be fetched from GET /languages endpoint
const AVAILABLE_LANGUAGES = [
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Golang", file_extension: "go" },
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Python", file_extension: "py" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Javascript", file_extension: "js" },
];

// Helper function to unescape common escape sequences
const unescapeText = (text: string): string => {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
};

export function CreateProblemForm() {
  const [submitting, setSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [validationResults, setValidationResults] = useState<CreateProblemResponse | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [languageDetails, setLanguageDetails] = useState<ProblemLanguageDetail[]>([
    {
      language_id: AVAILABLE_LANGUAGES[0].id,
      solution_stub: "",
      driver_code: "",
      time_constraint_ms: 1000,
      space_constraint_mb: 128,
      test_cases: [
        { input: "", expected_output: "", is_hidden: false }
      ],
      solution_code: ""
    }
  ]);

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await eventServiceApi.getAllTags();
        if (response.success && response.data) {
          const tagsData = Array.isArray(response.data) ? response.data : [];
          setAvailableTags(tagsData);
        } else {
          toast.error("Failed to load tags");
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

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

  const handleAddLanguage = () => {
    // Find next unused language
    const usedLanguages = languageDetails.map(ld => ld.language_id);
    const availableLanguage = AVAILABLE_LANGUAGES.find(lang => !usedLanguages.includes(lang.id));

    if (!availableLanguage) {
      toast.error("All languages have been added");
      return;
    }

    setLanguageDetails([
      ...languageDetails,
      {
        language_id: availableLanguage.id,
        solution_stub: "",
        driver_code: "",
        time_constraint_ms: 1000,
        space_constraint_mb: 128,
        test_cases: [
          { input: "", expected_output: "", is_hidden: false }
        ],
        solution_code: ""
      }
    ]);
  };

  const handleRemoveLanguage = (index: number) => {
    if (languageDetails.length === 1) {
      toast.error("At least one language is required");
      return;
    }
    setLanguageDetails(languageDetails.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (index: number, field: keyof ProblemLanguageDetail, value: any) => {
    const newDetails = [...languageDetails];
    (newDetails[index] as any)[field] = value;
    setLanguageDetails(newDetails);
  };

  const handleAddTestCase = (langIndex: number) => {
    const newDetails = [...languageDetails];
    newDetails[langIndex].test_cases.push({
      input: "",
      expected_output: "",
      is_hidden: false
    });
    setLanguageDetails(newDetails);
  };

  const handleRemoveTestCase = (langIndex: number, testIndex: number) => {
    const newDetails = [...languageDetails];
    if (newDetails[langIndex].test_cases.length === 1) {
      toast.error("At least one test case is required");
      return;
    }
    newDetails[langIndex].test_cases = newDetails[langIndex].test_cases.filter((_, i) => i !== testIndex);
    setLanguageDetails(newDetails);
  };

  const handleTestCaseChange = (langIndex: number, testIndex: number, field: keyof ProblemTestCase, value: any) => {
    const newDetails = [...languageDetails];
    (newDetails[langIndex].test_cases[testIndex] as any)[field] = value;
    setLanguageDetails(newDetails);
  };

  // Handle paste event to unescape text
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, callback: (value: string) => void) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const unescapedText = unescapeText(pastedText);
    callback(unescapedText);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!problemStatement.trim()) {
      toast.error("Problem statement is required");
      return;
    }
    if (selectedTags.length === 0) {
      toast.error("At least one tag is required");
      return;
    }
    if (selectedTags.some(t => !t.trim())) {
      toast.error("All tags must be selected");
      return;
    }

    // Validate language details
    for (const lang of languageDetails) {
      if (!lang.solution_stub.trim()) {
        toast.error(`Solution stub is required for ${AVAILABLE_LANGUAGES.find(l => l.id === lang.language_id)?.name}`);
        return;
      }
      if (!lang.driver_code.trim()) {
        toast.error(`Driver code is required for ${AVAILABLE_LANGUAGES.find(l => l.id === lang.language_id)?.name}`);
        return;
      }
      if (!lang.solution_code.trim()) {
        toast.error(`Solution code is required for ${AVAILABLE_LANGUAGES.find(l => l.id === lang.language_id)?.name}`);
        return;
      }
      if (lang.test_cases.length === 0) {
        toast.error(`At least one test case is required for ${AVAILABLE_LANGUAGES.find(l => l.id === lang.language_id)?.name}`);
        return;
      }
      for (const testCase of lang.test_cases) {
        if (!testCase.input.trim() || !testCase.expected_output.trim()) {
          toast.error("All test cases must have input and expected output");
          return;
        }
      }
    }

    const payload: CreateProblemRequest = {
      title: title.trim(),
      problem_statement: problemStatement.trim(),
      difficulty: difficulty,
      tag_ids: selectedTags.filter(t => t.trim()),
      language_details: languageDetails
    };

    setSubmitting(true);
    try {
      console.log('📤 Submitting problem:', JSON.stringify(payload, null, 2));
      const response = await eventServiceApi.createProblem(payload);

      if (response.success && response.data) {
        setValidationResults(response.data);
        toast.success("Problem created successfully!", {
          description: `Problem ID: ${response.data.problem_id}`
        });

        // Reset form
        setTitle("");
        setProblemStatement("");
        setDifficulty(1);
        setSelectedTags([]);
        setLanguageDetails([
          {
            language_id: AVAILABLE_LANGUAGES[0].id,
            solution_stub: "",
            driver_code: "",
            time_constraint_ms: 1000,
            space_constraint_mb: 128,
            test_cases: [
              { input: "", expected_output: "", is_hidden: false }
            ],
            solution_code: ""
          }
        ]);
      } else {
        console.error('❌ Problem creation failed:', response.error);
        
        // Check if there are validation results in the error details
        const errorDetails = response.error?.details as any;
        if (errorDetails?.validation_results) {
          // Show validation failure results
          setValidationResults({
            problem_id: "",
            title: title,
            validation_results: errorDetails.validation_results
          });
          
          // Build detailed error message
          const failedLanguages = Object.entries(errorDetails.validation_results)
            .filter(([_, result]: [string, any]) => !result.success)
            .map(([langId, result]: [string, any]) => {
              const langName = getLanguageName(langId);
              return `${langName}: ${result.message}`;
            });
          
          toast.error("Test solution validation failed", {
            description: failedLanguages.join("; ") || response.error?.message || "Validation failed"
          });
        } else {
          toast.error("Failed to create problem", {
            description: response.error?.message || "An error occurred"
          });
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error creating problem:", err);
      toast.error("Error", {
        description: "An unexpected error occurred"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getLanguageName = (langId: string) => {
    return AVAILABLE_LANGUAGES.find(l => l.id === langId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Validation Results */}
      {validationResults && (
        <Card className={CARD_CLASS}>
          <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="flex items-center gap-2 text-amber-100">
              {validationResults.problem_id ? (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Problem Created Successfully
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  Validation Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-6">
            {validationResults.problem_id ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
                <p className="text-sm text-emerald-200">
                  <strong>Problem ID:</strong> {validationResults.problem_id}
                </p>
                <p className="text-sm text-emerald-200">
                  <strong>Title:</strong> {validationResults.title}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4">
                <p className="text-sm text-rose-200">
                  <strong>Title:</strong> {validationResults.title}
                </p>
                <p className="text-sm text-rose-300 mt-2">
                  The problem was not created because the test solution validation failed. Please fix the issues below and try again.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-amber-100">Validation Results</h3>
              {Object.entries(validationResults.validation_results).map(([langId, result]) => (
                <div
                  key={langId}
                  className={`rounded-lg border p-4 ${
                    result.success
                      ? "border-emerald-500/30 bg-emerald-950/20"
                      : "border-rose-500/30 bg-rose-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-semibold ${result.success ? "text-emerald-400" : "text-rose-400"}`}>
                      {getLanguageName(langId)}
                    </h4>
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-400" />
                    )}
                  </div>
                  <p className={`text-xs mb-2 ${result.success ? "text-emerald-300" : "text-rose-300"}`}>
                    {result.message}
                  </p>
                  <p className={`text-xs ${result.success ? "text-emerald-200" : "text-rose-200"}`}>
                    Passed: {result.passed_tests} / {result.total_tests}
                  </p>
                  {result.execution_log && (
                    <details className="mt-2" open={!result.success}>
                      <summary className="cursor-pointer text-xs text-amber-400">Execution Log</summary>
                      <pre className="mt-2 text-[10px] text-white/70 whitespace-pre-wrap bg-black/30 p-2 rounded">
                        {result.execution_log}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card className={CARD_CLASS}>
        <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />

        <CardHeader className="relative border-b border-amber-900/20">
          <CardTitle className="text-amber-100">Problem Details</CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6 pt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-amber-200">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Addition"
                className="border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 focus:border-amber-600 focus:ring-amber-600/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemStatement" className="text-amber-200">Problem Statement *</Label>
              <Textarea
                id="problemStatement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                onPaste={(e) => handlePaste(e, setProblemStatement)}
                placeholder="Describe the problem..."
                className="min-h-[200px] border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 focus:border-amber-600 focus:ring-amber-600/30 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-amber-200">Difficulty *</Label>
              <Select
                value={difficulty.toString()}
                onValueChange={(value) => setDifficulty(parseInt(value))}
              >
                <SelectTrigger className="border-amber-900/30 bg-amber-950/20 text-amber-100 focus:border-amber-600 focus:ring-amber-600/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-amber-900/30 bg-[#1f1812]">
                  <SelectItem value="1" className="text-amber-100 hover:bg-amber-900/30">Easy</SelectItem>
                  <SelectItem value="2" className="text-amber-100 hover:bg-amber-900/30">Medium</SelectItem>
                  <SelectItem value="3" className="text-amber-100 hover:bg-amber-900/30">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-amber-200">Tags * {loadingTags && <span className="text-xs text-amber-700">(Loading...)</span>}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={loadingTags || availableTags.length === 0}
                  className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {selectedTags.map((tagId, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={tagId}
                      onValueChange={(value) => handleTagChange(index, value)}
                    >
                      <SelectTrigger className="border-amber-900/30 bg-amber-950/20 text-amber-100 focus:border-amber-600 focus:ring-amber-600/30">
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent className="border-amber-900/30 bg-[#1f1812]">
                        {availableTags.map((tag) => {
                          const isAlreadySelected = selectedTags.includes(tag.id) && selectedTags[index] !== tag.id;
                          if (isAlreadySelected) return null;
                          return (
                            <SelectItem
                              key={tag.id}
                              value={tag.id}
                              className="text-amber-100 hover:bg-amber-900/30"
                            >
                              {tag.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedTags.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTag(index)}
                        className="border-rose-500/30 bg-transparent text-rose-400 hover:bg-rose-500/10"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {selectedTags.length === 0 && (
                  <p className="text-xs italic text-amber-700">Click + to add tags</p>
                )}
              </div>
            </div>
          </div>

          {/* Language Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-100">
                <Code className="inline h-4 w-4 mr-1" />
                Language Implementations
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLanguage}
                disabled={languageDetails.length >= AVAILABLE_LANGUAGES.length}
                className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Language
              </Button>
            </div>

            {languageDetails.map((langDetail, langIndex) => (
              <Card key={langIndex} className="border-amber-900/30 bg-amber-950/10">
                <CardHeader className="border-b border-amber-900/20">
                  <div className="flex items-center justify-between">
                    <Select
                      value={langDetail.language_id}
                      onValueChange={(value) => handleLanguageChange(langIndex, 'language_id', value)}
                    >
                      <SelectTrigger className="w-[200px] border-amber-900/30 bg-amber-950/20 text-amber-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-amber-900/30 bg-[#1f1812]">
                        {AVAILABLE_LANGUAGES.map((lang) => {
                          const isUsed = languageDetails.some((ld, i) => i !== langIndex && ld.language_id === lang.id);
                          if (isUsed) return null;
                          return (
                            <SelectItem key={lang.id} value={lang.id} className="text-amber-100 hover:bg-amber-900/30">
                              {lang.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {languageDetails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveLanguage(langIndex)}
                        className="border-rose-500/30 bg-transparent text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Constraints */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-amber-300">Time Constraint (ms)</Label>
                      <Input
                        type="number"
                        min="100"
                        step="100"
                        value={langDetail.time_constraint_ms}
                        onChange={(e) => handleLanguageChange(langIndex, 'time_constraint_ms', parseInt(e.target.value) || 1000)}
                        className="border-amber-900/30 bg-amber-950/20 text-amber-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-amber-300">Space Constraint (MB)</Label>
                      <Input
                        type="number"
                        min="64"
                        step="64"
                        value={langDetail.space_constraint_mb}
                        onChange={(e) => handleLanguageChange(langIndex, 'space_constraint_mb', parseInt(e.target.value) || 128)}
                        className="border-amber-900/30 bg-amber-950/20 text-amber-100"
                      />
                    </div>
                  </div>

                  {/* Solution Stub */}
                  <div className="space-y-2">
                    <Label className="text-xs text-amber-300">Solution Stub *</Label>
                    <Textarea
                      value={langDetail.solution_stub}
                      onChange={(e) => handleLanguageChange(langIndex, 'solution_stub', e.target.value)}
                      onPaste={(e) => handlePaste(e, (val) => handleLanguageChange(langIndex, 'solution_stub', val))}
                      placeholder="Enter the function signature that users will complete..."
                      className="min-h-[100px] border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 font-mono text-xs"
                    />
                  </div>

                  {/* Driver Code */}
                  <div className="space-y-2">
                    <Label className="text-xs text-amber-300">Driver Code *</Label>
                    <Textarea
                      value={langDetail.driver_code}
                      onChange={(e) => handleLanguageChange(langIndex, 'driver_code', e.target.value)}
                      onPaste={(e) => handlePaste(e, (val) => handleLanguageChange(langIndex, 'driver_code', val))}
                      placeholder="Enter the driver code that runs the solution..."
                      className="min-h-[150px] border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 font-mono text-xs"
                    />
                  </div>

                  {/* Solution Code */}
                  <div className="space-y-2">
                    <Label className="text-xs text-amber-300">Solution Code * (for validation)</Label>
                    <Textarea
                      value={langDetail.solution_code}
                      onChange={(e) => handleLanguageChange(langIndex, 'solution_code', e.target.value)}
                      onPaste={(e) => handlePaste(e, (val) => handleLanguageChange(langIndex, 'solution_code', val))}
                      placeholder="Enter the correct solution..."
                      className="min-h-[100px] border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 font-mono text-xs"
                    />
                  </div>

                  {/* Test Cases */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-amber-300">Test Cases *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTestCase(langIndex)}
                        className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {langDetail.test_cases.map((testCase, testIndex) => (
                        <div key={testIndex} className="rounded-lg border border-amber-900/20 bg-amber-950/10 p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-300">Test Case {testIndex + 1}</span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 text-xs text-amber-300">
                                <input
                                  type="checkbox"
                                  checked={testCase.is_hidden}
                                  onChange={(e) => handleTestCaseChange(langIndex, testIndex, 'is_hidden', e.target.checked)}
                                  className="rounded border-amber-900/30 bg-amber-950/20"
                                />
                                Hidden
                              </label>
                              {langDetail.test_cases.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveTestCase(langIndex, testIndex)}
                                  className="h-6 w-6 p-0 border-rose-500/30 bg-transparent text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] text-amber-400">Input</Label>
                            <Textarea
                              value={testCase.input}
                              onChange={(e) => handleTestCaseChange(langIndex, testIndex, 'input', e.target.value)}
                              onPaste={(e) => handlePaste(e, (val) => handleTestCaseChange(langIndex, testIndex, 'input', val))}
                              placeholder="Enter test input (use \n for newlines)"
                              className="min-h-[60px] border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 font-mono text-xs"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] text-amber-400">Expected Output</Label>
                            <Textarea
                              value={testCase.expected_output}
                              onChange={(e) => handleTestCaseChange(langIndex, testIndex, 'expected_output', e.target.value)}
                              onPaste={(e) => handlePaste(e, (val) => handleTestCaseChange(langIndex, testIndex, 'expected_output', val))}
                              placeholder="Enter expected output"
                              className="min-h-[60px] border-amber-900/30 bg-amber-950/20 text-amber-100 placeholder:text-amber-700 font-mono text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating & Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Problem
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
