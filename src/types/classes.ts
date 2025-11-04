/**
 * Feature: Classes
 * Purpose: Manage class entities and their DTO forms for onboarding and learning roadmaps.
 * Source: RogueLearn.User.Application Features/Classes and Domain Entities
 */

/** Difficulty classification for a class (domain entity string form). */
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

/** Domain entity shape for persisted classes. */
export interface ClassEntity {
  id: string;
  name: string;
  description?: string;
  roadmapUrl?: string;
  skillFocusAreas?: string[] | null;
  difficultyLevel: DifficultyLevel; // Domain entity may emit enum as string
  estimatedDurationMonths?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Application-layer DTO where difficulty is represented as an integer. */
export interface ClassDetail {
  id: string;
  name: string;
  description?: string;
  roadmapUrl?: string;
  skillFocusAreas?: string[] | null;
  difficultyLevel: number; // mapped from enum in backend
  estimatedDurationMonths?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Commands
/** Command payload to create a new class. */
export interface CreateClassCommandRequest {
  name: string;
  description?: string;
  roadmapUrl?: string;
  skillFocusAreas?: string[] | null;
  difficultyLevel?: number | null; // int on command
  estimatedDurationMonths?: number | null;
  isActive?: boolean | null;
}

/** Command payload to update an existing class. */
export interface UpdateClassCommandRequest {
  id: string;
  name?: string | null;
  description?: string | null;
  roadmapUrl?: string | null;
  skillFocusAreas?: string[] | null;
  difficultyLevel?: number | null;
  estimatedDurationMonths?: number | null;
  isActive?: boolean | null;
}

// Queries
/** Query payload to list classes, optionally filtering by active flag. */
export interface GetClassesQueryRequest {
  active?: boolean | null;
}

// Depending on handler, this may return ClassEntity[]
/** Response containing classes. */
export type GetClassesResponse = ClassEntity[];

/** Query payload to fetch a class by id. */
export interface GetClassByIdQueryRequest {
  id: string;
}

/** Response containing the requested class or null if not found. */
export type GetClassByIdResponse = ClassEntity | null;