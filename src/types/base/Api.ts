// roguelearn-web/src/types/base/Api.ts

/**
 * Feature: Base API Types
 * Purpose: Provide a generic, consistent wrapper for all backend API responses so
 *          frontend code can uniformly handle success, messages, and validation errors.
 * References: Used by import/validation flows (e.g., curriculum-import, roadmap-import)
 *             and polling flows (quest generation, background jobs)
 * Mapping: T is the generic payload type returned on success.
 * @template T The type of the data payload in a successful response.
 * 
 * ⭐ NEW: Added is404 and isPollingEndpoint flags for smart polling error handling.
 *         These allow callers to distinguish between:
 *         - 404 from polling (job not ready yet - keep polling)
 *         - 404 from regular endpoints (genuine 404 error - show toast)
 *         - Other errors (network, server - show toast with retry)
 */
export type ApiResponse<T> = 
  | {
      data: T;
      isSuccess: true;
      message?: string;
      validationErrors?: string[];
      is404?: false;
      isPollingEndpoint?: boolean;
    }
  | {
      data: null;
      isSuccess: false;
      message: string;
      validationErrors?: string[];
      is404?: boolean;              // ⭐ NEW: true if 404 error (only for polling endpoints)
      isPollingEndpoint?: boolean;  // ⭐ NEW: true if this was a polling endpoint call
    };

/**
 * ⭐ OPTIONAL: Polling-specific response type for stricter typing
 * Use this when you want to be explicit about polling endpoint responses
 */
export type PollingApiResponse<T> = Exclude<
  ApiResponse<T>,
  { isSuccess: true; data: T } & { is404: true } // Impossible state: success + 404
>;