// roguelearn-web/src/api/skillsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { GetUserSkillsResponse } from '@/types/user-skills';
// ADDED: Import for the new skill tree type
import { SkillTree } from '@/types/skill-tree';

// The response from the backend will be a list of UserSkill objects.
type GetMySkillsResponse = GetUserSkillsResponse;

const skillsApi = {
  /**
   * Fetches all tracked skills and their progress for the currently authenticated user.
   * Corresponds to GET /api/users/me/skills
   */
  getMySkills: (): Promise<ApiResponse<GetMySkillsResponse>> =>
    axiosClient.get<GetMySkillsResponse>('/api/users/me/skills').then(res => ({
        isSuccess: true,
        data: res.data
    })),

  // ADDED: New function to fetch the complete skill tree data.
  /**
   * Fetches the entire skill tree structure and the user's progress on each skill.
   * Corresponds to GET /api/skills/tree
   */
  getSkillTree: (): Promise<ApiResponse<SkillTree>> =>
    axiosClient.get<SkillTree>('/api/skills/tree').then(res => ({
        isSuccess: true,
        data: res.data,
    })),
};

export default skillsApi;