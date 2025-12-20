// src/api/classesApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
import {
  ClassEntity,
  GetClassesResponse,
  CreateClassCommandRequest,
  UpdateClassCommandRequest,
} from "@/types/classes";

const classesApi = {
  // =================================================================
  // CLASSES (ClassesController)
  // =================================================================

  /** GET /api/classes */
  getAll: (): Promise<ApiResponse<GetClassesResponse>> =>
    axiosClient.get<ClassEntity[]>(`/api/classes`).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/classes (Admin) */
  create: (payload: CreateClassCommandRequest): Promise<ApiResponse<ClassEntity>> =>
    axiosClient.post<ClassEntity>('/api/classes', payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** PUT /api/classes/{id} (Admin) */
  update: (id: string, payload: UpdateClassCommandRequest): Promise<ApiResponse<ClassEntity>> =>
    axiosClient.put<ClassEntity>(`/api/classes/${id}`, { ...payload, id }).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/classes/{id} (Admin) */
  delete: (id: string): Promise<void> =>
    axiosClient.delete<void>(`/api/classes/${id}`).then(() => {}),

  // =================================================================
  // ROADMAP IMPORT (RoadmapImportController)
  // =================================================================
  
  /** 
   * POST /api/admin/roadmap-import 
   * Create a class by analyzing a roadmap.sh PDF 
   */
  createFromRoadmapPdf: (file: File): Promise<ApiResponse<ClassEntity>> => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post<ClassEntity>('/api/admin/roadmap-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => ({
      isSuccess: true,
      data: res.data,
    }));
  },
};

export default classesApi;