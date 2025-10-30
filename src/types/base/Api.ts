// roguelearn-web/src/types/base/Api.ts
/**
 * A generic wrapper for all API responses from the backend.
 * This provides a consistent structure for handling data and errors.
 * @template T The type of the data payload in a successful response.
 */
export interface ApiResponse<T> {
  // In a real application, the backend would wrap responses like this.
  // For now, we will simulate this wrapper in the service layer.
  // This structure is what we should aim for in the backend.
  data: T;
  isSuccess: boolean;
  message?: string;
  validationErrors?: string[];
}