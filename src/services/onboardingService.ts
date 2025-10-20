// roguelearn-web/src/services/onboardingService.ts
import { userApiClient } from "@/lib/api";
import { AcademicRoute, CareerClass } from "@/types/onboarding";

/**
 * Fetches all available academic routes (curriculum programs) for user selection.
 * Corresponds to GET /api/onboarding/routes in the User service.
 * @returns A promise that resolves to an array of AcademicRoute objects.
 */
export const getRoutes = async (): Promise<AcademicRoute[]> => {
  try {
    const response = await userApiClient.get<AcademicRoute[]>("/api/onboarding/routes");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch academic routes:", error);
    // In a real app, you'd handle this error more gracefully (e.g., show a toast notification)
    return [];
  }
};

/**
 * Fetches all available career specialization classes for user selection.
 * Corresponds to GET /api/onboarding/classes in the User service.
 * @returns A promise that resolves to an array of CareerClass objects.
 */
export const getClasses = async (): Promise<CareerClass[]> => {
  try {
    const response = await userApiClient.get<CareerClass[]>("/api/onboarding/classes");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch career classes:", error);
    return [];
  }
};

/**
 * Submits the user's final onboarding choices to the backend.
 * Corresponds to POST /api/onboarding/complete in the User service.
 * @param curriculumVersionId The ID of the selected academic route (maps to a curriculum version).
 * @param careerRoadmapId The ID of the selected career class.
 * @returns A promise that resolves when the operation is complete.
 */
export const completeOnboarding = async (curriculumVersionId: string, careerRoadmapId: string): Promise<void> => {
  try {
    await userApiClient.post("/api/onboarding/complete", {
      curriculumVersionId,
      careerRoadmapId,
    });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    // Rethrow the error so the UI component can handle it
    throw error;
  }
};