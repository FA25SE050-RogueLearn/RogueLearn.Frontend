// roguelearn-web/src/api/onboardingApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { AcademicRoute, CareerClass, OnboardingVersion } from '../types/onboarding';

const onboardingApi = {
  /**
   * Fetches all available academic routes (curriculum programs).
   * Corresponds to GET /api/onboarding/routes
   */
  getRoutes: (): Promise<ApiResponse<AcademicRoute[]>> =>
    axiosClient.get<AcademicRoute[]>('/api/onboarding/routes').then(res => ({
        isSuccess: true,
        data: res.data
    })),
    
  // ADDED: New function to fetch versions for a specific program.
  /**
   * Fetches all active curriculum versions for a given academic route (program).
   * Corresponds to GET /api/onboarding/routes/{programId}/versions
   */
  getVersionsForProgram: (programId: string): Promise<ApiResponse<OnboardingVersion[]>> =>
    axiosClient.get<OnboardingVersion[]>(`/api/onboarding/routes/${programId}/versions`).then(res => ({
        isSuccess: true,
        data: res.data
    })),

  /**
   * Fetches all available career specialization classes.
   * Corresponds to GET /api/onboarding/classes
   */
  getClasses: (): Promise<ApiResponse<CareerClass[]>> =>
    axiosClient.get<CareerClass[]>('/api/onboarding/classes').then(res => ({
        isSuccess: true,
        data: res.data
    })),

  /**
   * Submits the user's final onboarding choices.
   * Corresponds to POST /api/onboarding/complete
   */
  completeOnboarding: (curriculumProgramId: string, careerRoadmapId: string): Promise<void> =>
    // The post method returns an AxiosPromise, which resolves to void on success
    // for a 204 No Content response, matching our needs.
    axiosClient.post('/api/onboarding/complete', {
      curriculumProgramId,
      careerRoadmapId,
    }),
};

export default onboardingApi;