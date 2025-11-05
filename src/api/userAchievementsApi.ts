// src/api/userAchievementsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  UserAchievementDto,
  GetUserAchievementsByAuthIdResponse,
  AwardAchievementToUserCommand,
  RevokeAchievementFromUserCommand,
} from '@/types/achievement';

const userAchievementsApi = {
  /** GET /api/achievements/user/{authUserId} */
  getByAuthUserId: (authUserId: string): Promise<ApiResponse<GetUserAchievementsByAuthIdResponse>> =>
    axiosClient.get<UserAchievementDto[]>(`/api/achievements/user/${authUserId}`).then(res => ({
      isSuccess: true,
      data: { achievements: res.data },
    })),

  /** POST /api/admin/achievements/award */
  award: (payload: AwardAchievementToUserCommand): Promise<void> =>
    axiosClient.post<void>(`/api/admin/achievements/award`, payload).then(() => {}),

  /** POST /api/admin/achievements/revoke */
  revoke: (payload: RevokeAchievementFromUserCommand): Promise<void> =>
    axiosClient.post<void>(`/api/admin/achievements/revoke`, payload).then(() => {}),
};

export default userAchievementsApi;