/**
 * Feature: Base API Types
 * Purpose: Provide a generic, consistent wrapper for all backend API responses so
 *          frontend code can uniformly handle success, messages, and validation errors.
 * References: Used by import/validation flows (e.g., curriculum-import, roadmap-import)
 * Mapping: T is the generic payload type returned on success.
 * @template T The type of the data payload in a successful response.
 */
export type ApiResponse<T> = 
  | { data: T; isSuccess: true; message?: string; validationErrors?: string[] }
  | { data: null; isSuccess: false; message: string; validationErrors?: string[] };
