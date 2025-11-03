/**
 * Feature: Syllabus
 * Purpose: Represent syllabus version metadata used within curriculum features.
 */
export interface SyllabusVersionDetailsDto {
  id: string;
  versionNumber: number;
  effectiveDate: string; // DateOnly
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  hasContent: boolean;
}