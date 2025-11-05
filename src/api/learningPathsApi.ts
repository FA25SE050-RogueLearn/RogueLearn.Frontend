// src/api/learningPathsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  LearningPathDto,
  GetMyLearningPathResponse,
  DeleteLearningPathCommandRequest,
} from '@/types/learning-paths';

const learningPathsApi = {
  /** GET /api/learning-paths/me */
  getMine: (): Promise<ApiResponse<GetMyLearningPathResponse>> =>
    axiosClient.get<LearningPathDto | null>('/api/learning-paths/me').then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/learning-paths/{id} */
  remove: (payload: DeleteLearningPathCommandRequest): Promise<void> =>
    axiosClient.delete<void>(`/api/learning-paths/${payload.id}`).then(() => {}),
};

export default learningPathsApi;