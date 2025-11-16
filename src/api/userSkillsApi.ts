// src/api/userSkillsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  UserSkillDto,
  AddUserSkillCommandRequest,
  AddUserSkillResponse,
  RemoveUserSkillCommandRequest,
  ResetUserSkillProgressCommandRequest,
  GetUserSkillsResponse,
  GetUserSkillResponse,
} from '@/types/user-skills';
import { IngestXpEventCommandRequest, IngestXpEventResponse } from '@/types/user-skill-rewards';

const userSkillsApi = {
  /** GET /api/user-skills/{authUserId} */
  getAllByUser: (authUserId: string): Promise<ApiResponse<GetUserSkillsResponse>> =>
    axiosClient.get<UserSkillDto[]>(`/api/user-skills/${authUserId}`).then(res => ({
      isSuccess: true,
      data: { skills: res.data },
    })),

  /** GET /api/user-skills/{authUserId}/{skillName} */
  getOne: (authUserId: string, skillName: string): Promise<ApiResponse<GetUserSkillResponse>> =>
    axiosClient.get<GetUserSkillResponse>(`/api/user-skills/${authUserId}/${encodeURIComponent(skillName)}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/user-skills */
  add: (payload: AddUserSkillCommandRequest): Promise<ApiResponse<AddUserSkillResponse>> =>
    axiosClient.post<AddUserSkillResponse>('/api/user-skills', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/user-skills */
  remove: (payload: RemoveUserSkillCommandRequest): Promise<ApiResponse<void>> =>
    axiosClient.request<void>({ method: 'DELETE', url: '/api/user-skills', data: payload }).then(() => ({
      isSuccess: true,
      data: undefined,
    })),

  /** POST /api/user-skills/reset */
  resetProgress: (payload: ResetUserSkillProgressCommandRequest): Promise<ApiResponse<void>> =>
    axiosClient.post<void>('/api/user-skills/reset', payload).then(() => ({
      isSuccess: true,
      data: undefined,
    })),

  /** POST /api/user-skill-rewards/ingest (XP event -> updates user skill progression) */
  ingestXpEvent: (payload: IngestXpEventCommandRequest): Promise<ApiResponse<IngestXpEventResponse>> =>
    axiosClient.post<IngestXpEventResponse>('/api/user-skill-rewards/ingest', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),
};

export default userSkillsApi;