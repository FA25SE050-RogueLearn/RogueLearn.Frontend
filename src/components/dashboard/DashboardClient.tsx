// roguelearn-web/src/components/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Sword, Lightbulb, GraduationCap, ScrollText, Users, Shield, BookOpen, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { RightColumn } from "@/components/dashboard/RightColumn";
import { useUserFullInfo } from "@/hooks/queries/useUserData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { QuestAttemptItem, StudentTermSubjectItem } from "@/types/user-profile";
import { UpdateGradeDialog } from "./UpdateGradeDialog";

const ITEMS_PER_PAGE = 10;

export function DashboardClient() {
  const { data: fullInfo, isLoading: isLoadingUser, refetch: refetchUser } = useUserFullInfo();

  // State for the grade update modal
  const [editingSubject, setEditingSubject] = useState<StudentTermSubjectItem | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Force refresh on mount to ensure latest data
    refetchUser();
  }, [refetchUser]);

  const handleEditGrade = (subject: StudentTermSubjectItem) => {
    setEditingSubject(subject);
    setIsGradeModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    // Invalidate and refetch all user data
    refetchUser();
  };

  const activeAttempt: QuestAttemptItem | undefined = fullInfo?.relations.questAttempts.find(a => {
    const s = a.status.toLowerCase();
    return s === 'in_progress' || s === 'inprogress';
  }) || fullInfo?.relations.questAttempts.find(a => {
    const s = a.status.toLowerCase();
    return s === 'not_started' || s === 'notstarted';
  });

  const subjects = fullInfo?.relations.studentTermSubjects ?? [];
  const pendingSubject = subjects.find(ss => {
    const st = (ss.status || '').toLowerCase();
    return st.includes('studying') || st.includes('not');
  });
  const noQuestTip = pendingSubject
    ? `Tip: Your '${pendingSubject.subjectName}' is ${((pendingSubject.status || '').toLowerCase().includes('studying')) ? 'in progress' : 'not started'}. Check the guild hall for updates.`
    : 'Tip: Start a new quest to gain XP today.';

  // Pagination calculations
  const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubjects = subjects.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const isLoading = isLoadingUser;

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 space-y-6 xl:mr-80">
        {/* Profile Header Card */}
        <section className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/20 bg-gradient-to-r from-[#2a140f]/95 via-[#1a0b08]/95 to-[#2a140f]/95 p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,49,135,0.15),transparent_50%)]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-16 rounded-full bg-[#f5c16c]/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 bg-[#f5c16c]/10" />
                    <Skeleton className="h-4 w-48 bg-[#f5c16c]/10" />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="h-16 w-16 rounded-full border-2 border-[#f5c16c]/50 bg-cover bg-center shadow-[0_0_20px_rgba(210,49,135,0.3)]"
                    style={{ backgroundImage: fullInfo?.profile.profileImageUrl ? `url('${fullInfo.profile.profileImageUrl}')` : 'none', backgroundColor: '#2a1a3a' }}
                  />
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      {fullInfo?.profile.firstName && fullInfo?.profile.lastName
                        ? `${fullInfo.profile.firstName} ${fullInfo.profile.lastName}`
                        : (fullInfo?.profile.username || "Scholar")}
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-2.5 py-0.5 text-xs text-white">
                        <GraduationCap className="h-3 w-3 text-[#f5c16c]" />
                        {fullInfo?.profile.className || 'Unassigned'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-2.5 py-0.5 text-xs text-white">
                        <ScrollText className="h-3 w-3 text-[#d23187]" />
                        {fullInfo?.profile.curriculumName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-24 rounded-xl bg-[#f5c16c]/10" />
                  <Skeleton className="h-16 w-24 rounded-xl bg-[#f5c16c]/10" />
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-[#f5c16c]/30 bg-[#f5c16c]/10 px-4 py-2 text-center">
                    <p className="text-2xl font-bold text-white">{fullInfo?.counts.questsInProgress ?? 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#f5c16c]/80">In Progress</p>
                  </div>
                  <div className="rounded-xl border border-[#d23187]/30 bg-[#d23187]/10 px-4 py-2 text-center">
                    <p className="text-2xl font-bold text-white">{fullInfo?.counts.questsCompleted ?? 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#d23187]/80">Completed</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/community/guilds"
                className="flex items-center gap-2 rounded-xl border border-[#f5c16c]/20 bg-[#1a0b08]/60 px-3 py-2 transition-colors hover:border-[#f5c16c]/40"
              >
                <Shield className="h-4 w-4 text-[#f5c16c]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-[#f5c16c]/60">Guild</p>
                  <p className="text-xs font-medium text-white">
                    {isLoading ? '...' : (fullInfo?.relations.guildMembers?.[0]?.guildName || 'None')}
                  </p>
                </div>
              </Link>
              <Link
                href="/parties"
                className="flex items-center gap-2 rounded-xl border border-[#d23187]/20 bg-[#1a0b08]/60 px-3 py-2 transition-colors hover:border-[#d23187]/40"
              >
                <Users className="h-4 w-4 text-[#d23187]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-[#d23187]/60">Party</p>
                  <p className="text-xs font-medium text-white">
                    {isLoading ? '...' : (fullInfo?.relations.partyMembers?.[0]?.partyName || 'None')}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Quest Progress Card */}
        <div className="p-px rounded-[24px] bg-linear-to-r from-[#d23187]/30 via-[#f061a6]/30 to-[#f5c16c]/30">
          <div className="relative overflow-hidden rounded-[24px] border border-[#f5c16c]/22 bg-[#23110d]/88 p-6 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,rgba(245,193,108,0.06),transparent_60%)]" />
            {isLoading ? (
              <div className="space-y-4 text-center">
                <Skeleton className="mx-auto h-8 w-48 bg-[#f5c16c]/10" />
                <Skeleton className="h-3 w-full rounded-full bg-[#f5c16c]/10" />
              </div>
            ) : activeAttempt ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">{activeAttempt.questTitle}</h2>
                  <span className="rounded-full border border-[#f5c16c]/45 bg-[#f5c16c]/15 px-3 py-1 text-xs tracking-[0.35em] text-[#2b130f]">{Math.round(activeAttempt.completionPercentage)}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#2d140f]/70">
                  <div className="h-full rounded-full bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c]" style={{ width: `${Math.min(100, Math.round(activeAttempt.completionPercentage))}%` }} />
                </div>
                <div className="text-sm text-white/80">Step {activeAttempt.stepsCompleted} of {activeAttempt.stepsTotal}</div>
                <div className="flex gap-3">
                  <Link href="/quests" className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] px-4 py-2 text-sm font-semibold tracking-[0.35em] text-[#2b130f]">Resume Step {activeAttempt.currentStepId ?? ''}</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-lg uppercase tracking-[0.35em] text-[#f5c16c]/70">No Active Quest</p>
                <Link href="/quests" className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] px-5 py-3 text-sm font-semibold tracking-[0.35em] text-[#2b130f]">Find a Quest</Link>
                <div className="mx-auto mt-2 flex items-center justify-center gap-2 text-xs text-white/70">
                  <Lightbulb className="h-4 w-4 text-[#f5c16c]" />
                  <span>{noQuestTip}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Academic Record Card */}
        <Card className="bg-[#1a1410] border-[#f5c16c]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="w-5 h-5 text-[#f5c16c]" />
              Academic Record
            </CardTitle>
            {(fullInfo?.profile as any)?.currentGpa && (
              <p className="text-sm text-white/60">
                Current GPA: <span className="font-bold text-[#f5c16c]">{(fullInfo?.profile as any).currentGpa.toFixed(2)}</span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/10">
                    <TableHead className="text-white/60">Code</TableHead>
                    <TableHead className="text-white/60">Subject Name</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60 text-center">Grade</TableHead>
                    <TableHead className="text-right text-white/60">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubjects.length > 0 ? (
                    paginatedSubjects.map(subject => (
                      <TableRow key={subject.subjectId} className="border-b-white/5">
                        <TableCell className="font-mono text-sm text-[#f5c16c]">{subject.subjectCode}</TableCell>
                        <TableCell className="text-white">{subject.subjectName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${subject.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              subject.status === 'Studying' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                            {subject.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-white font-semibold">{subject.grade || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditGrade(subject)} className="text-white/60 hover:text-white">
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-white/40 py-8">
                        No subjects found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {subjects.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60">
                    Showing {startIndex + 1} to {Math.min(endIndex, subjects.length)} of {subjects.length} subjects
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={currentPage === page
                            ? "bg-[#f5c16c] text-[#2b130f] hover:bg-[#f5c16c]/90"
                            : "border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10"
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-[#f5c16c]/30 text-white hover:bg-[#f5c16c]/10 disabled:opacity-30"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <RightColumn
        achievements={fullInfo?.relations.userAchievements || []}
        userSkills={fullInfo?.relations.userSkills || []}
      />

      <UpdateGradeDialog
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        subject={editingSubject}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}