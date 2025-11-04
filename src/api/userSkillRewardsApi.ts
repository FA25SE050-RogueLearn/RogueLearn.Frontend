// src/api/userSkillRewardsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  UserSkillRewardDto,
  GetUserSkillRewardsResponse,
  IngestXpEventCommandRequest,
  IngestXpEventResponse,
} from '@/types/user-skill-rewards';

const userSkillRewardsApi = {
  /** GET /api/user-skill-rewards/{userId} */
  getByUserId: (userId: string): Promise<ApiResponse<GetUserSkillRewardsResponse>> =>
    axiosClient.get<UserSkillRewardDto[]>(`/api/user-skill-rewards/${userId}`).then(res => ({
      isSuccess: true,
      data: { rewards: res.data },
    })),

  /** POST /api/user-skill-rewards/ingest */
  ingestXpEvent: (payload: IngestXpEventCommandRequest): Promise<ApiResponse<IngestXpEventResponse>> =>
    axiosClient.post<IngestXpEventResponse>(`/api/user-skill-rewards/ingest`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
};

export default userSkillRewardsApi;