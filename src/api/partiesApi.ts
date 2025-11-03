// src/api/partiesApi.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/base/Api';
import {
  PartyDto,
  PartyMemberDto,
  PartyInvitationDto,
  PartyStashItemDto,
  PartyRole,
  GetAllPartiesQueryResponse,
  GetPartyByIdQueryResponse,
  GetPartyMembersQueryResponse,
  GetPartyResourcesQueryResponse,
  GetPendingInvitationsQueryResponse,
  GetPartyMemberRolesQueryResponse,
  CreatePartyCommandRequest,
  CreatePartyResponse,
  InviteMemberRequest,
  AddPartyResourceRequest,
} from '@/types/parties';

const partiesApi = {
  // === Query Endpoints ===

  /** GET /api/parties/{partyId} - Get party by id */
  getById: (partyId: string): Promise<ApiResponse<GetPartyByIdQueryResponse>> =>
    axiosClient.get<PartyDto | null>(`/api/parties/${partyId}`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId}/members - List members of a party */
  getMembers: (partyId: string): Promise<ApiResponse<GetPartyMembersQueryResponse>> =>
    axiosClient.get<PartyMemberDto[]>(`/api/parties/${partyId}/members`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId}/stash - List resources in party stash */
  getResources: (partyId: string): Promise<ApiResponse<GetPartyResourcesQueryResponse>> =>
    axiosClient.get<PartyStashItemDto[]>(`/api/parties/${partyId}/stash`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId}/invitations/pending - Get pending invitations for a party (Party Leader only) */
  getPendingInvitations: (partyId: string): Promise<ApiResponse<GetPendingInvitationsQueryResponse>> =>
    axiosClient.get<PartyInvitationDto[]>(`/api/parties/${partyId}/invitations/pending`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId}/members/{memberAuthUserId}/roles - Get roles of a party member */
  getMemberRoles: (partyId: string, memberAuthUserId: string): Promise<ApiResponse<GetPartyMemberRolesQueryResponse>> =>
    axiosClient.get<PartyRole[]>(`/api/parties/${partyId}/members/${memberAuthUserId}/roles`).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  // === Command Endpoints ===

  /** POST /api/parties - Create a new party */
  create: (payload: CreatePartyCommandRequest): Promise<ApiResponse<CreatePartyResponse>> =>
    axiosClient.post<CreatePartyResponse>(`/api/parties`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/parties/{partyId}/invite - Invite a user to the party (Party Leader only) */
  inviteMember: (partyId: string, payload: InviteMemberRequest): Promise<ApiResponse<PartyInvitationDto>> =>
    axiosClient.post<PartyInvitationDto>(`/api/parties/${partyId}/invite`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  /** POST /api/parties/{partyId}/stash - Add a resource to party stash (Party Leader only) */
  addResource: (partyId: string, payload: AddPartyResourceRequest): Promise<ApiResponse<PartyStashItemDto>> =>
    axiosClient.post<PartyStashItemDto>(`/api/parties/${partyId}/stash`, payload).then(res => ({
      isSuccess: true,
      data: res.data,
    })),

  // === Role Management Endpoints ===

  /** POST /api/parties/{partyId}/members/{memberAuthUserId}/roles/assign - Assign a party role to a member (Party Leader only) */
  assignRole: (partyId: string, memberAuthUserId: string, role: PartyRole): Promise<void> =>
    axiosClient.post(`/api/parties/${partyId}/members/${memberAuthUserId}/roles/assign`, { role }).then(() => {}),

  /** POST /api/parties/{partyId}/members/{memberAuthUserId}/roles/revoke - Revoke a party role from a member (Party Leader only) */
  revokeRole: (partyId: string, memberAuthUserId: string, role: PartyRole): Promise<void> =>
    axiosClient.post(`/api/parties/${partyId}/members/${memberAuthUserId}/roles/revoke`, { role }).then(() => {}),

  // === Admin Endpoints ===

  /** GET /api/admin/parties - Get all parties (Platform admin only) */
  admin: {
    /** GET /api/admin/parties - Get all parties */
    getAll: (): Promise<ApiResponse<GetAllPartiesQueryResponse>> =>
      axiosClient.get<PartyDto[]>(`/api/admin/parties`).then(res => ({
        isSuccess: true,
        data: res.data,
      })),

    /** POST /api/admin/parties/{partyId}/invite - Admin-only: Invite a user to the party */
    inviteMember: (partyId: string, payload: InviteMemberRequest): Promise<ApiResponse<PartyInvitationDto>> =>
      axiosClient.post<PartyInvitationDto>(`/api/admin/parties/${partyId}/invite`, payload).then(res => ({
        isSuccess: true,
        data: res.data,
      })),

    /** GET /api/admin/parties/{partyId}/invitations/pending - Admin-only: Get pending invitations for a party */
    getPendingInvitations: (partyId: string): Promise<ApiResponse<GetPendingInvitationsQueryResponse>> =>
      axiosClient.get<PartyInvitationDto[]>(`/api/admin/parties/${partyId}/invitations/pending`).then(res => ({
        isSuccess: true,
        data: res.data,
      })),

    /** POST /api/admin/parties/{partyId}/stash - Admin-only: Add a resource to party stash */
    addResource: (partyId: string, payload: AddPartyResourceRequest): Promise<ApiResponse<PartyStashItemDto>> =>
      axiosClient.post<PartyStashItemDto>(`/api/admin/parties/${partyId}/stash`, payload).then(res => ({
        isSuccess: true,
        data: res.data,
      })),

    /** POST /api/admin/parties/{partyId}/members/{memberAuthUserId}/roles/assign - Admin-only: Assign a party role to a member */
    assignRole: (partyId: string, memberAuthUserId: string, role: PartyRole): Promise<void> =>
      axiosClient.post(`/api/admin/parties/${partyId}/members/${memberAuthUserId}/roles/assign`, { role }).then(() => {}),

    /** POST /api/admin/parties/{partyId}/members/{memberAuthUserId}/roles/revoke - Admin-only: Revoke a party role from a member */
    revokeRole: (partyId: string, memberAuthUserId: string, role: PartyRole): Promise<void> =>
      axiosClient.post(`/api/admin/parties/${partyId}/members/${memberAuthUserId}/roles/revoke`, { role }).then(() => {}),
  },
};

export default partiesApi;