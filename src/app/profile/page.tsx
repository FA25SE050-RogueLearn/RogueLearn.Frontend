// src/app/profile/page.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { createServerApiClients } from "@/lib/api-server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const { coreApiClient } = await createServerApiClients();

    let userProfile = null;

    try {
        // Fetch user profile from your API
        const response = await coreApiClient.get("/api/profiles/me");
        userProfile = response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            // User not authenticated
            redirect("/login");
        }
        console.error("Failed to fetch profile:", error);
    }

    return (
        <DashboardLayout>
            <ProfileClient initialProfile={userProfile} />
        </DashboardLayout>
    );
}