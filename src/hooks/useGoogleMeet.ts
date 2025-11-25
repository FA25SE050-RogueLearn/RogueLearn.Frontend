"use client";

/**
 * useGoogleMeet
 * Wrapper around Google Identity Services (GIS) to obtain OAuth2 access tokens
 * for Google Meet REST API calls. Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID.
 */
export type MeetScopes =
  | "https://www.googleapis.com/auth/meetings.space.created"
  | "https://www.googleapis.com/auth/meetings.space.readonly"
  | "https://www.googleapis.com/auth/drive.readonly"
  // Note: Do NOT request "https://www.googleapis.com/auth/meeting" — this scope is invalid
  // for the Google Meet REST API and will cause an `invalid_scope` error.

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            access_type: string;
            callback: (resp: { access_token: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export function useGoogleMeet() {
  const clientId = process.env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'];

  async function getAccessToken(scopes: MeetScopes[] | string): Promise<string> {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = (session as any)?.provider_token as string | undefined;
      if (providerToken) {
        return providerToken;
      }
    } catch {}
    try {
      const stored = sessionStorage.getItem('googleProviderToken');
      if (stored) return stored;
    } catch {}
    return requestToken(scopes);
  }

  async function requestToken(scopes: MeetScopes[] | string): Promise<string> {
    const scopeString = Array.isArray(scopes) ? scopes.join(" ") : scopes;
    return new Promise((resolve, reject) => {
      if (!clientId) {
        reject(
          new Error(
            "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Set it in your environment."
          )
        );
        return;
      }
      if (!window.google?.accounts?.oauth2?.initTokenClient) {
        reject(
          new Error(
            "Google Identity Services script not loaded. Ensure layout includes the gsi client script."
          )
        );
        return;
      }
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: scopeString,
          access_type: "offline",
          callback: (resp: { access_token: string }) => {
            if (!resp?.access_token) {
              reject(new Error("Failed to acquire access_token"));
            } else {
              try { sessionStorage.setItem('googleProviderToken', resp.access_token); } catch {}
              resolve(resp.access_token);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err as Error);
      }
    });
  }

  async function refreshAccessToken(): Promise<string> {
    try {
      const rt = localStorage.getItem('googleProviderRefreshToken');
      if (!rt) throw new Error('Missing refresh token');
      const res = await fetch('/api/google/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const at = data?.access_token as string | undefined;
      if (!at) throw new Error('Missing access_token');
      try { sessionStorage.setItem('googleProviderToken', at); } catch {}
      return at;
    } catch (e) {
      throw e as Error;
    }
  }

  return {
    requestToken,
    getAccessToken,
    refreshAccessToken,
  };
}
