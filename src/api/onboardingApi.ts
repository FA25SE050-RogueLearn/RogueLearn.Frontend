// roguelearn-web/src/api/onboardingApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import { AcademicRoute, CareerClass, CompleteOnboardingCommandRequest } from '../types/onboarding';

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
    
  // REMOVED: getVersionsForProgram is obsolete due to architectural changes.

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
  completeOnboarding: (payload: Omit<CompleteOnboardingCommandRequest, 'authUserId'>): Promise<void> =>
    axiosClient.post('/api/onboarding/complete', payload),
};

export default onboardingApi;