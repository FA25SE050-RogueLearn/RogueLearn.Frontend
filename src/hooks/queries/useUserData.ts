import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/api/axiosClient";
import type { FullUserInfoResponse } from "@/types/user-profile";

export const userKeys = {
  all: ["user"] as const,
  fullInfo: () => [...userKeys.all, "fullInfo"] as const,
  achievements: () => [...userKeys.all, "achievements"] as const,
};

export function useUserFullInfo() {
  return useQuery({
    queryKey: userKeys.fullInfo(),
    queryFn: async (): Promise<FullUserInfoResponse | null> => {
      try {
        const res = await axiosClient.get("/api/users/me/full", {
          params: { "page[size]": 20, "page[number]": 1 },
        });
        return res.data;
      } catch (error) {
        console.error("Failed to fetch user full info:", error);
        return null;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export interface Achievement {
  achievementId: string;
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  sourceService: string;
  earnedAt: string;
  context: string | null;
}

export function useUserAchievements() {
  return useQuery({
    queryKey: userKeys.achievements(),
    queryFn: async (): Promise<Achievement[]> => {
      try {
        const res = await axiosClient.get("/api/users/achievements/me");
        return res.data?.achievements || [];
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
