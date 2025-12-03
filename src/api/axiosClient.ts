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
const axiosClient = axios.create({});

// Developer hint
let hasWarnedMissingApiUrl = false;

/**
 * Auth interceptor - attaches JWT bearer token
 */
const authInterceptor = async (config: any) => {
  // Ensure baseURL is applied at runtime to avoid build-time inlining
  if (!config.baseURL) {
    const runtimeBase = process.env['NEXT_PUBLIC_API_URL'];
    if (runtimeBase) {
      config.baseURL = runtimeBase;
    } else if (!hasWarnedMissingApiUrl) {
      hasWarnedMissingApiUrl = true;
      try {
        toast.error('API base URL is not configured. Set NEXT_PUBLIC_API_URL');
      } catch {}
      console.warn('[axiosClient] NEXT_PUBLIC_API_URL is undefined.');
    }
  }
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

axiosClient.interceptors.request.use(authInterceptor);

/**
 * Maps HTTP status codes to user-friendly error messages
 */
const getStatusMessage = (status: number | undefined): string => {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized - Please log in again';
    case 403: return 'Access Denied - You do not have permission to access this resource';
    case 404: return 'Not Found';
    case 409: return 'Conflict - Resource already exists';
    case 422: return 'Validation Error';
    case 415: return 'Unsupported Media Type';
    case 429: return 'Too Many Requests - Please try again later';
    case 500: return 'Server Error - Please try again later';
    case 502: return 'Bad Gateway';
    case 503: return 'Service Unavailable';
    default: return status ? `Error ${status}` : 'Network error - Please check your connection';
  }
};

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
      // Use API error message if available, otherwise use status-based message
      const message = payload?.error?.message ?? getStatusMessage(status);
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
      const is403 = status === 403;
      const is422 = status === 422;
      const is415 = status === 415;
      const is429 = status === 429;

      // ⭐ Don't show toast for polling 404s - let caller decide
      if (!(isPollingEndpoint && is404)) {
        if (is403) {
          toast.error('Access Denied', {
            description: message,
          });
        } else {
          toast.error(message);
        }
      }

      // ⭐ Always attach normalized info for downstream handling
      (error as any).normalized = { status, message, details } as NormalizedApiErrorInfo;
      
      // ⭐ Store endpoint info for caller logic
      (error as any).isPollingEndpoint = isPollingEndpoint;
      (error as any).is404 = is404;
      (error as any).is403 = is403;
      (error as any).is422 = is422;
      (error as any).is415 = is415;
      (error as any).is429 = is429;
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
