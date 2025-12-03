import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  GetMyNotificationsResponse,
  GetMyUnreadNotificationCountResponse,
  MarkAllNotificationsReadResponse,
} from '@/types/notifications';

const notificationsApi = {
  getMyNotifications: (size: number = 20): Promise<ApiResponse<GetMyNotificationsResponse>> =>
    axiosClient
      .get<GetMyNotificationsResponse>('/api/notifications', { params: { size } })
      .then(res => ({ isSuccess: true, data: res.data })),

  getUnreadCount: (): Promise<ApiResponse<GetMyUnreadNotificationCountResponse>> =>
    axiosClient
      .get<GetMyUnreadNotificationCountResponse>('/api/notifications/unread-count')
      .then(res => ({ isSuccess: true, data: res.data })),

  markAsRead: (id: string): Promise<void> =>
    axiosClient.post<void>(`/api/notifications/${id}/read`).then(() => {}),

  deleteNotification: (id: string): Promise<void> =>
    axiosClient.delete<void>(`/api/notifications/${id}`).then(() => {}),

  batchDelete: (ids: string[]): Promise<void> =>
    axiosClient.post<void>(`/api/notifications/batch-delete`, ids, { headers: { 'Content-Type': 'application/json' } }).then(() => {}),

  markAllRead: (): Promise<MarkAllNotificationsReadResponse> =>
    axiosClient.post<void>(`/api/notifications/mark-all-read`).then(() => {}),
};

export default notificationsApi;