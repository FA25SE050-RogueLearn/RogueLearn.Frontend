// roguelearn-web/src/api/axiosCodeBattleClient.ts
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

/**
 * Creates a dedicated Axios instance for the Code Battle service.
 * It uses a different baseURL from the main client.
 */
const axiosCodeBattleClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL,
});

/**
 * An Axios interceptor that automatically attaches the user's JWT bearer token.
 */
const authInterceptor = async (config: any) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

// Apply the interceptor to the Code Battle client.
axiosCodeBattleClient.interceptors.request.use(authInterceptor);

export default axiosCodeBattleClient;