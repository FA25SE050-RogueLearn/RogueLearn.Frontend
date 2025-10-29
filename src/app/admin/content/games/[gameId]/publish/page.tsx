"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Rocket, Users, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GameUpdatePublisherPage({ params }: PageProps) {
  const { gameId } = use(params);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 2000);
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
            <Link href="/admin/content/games" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Publish Quest Update</h1>
            <p className="text-sm text-amber-700">Agile Quest v2.2 - Staged Deployment</p>
          </div>
        </div>

        {/* Release Configuration - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Release Enchantment</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="version" className="text-sm text-amber-600">Version</Label>
              <Input
                id="version"
                defaultValue="v2.2"
                className="rounded-lg border-amber-900/30 bg-amber-950/20 text-amber-200 placeholder:text-amber-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm text-amber-600">Release Chronicles</Label>
              <textarea
                id="notes"
                rows={4}
                defaultValue="Added 2 new chapters: DevOps Integration & Remote Collaboration. Updated 3 existing chapters with expanded learning outcomes. Enhanced 10% difficulty across all challenges."
                className="w-full rounded-lg border border-amber-900/30 bg-amber-950/20 p-3 text-sm text-amber-200 focus:border-amber-700 focus:outline-none placeholder:text-amber-700"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-amber-600">Staged Rollout</Label>
              <div className="grid gap-3">
                {[
                  { stage: "Phase 1", percentage: "10%", duration: "Day 1-2" },
                  { stage: "Phase 2", percentage: "50%", duration: "Day 3-4" },
                  { stage: "Phase 3", percentage: "100%", duration: "Day 5-7" },
                ].map((phase) => (
                  <div key={phase.stage} className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                    <span className="text-sm font-semibold text-amber-200">{phase.stage}</span>
                    <div className="flex items-center gap-4 text-xs text-amber-700">
                      <span>{phase.percentage} of adventurers</span>
                      <span>{phase.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePublish}
              disabled={publishing || published}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-emerald-50 shadow-lg shadow-emerald-900/50 disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <Rocket className="mr-2 h-4 w-4 animate-bounce" />
                  Deploying Update...
                </>
              ) : published ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Deployed
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Release Quest Update
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Deployment Metrics - RPG styled */}
        {published && (
          <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
            <CardHeader className="relative border-b border-amber-900/20">
              <CardTitle className="text-amber-100">Phase 1 Deployment Chronicles</CardTitle>
            </CardHeader>
            <CardContent className="relative pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Adventurers Reached</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-amber-200">45 / 300</p>
                  <p className="text-xs text-amber-700">First 10% cohort</p>
                </div>
                <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Satisfaction</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">4.6 / 5</p>
                  <p className="text-xs text-amber-700">Based on 12 ratings</p>
                </div>
                <div className="rounded-lg border border-amber-900/30 bg-gradient-to-br from-amber-950/30 to-transparent p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Error Rate</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">0%</p>
                  <p className="text-xs text-amber-700">No curses detected</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-emerald-950/50 border border-emerald-700/30 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-400">
                  ✓ Phase 1 triumphant - Ready for Phase 2 deployment
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
