"use client";

/**
 * useGoogleMeet
 * Wrapper around Google Identity Services (GIS) to obtain OAuth2 access tokens
 * for Google Meet REST API calls. Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID.
 */
export type MeetScopes =
  | "https://www.googleapis.com/auth/meetings.space.created"
  | "https://www.googleapis.com/auth/meetings.space.readonly"
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
            callback: (resp: { access_token: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export function useGoogleMeet() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
          callback: (resp: { access_token: string }) => {
            if (!resp?.access_token) {
              reject(new Error("Failed to acquire access_token"));
            } else {
              resolve(resp.access_token);
            }
          },
        });
        tokenClient.requestAccessToken();
      } catch (err) {
        reject(err as Error);
      }
    });
  }

  return {
    requestToken,
  };
}