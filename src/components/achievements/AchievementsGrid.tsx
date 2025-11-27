"use client";

import { useState, useRef } from "react";
import { Trophy, X, Calendar, Award, Search, Filter } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { motion, useSpring } from "motion/react";

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

interface AchievementsGridProps {
  achievements: Achievement[];
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

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");

  // Get unique sources for filter
  const sources = ["all", ...new Set(achievements.map(a => a.sourceService))];

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === "all" || achievement.sourceService === selectedSource;
    return matchesSearch && matchesSource;
  });

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
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5c16c]/30 bg-[#1a0b08] text-[#f5c16c] transition-all hover:border-[#f5c16c] hover:bg-[#2a1510]"
            >
              <X className="h-4 w-4" />
            </button>

            <TiltingCard className="overflow-hidden rounded-[24px] border-2 border-[#f5c16c]/30 bg-gradient-to-br from-[#1a0b08] via-[#2a1510] to-[#1a0b08] shadow-[0_0_60px_rgba(210,49,135,0.3)]">
              <div className="h-1 bg-gradient-to-r from-transparent via-[#f5c16c] to-transparent" />
              
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute left-4 text-[#f5c16c]/20 text-xl">◆</div>
                <Award className="h-5 w-5 text-[#f5c16c]" />
                <span className="ml-2 text-xs font-medium uppercase tracking-[0.3em] text-[#f5c16c]/80">Achievement Unlocked</span>
                <div className="absolute right-4 text-[#f5c16c]/20 text-xl">◆</div>
              </div>

              <div className="flex justify-center px-6 py-8" style={{ transform: "translateZ(40px)" }}>
                <div className="relative">
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
                  <div className="absolute -inset-3 rounded-full border-2 border-dashed border-[#f5c16c]/30 animate-spin" style={{ animationDuration: "20s" }} />
                </div>
              </div>

              <div className="space-y-4 px-6 pb-6" style={{ transform: "translateZ(20px)" }}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">{selectedAchievement.name}</h3>
                  <p className="mt-2 text-sm text-[#f5c16c]/70">{selectedAchievement.description}</p>
                </div>

                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#f5c16c]/60">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(selectedAchievement.earnedAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="h-4 w-px bg-[#f5c16c]/20" />
                  <div className="rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-3 py-1 text-xs text-[#d23187]">
                    {selectedAchievement.sourceService}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f5c16c]/30" />
                  <Trophy className="h-4 w-4 text-[#f5c16c]/40" />
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f5c16c]/30" />
                </div>
              </div>

              <div className="h-1 bg-gradient-to-r from-transparent via-[#d23187] to-transparent" />
            </TiltingCard>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5c16c]/50" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#f5c16c]/20 bg-[#1a0b08]/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#f5c16c]/40 focus:border-[#f5c16c]/50 focus:outline-none sm:w-64"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#f5c16c]/50" />
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedSource === source
                    ? "border border-[#f5c16c] bg-[#f5c16c]/20 text-[#f5c16c]"
                    : "border border-[#f5c16c]/20 bg-[#1a0b08]/80 text-[#f5c16c]/60 hover:border-[#f5c16c]/40 hover:text-[#f5c16c]"
                }`}
              >
                {source === "all" ? "All" : source}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAchievements.map((achievement) => (
            <button
              key={achievement.achievementId}
              onClick={() => setSelectedAchievement(achievement)}
              className="group relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-5 text-left transition-all duration-300 hover:border-[#f5c16c]/40 hover:shadow-[0_0_30px_rgba(210,49,135,0.2)] [perspective:800px]"
            >
              {/* Background glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#d23187]/10 blur-2xl transition-all duration-300 group-hover:bg-[#d23187]/20" />
              
              {/* Corner rune */}
              <div className="absolute right-3 top-3 text-[#f5c16c]/10 text-lg transition-all group-hover:text-[#f5c16c]/20">◆</div>

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Achievement Image */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f5c16c]/20 to-[#d23187]/20 blur-xl" />
                  {achievement.iconUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#f5c16c]/40 shadow-[0_0_20px_rgba(245,193,108,0.3)] transition-transform duration-300 group-hover:scale-110">
                      <Image
                        src={achievement.iconUrl}
                        alt={achievement.name}
                        width={100}
                        height={100}
                        className="absolute inset-0 h-full w-full scale-150 object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#f5c16c]/40 bg-gradient-to-br from-[#d23187]/20 to-[#f5c16c]/20 transition-transform duration-300 group-hover:scale-110">
                      <Trophy className="h-8 w-8 text-[#f5c16c]" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="mb-1 text-sm font-bold text-white transition-colors group-hover:text-[#f5c16c]">
                  {achievement.name}
                </h3>

                {/* Description */}
                <p className="mb-3 line-clamp-2 text-xs text-[#f5c16c]/60">
                  {achievement.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#d23187]/30 bg-[#d23187]/10 px-2 py-0.5 text-[10px] text-[#d23187]">
                    {achievement.sourceService}
                  </span>
                  <span className="text-[10px] text-[#f5c16c]/40">
                    {formatDistanceToNow(new Date(achievement.earnedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f5c16c]/20 to-transparent transition-all group-hover:via-[#f5c16c]/40" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#f5c16c]/20 bg-[#1a0b08]/40 py-16 text-center">
          <Trophy className="mb-4 h-16 w-16 text-[#f5c16c]/20" />
          <h3 className="mb-2 text-lg font-semibold text-[#f5c16c]/70">
            {searchQuery || selectedSource !== "all" ? "No matching achievements" : "No achievements yet"}
          </h3>
          <p className="text-sm text-[#f5c16c]/40">
            {searchQuery || selectedSource !== "all" 
              ? "Try adjusting your search or filters" 
              : "Complete quests and challenges to earn achievements!"}
          </p>
        </div>
      )}
    </>
  );
}
