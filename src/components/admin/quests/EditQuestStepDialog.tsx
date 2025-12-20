"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  BrainCircuit,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import questApi, {
  AdminQuestStepDto,
  QuestStepActivityPayload,
  QuestionPayload,
} from "@/api/questApi";
import { cn } from "@/lib/utils";

interface QuestSkillInfo {
  skillId: string;
  skillName: string;
  domain: string;
  relevanceWeight: number;
}

interface EditQuestStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  step: AdminQuestStepDto | null;
  questId?: string;
  onSaved: () => void;
}

type ActivityType = "Reading" | "KnowledgeCheck" | "Quiz";

interface ActivityFormData {
  activityId: string;
  type: ActivityType;
  skillId: string;
  payload: {
    experiencePoints: number;
    url?: string;
    articleTitle?: string;
    summary?: string;
    questions?: QuestionPayload[];
  };
  isExpanded: boolean;
}

// Helper to get property value regardless of casing (camelCase or PascalCase)
const get = (obj: any, ...keys: string[]) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    if (obj[pascalKey] !== undefined) return obj[pascalKey];
  }
  return undefined;
};

export function EditQuestStepDialog({
  isOpen,
  onClose,
  step,
  questId,
  onSaved,
}: EditQuestStepDialogProps) {
  const [activities, setActivities] = useState<ActivityFormData[]>([]);
  const [skills, setSkills] = useState<QuestSkillInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Reset activities when dialog opens with step data
  useEffect(() => {
    if (isOpen && step) {
      console.log("[EditQuestStepDialog] Loading step content:", step.content);
      
      const activitiesArray = get(step.content, 'activities') || [];
      const existingActivities: ActivityFormData[] = activitiesArray.map((a: any, idx: number) => {
        const payload = get(a, 'payload') || {};
        const activityType = get(a, 'type') || "Reading";
        
        console.log(`[EditQuestStepDialog] Activity ${idx}:`, { 
          rawType: a.type, 
          resolvedType: activityType,
          skillId: get(a, 'skillId'),
          payload 
        });
        
        return {
          activityId: get(a, 'activityId') || crypto.randomUUID(),
          type: activityType as ActivityType,
          skillId: get(a, 'skillId') || "",
          payload: {
            experiencePoints: get(payload, 'experiencePoints') || 0,
            url: get(payload, 'url') || "",
            articleTitle: get(payload, 'articleTitle') || "",
            summary: get(payload, 'summary') || "",
            questions: (get(payload, 'questions') || []).map((q: any) => ({
              question: get(q, 'question') || "",
              options: get(q, 'options') || ["", "", "", ""],
              answer: get(q, 'answer') || "",
              explanation: get(q, 'explanation') || "",
            })),
          },
          isExpanded: idx === 0,
        };
      });
      setActivities(existingActivities);
    } else if (!isOpen) {
      // Clear state when dialog closes
      setActivities([]);
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (isOpen && questId) {
      loadSkills();
    }
  }, [isOpen, questId]);

  const loadSkills = async () => {
    if (!questId) return;
    setLoadingSkills(true);
    try {
      const res = await questApi.getQuestSkills(questId);
      if (res.isSuccess && res.data) {
        setSkills(res.data.skills || []);
      }
    } catch {
      toast.error("Failed to load skills");
    } finally {
      setLoadingSkills(false);
    }
  };

  const addActivity = (type: ActivityType) => {
    const newActivity: ActivityFormData = {
      activityId: crypto.randomUUID(),
      type,
      skillId: skills.length > 0 ? skills[0].skillId : "",
      payload: {
        experiencePoints: type === "Reading" ? 15 : type === "KnowledgeCheck" ? 30 : 50,
        url: "",
        articleTitle: "",
        summary: "",
        questions: type !== "Reading" ? [createEmptyQuestion()] : [],
      },
      isExpanded: true,
    };
    setActivities([...activities, newActivity]);
  };

  const createEmptyQuestion = (): QuestionPayload => ({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
  });

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, updates: Partial<ActivityFormData>) => {
    setActivities(
      activities.map((a, i) => (i === index ? { ...a, ...updates } : a))
    );
  };

  const updatePayload = (
    index: number,
    payloadUpdates: Partial<ActivityFormData["payload"]>
  ) => {
    setActivities(
      activities.map((a, i) =>
        i === index
          ? { ...a, payload: { ...a.payload, ...payloadUpdates } }
          : a
      )
    );
  };

  const updateQuestion = (
    activityIndex: number,
    questionIndex: number,
    updates: Partial<QuestionPayload>
  ) => {
    const activity = activities[activityIndex];
    const questions = [...(activity.payload.questions || [])];
    questions[questionIndex] = { ...questions[questionIndex], ...updates };
    updatePayload(activityIndex, { questions });
  };

  const addQuestion = (activityIndex: number) => {
    const activity = activities[activityIndex];
    const questions = [...(activity.payload.questions || []), createEmptyQuestion()];
    updatePayload(activityIndex, { questions });
  };

  const removeQuestion = (activityIndex: number, questionIndex: number) => {
    const activity = activities[activityIndex];
    const questions = (activity.payload.questions || []).filter(
      (_, i) => i !== questionIndex
    );
    updatePayload(activityIndex, { questions });
  };

  const updateQuestionOption = (
    activityIndex: number,
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const activity = activities[activityIndex];
    const questions = [...(activity.payload.questions || [])];
    const options = [...questions[questionIndex].options];
    options[optionIndex] = value;
    questions[questionIndex] = { ...questions[questionIndex], options };
    updatePayload(activityIndex, { questions });
  };

  const toggleExpanded = (index: number) => {
    updateActivity(index, { isExpanded: !activities[index].isExpanded });
  };

  const handleSave = async () => {
    if (!step) return;

    const validationErrors: string[] = [];
    activities.forEach((a, i) => {
      if (!a.skillId) {
        validationErrors.push(`Activity ${i + 1}: Skill is required`);
      }
      if (a.payload.experiencePoints <= 0) {
        validationErrors.push(`Activity ${i + 1}: XP must be greater than 0`);
      }
      if (a.type === "Reading") {
        if (!a.payload.url) {
          validationErrors.push(`Activity ${i + 1}: URL is required for Reading`);
        }
        if (!a.payload.articleTitle) {
          validationErrors.push(`Activity ${i + 1}: Article title is required`);
        }
      }
      if (a.type === "KnowledgeCheck" || a.type === "Quiz") {
        if (!a.payload.questions || a.payload.questions.length === 0) {
          validationErrors.push(`Activity ${i + 1}: At least one question is required`);
        }
        a.payload.questions?.forEach((q, qIdx) => {
          if (!q.question) {
            validationErrors.push(`Activity ${i + 1}, Q${qIdx + 1}: Question text is required`);
          }
          if (q.options.filter((o) => o.trim()).length < 2) {
            validationErrors.push(`Activity ${i + 1}, Q${qIdx + 1}: At least 2 options required`);
          }
          if (!q.answer) {
            validationErrors.push(`Activity ${i + 1}, Q${qIdx + 1}: Answer is required`);
          }
        });
      }
    });

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setSaving(true);
    try {
      const payload: QuestStepActivityPayload[] = activities.map((a) => ({
        activityId: a.activityId,
        type: a.type,
        skillId: a.skillId,
        payload:
          a.type === "Reading"
            ? {
                experiencePoints: Number(a.payload.experiencePoints),
                url: a.payload.url || "",
                articleTitle: a.payload.articleTitle || "",
                summary: a.payload.summary || "",
              }
            : {
                experiencePoints: Number(a.payload.experiencePoints),
                questions: a.payload.questions || [],
              },
      }));

      console.log("[EditQuestStepDialog] Saving payload:", JSON.stringify(payload, null, 2));
      const res = await questApi.adminUpdateQuestStepContent(step.id, payload);
      console.log("[EditQuestStepDialog] Save response:", res);
      if (res.isSuccess) {
        toast.success("Quest step content updated successfully");
        onSaved();
        onClose();
      } else {
        toast.error(res.message || "Failed to update quest step");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update quest step");
    } finally {
      setSaving(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "Reading":
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case "KnowledgeCheck":
        return <CheckCircle className="w-4 h-4 text-amber-400" />;
      case "Quiz":
        return <BrainCircuit className="w-4 h-4 text-purple-400" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "Reading":
        return "border-blue-500/30 bg-blue-500/5";
      case "KnowledgeCheck":
        return "border-amber-500/30 bg-amber-500/5";
      case "Quiz":
        return "border-purple-500/30 bg-purple-500/5";
    }
  };

  if (!step) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            Edit Week {step.stepNumber} Activities
            <Badge className="bg-[#7289da]/20 text-[#7289da] border-[#7289da]/30">
              {step.difficultyVariant}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {step.title} - Manage learning activities for this step
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">
              {activities.length} activit{activities.length === 1 ? "y" : "ies"}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addActivity("Reading")}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <BookOpen className="w-3 h-3 mr-1" /> Reading
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addActivity("KnowledgeCheck")}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Knowledge Check
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addActivity("Quiz")}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <BrainCircuit className="w-3 h-3 mr-1" /> Quiz
              </Button>
            </div>
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
              <p className="text-white/40 mb-4">No activities yet</p>
              <p className="text-white/30 text-sm">
                Click the buttons above to add activities
              </p>
            </div>
          )}

          <div className="space-y-4">
            {activities.map((activity, activityIndex) => (
              <Card
                key={activity.activityId}
                className={cn("border overflow-hidden", getActivityColor(activity.type))}
              >
                <CardHeader
                  className="py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpanded(activityIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-white/30" />
                      {getActivityIcon(activity.type)}
                      <span className="text-white font-medium">{activity.type}</span>
                      <span className="text-white/40 text-sm">
                        +{activity.payload.experiencePoints} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeActivity(activityIndex);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {activity.isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {activity.isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70">Skill *</Label>
                        <Select
                          value={activity.skillId}
                          onValueChange={(v) =>
                            updateActivity(activityIndex, { skillId: v })
                          }
                        >
                          <SelectTrigger className="border-[#f5c16c]/30 bg-[#0a0506]">
                            <SelectValue placeholder="Select skill" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1410] border-[#f5c16c]/30">
                            {loadingSkills ? (
                              <div className="p-2 text-center">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                              </div>
                            ) : (
                              skills.map((skill) => (
                                <SelectItem key={skill.skillId} value={skill.skillId}>
                                  {skill.skillName}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Experience Points *</Label>
                        <Input
                          type="number"
                          min={1}
                          value={activity.payload.experiencePoints}
                          onChange={(e) =>
                            updatePayload(activityIndex, {
                              experiencePoints: parseInt(e.target.value) || 0,
                            })
                          }
                          className="border-[#f5c16c]/30 bg-[#0a0506]"
                        />
                      </div>
                    </div>

                    {activity.type === "Reading" && (
                      <ReadingActivityForm
                        payload={activity.payload}
                        onUpdate={(updates) => updatePayload(activityIndex, updates)}
                      />
                    )}

                    {(activity.type === "KnowledgeCheck" ||
                      activity.type === "Quiz") && (
                      <QuestionsForm
                        questions={activity.payload.questions || []}
                        onUpdateQuestion={(qIdx, updates) =>
                          updateQuestion(activityIndex, qIdx, updates)
                        }
                        onUpdateOption={(qIdx, oIdx, value) =>
                          updateQuestionOption(activityIndex, qIdx, oIdx, value)
                        }
                        onAddQuestion={() => addQuestion(activityIndex)}
                        onRemoveQuestion={(qIdx) =>
                          removeQuestion(activityIndex, qIdx)
                        }
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#f5c16c]/30 text-white/70 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReadingActivityForm({
  payload,
  onUpdate,
}: {
  payload: ActivityFormData["payload"];
  onUpdate: (updates: Partial<ActivityFormData["payload"]>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white/70">Article Title *</Label>
        <Input
          value={payload.articleTitle || ""}
          onChange={(e) => onUpdate({ articleTitle: e.target.value })}
          placeholder="e.g., Introduction to Computer Architecture"
          className="border-[#f5c16c]/30 bg-[#0a0506]"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/70">URL *</Label>
        <Input
          value={payload.url || ""}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://example.com/article"
          className="border-[#f5c16c]/30 bg-[#0a0506]"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/70">Summary</Label>
        <Textarea
          value={payload.summary || ""}
          onChange={(e) => onUpdate({ summary: e.target.value })}
          placeholder="Brief description of what the article covers..."
          className="border-[#f5c16c]/30 bg-[#0a0506] min-h-[80px] resize-none"
        />
      </div>
    </div>
  );
}

function QuestionsForm({
  questions,
  onUpdateQuestion,
  onUpdateOption,
  onAddQuestion,
  onRemoveQuestion,
}: {
  questions: QuestionPayload[];
  onUpdateQuestion: (qIdx: number, updates: Partial<QuestionPayload>) => void;
  onUpdateOption: (qIdx: number, oIdx: number, value: string) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (qIdx: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white/70">Questions ({questions.length})</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={onAddQuestion}
          className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Question
        </Button>
      </div>

      {questions.map((q, qIdx) => (
        <Card
          key={qIdx}
          className="bg-black/20 border-white/10"
        >
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Label className="text-white/60 text-xs">Question {qIdx + 1} *</Label>
                <Input
                  value={q.question}
                  onChange={(e) =>
                    onUpdateQuestion(qIdx, { question: e.target.value })
                  }
                  placeholder="Enter your question..."
                  className="border-[#f5c16c]/30 bg-[#0a0506]"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveQuestion(qIdx)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 mt-6"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Options *</Label>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <Input
                    key={oIdx}
                    value={opt}
                    onChange={(e) => onUpdateOption(qIdx, oIdx, e.target.value)}
                    placeholder={`Option ${oIdx + 1}`}
                    className={cn(
                      "border-[#f5c16c]/30 bg-[#0a0506]",
                      opt === q.answer && opt && "border-emerald-500/50"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Correct Answer *</Label>
              <Select
                value={q.answer}
                onValueChange={(v) => onUpdateQuestion(qIdx, { answer: v })}
              >
                <SelectTrigger className="border-[#f5c16c]/30 bg-[#0a0506]">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1410] border-[#f5c16c]/30">
                  {q.options
                    .filter((opt) => opt.trim())
                    .map((opt, oIdx) => (
                      <SelectItem key={oIdx} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Explanation</Label>
              <Textarea
                value={q.explanation}
                onChange={(e) =>
                  onUpdateQuestion(qIdx, { explanation: e.target.value })
                }
                placeholder="Explain why this is the correct answer..."
                className="border-[#f5c16c]/30 bg-[#0a0506] min-h-[60px] resize-none"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-4 border border-dashed border-white/20 rounded-lg">
          <p className="text-white/40 text-sm">No questions yet. Click &quot;Add Question&quot; above.</p>
        </div>
      )}
    </div>
  );
}

export default EditQuestStepDialog;
