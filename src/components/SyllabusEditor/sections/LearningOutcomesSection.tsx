// roguelearn-web/src/components/SyllabusEditor/sections/LearningOutcomesSection.tsx
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
    form: UseFormReturn<SyllabusFormData>;
}

export function LearningOutcomesSection({ form }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "courseLearningOutcomes",
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-amber-100 mb-2">
                    Learning Outcomes
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                    Define what students should be able to do after completing the course.
                </p>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <Card
                        key={field.id}
                        className="border-amber-900/30 bg-amber-950/20"
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <FormField
                                        control={form.control}
                                        name={`courseLearningOutcomes.${index}.details`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">
                                                    Learning Outcome {index + 1}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Students will understand fundamental database concepts"
                                                        className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-rose-400" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="border-rose-900/30 text-rose-400 hover:bg-rose-950/20 mt-8"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button
                type="button"
                onClick={() => append({ id: Date.now().toString(), details: "" })}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Learning Outcome
            </Button>
        </div>
    );
}