// roguelearn-web/src/api/usersApi.ts
/**
 * Feature: Users API
 * Purpose: Handle user profile management, context retrieval, and academic processing.
 * Backend: UsersController.cs
 */

import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/base/Api';
import type { UserContextDto } from '@/types/user-context';
import { invalidateMyProfileCache } from './profileApi';
import type {
  UpdateMyProfileCommand,
  GetAllUserProfilesResponse,
  GetUserProfileByAuthIdResponse,
  FullUserInfoResponse,
} from '@/types/user-profile';
import type {
  ProcessAcademicRecordResponse,
  GetAcademicStatusResponse,
} from '@/types/student';

/**
 * Processes the authenticated user's academic record, syncs their gradebook,
 * and triggers the generation of their personalized learning path and high-level quests.
 * This is the primary, all-in-one endpoint for onboarding and progress synchronization.
 * Corresponds to POST /api/users/me/academic-record
 */
export const processAcademicRecord = async (
  fapHtmlContent: string,
  curriculumProgramId: string
): Promise<ApiResponse<ProcessAcademicRecordResponse>> => {
  const formData = new FormData();
  formData.append('fapHtmlContent', fapHtmlContent);
  formData.append('curriculumProgramId', curriculumProgramId);

  return axiosClient
    .post<ProcessAcademicRecordResponse>('/api/users/me/academic-record', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => ({ isSuccess: true, data: res.data }));
};

// REMOVED: initializeSkills and establishSkillDependencies are no longer called from the frontend.
// This logic is now orchestrated by the backend's ProcessAcademicRecordCommandHandler.

/**
 * Retrieves the complete academic status for the authenticated user.
 * Corresponds to GET /api/users/me/academic-status
 */
export const getAcademicStatus = async (): Promise<ApiResponse<GetAcademicStatusResponse>> => {
  return axiosClient.get('/api/users/me/academic-status').then(res => ({
    isSuccess: true,
    data: res.data,
  }));
};

/**
 * Get current user's context (profile, roles, class, enrollment, skills)
 * Corresponds to GET /api/users/me
 */
let __myContextCache: { value: UserContextDto; ts: number } | null = null;
let __myContextPending: Promise<ApiResponse<UserContextDto>> | null = null;
const __CONTEXT_TTL_MS = 120000;

export const invalidateMyContextCache = (): void => {
  __myContextCache = null;
  __myContextPending = null;
  if (typeof window !== 'undefined') {
    try { sessionStorage.removeItem('cache:users:me'); } catch {}
  }
};

export const getMyContext = async (options?: { forceRefresh?: boolean }): Promise<ApiResponse<UserContextDto>> => {
  const now = Date.now();
  const force = !!options?.forceRefresh;
  if (!force && __myContextCache && now - __myContextCache.ts < __CONTEXT_TTL_MS) {
    return { isSuccess: true, data: __myContextCache.value };
  }
  if (!force && typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('cache:users:me');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ts && now - parsed.ts < __CONTEXT_TTL_MS) {
          __myContextCache = { value: parsed.value, ts: parsed.ts };
          return { isSuccess: true, data: __myContextCache.value };
        }
      }
    } catch {}
  }
  if (!force && __myContextPending) return __myContextPending!;
  const pending: Promise<ApiResponse<UserContextDto>> = axiosClient
    .get<UserContextDto>('/api/users/me')
    .then(res => {
      __myContextCache = { value: res.data, ts: now };
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('cache:users:me', JSON.stringify(__myContextCache)); } catch {}
      }
      return { isSuccess: true as const, data: res.data };
    })
    .finally(() => { __myContextPending = null; });
  __myContextPending = pending;
  return pending;
};

export const getMyFullInfo = async (
  pageSize: number = 20,
  pageNumber: number = 1
): Promise<ApiResponse<FullUserInfoResponse>> =>
  axiosClient
    .get<FullUserInfoResponse>('/api/users/me/full', {
      params: {
        'page[size]': pageSize,
        'page[number]': pageNumber,
      },
    })
    .then(res => ({ isSuccess: true, data: res.data }));

/**
 * Update current user's profile
 * Corresponds to PATCH /api/users/me
 * Uses Content-Type: multipart/form-data to support optional profile image upload.
 */
export const updateMyProfile = async (
  request: UpdateMyProfileCommand,
  profileImage?: File
): Promise<void> => {
  const formData = new FormData();

  // Add text fields only if they are not undefined
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
  }).then(() => { invalidateMyProfileCache(); invalidateMyContextCache(); });
};

// ===== Admin Endpoints =====

/**
 * Get all user profiles (admin only)
 * Corresponds to GET /api/admin/users/profiles
 */
export const getAllUserProfiles = async (): Promise<ApiResponse<GetAllUserProfilesResponse>> =>
  axiosClient.get<GetAllUserProfilesResponse>('/api/admin/users/profiles').then(res => ({ isSuccess: true, data: res.data }));

/**
 * Get user profile by authentication ID (admin only)
 * Corresponds to GET /api/admin/users/{authId}
 */
export const getUserProfileByAuthId = async (
  authId: string
): Promise<ApiResponse<GetUserProfileByAuthIdResponse>> =>
  axiosClient.get<GetUserProfileByAuthIdResponse>(`/api/admin/users/${authId}`).then(res => ({ isSuccess: true, data: res.data }));

/**
 * Get user's aggregated context by authentication ID (admin only)
 * Corresponds to GET /api/admin/users/{authId}/context
 */
export const getUserContextByAuthId = async (
  authId: string
): Promise<ApiResponse<UserContextDto | null>> =>
  axiosClient
    .get<UserContextDto | null>(`/api/admin/users/${authId}/context`)
    .then(res => ({ isSuccess: true, data: res.data }));