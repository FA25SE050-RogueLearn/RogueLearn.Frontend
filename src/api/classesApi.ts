// src/api/classesApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
import {
  ClassEntity,
  GetClassesResponse,
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
};

export default classesApi;
