export type NotificationType =
  | 'Achievement'
  | 'QuestComplete'
  | 'Party'
  | 'Guild'
  | 'FriendRequest'
  | 'System'
  | 'Reminder';

export interface NotificationDto {
  id: string;
  authUserId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface GetMyNotificationsQueryRequest {
  size?: number;
}
export type GetMyNotificationsResponse = NotificationDto[];

export type GetMyUnreadNotificationCountResponse = number;

export interface MarkNotificationReadCommandRequest {
  id: string;
}
export type MarkNotificationReadResponse = void;

export interface DeleteNotificationCommandRequest {
  id: string;
}
export type DeleteNotificationResponse = void;

export interface DeleteNotificationsBatchCommandRequest {
  ids: string[];
}
export type DeleteNotificationsBatchResponse = void;

export type MarkAllNotificationsReadResponse = void;