import axios from 'axios';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import https from 'https'; // Use the native Node.js https module on the server

/**
 * Creates pre-configured Axios clients for making authenticated API calls from within Next.js Server Components.
 * It automatically retrieves the user's JWT from the secure cookie store and attaches it to every outgoing request.
 * This ensures that your microservices can securely identify and authorize the user for each server-side operation.
 */
export async function createServerApiClients() {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // Create an httpsAgent for development to bypass self-signed certificate errors.
    const httpsAgent = new https.Agent({
        rejectUnauthorized: process.env.NODE_ENV === 'production',
    });

    const createClientInstance = (baseURL: string | undefined) => {
        // Pass the httpsAgent to the axios instance.
        const instance = axios.create({ baseURL, httpsAgent });
        
        if (token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return instance;
    };
    
    return {
        // The single client for the consolidated User, Quest, Social, and Meeting service.
        coreApiClient: createClientInstance(process.env.NEXT_PUBLIC_API_URL),
        // The separate client for the Code Battle service.
        codeBattleApiClient: createClientInstance(process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL),
    };
}