"use client";

import { Trophy, Zap, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";

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

export function RightColumn({ achievements, userSkills }: RightColumnProps) {
  const getSkillProgress = (xp: number) => {
    return ((xp % 1000) / 1000) * 100;
  };

  return (
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
            {achievements.slice(0, 5).map((achievement) => (
              <div
                key={achievement.achievementId}
                className="group rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/80 p-3 transition-all hover:border-[#f5c16c]/40 hover:bg-[#1a0b08]"
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
                      {achievement.description}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded bg-[#f5c16c]/10 px-2 py-0.5 text-[9px] text-[#f5c16c]/50">
                        {achievement.sourceService}
                      </span>
                      <span className="text-[9px] text-[#f5c16c]/50">
                        {formatDistanceToNow(new Date(achievement.earnedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
            {userSkills.slice(0, 8).map((skill) => (
              <div
                key={skill.skillName}
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
  );
}
