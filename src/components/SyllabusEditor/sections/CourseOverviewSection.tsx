"use client";

import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { SyllabusFormData } from "../schemas/syllabusSchema";

interface Props {
    form: UseFormReturn<SyllabusFormData, any>;
}

export function CourseOverviewSection({ form }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-amber-100 mb-2">
                    Course Overview
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                    Provide a comprehensive description of the course objectives and content.
                </p>
            </div>

            <FormField
                control={form.control}
                name="courseDescription"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-amber-200">Course Description</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Enter a detailed course description..."
                                className="min-h-[150px] bg-amber-950/20 border-amber-800/50 text-amber-100 placeholder-amber-700/50"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription className="text-amber-700">
                            Include course objectives, scope, and key topics covered.
                        </FormDescription>
                        <FormMessage className="text-rose-400" />
                    </FormItem>
                )}
            />
        </div>
    );
}