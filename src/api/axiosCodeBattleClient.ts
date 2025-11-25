// roguelearn-web/src/api/axiosCodeBattleClient.ts
import axios, { AxiosError } from 'axios';
import { createClient } from '@/utils/supabase/client';
import { ApiErrorPayload, NormalizedApiErrorInfo } from '@/types/base/Error';

/**
 * Creates a dedicated Axios instance for the Code Battle service.
 * It uses a different baseURL from the main client.
 */
const axiosCodeBattleClient = axios.create({});

/**
 * An Axios interceptor that automatically attaches the user's JWT bearer token.
 */
const authInterceptor = async (config: any) => {
  if (!config.baseURL) {
    const runtimeBase = process.env['NEXT_PUBLIC_CODE_BATTLE_API_URL'];
    if (runtimeBase) {
      config.baseURL = runtimeBase;
    }
  }
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

// Apply the interceptor to the Code Battle client.
axiosCodeBattleClient.interceptors.request.use(authInterceptor);

// Mirror error handling to provide consistent behavior across clients
axiosCodeBattleClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizeApiError = (err: AxiosError): NormalizedApiErrorInfo => {
      const status = err.response?.status;
      const payload = err.response?.data as ApiErrorPayload | undefined;
      // Prefer backend message; avoid axios generic error text
      const message = payload?.error?.message ?? 'Request failed';
      const details = payload?.error?.details;
      return { status, message, details };
    };

    if (axios.isAxiosError(error)) {
      const { status, message, details } = normalizeApiError(error);
      if (status === 400) {
        // Keep Code Battle UX consistent
        // No global toast library imported here on purpose; rely on callers to display messages.
        // Attach normalized info for the caller
        (error as any).normalized = { status, message, details } as NormalizedApiErrorInfo;
      } else {
        (error as any).normalized = { status, message, details } as NormalizedApiErrorInfo;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosCodeBattleClient;
