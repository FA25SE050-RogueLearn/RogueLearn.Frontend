// roguelearn-web/src/types/onboarding.ts
/**
 * Represents an academic route (Curriculum Program) a user can select during onboarding.
 * This corresponds to the RouteDto from the User service.
 */
export interface AcademicRoute {
  id: string;
  programName: string;
  programCode: string;
  description?: string;
}

/**
 * Represents a career specialization class a user can select during onboarding.
 * This corresponds to the ClassDto from the User service.
 */
export interface CareerClass {
  id: string;
  name: string;
  description?: string;
  roadmapUrl?: string;
}