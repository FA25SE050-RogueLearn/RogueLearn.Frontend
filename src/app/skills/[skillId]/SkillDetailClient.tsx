// roguelearn-web/src/app/skills/[skillId]/SkillDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import { SkillDetailCard } from "@/components/skills/SkillDetailCard";
import skillsApi from "@/api/skillsApi";
import { SkillDetailDto } from "@/types/skill-details";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SkillDetailClient({ skillId }: { skillId: string }) {
    const [skill, setSkill] = useState<SkillDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!skillId) return;

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await skillsApi.getSkillDetail(skillId);
                if (response.isSuccess && response.data) {
                    setSkill(response.data);
                } else {
                    setError("Failed to load skill details.");
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [skillId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-[#f5c16c]" />
                    <p className="text-white/60">Consulting the archives...</p>
                </div>
            </div>
        );
    }

    if (error || !skill) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Skill Not Found</h1>
                <p className="text-white/60">{error || "This skill node appears to be missing from the constellation."}</p>
                <Link href="/skills">
                    <Button variant="outline" className="mt-4 border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Skill Tree
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <SkillDetailCard skill={skill} />
        </div>
    );
}