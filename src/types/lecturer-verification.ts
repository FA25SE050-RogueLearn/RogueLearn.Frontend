export type LecturerVerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CreateLecturerVerificationRequestPayload {
  email: string;
  staffId: string;
  screenshotUrl?: string | null;
}

export interface CreateLecturerVerificationRequestResponse {
  requestId: string;
  status: LecturerVerificationStatus;
}

export interface MyLecturerVerificationRequestDto {
  id: string;
  status: string;
  reason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  screenshotUrl?: string | null;
  documents?: Record<string, any> | null;
}

export interface AdminLecturerVerificationRequestListItem {
  id: string;
  userId: string;
  status: string;
  staffId?: string | null;
  email?: string | null;
}

export interface AdminListLecturerVerificationRequestsResponse {
  items: AdminLecturerVerificationRequestListItem[];
  page: number;
  size: number;
  total: number;
}

export interface AdminLecturerVerificationRequestDetail {
  id: string;
  authUserId: string;
  email?: string | null;
  staffId?: string | null;
  screenshotUrl?: string | null;
  status: string;
  note?: string | null;
  reason?: string | null;
  submittedAt?: string;
  reviewedAt?: string | null;
}

export interface ApproveLecturerVerificationRequestPayload {
  note?: string | null;
}

export interface DeclineLecturerVerificationRequestPayload {
  reason: string;
}