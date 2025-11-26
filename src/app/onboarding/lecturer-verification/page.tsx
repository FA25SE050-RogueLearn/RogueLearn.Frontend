import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function LecturerVerificationOnboardingPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="p-4 rounded-full bg-[#f5c16c]/10">📜</div>
        <h2 className="text-2xl font-bold text-white">Lecturer Verification</h2>
        <p className="text-white/60 max-w-md text-center">
          To unlock lecturer capabilities, please submit your verification details.
        </p>
        <a href="/dashboard/lecturer-verification" className="inline-flex items-center rounded-md border border-[#f5c16c]/50 px-4 py-2 text-sm font-semibold text-[#f5c16c] hover:bg-[#f5c16c]/10">
          Open Verification Form
        </a>
      </div>
    </DashboardLayout>
  );
}