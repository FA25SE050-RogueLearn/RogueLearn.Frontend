// roguelearn-web/src/lib/api-server.ts
import axios from 'axios';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Creates pre-configured Axios clients for making authenticated API calls from within Next.js Server Components.
 * It automatically retrieves the user's JWT from the secure cookie store and attaches it to every outgoing request.
 * This ensures that your microservices can securely identify and authorize the user for each server-side operation.
 */
export async function createServerApiClients() {
    const cookieStore = cookies();
    const supabase = await createClient(); // This correctly uses the server-side cookie store
    
    // Retrieve the current user's session, which contains the access token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // A helper function to create a new Axios instance with the base URL and auth header
    const createClientInstance = (baseURL: string | undefined) => {
        const instance = axios.create({ baseURL });
        
        // If a token exists, set it as the default Authorization header for this instance
        if (token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return instance;
    };
    
    // Return a collection of ready-to-use API clients for each microservice
    return {
        userApiClient: createClientInstance(process.env.NEXT_PUBLIC_USER_API_URL),
        questApiClient: createClientInstance(process.env.NEXT_PUBLIC_QUEST_API_URL),
        codeBattleApiClient: createClientInstance(process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL),
    };
}