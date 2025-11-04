/**
 * Feature: Subjects
 * Source: RogueLearn.User.Application Features/Subjects
 * Purpose: Manage academic subjects metadata and CRUD operations.
 * Mapping:
 * - Guid -> string (UUID)
 * - DateTimeOffset -> string (ISO timestamp)
 */

/** Subject entity used across curriculum and academic features. */
export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Command payload to create a subject. */
export interface CreateSubjectCommandRequest {
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
}

/** Response returned after creating a subject. */
export type CreateSubjectResponse = Subject;

/** Command payload to update a subject. */
export interface UpdateSubjectCommandRequest {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
}

/** Response returned after updating a subject. */
export type UpdateSubjectResponse = Subject;

/** Command payload to delete a subject by id. */
export interface DeleteSubjectCommandRequest {
  id: string;
}

/** Response for fetching all subjects. */
export type GetAllSubjectsResponse = Subject[];

/** Query payload to fetch a subject by id. */
export interface GetSubjectByIdQueryRequest {
  id: string;
}

/** Response for fetching a subject by id. */
export type GetSubjectByIdResponse = Subject;