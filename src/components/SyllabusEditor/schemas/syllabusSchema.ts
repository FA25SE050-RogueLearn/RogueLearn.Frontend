import { z } from "zod";

// Match your actual API structure
export const syllabusSchema = z.object({
  courseDescription: z
    .string()
    .min(10, "Course description must be at least 10 characters")
    .describe("Comprehensive overview of the course"),

  courseLearningOutcomes: z
    .array(
      z.object({
        id: z.string().min(1, "ID is required"),
        details: z.string().min(5, "Learning outcome must be detailed"),
      })
    )
    .min(1, "At least one learning outcome is required"),

  sessionSchedule: z
    .array(
      z.object({
        sessionNumber: z
          .number()
          .int("Session number must be a whole number")
          .min(1, "Session number must be at least 1"),
        topic: z.string().min(3, "Topic is required"),
        readings: z.array(z.string()),
        activities: z.array(z.string()),    
        suggestedUrl: z.string().optional(),
      })
    )
    .min(1, "At least one session is required"),

  constructiveQuestions: z
    .array(
      z.object({
        name: z.string().min(1, "Question name/ID is required"),
        question: z.string().min(5, "Question text is required"),
        sessionNumber: z.number().int().min(1, "Valid session number required"),
      })
    )
    .default([]),

  assessments: z
    .array(
      z.object({
        type: z.enum(["Quiz", "Midterm", "Final", "Project", "Assignment"]),
        weightPercentage: z
          .number()
          .min(0, "Weight must be at least 0")
          .max(100, "Weight must be at most 100"),
        description: z.string().min(5, "Description required"),
      })
    )
    .default([])
    .refine(
      (assessments) => {
        if (assessments.length === 0) return true; // Allow empty
        const total = assessments.reduce(
          (sum, a) => sum + a.weightPercentage,
          0
        );
        return total === 100;
      },
      {
        message: "Assessment weights must total 100% (or leave empty)",
        path: ["_root"],
      }
    ),
});

export type SyllabusFormData = z.infer<typeof syllabusSchema>;

// Transform API data to form data
export function transformApiToForm(raw: any): SyllabusFormData {
  return {
    courseDescription: raw?.courseDescription || "",

    courseLearningOutcomes: (raw?.courseLearningOutcomes || []).map(
      (lo: any) => ({
        id: lo?.id || "",
        details: lo?.details || "",
      })
    ),

    sessionSchedule: (raw?.sessionSchedule || []).map((s: any) => ({
      sessionNumber: Number(s?.sessionNumber) || 0,
      topic: s?.topic || "",
      readings: Array.isArray(s?.readings) ? s.readings : [],
      activities: Array.isArray(s?.activities) ? s.activities : [],
      suggestedUrl: s?.suggestedUrl || "",
    })),

    constructiveQuestions: (raw?.constructiveQuestions || []).map(
      (cq: any) => ({
        name: cq?.name || cq?.id || "",
        question: cq?.question || cq?.text || "",
        sessionNumber: Number(cq?.sessionNumber) || 0,
      })
    ),

    assessments: (raw?.assessments || []).map((a: any) => ({
      type: a?.type || "Quiz",
      weightPercentage: Number(a?.weightPercentage) || 0,
      description: a?.description || "",
    })),
  };
}

// Transform form data back to API format
export function transformFormToApi(data: SyllabusFormData): any {
  return {
    courseDescription: data.courseDescription,
    courseLearningOutcomes: data.courseLearningOutcomes,
    sessionSchedule: data.sessionSchedule,
    constructiveQuestions: data.constructiveQuestions,
    assessments: data.assessments,
  };
}