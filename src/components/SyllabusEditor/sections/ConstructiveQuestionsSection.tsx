"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SyllabusFormData } from "../schemas/syllabusSchema";

interface Props {
    form: UseFormReturn<SyllabusFormData, any>;
}

export function ConstructiveQuestionsSection({ form }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "constructiveQuestions",
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-amber-100 mb-2">
                    Constructive Questions
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                    Add discussion questions linked to specific sessions.
                </p>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <Card
                        key={field.id}
                        className="border-amber-900/30 bg-amber-950/20"
                    >
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Question Name/ID */}
                                <FormField
                                    control={form.control}
                                    name={`constructiveQuestions.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-amber-200">
                                                Question ID/Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., CQ1.1, Q1, Question-1"
                                                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-amber-700">
                                                Unique identifier for this question
                                            </FormDescription>
                                            <FormMessage className="text-rose-400" />
                                        </FormItem>
                                    )}
                                />

                                {/* Question Text */}
                                <FormField
                                    control={form.control}
                                    name={`constructiveQuestions.${index}.question`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-amber-200">Question</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., What is computer architecture? What is computer organization?"
                                                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-amber-700">
                                                The question text for discussion
                                            </FormDescription>
                                            <FormMessage className="text-rose-400" />
                                        </FormItem>
                                    )}
                                />

                                {/* Session Number */}
                                <FormField
                                    control={form.control}
                                    name={`constructiveQuestions.${index}.sessionNumber`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-amber-200">
                                                Session Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="1"
                                                    className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value ? Number(value) : "");
                                                    }}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-amber-700">
                                                Which session this question belongs to
                                            </FormDescription>
                                            <FormMessage className="text-rose-400" />
                                        </FormItem>
                                    )}
                                />

                                {/* Remove Button */}
                                <div className="flex justify-end pt-4 border-t border-amber-800/30">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="border-rose-900/30 text-rose-400 hover:bg-rose-950/20"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Question
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Question Button */}
            <Button
                type="button"
                onClick={() =>
                    append({
                        name: `CQ${fields.length + 1}.1`,
                        question: "",
                        sessionNumber: 1,
                    })
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Constructive Question
            </Button>
        </div>
    );
}