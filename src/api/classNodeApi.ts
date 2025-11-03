// src/api/classNodeApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  ClassNode,
  ClassNodeTreeItem,
  CreateClassNodeCommandRequest,
  CreateClassNodeResponse,
  UpdateClassNodeCommandRequest,
  UpdateClassNodeResponse,
  SoftDeleteClassNodeCommandRequest,
  MoveClassNodeCommandRequest,
  ReorderClassNodesCommandRequest,
  ToggleLockClassNodeCommandRequest,
  GetFlatClassNodesResponse,
  GetTreeClassNodesResponse,
} from '@/types/class-nodes';

const classNodeApi = {
  /** GET /api/classes/{classId}/nodes */
  getFlat: (classId: string, onlyActive?: boolean): Promise<ApiResponse<GetFlatClassNodesResponse>> =>
    axiosClient
      .get<ClassNode[]>(`/api/classes/${classId}/nodes`, { params: { onlyActive } })
      .then(res => ({ isSuccess: true, data: res.data })),

  /** GET /api/classes/{classId}/nodes/tree */
  getTree: (classId: string, onlyActive?: boolean): Promise<ApiResponse<GetTreeClassNodesResponse>> =>
    axiosClient
      .get<ClassNodeTreeItem[]>(`/api/classes/${classId}/nodes/tree`, { params: { onlyActive } })
      .then(res => ({ isSuccess: true, data: res.data })),

  /** POST /api/classes/{classId}/nodes */
  create: (payload: CreateClassNodeCommandRequest): Promise<ApiResponse<CreateClassNodeResponse>> =>
    axiosClient
      .post<ClassNode>(`/api/classes/${payload.classId}/nodes`, payload)
      .then(res => ({ isSuccess: true, data: res.data })),

  /** PUT /api/classes/{classId}/nodes/{nodeId} */
  update: (payload: UpdateClassNodeCommandRequest): Promise<ApiResponse<UpdateClassNodeResponse>> =>
    axiosClient
      .put<ClassNode>(`/api/classes/${payload.classId}/nodes/${payload.nodeId}`, payload)
      .then(res => ({ isSuccess: true, data: res.data })),

  /** POST /api/classes/{classId}/nodes/{nodeId}/soft-delete */
  softDelete: (payload: SoftDeleteClassNodeCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/classes/${payload.classId}/nodes/${payload.nodeId}/soft-delete`)
      .then(() => {}),

  /** POST /api/classes/{classId}/nodes/{nodeId}/move */
  move: (payload: MoveClassNodeCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/classes/${payload.classId}/nodes/${payload.nodeId}/move`, {
        newParentId: payload.newParentId,
        newSequence: payload.newSequence,
      })
      .then(() => {}),

  /** POST /api/classes/{classId}/nodes/reorder */
  reorder: (payload: ReorderClassNodesCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/classes/${payload.classId}/nodes/reorder`, {
        parentId: payload.parentId,
        items: payload.items,
      })
      .then(() => {}),

  /** POST /api/classes/{classId}/nodes/{nodeId}/toggle-lock */
  toggleLock: (payload: ToggleLockClassNodeCommandRequest): Promise<void> =>
    axiosClient
      .post<void>(`/api/classes/${payload.classId}/nodes/${payload.nodeId}/toggle-lock`, {
        isLocked: payload.isLocked,
        reason: payload.reason,
      })
      .then(() => {}),
};

export default classNodeApi;