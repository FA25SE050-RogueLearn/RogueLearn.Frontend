import axios from 'axios';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import https from 'https';
import { cache } from 'react';

function sanitizeBaseURL(baseURL: string | undefined): string | undefined {
  if (!baseURL) return baseURL;
  const trimmed = baseURL.trim();
  const unquoted = trimmed.replace(/^["'`]+|["'`]+$/g, '');
  return unquoted.replace(/\/$/, '');
}

/**
 * Quick health check for the API endpoint
 * Returns true if healthy, false if unhealthy or timeout
 */
export async function checkApiHealth(baseURL: string | undefined): Promise<boolean> {
    console.log("Checking API health for in api-server.ts:", baseURL);
    const cleanBaseURL = sanitizeBaseURL(baseURL);
    if (!cleanBaseURL) return false;

    try {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: process.env.NODE_ENV === 'production',
        });

        const response = await axios.get(`${cleanBaseURL}/health`, {
            httpsAgent,
            timeout: 2000, // Fast 2-second timeout for health check
        });

        return response.status === 200;
    } catch (error) {
        console.warn(`API health check failed for ${baseURL}:`, error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}

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
        const cleanBaseURL = sanitizeBaseURL(baseURL);
        // Pass the httpsAgent to the axios instance with timeout
        const instance = axios.create({
            baseURL: cleanBaseURL,
            httpsAgent,
            timeout: 15000, // 15 second timeout to handle cold starts
        });

        if (token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        return instance;
    };
    
    return {
        // The single client for the consolidated User, Quest, Social, and Meeting service.
        coreApiClient: createClientInstance(process.env['NEXT_PUBLIC_API_URL']),
        // The separate client for the Code Battle service.
        codeBattleApiClient: createClientInstance(process.env['NEXT_PUBLIC_CODE_BATTLE_API_URL']),
    };
}

/**
 * Fetches user full info with retry logic for serverless environments
 */
async function fetchUserFullInfoWithRetry(maxRetries = 2): Promise<any> {
    const { coreApiClient } = await createServerApiClients();
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await coreApiClient.get('/api/users/me/full', {
                params: { 'page[size]': 20, 'page[number]': 1 }
            });
            return res.data;
        } catch (error) {
            lastError = error as Error;
            console.warn(`API call attempt ${attempt}/${maxRetries} failed:`, 
                error instanceof Error ? error.message : 'Unknown error');
            
            // Don't retry on auth errors (401, 403)
            if (axios.isAxiosError(error) && error.response?.status && 
                [401, 403].includes(error.response.status)) {
                throw error;
            }
            
            // Small delay before retry
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
    
    throw lastError || new Error('Failed to fetch user info after retries');
}

/**
 * Cached fetch for user full info - dedupes requests within same render
 */
export const getCachedUserFullInfo = cache(async () => {
    return await fetchUserFullInfoWithRetry(2);
});
