// roguelearn-web/src/api/skillsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserSkill } from '../types/user';

// The response from the backend will be a list of UserSkill objects.
interface GetMySkillsResponse {
    skills: UserSkill[];
}

const skillsApi = {
  /**
   * Fetches all tracked skills and their progress for the currently authenticated user.
   * Corresponds to GET /api/users/me/skills
   */
  getMySkills: (): Promise<ApiResponse<GetMySkillsResponse>> =>
    axiosClient.get('/api/users/me/skills').then(res => ({
        isSuccess: true,
        data: res.data
    })),
};

export default skillsApi;