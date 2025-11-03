// src/api/userRolesApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  UserRoleDto,
  GetUserRolesResponse,
  AssignRoleToUserCommandRequest,
  AssignRoleToUserResponse,
  RemoveRoleFromUserCommandRequest,
  RemoveRoleFromUserResponse,
} from '@/types/user-roles';

const userRolesApi = {
  /** GET /api/admin/users/{userId}/roles */
  getByUserId: (userId: string): Promise<ApiResponse<GetUserRolesResponse>> =>
    axiosClient.get<UserRoleDto[]>(`/api/admin/users/${userId}/roles`).then(res => ({
      isSuccess: true,
      data: { userId, roles: res.data },
    })),

  /** POST /api/admin/users/assign-role */
  assign: (payload: AssignRoleToUserCommandRequest): Promise<AssignRoleToUserResponse> =>
    axiosClient.post<void>(`/api/admin/users/assign-role`, payload).then(() => {}),

  /** POST /api/admin/users/remove-role */
  remove: (payload: RemoveRoleFromUserCommandRequest): Promise<RemoveRoleFromUserResponse> =>
    axiosClient.post<void>(`/api/admin/users/remove-role`, payload).then(() => {}),
};

export default userRolesApi;