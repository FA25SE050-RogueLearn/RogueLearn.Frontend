/**
 * Feature: Class Nodes
 * Purpose: Hierarchical nodes within a class roadmap (chapters, lessons, tasks) including CRUD and tree queries.
 * Source: RogueLearn.User.Application Features/ClassNodes and Domain ClassNode entity
 */

/** Flat class node entity representation. */
export interface ClassNode {
  id: string;
  classId: string;
  parentId?: string | null;
  title: string;
  nodeType?: string | null;
  description?: string | null;
  sequence: number;
  isActive: boolean;
  isLockedByImport: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

/** Tree item combining a node with its recursive children. */
export interface ClassNodeTreeItem {
  node: ClassNode;
  children: ClassNodeTreeItem[];
}

// Commands
/** Command payload to create a new class node. */
export interface CreateClassNodeCommandRequest {
  classId: string;
  title: string;
  nodeType?: string | null;
  description?: string | null;
  parentId?: string | null;
  sequence: number;
}

/** Response containing the created class node. */
export type CreateClassNodeResponse = ClassNode;

/** Command payload to update an existing class node. */
export interface UpdateClassNodeCommandRequest {
  classId: string;
  nodeId: string;
  title: string;
  nodeType?: string | null;
  description?: string | null;
  sequence: number;
}

/** Response containing the updated class node. */
export type UpdateClassNodeResponse = ClassNode;

/** Command payload to soft-delete a class node. */
export interface SoftDeleteClassNodeCommandRequest {
  classId: string;
  nodeId: string;
}

/** Command payload to lock or unlock a node for import protection. */
export interface ToggleLockClassNodeCommandRequest {
  classId: string;
  nodeId: string;
  isLocked: boolean;
  reason?: string | null;
}

/** Command payload to move a node under a new parent and sequence. */
export interface MoveClassNodeCommandRequest {
  classId: string;
  nodeId: string;
  newParentId?: string | null;
  newSequence: number;
}

/** Command payload to reorder child nodes under a parent. */
export interface ReorderClassNodesCommandRequest {
  classId: string;
  parentId?: string | null;
  items: { nodeId: string; sequence: number }[];
}

// Queries
/** Query payload to get a flat list of class nodes. */
export interface GetFlatClassNodesQueryRequest {
  classId: string;
  onlyActive?: boolean; // default false
}

/** Response containing a flat list of class nodes. */
export type GetFlatClassNodesResponse = ClassNode[];

/** Query payload to get the hierarchical tree of class nodes. */
export interface GetTreeClassNodesQueryRequest {
  classId: string;
  onlyActive?: boolean; // default false
}

/** Response containing the tree of class nodes. */
export type GetTreeClassNodesResponse = ClassNodeTreeItem[];