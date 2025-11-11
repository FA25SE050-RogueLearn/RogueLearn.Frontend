// roguelearn-web/src/api/learningPathsApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  LearningPathDto,
  DeleteLearningPathCommandRequest,
} from '@/types/learning-paths';

const learningPathsApi = {
  /** GET /api/learning-paths/me */
  getMine: (): Promise<ApiResponse<LearningPathDto | null>> =>
    axiosClient.get<LearningPathDto | null>('/api/learning-paths/me').then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** DELETE /api/admin/learning-paths/{id} */
  remove: (payload: DeleteLearningPathCommandRequest): Promise<void> =>
    axiosClient.delete<void>(`/api/admin/learning-paths/${payload.id}`).then(() => {}),
};

export default learningPathsApi;