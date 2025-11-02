// src/app/onboarding/layout.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}