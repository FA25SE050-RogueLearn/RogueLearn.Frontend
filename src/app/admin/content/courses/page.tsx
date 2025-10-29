"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, CheckCircle, AlertCircle, Download } from "lucide-react";
import Link from "next/link";

const mockCourseData = [
  { code: "PRJ301", name: "Java Web Application Development", version: "v3.2", status: "update-available", updated: "2 days ago" },
  { code: "SWP391", name: "Software Development Project", version: "v2.8", status: "synced", updated: "1 week ago" },
  { code: "SWE201c", name: "Introduction to Software Engineering", version: "v1.5", status: "synced", updated: "2 weeks ago" },
  { code: "PRN211", name: "Basic Cross-Platform Application Programming With .NET", version: "v3.0", status: "update-available", updated: "3 days ago" },
];

const syncLog = [
  { action: "Imported PRJ301 v3.2", result: "12 weeks, 10 topics, 15 learning objectives parsed", time: "2 days ago" },
  { action: "Synced FAP Data", result: "157 courses updated, 3 new courses added", time: "2 days ago" },
  { action: "Flagged Agile Quest", result: "Game needs update for PRJ301 v3.2", time: "2 days ago" },
];

export default function CourseDataPage() {
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
            <h1 className="text-2xl font-bold text-amber-100">Tome Data Sync</h1>
            <p className="text-sm text-amber-700">FAP & FLM Integration</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-50 shadow-lg shadow-amber-900/50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Tomes Now
          </Button>
        </div>

        {/* Course List - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Tome Catalog</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-6">
            {mockCourseData.map((course) => (
              <div
                key={course.code}
                className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-200">{course.code} - {course.name}</h3>
                  <p className="text-xs text-amber-700">Version {course.version} • Updated {course.updated}</p>
                </div>
                <div className="flex items-center gap-3">
                  {course.status === "update-available" ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                      <Button size="sm" className="bg-amber-900/30 border border-amber-700/50 text-amber-300 hover:bg-amber-800/40">
                        <Download className="mr-2 h-3 w-3" />
                        Import Scroll
                      </Button>
                    </>
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sync Log - RPG styled */}
        <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-5 pointer-events-none" />
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Sync Activity Chronicles</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-6">
            {syncLog.map((log, index) => (
              <div key={index} className="rounded-lg border border-amber-900/30 bg-gradient-to-r from-amber-950/30 to-transparent p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-200">{log.action}</p>
                    <p className="mt-1 text-xs text-amber-600">{log.result}</p>
                  </div>
                  <span className="text-xs text-amber-800">{log.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
