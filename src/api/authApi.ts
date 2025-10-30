// roguelearn-web/src/api/authApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';

interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const authApi = {
  /**
   * Refreshes an expired access token. (Placeholder for future implementation)
   */
  refreshToken: (request: RefreshTokenRequest) =>
    axiosClient.post<ApiResponse<TokenResponse>>('/auth/refresh-token', request),
};

export default authApi;