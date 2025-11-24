// roguelearn-web/src/components/SyllabusEditor/sections/AssessmentsSection.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SyllabusFormData } from "../schemas/syllabusSchema";

interface Props {
    form: UseFormReturn<SyllabusFormData>;
}

export function AssessmentsSection({ form }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "assessments",
    });

    const currentTotalWeight = form.watch("assessments").reduce((sum, a) => sum + (Number(a.weightPercentage) || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-amber-100">
                        Assessments
                    </h3>
                    <div className={`text-sm font-bold px-3 py-1 rounded ${currentTotalWeight === 100 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'}`}>
                        Total Weight: {currentTotalWeight}%
                    </div>
                </div>
                <p className="text-sm text-amber-700 mb-4">
                    Define how student performance will be evaluated. Weights must total 100%.
                </p>
                {form.formState.errors.assessments?.root && (
                    <p className="text-rose-400 text-sm mb-4">{form.formState.errors.assessments.root.message}</p>
                )}
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <Card
                        key={field.id}
                        className="border-amber-900/30 bg-amber-950/20"
                    >
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                {/* Type Selection */}
                                <div className="md:col-span-3">
                                    <FormField
                                        control={form.control}
                                        name={`assessments.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-amber-950/20 border-amber-800/50 text-amber-100">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#1a0a08] border-amber-900/30">
                                                        {["Quiz", "Midterm", "Final", "Project", "Assignment"].map((t) => (
                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-rose-400" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Weight */}
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`assessments.${index}.weightPercentage`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">Weight %</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-rose-400" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name={`assessments.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">Description</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Multiple choice questions"
                                                        className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-rose-400" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="md:col-span-1 flex justify-end mt-8">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-rose-400 hover:bg-rose-950/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Button
                type="button"
                onClick={() => append({ type: "Quiz", weightPercentage: 0, description: "" })}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Assessment
            </Button>
        </div>
    );
}