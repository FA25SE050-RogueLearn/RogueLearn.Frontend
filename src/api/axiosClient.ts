// roguelearn-web/src/api/axiosClient.ts
import axios, { AxiosError } from 'axios';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ApiErrorPayload, NormalizedApiErrorInfo } from '@/types/base/Error';

/**
 * Creates and configures a single, centralized Axios instance for making client-side
 * requests to the consolidated core backend service.
 *
 * This client is the foundational "engine" for our frontend's service layer.
 */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/**
 * An Axios interceptor that automatically attaches the user's JWT bearer token
 * to every outgoing request. This handles authentication for all API calls made
 * through this client.
 */
const authInterceptor = async (config: any) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

// Apply the interceptor to the client.
axiosClient.interceptors.request.use(authInterceptor);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error normalization and user feedback based on backend contract
    const normalizeApiError = (err: AxiosError): NormalizedApiErrorInfo => {
      const status = err.response?.status;
      const payload = err.response?.data as ApiErrorPayload | undefined;
      // Show ONLY the backend-provided message when available; avoid axios generic messages
      const message = payload?.error?.message ?? 'Request failed';
      const details = payload?.error?.details;
      return { status, message, details };
    };

    if (axios.isAxiosError(error)) {
      const { status, message, details } = normalizeApiError(error);

      // Show only the message (no description) for all statuses
      toast.error(message);

      // Attach normalized info for downstream consumers (e.g., forms)
      (error as any).normalized = { status, message, details } as NormalizedApiErrorInfo;
    } else {
      // Network or unexpected error
      toast.error('Unexpected error', {
        description: String(error),
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;