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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 hover:text-amber-200"
          >
            <Link href="/admin/content/problems" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Problems
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Forge New Challenge</h1>
            <p className="text-sm text-amber-700">Create a new coding problem</p>
          </div>
        </div>

        {/* Create Problem Form */}
        <CreateProblemForm />
      </div>
    </AdminLayout>
  );
}
