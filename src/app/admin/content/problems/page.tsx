import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Database, Plus } from "lucide-react";
import Link from "next/link";

const mockProblems = [
  { id: 1, title: "Spring Boot REST API", category: "Spring Boot", difficulty: "Intermediate", used: 15 },
  { id: 2, title: "Binary Search Tree", category: "Algorithms", difficulty: "Advanced", used: 22 },
  { id: 3, title: "SQL Join Operations", category: "Database", difficulty: "Beginner", used: 8 },
  { id: 4, title: "Singleton Pattern", category: "Design Patterns", difficulty: "Intermediate", used: 6 },
];

export default function ProblemBankPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* RPG-styled Header */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30 hover:text-amber-200"
          >
            <Link href="/admin/content" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Challenge Arsenal</h1>
            <p className="text-sm text-amber-700">Trials & Coding Exercises</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50 shadow-lg shadow-amber-900/50">
            <Plus className="mr-2 h-4 w-4" />
            Forge Challenge
          </Button>
        </div>

        {/* Problem List - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Available Trials</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-6">
            {mockProblems.map((problem) => (
              <div
                key={problem.id}
                className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-950/50 to-amber-900/30 border border-amber-800/30">
                    <Database className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">{problem.title}</h3>
                    <p className="text-xs text-amber-700">
                      {problem.category} • {problem.difficulty}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-amber-800">Used in {problem.used} quests</span>
                  <Button size="sm" variant="outline" className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
