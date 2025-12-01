// src/api/partiesApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/base/Api";
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
  GetMyPendingInvitationsQueryResponse,
  GetPartyMemberRolesQueryResponse,
  CreatePartyCommandRequest,
  CreatePartyResponse,
  InviteMemberRequest,
  AddPartyResourceRequest,
  UpdatePartyResourceRequest,
  AcceptPartyInvitationCommandRequest,
  DeclinePartyInvitationCommandRequest,
  ConfigurePartySettingsCommandRequest,
  LeavePartyCommandRequest,
  TransferPartyLeadershipCommandRequest,
} from "@/types/parties";

const partiesApi = {
  // =================================================================
  // PARTIES (PartiesController)
  // =================================================================

  // === Query Endpoints ===

  /** GET /api/parties - Get all parties */
  getAll: (): Promise<ApiResponse<GetAllPartiesQueryResponse>> =>
    axiosClient.get<PartyDto[]>(`/api/parties`).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId} - Get party by id */
  getById: (partyId: string): Promise<ApiResponse<GetPartyByIdQueryResponse>> =>
    axiosClient.get<PartyDto | null>(`/api/parties/${partyId}`).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId}/members - List members of a party */
  getMembers: (
    partyId: string
  ): Promise<ApiResponse<GetPartyMembersQueryResponse>> =>
    axiosClient
      .get<PartyMemberDto[]>(`/api/parties/${partyId}/members`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** GET /api/parties/{partyId}/stash - List resources in party stash */
  getResources: (
    partyId: string
  ): Promise<ApiResponse<GetPartyResourcesQueryResponse>> =>
    axiosClient
      .get<PartyStashItemDto[]>(`/api/parties/${partyId}/stash`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** POST /api/parties/{partyId}/stash - Add a resource to party stash */
  addResource: (
    partyId: string,
    payload: AddPartyResourceRequest
  ): Promise<ApiResponse<PartyStashItemDto>> =>
    axiosClient
      .post<PartyStashItemDto>(`/api/parties/${partyId}/stash`, payload)
      .then((res) => ({ isSuccess: true, data: res.data })),

  /** GET /api/parties/{partyId}/stash/{stashItemId} - Get a stash item by id */
  getResourceById: (
    partyId: string,
    stashItemId: string
  ): Promise<ApiResponse<PartyStashItemDto | null>> =>
    axiosClient
      .get<PartyStashItemDto | null>(
        `/api/parties/${partyId}/stash/${stashItemId}`
      )
      .then((res) => ({ isSuccess: true, data: res.data })),

  /** GET /api/parties/{partyId}/invitations/pending - Get pending invitations for a party (Party Leader only) */
  getPendingInvitations: (
    partyId: string
  ): Promise<ApiResponse<GetPendingInvitationsQueryResponse>> =>
    axiosClient
      .get<PartyInvitationDto[]>(`/api/parties/${partyId}/invitations/pending`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** GET /api/parties/invitations/pending - Get my pending party invitations */
  getMyPendingInvitations: (): Promise<
    ApiResponse<GetMyPendingInvitationsQueryResponse>
  > =>
    axiosClient
      .get<PartyInvitationDto[]>(`/api/parties/invitations/pending`)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** GET /api/parties/mine - Get all parties for the current authenticated user */
  getMine: (): Promise<ApiResponse<GetAllPartiesQueryResponse>> =>
    axiosClient.get<PartyDto[]>(`/api/parties/mine`).then((res) => ({
      isSuccess: true,
      data: res.data,
    })),

  /** GET /api/parties/{partyId}/members/{memberAuthUserId}/roles - Get roles of a party member */
  getMemberRoles: (
    partyId: string,
    memberAuthUserId: string
  ): Promise<ApiResponse<GetPartyMemberRolesQueryResponse>> =>
    axiosClient
      .get<PartyRole[]>(
        `/api/parties/${partyId}/members/${memberAuthUserId}/roles`
      )
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  // === Command Endpoints ===

  /** POST /api/parties - Create a new party */
  create: (
    payload: CreatePartyCommandRequest
  ): Promise<ApiResponse<CreatePartyResponse>> =>
    axiosClient
      .post<CreatePartyResponse>(`/api/parties`, payload)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),

  /** POST /api/parties/{partyId}/invite - Invite a user to the party (Party Leader only) */
  inviteMember: (
    partyId: string,
    payload: InviteMemberRequest
  ): Promise<ApiResponse<PartyInvitationDto>> =>
    axiosClient
      .post<PartyInvitationDto>(`/api/parties/${partyId}/invite`, payload)
      .then((res) => ({
        isSuccess: true,
        data: res.data,
      })),


  /** PUT /api/parties/{partyId}/stash/{stashItemId} - Update a stash item (Party Leader only) */
  updateResource: (
    partyId: string,
    stashItemId: string,
    payload: UpdatePartyResourceRequest
  ): Promise<void> =>
    axiosClient
      .put(`/api/parties/${partyId}/stash/${stashItemId}`, payload)
      .then(() => {}),

  /** DELETE /api/parties/{partyId}/stash/{stashItemId} - Delete a stash item (Party Leader only) */
  deleteResource: (partyId: string, stashItemId: string): Promise<void> =>
    axiosClient
      .delete(`/api/parties/${partyId}/stash/${stashItemId}`)
      .then(() => {}),

  /** POST /api/parties/{partyId}/invitations/{invitationId}/accept - Accept a party invitation */
  acceptInvitation: (
    partyId: string,
    invitationId: string,
    payload: AcceptPartyInvitationCommandRequest
  ): Promise<void> =>
    axiosClient
      .post(
        `/api/parties/${partyId}/invitations/${invitationId}/accept`,
        payload
      )
      .then(() => {}),

  /** POST /api/parties/{partyId}/invitations/{invitationId}/decline - Decline a party invitation */
  declineInvitation: (
    partyId: string,
    invitationId: string,
    payload: DeclinePartyInvitationCommandRequest
  ): Promise<void> =>
    axiosClient
      .post(
        `/api/parties/${partyId}/invitations/${invitationId}/decline`,
        payload
      )
      .then(() => {}),

  /** PUT /api/parties/{partyId}/settings - Configure party settings */
  configure: (
    partyId: string,
    payload: ConfigurePartySettingsCommandRequest
  ): Promise<void> =>
    axiosClient.put(`/api/parties/${partyId}`, payload).then(() => {}),

  /** DELETE /api/parties/{partyId} - Delete a party */
  delete: (partyId: string): Promise<void> =>
    axiosClient.delete(`/api/parties/${partyId}`).then(() => {}),

  /** POST /api/parties/{partyId}/leave - Leave a party */
  leave: (partyId: string, payload: LeavePartyCommandRequest): Promise<void> =>
    axiosClient.post(`/api/parties/${partyId}/leave`, payload).then(() => {}),

  /** POST /api/parties/{partyId}/join - Join a public party */
  joinPublic: (partyId: string): Promise<void> =>
    axiosClient.post(`/api/parties/${partyId}/join`, {}).then(() => {}),

  /** DELETE /api/parties/{partyId}/members/{memberId} - Remove a party member */
  removeMember: (
    partyId: string,
    memberId: string,
    payload: { reason?: string }
  ): Promise<void> =>
    axiosClient
      .post(`/api/parties/${partyId}/members/${memberId}/remove`, payload)
      .then(() => {}),

  /** POST /api/parties/{partyId}/transfer-leadership - Transfer party leadership */
  transferLeadership: (
    partyId: string,
    payload: TransferPartyLeadershipCommandRequest
  ): Promise<void> =>
    axiosClient
      .post(`/api/parties/${partyId}/transfer-leadership`, payload)
      .then(() => {}),
};

export default partiesApi;
