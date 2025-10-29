"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AIGeneratorPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3000);
  };

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
            <h1 className="text-2xl font-bold text-amber-100">Arcane Content Forge</h1>
            <p className="text-sm text-amber-700">Conjure quest updates with mystical AI</p>
          </div>
        </div>

        {/* Configuration Form - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Summoning Configuration</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="game" className="text-sm text-amber-600">Target Quest</Label>
              <Input
                id="game"
                defaultValue="Agile Quest"
                className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200 placeholder:text-amber-700"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newChapters" className="text-sm text-amber-600">New Chapters</Label>
                <Input
                  id="newChapters"
                  type="number"
                  defaultValue="2"
                  className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modifiedChapters" className="text-sm text-amber-600">Modified Chapters</Label>
                <Input
                  id="modifiedChapters"
                  type="number"
                  defaultValue="3"
                  className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm text-amber-600">Challenge Intensity (%)</Label>
              <Input
                id="difficulty"
                type="number"
                defaultValue="10"
                className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-amber-600">Content Scrolls</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Chapters", "Challenges", "Quizzes"].map((type) => (
                  <div key={type} className="flex items-center gap-2 rounded-lg border border-amber-900/30 bg-amber-950/20 p-3">
                    <input type="checkbox" id={type} defaultChecked className="h-4 w-4 accent-amber-600" />
                    <Label htmlFor={type} className="text-sm text-amber-200 cursor-pointer">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || generated}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-purple-50 shadow-lg shadow-purple-900/50 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Channeling Arcane Powers...
                </>
              ) : generated ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Content Manifested
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summon Content with Arcane AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generation Results - RPG styled */}
        {generated && (
          <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
            <CardHeader className="relative border-b border-amber-900/20">
              <CardTitle className="text-amber-100">Conjured Content Preview</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4 pt-6">
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                <h3 className="text-sm font-semibold text-amber-200">Chapter 11: DevOps Integration</h3>
                <p className="mt-2 text-xs text-amber-600">
                  New chapter covering CI/CD pipelines, Docker containerization, and deployment automation...
                </p>
              </div>
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                <h3 className="text-sm font-semibold text-amber-200">Chapter 12: Remote Collaboration</h3>
                <p className="mt-2 text-xs text-amber-600">
                  New chapter on agile remote workflows, version control best practices, and team communication...
                </p>
              </div>
              <div className="rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                <h3 className="text-sm font-semibold text-amber-200">15 New Challenges Forged</h3>
                <p className="mt-2 text-xs text-amber-600">
                  Coding trials aligned with learning objectives, graded difficulty progression...
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-emerald-50 shadow-lg shadow-emerald-900/50">
                  Seal & Publish
                </Button>
                <Button variant="outline" className="flex-1 border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
                  Manual Adjustments
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
