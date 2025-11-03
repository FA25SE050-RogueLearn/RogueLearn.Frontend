// src/api/rolesApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  RoleDto,
  CreateRoleCommandRequest,
  CreateRoleResponse,
  UpdateRoleCommandRequest,
  UpdateRoleResponse,
  GetAllRolesResponse,
} from '@/types/roles';

const rolesApi = {
  /** GET /api/admin/roles */
  getAll: (): Promise<ApiResponse<GetAllRolesResponse>> =>
    axiosClient.get<RoleDto[]>(`/api/admin/roles`).then(res => ({
      isSuccess: true,
      data: { roles: res.data },
    })),

  /** POST /api/admin/roles */
  create: (payload: CreateRoleCommandRequest): Promise<ApiResponse<CreateRoleResponse>> =>
    axiosClient.post<CreateRoleResponse>('/api/admin/roles', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/admin/roles/{id} */
  update: (id: string, payload: Omit<UpdateRoleCommandRequest, 'id'>): Promise<ApiResponse<UpdateRoleResponse>> =>
    axiosClient.put<UpdateRoleResponse>(`/api/admin/roles/${id}`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/roles/{id} */
  remove: (id: string): Promise<void> => axiosClient.delete(`/api/admin/roles/${id}`).then(() => {}),
};

export default rolesApi;