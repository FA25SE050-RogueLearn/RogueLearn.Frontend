// src/api/achievementsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  AchievementDto,
  UserAchievementDto,
  CreateAchievementCommand,
  CreateAchievementResponse,
  UpdateAchievementCommand,
  UpdateAchievementResponse,
  GetAllAchievementsResponse,
  GetUserAchievementsByAuthIdResponse,
} from '@/types/achievement';

const achievementsApi = {
  /** GET /api/admin/achievements */
  getAll: (): Promise<ApiResponse<GetAllAchievementsResponse>> =>
    axiosClient.get<AchievementDto[]>('/api/admin/achievements').then(res => ({
      isSuccess: true,
      data: { achievements: res.data },
    })),

  /** GET /api/achievements/user/{authUserId} */
  getByUserAuthId: (authUserId: string): Promise<ApiResponse<GetUserAchievementsByAuthIdResponse>> =>
    axiosClient.get<UserAchievementDto[]>(`/api/achievements/user/${authUserId}`).then(res => ({
      isSuccess: true,
      data: { achievements: res.data },
    })),

  /** POST /api/admin/achievements */
  create: (payload: CreateAchievementCommand): Promise<ApiResponse<CreateAchievementResponse>> =>
    axiosClient.post<CreateAchievementResponse>('/api/admin/achievements', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /**
   * POST /api/admin/achievements (multipart)
   * Create an achievement with icon upload.
   */
  createWithIconUpload: (
    payload: Omit<CreateAchievementCommand, 'iconUrl'> & { iconFile: File | Blob; iconFileName?: string; contentType?: string }
  ): Promise<ApiResponse<CreateAchievementResponse>> => {
    const formData = new FormData();
    formData.append('key', payload.key);
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    if (payload.ruleType) formData.append('ruleType', payload.ruleType);
    if (payload.ruleConfig) formData.append('ruleConfig', payload.ruleConfig);
    if (payload.category) formData.append('category', payload.category);
    if (payload.icon) formData.append('icon', payload.icon);
    if (payload.version != null) formData.append('version', String(payload.version));
    if (payload.isActive != null) formData.append('isActive', String(payload.isActive));
    formData.append('sourceService', payload.sourceService);
    // icon binary
    formData.append('iconFile', payload.iconFile);
    if (payload.iconFileName) formData.append('iconFileName', payload.iconFileName);
    if (payload.contentType) formData.append('contentType', payload.contentType);
    return axiosClient
      .post<CreateAchievementResponse>('/api/admin/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => ({ isSuccess: true, data: res.data }));
  },

  /** PUT /api/admin/achievements/{id} */
  update: (id: string, payload: Omit<UpdateAchievementCommand, 'id'>): Promise<ApiResponse<UpdateAchievementResponse>> =>
    axiosClient.put<UpdateAchievementResponse>(`/api/admin/achievements/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /**
   * PUT /api/admin/achievements/{id} (multipart)
   * Update an achievement and optionally upload a new icon.
   */
  updateWithIconUpload: (
    id: string,
    payload: Omit<UpdateAchievementCommand, 'id' | 'iconUrl'> & { iconFile?: File | Blob; iconFileName?: string; contentType?: string }
  ): Promise<ApiResponse<UpdateAchievementResponse>> => {
    const formData = new FormData();
    formData.append('key', payload.key);
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    if (payload.ruleType) formData.append('ruleType', payload.ruleType);
    if (payload.ruleConfig) formData.append('ruleConfig', payload.ruleConfig);
    if (payload.category) formData.append('category', payload.category);
    if (payload.icon) formData.append('icon', payload.icon);
    if (payload.version != null) formData.append('version', String(payload.version));
    if (payload.isActive != null) formData.append('isActive', String(payload.isActive));
    formData.append('sourceService', payload.sourceService);
    if (payload.iconFile) {
      formData.append('iconFile', payload.iconFile);
      if (payload.iconFileName) formData.append('iconFileName', payload.iconFileName);
      if (payload.contentType) formData.append('contentType', payload.contentType);
    }
    return axiosClient
      .put<UpdateAchievementResponse>(`/api/admin/achievements/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => ({ isSuccess: true, data: res.data }));
  },

  /** DELETE /api/admin/achievements/{id} */
  remove: (id: string): Promise<void> => axiosClient.delete(`/api/admin/achievements/${id}`).then(() => {}),
};

export default achievementsApi;