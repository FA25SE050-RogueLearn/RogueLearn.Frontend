import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/base/Api';
import {
  CreateLecturerVerificationRequestPayload,
  CreateLecturerVerificationRequestResponse,
  MyLecturerVerificationRequestDto,
  AdminListLecturerVerificationRequestsResponse,
  AdminLecturerVerificationRequestDetail,
  ApproveLecturerVerificationRequestPayload,
  DeclineLecturerVerificationRequestPayload,
} from '@/types/lecturer-verification';

const lecturerVerificationApi = {
  // =================================================================
  // LECTURER VERIFICATION (LecturerVerificationController)
  // =================================================================

  createRequest: async (
    payload: CreateLecturerVerificationRequestPayload
  ): Promise<ApiResponse<CreateLecturerVerificationRequestResponse>> =>
    axiosClient
      .post<CreateLecturerVerificationRequestResponse>(
        '/api/lecturer-verification/requests',
        payload
      )
      .then((res) => ({ isSuccess: true, data: res.data })),

  createRequestForm: async (
    email: string,
    staffId: string,
    screenshotFile?: File | null
  ): Promise<ApiResponse<CreateLecturerVerificationRequestResponse>> => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('staffId', staffId);
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }
    return axiosClient
      .post<CreateLecturerVerificationRequestResponse>(
        '/api/lecturer-verification/requests/form',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((res) => ({ isSuccess: true, data: res.data }));
  },

  getMyRequests: async (): Promise<ApiResponse<MyLecturerVerificationRequestDto[]>> =>
    axiosClient
      .get<MyLecturerVerificationRequestDto[]>(
        '/api/lecturer-verification/requests'
      )
      .then((res) => ({ isSuccess: true, data: res.data })),

  adminList: async (
    params: { status?: string | null; userId?: string | null; page?: number; size?: number }
  ): Promise<ApiResponse<AdminListLecturerVerificationRequestsResponse>> =>
    axiosClient
      .get<AdminListLecturerVerificationRequestsResponse>(
        '/api/admin/lecturer-verification/requests',
        { params }
      )
      .then((res) => ({ isSuccess: true, data: res.data })),

  adminGet: async (
    requestId: string
  ): Promise<ApiResponse<AdminLecturerVerificationRequestDetail>> =>
    axiosClient
      .get<AdminLecturerVerificationRequestDetail>(
        `/api/admin/lecturer-verification/requests/${requestId}`
      )
      .then((res) => ({ isSuccess: true, data: res.data })),

  adminApprove: async (
    requestId: string,
    payload?: ApproveLecturerVerificationRequestPayload
  ): Promise<void> =>
    axiosClient
      .post<void>(
        `/api/admin/lecturer-verification/requests/${requestId}/approve`,
        payload ?? {}
      )
      .then(() => {}),

  adminDecline: async (
    requestId: string,
    payload: DeclineLecturerVerificationRequestPayload
  ): Promise<void> =>
    axiosClient
      .post<void>(
        `/api/admin/lecturer-verification/requests/${requestId}/decline`,
        payload
      )
      .then(() => {}),
};

export default lecturerVerificationApi;