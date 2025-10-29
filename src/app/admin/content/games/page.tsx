"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

const mockGames = [
  {
    id: "agile-quest",
    name: "Agile Quest",
    version: "v2.1",
    linkedCourse: "PRJ301 v3.1",
    lastUpdated: "30 days ago",
    matchPercentage: 80,
    status: "outdated",
    newTopics: 2,
    modifiedTopics: 3
  },
  {
    id: "algorithm-adventure",
    name: "Algorithm Adventure",
    version: "v1.8",
    linkedCourse: "DSA v2.5",
    lastUpdated: "15 days ago",
    matchPercentage: 95,
    status: "current",
    newTopics: 0,
    modifiedTopics: 1
  },
  {
    id: "database-dungeon",
    name: "Database Dungeon",
    version: "v3.0",
    linkedCourse: "DBI202 v4.1",
    lastUpdated: "7 days ago",
    matchPercentage: 100,
    status: "current",
    newTopics: 0,
    modifiedTopics: 0
  },
];

export default function GameLibraryPage() {
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
            <h1 className="text-2xl font-bold text-amber-100">Quest Library</h1>
            <p className="text-sm text-amber-700">Curriculum Mapping & Version Control</p>
          </div>
        </div>

        {/* Game List - RPG styled */}
        <div className="grid gap-6">
          {mockGames.map((game) => (
            <Card
              key={game.id}
              className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
              <CardHeader className="relative border-b border-amber-900/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-amber-100">{game.name}</CardTitle>
                    <p className="text-sm text-amber-700">
                      {game.version} • Linked to {game.linkedCourse}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs border ${
                        game.status === "current"
                          ? "bg-emerald-950/50 text-emerald-400 border-emerald-700/30"
                          : "bg-amber-950/50 text-amber-400 border-amber-700/30"
                      }`}
                    >
                      {game.status}
                    </span>
                    <span className="text-xs text-amber-800">Updated {game.lastUpdated}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                    <p className="text-xs text-amber-700">Match Percentage</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-amber-200">{game.matchPercentage}%</span>
                      {game.matchPercentage < 90 && (
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                    <p className="text-xs text-amber-700">New Topics</p>
                    <p className="mt-2 text-2xl font-bold text-amber-200">{game.newTopics}</p>
                  </div>
                  <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                    <p className="text-xs text-amber-700">Modified Topics</p>
                    <p className="mt-2 text-2xl font-bold text-amber-200">{game.modifiedTopics}</p>
                  </div>
                </div>

                {game.status === "outdated" && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      asChild
                      className="flex-1 bg-amber-900/30 border border-amber-700/50 text-amber-300 hover:bg-amber-800/40"
                    >
                      <Link href={`/admin/content/games/${game.id}/compare`}>
                        View Topic Comparison
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-emerald-50 shadow-lg shadow-emerald-900/50"
                    >
                      <Link href={`/admin/content/ai-generator?game=${game.id}`}>
                        Generate with Arcane AI
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
