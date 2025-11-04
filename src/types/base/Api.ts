/**
 * Feature: Base API Types
 * Purpose: Provide a generic, consistent wrapper for all backend API responses so
 *          frontend code can uniformly handle success, messages, and validation errors.
 * References: Used by import/validation flows (e.g., curriculum-import, roadmap-import)
 * Mapping: T is the generic payload type returned on success.
 * @template T The type of the data payload in a successful response.
 */
export interface ApiResponse<T> {
  /** The data payload returned when the operation succeeds. */
  data: T;
  /** Indicates whether the request completed successfully. */
  isSuccess: boolean;
  /** Optional message, typically for user-facing feedback or debugging. */
  message?: string;
  /** Optional structured validation errors (usually field-level). */
  validationErrors?: string[];
}