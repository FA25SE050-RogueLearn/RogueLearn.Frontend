// roguelearn-web/src/api/axiosClient.ts
import axios, { AxiosError } from 'axios';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ApiErrorPayload, NormalizedApiErrorInfo } from '@/types/base/Error';

/**
 * Axios instance with smart error handling that:
 * - Silences 404s for polling endpoints (caller decides when to show toasts)
 * - Attach normalized error info to rejected promises
 * - Only shows user-facing toasts for genuine errors
 */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Developer hint
if (!process.env.NEXT_PUBLIC_API_URL) {
  try {
    toast.error('API base URL is not configured. Set NEXT_PUBLIC_API_URL in your .env.local');
  } catch {}
  console.warn('[axiosClient] NEXT_PUBLIC_API_URL is undefined. Requests will target the Next.js dev server origin.');
}

/**
 * Auth interceptor - attaches JWT bearer token
 */
const authInterceptor = async (config: any) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

axiosClient.interceptors.request.use(authInterceptor);

/**
 * ⭐ UPDATED: Response interceptor with smart 404 handling
 * 
 * Polling endpoints (checkGenerationStatus, getGenerationProgress) should NOT
 * trigger toast errors on 404, since:
 * - Job may not be ready yet (backend delay)
 * - Job may have completed and been cleaned up
 * 
 * Callers will handle retry logic and show appropriate UI feedback
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizeApiError = (err: AxiosError): NormalizedApiErrorInfo => {
      const status = err.response?.status;
      const payload = err.response?.data as ApiErrorPayload | undefined;
      const message = payload?.error?.message ?? 'Request failed';
      const details = payload?.error?.details;
      return { status, message, details };
    };

    if (axios.isAxiosError(error)) {
      const { status, message, details } = normalizeApiError(error);

      // ⭐ NEW: Silent 404 handling for polling endpoints
      const isPollingEndpoint = 
        error.config?.url?.includes('/generation-status/') ||
        error.config?.url?.includes('/generation-progress/');
      
      const is404 = status === 404;

      // ⭐ Don't show toast for polling 404s - let caller decide
      if (!(isPollingEndpoint && is404)) {
        toast.error(message);
      }

      // ⭐ Always attach normalized info for downstream handling
      (error as any).normalized = { status, message, details } as NormalizedApiErrorInfo;
      
      // ⭐ Store endpoint info for caller logic
      (error as any).isPollingEndpoint = isPollingEndpoint;
      (error as any).is404 = is404;
    } else {
      // Network or unexpected error - only show if not a polling endpoint
      toast.error('Unexpected error', {
        description: String(error),
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
