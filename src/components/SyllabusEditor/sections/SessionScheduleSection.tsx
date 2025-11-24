"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Plus, Trash2, ChevronDown } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SyllabusFormData } from "../schemas/syllabusSchema";

interface Props {
    form: UseFormReturn<SyllabusFormData, any>;
}

export function SessionScheduleSection({ form }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "sessionSchedule",
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-amber-100 mb-2">
                    Session Schedule
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                    Outline weekly topics, activities, and learning resources.
                </p>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <Card
                        key={field.id}
                        className="border-amber-900/30 bg-amber-950/20"
                    >
                        <Collapsible>
                            <CardHeader className="py-3">
                                <CollapsibleTrigger className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-semibold text-amber-900">
                                            {index + 1}
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`sessionSchedule.${index}.topic`}
                                            render={({ field: topicField }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., Chapter 1: Introduction - Organization and Architecture"
                                                            className="border-0 bg-transparent text-amber-100 placeholder-amber-700/50 font-semibold"
                                                            {...topicField}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-amber-600 transition-transform" />
                                </CollapsibleTrigger>
                            </CardHeader>

                            <CollapsibleContent>
                                <CardContent className="space-y-4 pt-0">
                                    {/* Session Number */}
                                    <FormField
                                        control={form.control}
                                        name={`sessionSchedule.${index}.sessionNumber`}
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
                                                    Week or session number
                                                </FormDescription>
                                                <FormMessage className="text-rose-400" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Readings */}
                                    <FormField
                                        control={form.control}
                                        name={`sessionSchedule.${index}.readings`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">
                                                    Readings (comma-separated)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Text Book, Slide, Chapter 1-3"
                                                        className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                        value={field.value?.join(", ") || ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    .split(",")
                                                                    .map((a) => a.trim())
                                                                    .filter(Boolean)
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-amber-700">
                                                    Readings for this session
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Activities */}
                                    <FormField
                                        control={form.control}
                                        name={`sessionSchedule.${index}.activities`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">
                                                    Activities (comma-separated)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Read chapter 1, Use chatGPT to distinguish concepts"
                                                        className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                        value={field.value?.join(", ") || ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    .split(",")
                                                                    .map((a) => a.trim())
                                                                    .filter(Boolean)
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-amber-700">
                                                    Activities for students to complete
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Suggested URL */}
                                    <FormField
                                        control={form.control}
                                        name={`sessionSchedule.${index}.suggestedUrl`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200">
                                                    Suggested URL (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://example.com/resource"
                                                        className="bg-amber-950/20 border-amber-800/50 text-amber-100"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-amber-700">
                                                    Optional link to external resource
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Remove Session Button */}
                                    <div className="flex justify-end pt-4 border-t border-amber-800/30">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="border-rose-900/30 text-rose-400 hover:bg-rose-950/20"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove Session
                                        </Button>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                ))}
            </div>

            {/* Add Session Button */}
            <Button
                type="button"
                onClick={() =>
                    append({
                        sessionNumber: fields.length + 1,
                        topic: "",
                        readings: [],
                        activities: [],
                        suggestedUrl: "",
                    })
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Session
            </Button>
        </div>
    );
}