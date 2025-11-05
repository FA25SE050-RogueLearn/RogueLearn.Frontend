/**
 * Feature: Roles
 * Purpose: Define types for creating, updating, deleting, and querying user roles.
 * Mapping Rules:
 * - Guid -> string
 * - DateTimeOffset -> string (ISO 8601)
 */

/** Role data transfer object returned by queries. */
export interface RoleDto {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

/** Command payload for creating a new role. */
export interface CreateRoleCommandRequest {
  name: string;
  description?: string | null;
}

/** Response payload after a role is created. */
export interface CreateRoleResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

/** Command payload for updating an existing role. */
export interface UpdateRoleCommandRequest {
  id: string;
  name: string;
  description?: string | null;
}

/** Response payload after a role is updated. */
export interface UpdateRoleResponse {
  id: string;
  name: string;
  description?: string | null;
  updatedAt: string; // backend uses DateTime
}

/** Command payload for deleting a role by identifier. */
export interface DeleteRoleCommandRequest {
  id: string;
}
export type DeleteRoleResponse = void;

/** Query to get all roles. */
export interface GetAllRolesQueryRequest {}
export interface GetAllRolesResponse {
  roles: RoleDto[];
}