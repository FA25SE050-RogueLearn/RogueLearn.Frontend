import { createClient } from "@/utils/supabase/client";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Centralized logout utility that properly clears all caches and session data
 * to prevent data leakage between different user accounts.
 */
export async function performLogout(queryClient?: QueryClient) {
  // 1. Sign out from Supabase
  const supabase = createClient();
  await supabase.auth.signOut();

  // 2. Clear React Query cache if provided
  if (queryClient) {
    queryClient.clear();
  }

  // 3. Clear authentication cookies
  try {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const domain = process.env['NEXT_PUBLIC_COOKIE_DOMAIN'];
    const secure = isHttps ? '; Secure' : '';
    const sameSite = isHttps ? 'None' : 'Lax';
    const dom = domain ? `; Domain=${domain}` : '';
    
    // Clear all auth-related cookies
    document.cookie = `rl_access_token=; Path=/; Max-Age=0${secure}; SameSite=${sameSite}${dom}`;
    document.cookie = `rl_refresh_token=; Path=/; Max-Age=0${secure}; SameSite=${sameSite}${dom}`;
    
    // Clear any other potential auth cookies
    document.cookie = `sb-access-token=; Path=/; Max-Age=0${secure}; SameSite=${sameSite}${dom}`;
    document.cookie = `sb-refresh-token=; Path=/; Max-Age=0${secure}; SameSite=${sameSite}${dom}`;
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }

  // 4. Clear localStorage and sessionStorage (preserve only non-sensitive data)
  try {
    if (typeof window !== 'undefined') {
      // List of keys to preserve (e.g., theme preferences, language settings)
      const keysToPreserve = ['theme', 'language', 'cookieConsent'];
      
      // Backup preserved data
      const preservedData: Record<string, string | null> = {};
      keysToPreserve.forEach(key => {
        preservedData[key] = localStorage.getItem(key);
      });
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore preserved data
      keysToPreserve.forEach(key => {
        if (preservedData[key]) {
          localStorage.setItem(key, preservedData[key]!);
        }
      });
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }

  // 5. Clear any axios client caches if they exist
  try {
    // This will be picked up by the axios interceptors on next request
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  } catch (error) {
    console.error('Error dispatching logout event:', error);
  }

  // 6. Force reload to clear any in-memory state and Next.js cache
  if (typeof window !== 'undefined') {
    // Use router.push in the calling component, but add cache busting
    window.location.href = '/login?t=' + Date.now();
  }
}
