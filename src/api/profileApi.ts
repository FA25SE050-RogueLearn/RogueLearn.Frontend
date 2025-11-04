// roguelearn-web/src/api/profileApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserProfileDto } from '../types/user-profile';

const profileApi = {
  /**
   * Fetches the profile for the currently authenticated user.
   * Corresponds to GET /api/profiles/me
   */
  getMyProfile: (): Promise<ApiResponse<UserProfileDto | null>> =>
    axiosClient.get<UserProfileDto>('/api/profiles/me').then(res => ({
        isSuccess: true,
        data: res.data
    })),
};

export default profileApi;