/**
 * API Error payload contract based on backend responses.
 * The backend returns 400 bodies like:
 * { error: { message: string; details: ValidationFailure[] | string | unknown } }
 */
export interface ApiErrorPayload {
  error?: {
    message?: string;
    details?: unknown;
  };
}

/**
 * FluentValidation failure item returned for validation errors.
 */
export interface ValidationFailure {
  propertyName: string;
  errorMessage: string;
  attemptedValue?: unknown;
  errorCode?: string;
  customState?: unknown;
}

/**
 * Normalized error information attached by axios interceptors for convenience.
 */
export interface NormalizedApiErrorInfo {
  status?: number;
  message: string;
  details?: unknown;
}