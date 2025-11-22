"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    ChevronLeft,
    Save,
    AlertCircle,
    CheckCircle,
    Code2,
    Loader2,
} from "lucide-react";
import adminContentApi from "@/api/adminContentApi";
import { SyllabusContent } from "@/types/subjects";

export default function EditSubjectPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [content, setContent] = useState<SyllabusContent | null>(null);
    const [jsonText, setJsonText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("json");

    useEffect(() => {
        fetchSubjectContent();
    }, [subjectId]);

    const fetchSubjectContent = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminContentApi.getSubjectContent(subjectId);

            if (response.isSuccess && response.data) {
                setContent(response.data);
                setJsonText(JSON.stringify(response.data, null, 2));
            } else {
                setError("Failed to load subject content");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleJsonChange = (newJson: string) => {
        setJsonText(newJson);
        try {
            const parsed = JSON.parse(newJson) as SyllabusContent;
            setContent(parsed);
            setError(null);
        } catch (err) {
            setError("Invalid JSON format");
        }
    };

    const handleSave = async () => {
        if (!content) return;

        try {
            setIsSaving(true);
            setError(null);

            const response = await adminContentApi.updateSubjectContent(subjectId, content);

            if (response.isSuccess) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError("Failed to save content");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
                        <p className="text-amber-600">Loading subject content...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm" className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
                        <Link href="/admin/content/subjects" className="flex items-center gap-2">
                            <ChevronLeft className="h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-amber-100">Edit Subject Content</h1>
                        <p className="text-sm text-amber-700">Manage syllabus JSON content</p>
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <Card className="border-rose-900/30 bg-rose-950/30">
                        <CardContent className="pt-6 flex items-center gap-3 text-rose-400">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                )}

                {success && (
                    <Card className="border-emerald-900/30 bg-emerald-950/30">
                        <CardContent className="pt-6 flex items-center gap-3 text-emerald-400">
                            <CheckCircle className="h-5 w-5" />
                            <p>Content saved successfully!</p>
                        </CardContent>
                    </Card>
                )}

                {/* Editor */}
                <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
                    <CardHeader className="relative border-b border-amber-900/20">
                        <CardTitle className="text-amber-100">Syllabus Content Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="relative pt-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-amber-950/30">
                                <TabsTrigger value="json" className="flex items-center gap-2">
                                    <Code2 className="h-4 w-4" />
                                    JSON Editor
                                </TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>

                            <TabsContent value="json" className="space-y-4 mt-4">
                                <Textarea
                                    value={jsonText}
                                    onChange={(e) => handleJsonChange(e.target.value)}
                                    placeholder='{ "courseDescription": "...", "sessionSchedule": [...] }'
                                    className="min-h-[600px] font-mono text-sm bg-amber-950/20 border-amber-800/50"
                                />
                                <p className="text-xs text-amber-600">
                                    Edit the JSON directly. Changes preview in real-time. Save when ready.
                                </p>
                            </TabsContent>

                            <TabsContent value="preview" className="space-y-4 mt-4">
                                {content ? (
                                    <div className="space-y-6 text-amber-100">
                                        {content.courseDescription && (
                                            <div>
                                                <h3 className="font-semibold text-amber-200 mb-2">Course Description</h3>
                                                <p className="text-sm text-amber-200">{content.courseDescription}</p>
                                            </div>
                                        )}

                                        {content.courseLearningOutcomes && content.courseLearningOutcomes.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-amber-200 mb-2">Learning Outcomes</h3>
                                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                                    {content.courseLearningOutcomes.map((clo) => (
                                                        <li key={clo.id} className="text-amber-200">
                                                            {clo.details}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {content.sessionSchedule && content.sessionSchedule.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-amber-200 mb-2">
                                                    Sessions ({content.sessionSchedule.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {content.sessionSchedule.slice(0, 5).map((session) => (
                                                        <div
                                                            key={session.sessionNumber}
                                                            className="p-3 rounded border border-amber-800/30 bg-amber-950/20"
                                                        >
                                                            <p className="text-sm font-semibold">
                                                                Week {session.sessionNumber}: {session.topic}
                                                            </p>
                                                            {session.activities && session.activities.length > 0 && (
                                                                <p className="text-xs text-amber-700 mt-1">
                                                                    Activities: {session.activities.join(", ")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {content.assessments && content.assessments.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-amber-200 mb-2">Assessments</h3>
                                                <div className="space-y-2">
                                                    {content.assessments.map((assessment, idx) => (
                                                        <p key={idx} className="text-sm text-amber-200">
                                                            {assessment.type}: {assessment.weightPercentage}%
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-amber-600">No content to preview</p>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Save Button */}
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-amber-900/20">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !content}
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                            >
                                {isSaving ? (
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

                {/* JSON Schema Reference */}
                <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
                    <CardHeader className="relative border-b border-amber-900/20">
                        <CardTitle className="text-amber-100">Content Structure Reference</CardTitle>
                    </CardHeader>
                    <CardContent className="relative pt-6">
                        <Textarea
                            value={JSON.stringify(
                                {
                                    courseDescription: "Course overview",
                                    courseLearningOutcomes: [
                                        { id: "clo1", details: "Learning outcome" },
                                    ],
                                    sessionSchedule: [
                                        {
                                            sessionNumber: 1,
                                            topic: "Introduction",
                                            activities: ["Lecture", "Discussion"],
                                            readings: ["Chapter 1"],
                                            constructiveQuestions: [],
                                            mappedSkills: ["Skill 1"],
                                        },
                                    ],
                                    assessments: [
                                        {
                                            type: "Quiz",
                                            weightPercentage: 20,
                                            description: "Weekly quizzes",
                                        },
                                    ],
                                } as SyllabusContent,
                                null,
                                2
                            )}
                            readOnly
                            className="min-h-[300px] font-mono text-xs bg-amber-950/20 border-amber-800/50"
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
