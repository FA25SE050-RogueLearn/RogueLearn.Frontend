// roguelearn-web/src/api/axiosCodeBattleClient.ts
import axios, { AxiosError } from 'axios';
import { createClient } from '@/utils/supabase/client';
import { NormalizedApiErrorInfo } from '@/types/base/Error';

/**
 * Event Service API response format:
 * {
 *   "success": boolean,
 *   "data": { ... } | null,
 *   "message": string,
 *   "error_message": string
 * }
 */
interface EventServiceErrorResponse {
  success: boolean;
  data?: any;
  message?: string;
  error_message?: string;
}

/**
 * Creates a dedicated Axios instance for the Code Battle / Event service.
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
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

// Apply the interceptor to the Code Battle client.
axiosCodeBattleClient.interceptors.request.use(authInterceptor);

/**
 * Maps HTTP status codes to user-friendly error messages for Event Service
 */
const getStatusMessage = (status: number | undefined): string => {
  switch (status) {
    case 400: return 'Bad Request - Validation failed';
    case 401: return 'Unauthorized - Please log in again';
    case 403: return 'Access Denied - You do not have permission';
    case 404: return 'Not Found';
    case 409: return 'Conflict - Resource already exists';
    case 422: return 'Validation Error';
    case 429: return 'Too Many Requests - Please try again later';
    case 500: return 'Server Error - Please try again later';
    default: return 'Request failed';
  }
};

// Response interceptor with Event Service-specific error handling
axiosCodeBattleClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizeEventServiceError = (err: AxiosError): NormalizedApiErrorInfo => {
      const status = err.response?.status;
      const payload = err.response?.data as EventServiceErrorResponse | undefined;
      
      // Event Service returns: { success, data, message, error_message }
      // Extract the most relevant error message
      const message = payload?.message || 
                      payload?.error_message || 
                      getStatusMessage(status);
      
      // For validation errors, the data field contains detailed results
      const details = payload?.data;
      
      return { status, message, details };
    };

    if (axios.isAxiosError(error)) {
      const normalized = normalizeEventServiceError(error);
      
      // Attach normalized info for the caller to use
      (error as any).normalized = normalized;
      
      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[EventService Error]', {
          status: normalized.status,
          message: normalized.message,
          details: normalized.details,
          url: error.config?.url,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosCodeBattleClient;
