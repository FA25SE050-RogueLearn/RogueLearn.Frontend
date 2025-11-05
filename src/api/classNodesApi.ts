import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  ClassNode as ClassNodeDto,
  ClassNodeTreeItem as ClassNodeTreeItemDto,
  CreateClassNodeCommandRequest,
  CreateClassNodeResponse,
  UpdateClassNodeCommandRequest,
  UpdateClassNodeResponse,
  MoveClassNodeCommandRequest,
  ReorderClassNodesCommandRequest,
  ToggleLockClassNodeCommandRequest,
  SoftDeleteClassNodeCommandRequest,
  GetFlatClassNodesQueryRequest,
  GetFlatClassNodesResponse,
  GetTreeClassNodesQueryRequest,
  GetTreeClassNodesResponse,
} from '@/types/class-nodes';

/**
 * API for managing class nodes (Admin only)
 * Base route: /api/admin/classes/{classId}/nodes
 */
export const classNodesApi = {
  /**
   * Get a flat list of nodes for a class
   */
  getFlatNodes: async (
    payload: GetFlatClassNodesQueryRequest
  ): Promise<ApiResponse<GetFlatClassNodesResponse>> =>
    axiosClient
      .get<ClassNodeDto[]>(`/api/admin/classes/${payload.classId}/nodes/flat`, { params: { onlyActive: payload.onlyActive ?? false } })
      .then(res => ({ isSuccess: true, data: res.data })),

  /**
   * Get a hierarchical tree of nodes for a class
   */
  getTreeNodes: async (
    payload: GetTreeClassNodesQueryRequest
  ): Promise<ApiResponse<GetTreeClassNodesResponse>> =>
    axiosClient
      .get<ClassNodeTreeItemDto[]>(`/api/admin/classes/${payload.classId}/nodes/tree`, { params: { onlyActive: payload.onlyActive ?? false } })
      .then(res => ({ isSuccess: true, data: res.data })),

  /**
   * Create a new node under a parent (or as root if parentId is null)
   */
  createNode: async (
    payload: Omit<CreateClassNodeCommandRequest, 'classId' | 'sequence'> & { classId: string; sequence?: number }
  ): Promise<ApiResponse<CreateClassNodeResponse>> =>
    axiosClient
      .post<ClassNodeDto>(`/api/admin/classes/${payload.classId}/nodes`, {
        title: payload.title,
        nodeType: payload.nodeType ?? undefined,
        description: payload.description ?? undefined,
        parentId: payload.parentId ?? undefined,
        sequence: payload.sequence,
      })
      .then(res => ({ isSuccess: true, data: res.data })),

  /**
   * Update a node's attributes or sequence
   */
  updateNode: async (
    payload: UpdateClassNodeCommandRequest
  ): Promise<ApiResponse<UpdateClassNodeResponse>> =>
    axiosClient
      .put<ClassNodeDto>(`/api/admin/classes/${payload.classId}/nodes/${payload.nodeId}`, {
        title: payload.title,
        nodeType: payload.nodeType ?? undefined,
        description: payload.description ?? undefined,
        sequence: payload.sequence,
      })
      .then(res => ({ isSuccess: true, data: res.data })),

  /**
   * Move a node to a new parent and sequence
   */
  moveNode: async (payload: MoveClassNodeCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/admin/classes/${payload.classId}/nodes/${payload.nodeId}/move`, {
        newParentId: payload.newParentId ?? undefined,
        newSequence: payload.newSequence,
      })
      .then(() => {}),

  /**
   * Bulk reorder direct children under a parent
   */
  reorderNodes: async (payload: ReorderClassNodesCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/admin/classes/${payload.classId}/nodes/reorder`, {
        parentId: payload.parentId ?? undefined,
        items: payload.items,
      })
      .then(() => {}),

  /**
   * Soft delete a node (sets is_active=false and compacts sibling sequence)
   */
  deleteNode: async (payload: SoftDeleteClassNodeCommandRequest): Promise<void> =>
    axiosClient.delete<void>(`/api/admin/classes/${payload.classId}/nodes/${payload.nodeId}`).then(() => {}),

  /**
   * Toggle lock flag on a node (used for import protection)
   */
  toggleLock: async (payload: ToggleLockClassNodeCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/admin/classes/${payload.classId}/nodes/${payload.nodeId}/lock`, {
        isLocked: payload.isLocked,
        reason: payload.reason ?? undefined,
      })
      .then(() => {})
};

export default classNodesApi;