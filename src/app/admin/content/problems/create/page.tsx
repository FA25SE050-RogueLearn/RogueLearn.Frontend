"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { CreateProblemForm } from "@/components/admin/problems/CreateProblemForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateProblemPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#beaca3]/30 text-[#2c2f33] hover:bg-[#beaca3]/20">
            <Link href="/admin/content/problems" className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back to Problems</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#2c2f33]">Create New Problem</h1>
            <p className="text-sm text-[#2c2f33]/60">Create a new coding problem</p>
          </div>
        </div>
        <CreateProblemForm />
      </div>
    </AdminLayout>
  );
}
