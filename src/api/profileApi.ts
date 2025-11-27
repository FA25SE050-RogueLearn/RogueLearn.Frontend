// roguelearn-web/src/api/profileApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserProfileDto } from '../types/user-profile';

let __myProfileCache: { value: UserProfileDto | null; ts: number } | null = null;
let __myProfilePending: Promise<ApiResponse<UserProfileDto | null>> | null = null;
const __PROFILE_TTL_MS = 120000;

export const invalidateMyProfileCache = (): void => {
  __myProfileCache = null;
  __myProfilePending = null;
  if (typeof window !== 'undefined') {
    try { sessionStorage.removeItem('cache:profiles:me'); } catch {}
  }
};

const profileApi = {
  /**
   * Fetches the profile for the currently authenticated user.
   * Corresponds to GET /api/profiles/me
   */
  getMyProfile: (options?: { forceRefresh?: boolean }): Promise<ApiResponse<UserProfileDto | null>> => {
    const now = Date.now();
    const force = !!options?.forceRefresh;
    if (!force && __myProfileCache && now - __myProfileCache.ts < __PROFILE_TTL_MS) {
      return Promise.resolve({ isSuccess: true, data: __myProfileCache.value });
    }
    if (!force && typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('cache:profiles:me');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.ts && now - parsed.ts < __PROFILE_TTL_MS) {
            __myProfileCache = { value: parsed.value ?? null, ts: parsed.ts };
            return Promise.resolve({ isSuccess: true, data: __myProfileCache.value });
          }
        }
      } catch {}
    }
    if (!force && __myProfilePending) return __myProfilePending!;
    const pending: Promise<ApiResponse<UserProfileDto | null>> = axiosClient
      .get<UserProfileDto>('/api/profiles/me')
      .then(res => {
        __myProfileCache = { value: res.data ?? null, ts: now };
        if (typeof window !== 'undefined') {
          try { sessionStorage.setItem('cache:profiles:me', JSON.stringify(__myProfileCache)); } catch {}
        }
        return { isSuccess: true as const, data: res.data ?? null };
      })
      .finally(() => { __myProfilePending = null; });
    __myProfilePending = pending;
    return pending;
  },
};

export default profileApi;