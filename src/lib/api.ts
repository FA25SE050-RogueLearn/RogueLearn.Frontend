import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

// Create a reusable authentication interceptor.
// This function will be called before each request is sent.
const authInterceptor = async (config: any) => {
  // Create a Supabase client instance to access the current session.
  const supabase = createClient();
  
  // Get the session, which contains the JWT access token.
  const { data: { session } } = await supabase.auth.getSession();

  // If a session exists and has an access token, add it to the Authorization header.
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
};

// A single, consolidated Axios instance for the core backend service.
// This client will handle requests for the User, Quest, Social, and Meeting domains.
export const coreApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// A dedicated Axios instance for the separate Code Battle Service.
export const codeBattleApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL,
});

// Apply the authentication interceptor to all our API clients.
// Now, any request made using these clients will automatically include the JWT.
coreApiClient.interceptors.request.use(authInterceptor);
codeBattleApiClient.interceptors.request.use(authInterceptor);