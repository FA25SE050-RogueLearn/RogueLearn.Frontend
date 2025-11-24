// roguelearn-web/src/api/skillsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { GetUserSkillsResponse } from '@/types/user-skills';
import { SkillTree } from '@/types/skill-tree';
// ⭐ NEW: Import the detail type
import { SkillDetailDto } from '@/types/skill-details';

type GetMySkillsResponse = GetUserSkillsResponse;

const skillsApi = {
  /**
   * Fetches all tracked skills and their progress for the currently authenticated user.
   */
  getMySkills: (): Promise<ApiResponse<GetMySkillsResponse>> =>
    axiosClient.get<GetMySkillsResponse>('/api/users/me/skills').then(res => ({
        isSuccess: true,
        data: res.data
    })),

  /**
   * Fetches the entire skill tree structure and the user's progress on each skill.
   */
  getSkillTree: (): Promise<ApiResponse<SkillTree>> =>
    axiosClient.get<SkillTree>('/api/skills/tree').then(res => ({
        isSuccess: true,
        data: res.data,
    })),

  /**
   * ⭐ NEW: Fetches detailed information for a specific skill including path and dependencies.
   */
  getSkillDetail: (skillId: string): Promise<ApiResponse<SkillDetailDto>> =>
    axiosClient.get<SkillDetailDto>(`/api/skills/${skillId}/details`).then(res => ({
        isSuccess: true,
        data: res.data,
    })),
};

export default skillsApi;