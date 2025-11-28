/**
 * Feature: User Roles
 * Purpose: Manage and query user roles for authorization and feature access.
 */
// ===== User Roles (Queries) =====
export interface UserRoleDto {
  roleId: string;
  roleName: string;
  description?: string | null;
  assignedAt: string; // DateTimeOffset
}

/** Query payload to list roles for a given user. */
export interface GetUserRolesQueryRequest {
  authUserId: string;
}
/** Response containing all roles assigned to the user. */
export interface GetUserRolesResponse {
  authUserId: string;
  roles: UserRoleDto[];
}

/** Command payload to assign a role to a user. */
export interface AssignRoleToUserCommandRequest {
  authUserId: string;
  roleId: string;
}
export type AssignRoleToUserResponse = void;

/** Command payload to remove a role from a user. */
export interface RemoveRoleFromUserCommandRequest {
  authUserId: string;
  roleId: string;
}
export type RemoveRoleFromUserResponse = void;