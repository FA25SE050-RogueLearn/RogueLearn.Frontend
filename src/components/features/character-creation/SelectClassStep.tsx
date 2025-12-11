// roguelearn-web/src/components/features/character-creation/SelectClassStep.tsx
import { useState } from "react";
import { CareerClass } from "@/types/onboarding";
import { SpecializationSubjectEntry } from "@/types/admin-management";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Loader2, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import adminManagementApi from "@/api/adminManagementApi";
import { toast } from "sonner";

interface SelectClassStepProps {
    classes: CareerClass[];
    selectedClass: CareerClass | null;
    onSelectClass: (cls: CareerClass) => void;
    onNext: () => void;
    onBack: () => void;
}

// NOTE: Mock data for tags, as this is not yet in the API response.
const classTags: Record<string, string[]> = {
    "ASP.NET Core Roadmap": ["Backend", "C#", "Microservices"],
    "React Roadmap": ["Frontend", "TypeScript", "Web Apps"],
    "DevOps Roadmap": ["CI/CD", "Infrastructure", "Cloud"],
};

/**
 * The second step in character creation: selecting a career class (specialization).
 * Restyled to match the new design.
 */
export function SelectClassStep({ classes, selectedClass, onSelectClass, onNext, onBack }: SelectClassStepProps) {
    const [subjectsClass, setSubjectsClass] = useState<CareerClass | null>(null);
    const [subjects, setSubjects] = useState<SpecializationSubjectEntry[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const handleViewSubjects = async (cls: CareerClass) => {
        setSubjectsClass(cls);
        setLoadingSubjects(true);
        setSubjects([]);
        try {
            const res = await adminManagementApi.getClassSpecialization(cls.id);
            if (res.isSuccess && res.data) {
                setSubjects(res.data);
            } else {
                toast.error(res.message || 'Failed to load focused subjects');
            }
        } catch {
            toast.error('Failed to load focused subjects');
        } finally {
            setLoadingSubjects(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 h-full flex flex-col">
            <div className="text-left mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold font-heading text-white">Select Your Class</h1>
                <p className="mt-2 text-foreground/70 font-body text-sm">
                    Your Class represents your career specialization. It will add supplementary quests to bridge the gap between academia and industry.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            onClick={() => onSelectClass(cls)}
                            className={cn(
                                "group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300",
                                selectedClass?.id === cls.id
                                    ? "border-accent shadow-[0_0_30px_rgba(210,49,135,0.5)]"
                                    : "border-white/10 hover:border-accent/50 hover:-translate-y-1"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-80 group-hover:opacity-100" />
                            <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Class Codex</p>
                                        {selectedClass?.id === cls.id && (
                                            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Selected</span>
                                        )}
                                    </div>
                                    <h3 className="mt-2 text-xl font-semibold text-white">{cls.name}</h3>
                                    <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{cls.description || "A powerful specialization for the modern adventurer."}</p>
                                </div>
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {(classTags[cls.name] || []).map(tag => (
                                            <span key={tag} className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-0.5 text-[10px] text-amber-200">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewSubjects(cls);
                                            }}
                                            className="flex items-center gap-1.5 py-1.5 px-3 rounded-md 
                                                bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium
                                                hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
                                        >
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            View Focused Subjects
                                        </button>
                                        <span className="flex items-center text-xs font-semibold text-accent transition group-hover:translate-x-1">
                                            SELECT <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 flex justify-between flex-shrink-0 border-t border-white/5">
                <Button size="lg" variant="outline" onClick={onBack} className="h-10 rounded-full px-6 text-xs uppercase tracking-[0.3em]">
                    Back
                </Button>
                <Button size="lg" onClick={onNext} disabled={!selectedClass} className="h-10 rounded-full bg-accent px-6 text-xs uppercase tracking-[0.3em] text-accent-foreground hover:bg-accent/90">
                    Continue
                </Button>
            </div>

            {/* Focused Subjects Modal */}
            <AnimatePresence>
                {subjectsClass && (
                    <Dialog open={!!subjectsClass} onOpenChange={() => setSubjectsClass(null)}>
                        <DialogContent className="w-[95vw] max-w-3xl h-[80vh] max-h-[600px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col">
                            <DialogHeader className="space-y-3 pb-4 border-b border-white/10 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            Focused Subjects
                                        </DialogTitle>
                                        <p className="text-sm text-foreground/60 mt-1">
                                            Subjects emphasized in <span className="text-amber-300 font-medium">{subjectsClass.name}</span>
                                        </p>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/40 min-h-0">
                                {loadingSubjects ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                                        <span className="text-sm text-foreground/60">Loading subjects...</span>
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                                        <p className="text-base text-foreground/50">No focused subjects defined for this class yet.</p>
                                        <p className="text-sm text-foreground/40 mt-1">This class may use general curriculum subjects.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {subjects.map((subject, index) => (
                                            <motion.div
                                                key={subject.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/[0.07] transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-5 h-5 text-amber-400/70" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                                            <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 text-xs font-bold rounded">
                                                                {subject.subjectCode || subject.placeholderSubjectCode || 'TBD'}
                                                            </span>
                                                            {subject.semester > 0 && (
                                                                <span className="px-2 py-0.5 bg-white/10 text-foreground/60 text-xs rounded">
                                                                    Semester {subject.semester}
                                                                </span>
                                                            )}
                                                            {subject.isRequired && (
                                                                <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-xs rounded">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-sm md:text-base font-medium text-white leading-snug">
                                                            {subject.subjectName || subject.placeholderSubjectCode || 'Subject Pending'}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 flex-shrink-0">
                                <Button
                                    onClick={() => {
                                        onSelectClass(subjectsClass);
                                        setSubjectsClass(null);
                                    }}
                                    disabled={selectedClass?.id === subjectsClass.id}
                                    className="flex-1 bg-amber-500 text-black hover:bg-amber-400 h-11 text-sm md:text-base font-semibold"
                                >
                                    {selectedClass?.id === subjectsClass.id ? 'Already Selected' : 'Select This Class'}
                                </Button>
                                <Button
                                    onClick={() => setSubjectsClass(null)}
                                    variant="outline"
                                    className="sm:w-auto w-full px-6 h-11 text-sm md:text-base border-white/10 hover:bg-white/5"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}