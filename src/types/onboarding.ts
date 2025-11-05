/**
 * Feature: Onboarding
 * Purpose: Types for onboarding selections (academic routes and career classes) and completion command.
 * Source: User service DTOs used during the onboarding flow.
 */
/**
 * Represents an academic route (Curriculum Program) a user can select during onboarding.
 * Corresponds to RouteDto from the User service.
 */
export interface AcademicRoute {
  id: string;
  programName: string;
  programCode: string;
  description?: string;
}

/**
 * Represents a career specialization class a user can select during onboarding.
 * Corresponds to ClassDto from the User service.
 */
export interface CareerClass {
  id: string;
  name: string;
  description?: string;
  roadmapUrl?: string;
}

// ===== Queries =====
/** Query payload to list all available academic routes. */
export interface GetAllRoutesQueryRequest {}
export type GetAllRoutesResponse = AcademicRoute[];

/** Query payload to list all available career classes. */
export interface GetAllClassesQueryRequest {}
export type GetAllClassesResponse = CareerClass[];

// ===== Commands =====
/** Command payload to complete onboarding with selected route and class. */
export interface CompleteOnboardingCommandRequest {
  authUserId: string; // JSON-ignored in backend, included here for client clarity/routing
  curriculumProgramId: string;
  careerRoadmapId: string;
}
export type CompleteOnboardingResponse = void;