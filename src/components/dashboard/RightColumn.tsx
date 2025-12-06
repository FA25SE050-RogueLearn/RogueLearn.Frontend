"use client";

import { useState, useRef } from "react";
import { Trophy, Zap, ExternalLink, X, Calendar, Award } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { safeDate } from "@/utils/time";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "motion/react";

interface RightColumnProps {
  achievements: Achievement[];
  userSkills: UserSkill[];
}

interface Achievement {
  achievementId: string;
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  sourceService: string;
  earnedAt: string;
  context: string | null;
}

interface UserSkill {
  skillName: string;
  level: number;
  experiencePoints: number;
}

function TiltingCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { damping: 20, stiffness: 100 });
  const rotateY = useSpring(0, { damping: 20, stiffness: 100 });
  const scale = useSpring(1, { damping: 20, stiffness: 100 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -15);
    rotateY.set((offsetX / (rect.width / 2)) * 15);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouse}
      onMouseEnter={() => scale.set(1.02)}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); scale.set(1); }}
    >
      {children}
    </motion.div>
  );
}

export function RightColumn({ achievements, userSkills }: RightColumnProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const getSkillProgress = (xp: number) => {
    return ((xp % 1000) / 1000) * 100;
  };

  return (
    <>
    {/* Achievement Detail Modal */}
    {selectedAchievement && (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm [perspective:1000px]"
        onClick={() => setSelectedAchievement(null)}
      >
        <div 
          className="relative mx-4 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedAchievement(null)}
            className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5c16c]/30 bg-[#1a0b08] text-[#f5c16c] transition-all hover:border-[#f5c16c] hover:bg-[#2a1510]"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Tilting Card Container */}
          <TiltingCard className="overflow-hidden rounded-[24px] border-2 border-[#f5c16c]/30 bg-gradient-to-br from-[#1a0b08] via-[#2a1510] to-[#1a0b08] shadow-[0_0_60px_rgba(210,49,135,0.3)]">
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#f5c16c] to-transparent" />
            
            {/* Header with runes */}
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute left-4 text-[#f5c16c]/20 text-xl">◆</div>
              <Award className="h-5 w-5 text-[#f5c16c]" />
              <span className="ml-2 text-xs font-medium uppercase tracking-[0.3em] text-[#f5c16c]/80">Achievement Unlocked</span>
              <div className="absolute right-4 text-[#f5c16c]/20 text-xl">◆</div>
            </div>

            {/* Achievement image */}
            <div className="flex justify-center px-6 py-8" style={{ transform: "translateZ(40px)" }}>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f5c16c]/40 to-[#d23187]/40 blur-2xl scale-110" />
                {selectedAchievement.iconUrl ? (
                  <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-[#f5c16c]/50 shadow-[0_0_40px_rgba(245,193,108,0.5)]">
                    <Image
                      src={selectedAchievement.iconUrl}
                      alt={selectedAchievement.name}
                      width={300}
                      height={300}
                      className="absolute inset-0 h-full w-full scale-150 object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-4 border-[#f5c16c]/50 bg-gradient-to-br from-[#d23187]/30 to-[#f5c16c]/30">
                    <Trophy className="h-24 w-24 text-[#f5c16c]" />
                  </div>
                )}
                {/* Decorative ring */}
                <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#f5c16c]/30 animate-spin" style={{ animationDuration: "20s" }} />
              </div>
            </div>

            {/* Achievement details */}
            <div className="space-y-4 px-6 pb-6" style={{ transform: "translateZ(20px)" }}>
              {/* Name */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{selectedAchievement.name}</h3>
                <p className="mt-2 text-sm text-[#f5c16c]/70">{selectedAchievement.context}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-xs text-[#f5c16c]/60">
                  <Calendar className="h-4 w-4" />
                  <span>{safeDate(selectedAchievement.earnedAt) ? format(safeDate(selectedAchievement.earnedAt)!, "MMM d, yyyy") : "Unknown"}</span>
                </div>
                <div className="h-4 w-px bg-[#f5c16c]/20" />
                <div className="rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-3 py-1 text-xs text-[#d23187]">
                  {selectedAchievement.sourceService}
                </div>
              </div>

              {/* Decorative bottom */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f5c16c]/30" />
                <Trophy className="h-4 w-4 text-[#f5c16c]/40" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f5c16c]/30" />
              </div>
            </div>

            {/* Decorative bottom border */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#d23187] to-transparent" />
          </TiltingCard>
        </div>
      </div>
    )}
    <aside className="fixed right-0 top-0 hidden h-screen w-[320px] overflow-y-auto border-l border-[#f5c16c]/20 bg-[#0c0308]/80 backdrop-blur-md xl:block">
      {/* Achievements Section */}
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#f5c16c]" />
            <h2 className="text-lg font-bold text-[#f5c16c]">Achievements</h2>
          </div>
          <Link
            href="/achievements"
            className="flex items-center gap-1 text-xs text-[#f5c16c]/70 transition-colors hover:text-[#f5c16c]"
          >
            View All
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {achievements.length > 0 ? (
          <div className="space-y-3">
            {achievements.slice(0, 5).map((achievement, idx) => (
              <button
                key={`${achievement.achievementId}-${idx}`}
                onClick={() => setSelectedAchievement(achievement)}
                className="group w-full rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/80 p-3 text-left transition-all hover:border-[#f5c16c]/40 hover:bg-[#1a0b08] hover:shadow-[0_0_15px_rgba(210,49,135,0.15)]"
              >
                <div className="flex gap-3">
                  {achievement.iconUrl ? (
                    <Image
                      src={achievement.iconUrl}
                      alt={achievement.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full border border-[#f5c16c]/30 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f5c16c]/30 bg-gradient-to-br from-[#f5c16c]/20 to-[#d23187]/20">
                      <Trophy className="h-6 w-6 text-[#f5c16c]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {achievement.name}
                    </h3>
                    <p className="line-clamp-1 text-xs text-[#f5c16c]/70">
                      {achievement.context}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded bg-[#f5c16c]/10 px-2 py-0.5 text-[9px] text-[#f5c16c]/50">
                        {achievement.sourceService}
                      </span>
                      <span className="text-[9px] text-[#f5c16c]/50">
                        {safeDate(achievement.earnedAt) ? formatDistanceToNow(safeDate(achievement.earnedAt)!, { addSuffix: true }) : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/40 p-8 text-center">
            <Trophy className="mb-2 h-12 w-12 text-[#f5c16c]/30" />
            <p className="text-sm text-[#f5c16c]/50">
              No achievements yet
            </p>
            <p className="mt-1 text-xs text-[#f5c16c]/30">
              Complete quests to earn your first achievement!
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#f5c16c]/20" />

      {/* Skills Section */}
      <div className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#f5c16c]" />
          <h2 className="text-lg font-bold text-[#f5c16c]">Skills</h2>
        </div>

        {userSkills.length > 0 ? (
          <div className="space-y-3">
            {userSkills.slice(0, 8).map((skill, idx) => (
              <div
                key={`${skill.skillName}-${idx}`}
                className="rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/80 p-3 transition-all hover:border-[#f5c16c]/40"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    {skill.skillName}
                  </h3>
                  <span className="text-xs font-bold text-[#f5c16c]">
                    Lv {skill.level}
                  </span>
                </div>
                <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-[#f5c16c]/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#f5c16c] to-[#d23187] transition-all duration-500"
                    style={{ width: `${getSkillProgress(skill.experiencePoints)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#f5c16c]/50">
                  {skill.experiencePoints % 1000} / 1000 XP
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/40 p-8 text-center">
            <Zap className="mb-2 h-12 w-12 text-[#f5c16c]/30" />
            <p className="text-sm text-[#f5c16c]/50">
              No skills unlocked yet
            </p>
            <p className="mt-1 text-xs text-[#f5c16c]/30">
              Complete quests to develop your skills!
            </p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
