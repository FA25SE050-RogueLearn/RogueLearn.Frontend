"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { syllabusSchema, type SyllabusFormData, transformApiToForm, transformFormToApi } from "@/components/SyllabusEditor/schemas/syllabusSchema";
import { CourseOverviewSection, LearningOutcomesSection, SessionScheduleSection, ConstructiveQuestionsSection, AssessmentsSection } from "@/components/SyllabusEditor/sections";
import adminContentApi from "@/api/adminContentApi";

const DEFAULT_VALUES: SyllabusFormData = { courseDescription: "", courseLearningOutcomes: [], sessionSchedule: [], constructiveQuestions: [], assessments: [] };

export default function ProfessionalEditSubjectPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<SyllabusFormData>({ resolver: zodResolver(syllabusSchema), mode: "onChange", defaultValues: DEFAULT_VALUES });

    useEffect(() => { fetchSubjectContent(); }, [subjectId]);

    const fetchSubjectContent = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminContentApi.getSubjectContent(subjectId);
            if (response.isSuccess && response.data) {
                const formData = transformApiToForm(response.data);
                form.reset(formData);
            } else { setError("Failed to load subject content"); }
        } catch (err: any) { setError(err.message || "An error occurred while loading content"); }
        finally { setIsLoading(false); }
    };

    const handleSave: SubmitHandler<SyllabusFormData> = async (data) => {
        try {
            setIsSaving(true);
            setError(null);
            const apiData = transformFormToApi(data);
            const response = await adminContentApi.updateSubjectContent(subjectId, apiData);
            if (response.isSuccess) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
            else { setError("Failed to save content"); }
        } catch (err: any) { setError(err.message || "An error occurred while saving"); }
        finally { setIsSaving(false); }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-[#7289da]" />
                        <p className="text-[#2c2f33]/60">Loading subject content...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm" className="border-[#beaca3]/30 text-[#2c2f33] hover:bg-[#beaca3]/20">
                            <Link href="/admin/content/subjects" className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back</Link>
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-[#2c2f33]">Edit Course Syllabus</h1>
                            <p className="text-sm text-[#2c2f33]/60">Update course information, learning outcomes, sessions, and assessments</p>
                        </div>
                    </div>

                    {error && (
                        <Card className="border-[#e07a5f]/30 bg-[#e07a5f]/10">
                            <CardContent className="pt-6 flex items-center gap-3 text-[#e07a5f]">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" /><p>{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {success && (
                        <Card className="border-emerald-200 bg-emerald-50">
                            <CardContent className="pt-6 flex items-center gap-3 text-emerald-600">
                                <CheckCircle className="h-5 w-5 flex-shrink-0" /><p>Syllabus saved successfully!</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-[#1a1410] border-[#f5c16c]/30">
                        <CardContent className="pt-6">
                            <Accordion type="single" collapsible defaultValue="overview">
                                <AccordionItem value="overview">
                                    <AccordionTrigger className="text-[#2c2f33] hover:text-[#7289da]"><span className="flex items-center gap-2">Course Overview</span></AccordionTrigger>
                                    <AccordionContent className="pt-6 pb-6"><CourseOverviewSection form={form} /></AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="outcomes">
                                    <AccordionTrigger className="text-[#2c2f33] hover:text-[#7289da]"><span className="flex items-center gap-2">Learning Outcomes</span></AccordionTrigger>
                                    <AccordionContent className="pt-6 pb-6"><LearningOutcomesSection form={form} /></AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="sessions">
                                    <AccordionTrigger className="text-[#2c2f33] hover:text-[#7289da]"><span className="flex items-center gap-2">Session Schedule</span></AccordionTrigger>
                                    <AccordionContent className="pt-6 pb-6"><SessionScheduleSection form={form} /></AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="questions">
                                    <AccordionTrigger className="text-[#2c2f33] hover:text-[#7289da]"><span className="flex items-center gap-2">Discussion Questions</span></AccordionTrigger>
                                    <AccordionContent className="pt-6 pb-6"><ConstructiveQuestionsSection form={form} /></AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="assessments">
                                    <AccordionTrigger className="text-[#2c2f33] hover:text-[#7289da]"><span className="flex items-center gap-2">Assessments</span></AccordionTrigger>
                                    <AccordionContent className="pt-6 pb-6"><AssessmentsSection form={form} /></AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={isSaving || !form.formState.isValid} className="bg-[#7289da] hover:bg-[#7289da]/90 text-white px-6">
                            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Syllabus</>}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </AdminLayout>
    );
}
