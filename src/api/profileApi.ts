// roguelearn-web/src/api/profileApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { UserProfileDto, GetAllUserProfilesResponse, GetUserProfileByAuthIdResponse, FullUserInfoSocialResponse, SearchProfilesResponse, SuggestedAlliesResponse, TopRankedResponse, UserProfileSearchResult } from '../types/user-profile';

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
  getAllUserProfilesAuthorized: (): Promise<ApiResponse<GetAllUserProfilesResponse>> =>
    axiosClient.get<GetAllUserProfilesResponse>('/api/profiles').then(res => ({ isSuccess: true, data: res.data })),
  getByAuthId: (authId: string): Promise<ApiResponse<GetUserProfileByAuthIdResponse>> =>
    axiosClient.get<UserProfileDto>(`/api/profiles/${authId}`).then(res => ({ isSuccess: true, data: res.data ?? null })),
  getSocialByAuthId: (authId: string, page?: { size?: number; number?: number }): Promise<ApiResponse<FullUserInfoSocialResponse>> => {
    const qs = new URLSearchParams();
    if (page?.size) qs.set('page[size]', String(page.size));
    if (page?.number) qs.set('page[number]', String(page.number));
    const url = qs.toString() ? `/api/profiles/${authId}/social?${qs.toString()}` : `/api/profiles/${authId}/social`;
    return axiosClient.get<FullUserInfoSocialResponse>(url).then(res => ({ isSuccess: true, data: res.data }));
  },
  search: async (q: string, limit = 20): Promise<ApiResponse<SearchProfilesResponse>> => {
    const qParam = q?.trim();
    try {
      const res = await axiosClient.get<SearchProfilesResponse>('/api/profiles/search', { params: { q: qParam, limit } });
      return { isSuccess: true, data: res.data };
    } catch {
      const list = await profileApi.getAllUserProfilesAuthorized();
      const base = list.data?.userProfiles ?? [];
      const filtered = base.filter(u => {
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '';
        const email = u.email || '';
        const s = qParam.toLowerCase();
        if (!s) return true;
        return name.toLowerCase().includes(s) || email.toLowerCase().includes(s) || u.authUserId.toLowerCase().includes(s);
      });
      const mapped: UserProfileSearchResult[] = filtered.slice(0, limit).map(u => ({
        authUserId: u.authUserId,
        username: u.username,
        email: u.email,
        profileImageUrl: u.profileImageUrl ?? null,
        className: null,
        guildName: null,
      }));
      return { isSuccess: true, data: { results: mapped } };
    }
  },
  suggestedAllies: async (limit = 10): Promise<ApiResponse<SuggestedAlliesResponse>> => {
    const me = await profileApi.getMyProfile();
    const list = await profileApi.getAllUserProfilesAuthorized();
    const mine = me.data ?? null;
    const base = list.data?.userProfiles ?? [];
    const filtered = base.filter(u => {
      if (!mine) return true;
      if (mine.classId && u.classId === mine.classId) return true;
      if (mine.routeId && u.routeId === mine.routeId) return true;
      return false;
    });
    const mapped: UserProfileSearchResult[] = filtered.slice(0, limit).map(u => ({
      authUserId: u.authUserId,
      username: u.username,
      email: u.email,
      profileImageUrl: u.profileImageUrl ?? null,
      className: null,
      guildName: null,
    }));
    return { isSuccess: true, data: { users: mapped } };
  },
  topRanked: async (limit = 3): Promise<ApiResponse<TopRankedResponse>> => {
    const list = await profileApi.getAllUserProfilesAuthorized();
    const base = list.data?.userProfiles ?? [];
    const sorted = [...base].slice(0, limit);
    const mapped: UserProfileSearchResult[] = sorted.map(u => ({
      authUserId: u.authUserId,
      username: u.username,
      email: u.email,
      profileImageUrl: u.profileImageUrl ?? null,
      className: null,
      guildName: null,
    }));
    return { isSuccess: true, data: { users: mapped } };
  },
};

export default profileApi;