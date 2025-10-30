// roguelearn-web/src/api/profileApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserProfile } from '../types/user';

const profileApi = {
  /**
   * Fetches the profile for the currently authenticated user.
   * Corresponds to GET /api/profiles/me
   */
  getMyProfile: (): Promise<ApiResponse<UserProfile | null>> =>
    axiosClient.get<UserProfile>('/api/profiles/me').then(res => ({
        isSuccess: true,
        data: res.data
    })),
};

export default profileApi;