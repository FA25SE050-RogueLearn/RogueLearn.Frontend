// roguelearn-web/src/api/skillsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserSkillDto, GetUserSkillsResponse } from '@/types/user-skills';

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
};

export default skillsApi;