// roguelearn-web/src/app/skills/[skillId]/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SkillDetailClient } from "./SkillDetailClient";

interface PageProps {
    params: Promise<{ skillId: string }>;
}

export default async function SkillDetailPage({ params }: PageProps) {
    // Await the params object in Next.js 15+
    const { skillId } = await params;

    return (
        <DashboardLayout>
            <SkillDetailClient skillId={skillId} />
        </DashboardLayout>
    );
}