/**
 * Feature: Users API
 * Purpose: Handle user profile management, context retrieval, and admin operations
 * Backend: UsersController.cs
 */

import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/base/Api';
import type {
  UserContextDto,
  GetUserContextByAuthIdQueryRequest,
  GetUserContextByAuthIdResponse,
} from '@/types/user-context';
import type {
  UserProfileDto,
  UpdateMyProfileCommand,
  GetAllUserProfilesResponse,
  GetUserProfileByAuthIdResponse,
} from '@/types/user-profile';
import type {
  ProcessAcademicRecordCommandRequest,
  ProcessAcademicRecordResponse,
} from '@/types/student';

/**
 * Process academic record for the current user
 * POST /api/users/me/process-academic-record
 * Content-Type: multipart/form-data
 */
export const processMyAcademicRecord = async (
  request: ProcessAcademicRecordCommandRequest
): Promise<ApiResponse<ProcessAcademicRecordResponse>> => {
  const formData = new FormData();
  formData.append('fapHtmlContent', request.fapHtmlContent);
  formData.append('curriculumVersionId', request.curriculumVersionId);

  return axiosClient
    .post<ProcessAcademicRecordResponse>('/api/users/me/process-academic-record', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => ({ isSuccess: true, data: res.data }));
};

/**
 * Get current user's context (profile, roles, class, enrollment, skills)
 * GET /api/users/me
 */
export const getMyContext = async (): Promise<ApiResponse<UserContextDto>> =>
  axiosClient.get<UserContextDto>('/api/users/me').then(res => ({ isSuccess: true, data: res.data }));

/**
 * Update current user's profile
 * PATCH /api/users/me
 * Content-Type: multipart/form-data (supports profile image upload)
 */
export const updateMyProfile = async (
  request: UpdateMyProfileCommand,
  profileImage?: File
): Promise<void> => {
  const formData = new FormData();
  
  // Add text fields
  if (request.firstName !== undefined) {
    formData.append('firstName', request.firstName || '');
  }
  if (request.lastName !== undefined) {
    formData.append('lastName', request.lastName || '');
  }
  if (request.bio !== undefined) {
    formData.append('bio', request.bio || '');
  }
  if (request.preferencesJson !== undefined) {
    formData.append('preferencesJson', request.preferencesJson || '');
  }
  
  // Add profile image if provided
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  return axiosClient.patch<void>('/api/users/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(() => {});
};

// ===== Admin Endpoints =====

/**
 * Get all user profiles (admin only)
 * GET /api/admin/users/profiles
 */
export const getAllUserProfiles = async (): Promise<ApiResponse<GetAllUserProfilesResponse>> =>
  axiosClient.get<GetAllUserProfilesResponse>('/api/admin/users/profiles').then(res => ({ isSuccess: true, data: res.data }));

/**
 * Get user profile by authentication ID (admin only)
 * GET /api/admin/users/{authId}
 */
export const getUserProfileByAuthId = async (
  authId: string
): Promise<ApiResponse<GetUserProfileByAuthIdResponse>> =>
  axiosClient.get<GetUserProfileByAuthIdResponse>(`/api/admin/users/${authId}`).then(res => ({ isSuccess: true, data: res.data }));

/**
 * Get user's aggregated context by authentication ID (admin only)
 * GET /api/admin/users/{authId}/context
 */
export const getUserContextByAuthId = async (
  authId: string
): Promise<ApiResponse<GetUserContextByAuthIdResponse>> =>
  axiosClient
    .get<GetUserContextByAuthIdResponse>(`/api/admin/users/${authId}/context`)
    .then(res => ({ isSuccess: true, data: res.data }));