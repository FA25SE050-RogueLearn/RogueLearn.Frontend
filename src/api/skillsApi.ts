// src/api/skillsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  Skill,
  CreateSkillCommandRequest,
  UpdateSkillCommandRequest,
  GetSkillsResponse,
  GetSkillByIdResponse,
} from '@/types/skills';
import {
  SkillDependencyDto,
  AddSkillDependencyCommandRequest,
  AddSkillDependencyResponse,
  RemoveSkillDependencyCommandRequest,
  RemoveSkillDependencyResponse,
  GetSkillDependenciesResponse,
} from '@/types/skill-dependencies';

const skillsApi = {
  /** GET /api/admin/skills */
  getAll: (): Promise<ApiResponse<GetSkillsResponse>> =>
    axiosClient.get<Skill[]>(`/api/admin/skills`).then(res => ({
      isSuccess: true,
      data: { skills: res.data },
    })),

  /** GET /api/admin/skills/{id} */
  getById: (id: string): Promise<ApiResponse<GetSkillByIdResponse>> =>
    axiosClient.get<GetSkillByIdResponse>(`/api/admin/skills/${id}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/admin/skills */
  create: (payload: CreateSkillCommandRequest): Promise<ApiResponse<Skill>> =>
    axiosClient.post<Skill>('/api/admin/skills', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/admin/skills/{id} */
  update: (id: string, payload: Omit<UpdateSkillCommandRequest, 'id'>): Promise<ApiResponse<Skill>> =>
    axiosClient.put<Skill>(`/api/admin/skills/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/skills/{id} */
  remove: (id: string): Promise<void> => axiosClient.delete(`/api/admin/skills/${id}`).then(() => {}),

  // --- Dependencies management ---
  /** GET /api/admin/skills/{skillId}/dependencies */
  getDependencies: (skillId: string): Promise<ApiResponse<GetSkillDependenciesResponse>> =>
    axiosClient.get<SkillDependencyDto[]>(`/api/admin/skills/${skillId}/dependencies`).then(res => ({
      isSuccess: true,
      data: { dependencies: res.data },
    })),

  /** POST /api/admin/skills/{skillId}/dependencies */
  addDependency: (
    payload: AddSkillDependencyCommandRequest
  ): Promise<ApiResponse<AddSkillDependencyResponse>> =>
    axiosClient.post<AddSkillDependencyResponse>(`/api/admin/skills/${payload.skillId}/dependencies`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/skills/{skillId}/dependencies */
  removeDependency: (
    payload: RemoveSkillDependencyCommandRequest
  ): Promise<RemoveSkillDependencyResponse> =>
    axiosClient.request<void>({ method: 'DELETE', url: `/api/admin/skills/${payload.skillId}/dependencies`, data: payload }).then(() => {}),
};

export default skillsApi;