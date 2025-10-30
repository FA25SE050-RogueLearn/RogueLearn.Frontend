// roguelearn-web/src/api/axiosClient.ts
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

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

export default axiosClient;