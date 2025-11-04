// src/api/classesApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
import {
  ClassEntity,
  GetClassesResponse,
  GetClassByIdResponse,
  CreateClassCommandRequest,
  UpdateClassCommandRequest,
} from "@/types/classes";

const classesApi = {
  /** GET /api/classes */
  getAll: (): Promise<ApiResponse<GetClassesResponse>> =>
    axiosClient.get<ClassEntity[]>(`/api/classes`).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/admin/classes */
  adminGetAll: (): Promise<ApiResponse<GetClassesResponse>> =>
    axiosClient.get<ClassEntity[]>(`/api/admin/classes`).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/admin/classes/{id} */
  getById: (id: string): Promise<ApiResponse<GetClassByIdResponse>> =>
    axiosClient
      .get<GetClassByIdResponse>(`/api/admin/classes/${id}`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** PUT /api/admin/classes/{id} */
  update: (
    id: string,
    payload: Omit<UpdateClassCommandRequest, "id">
  ): Promise<ApiResponse<ClassEntity>> =>
    axiosClient
      .put<ClassEntity>(`/api/admin/classes/${id}`, payload)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** POST /api/admin/classes */
  create: (
    payload: CreateClassCommandRequest
  ): Promise<ApiResponse<ClassEntity>> =>
    axiosClient
      .post<ClassEntity>(`/api/admin/classes`, payload)
      .then((res) => ({ isSuccess: true, data: res.data })),

  /** POST /api/admin/classes/{id}/soft-delete */
  softDelete: (id: string): Promise<void> =>
    axiosClient
      .post<void>(`/api/admin/classes/${id}/soft-delete`)
      .then(() => {}),

  /** POST /api/admin/classes/{id}/restore */
  restore: (id: string): Promise<void> =>
    axiosClient
      .post<void>(`/api/admin/classes/${id}/restore`)
      .then(() => {}),
};

export default classesApi;
