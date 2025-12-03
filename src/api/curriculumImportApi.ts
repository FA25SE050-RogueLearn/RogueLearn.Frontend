// src/api/curriculumImportApi.ts
import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/base/Api";
import {
  ImportCurriculumCommandRequest,
  ImportCurriculumCommandResponse,
  ImportSubjectFromTextCommandRequest,
  ImportSubjectFromTextCommandResponse,
} from "@/types/curriculum-import";

const curriculumImportApi = {
  // =================================================================
  // CURRICULUM IMPORT (CurriculumImportController)
  // =================================================================

  /** POST /api/admin/curriculum */
  importCurriculum: (
    payload: ImportCurriculumCommandRequest
  ): Promise<ApiResponse<ImportCurriculumCommandResponse>> => {
    const formData = new FormData();
    formData.append("rawText", payload.rawText);
    if (payload.programId) formData.append("programId", payload.programId);
    return axiosClient
      .post<ImportCurriculumCommandResponse>(
        "/api/admin/curriculum",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then((res) => ({ isSuccess: true, data: res.data }));
  },

  // =================================================================
  // SUBJECT IMPORT (SubjectController)
  // =================================================================

  /** POST /api/admin/subjects/import-from-text */
  importSubjectFromText: (
    payload: ImportSubjectFromTextCommandRequest
  ): Promise<ApiResponse<ImportSubjectFromTextCommandResponse>> => {
    const formData = new FormData();
    formData.append("rawText", payload.rawText);
    if (payload.semester !== undefined && payload.semester !== null) {
      formData.append("semester", payload.semester.toString());
    }
    return axiosClient
      .post<ImportSubjectFromTextCommandResponse>(
        "/api/admin/subjects/import-from-text",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then((res) => ({ isSuccess: true, data: res.data }));
  },
};

export default curriculumImportApi;
