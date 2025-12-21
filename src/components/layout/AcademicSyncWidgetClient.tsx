// roguelearn-web/src/components/layout/AcademicSyncWidgetClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useUserFullInfo } from "@/hooks/queries/useUserData";
import { AcademicSyncWidget } from "@/components/quests/AcademicSyncWidget";

export function AcademicSyncWidgetClient() {
    const { data: fullInfo, isLoading } = useUserFullInfo();

    const [hasGrades, setHasGrades] = useState(false);
    const [gpa, setGpa] = useState<number | null>(null);
    const [lastSynced, setLastSynced] = useState<string | null>(null);

    useEffect(() => {
        if (fullInfo) {
            const hasAnyGrades = fullInfo.relations?.studentTermSubjects?.some(s => s.grade) || false;
            const enrollment = fullInfo.relations?.studentEnrollments?.[0];
            // Note: GPA and lastSynced are not directly available in FullUserInfo,
            // this is a placeholder. A dedicated status endpoint might be better.
            // For now, we'll use enrollment update time as a proxy for sync time.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasGrades(hasAnyGrades);
            if (enrollment) {
                // A proper GPA field would be ideal. Placeholder logic.
                // setGpa(some_gpa_field); 
            }
        }
    }, [fullInfo]);

    if (isLoading) {
        return null; // Don't show anything while loading user info
    }

    return (
        <AcademicSyncWidget
            hasAnyGrades={hasGrades}
            currentGpa={gpa}
            lastSyncedAt={lastSynced}
        />
    );
}