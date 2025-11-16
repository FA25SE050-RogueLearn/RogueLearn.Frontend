// Event Service API Client
import axiosCodeBattleClient from './axiosCodeBattleClient';
import { createClient } from '@/utils/supabase/client';
import type {
  Problem,
  ProblemDetails,
  Submission,
  Event,
  Room,
  EventRequest,
  Leaderboard,
  Tag,
  SubmitSolutionRequest,
  SubmitSolutionResponse,
  CreateEventRequestPayload,
  ProcessEventRequestPayload,
  ApiResponse,
} from '@/types/event-service';

const eventServiceApi = {
  // ============ Problems ============
  /**
   * Get all problems (public)
   */
  async getAllProblems(): Promise<ApiResponse<Problem[]>> {
    try {
      const response = await axiosCodeBattleClient.get('/problems');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch problems',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Get single problem (public)
   */
  async getProblem(problemId: string): Promise<ApiResponse<Problem>> {
    try {
      const response = await axiosCodeBattleClient.get(`/problems/${problemId}`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch problem',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Get problem details with test cases (authenticated)
   * @param lang - Programming language: "Golang", "Javascript", or "Python"
   */
  async getProblemDetails(problemId: string, lang?: 'Golang' | 'Javascript' | 'Python'): Promise<ApiResponse<ProblemDetails>> {
    try {
      const url = lang
        ? `/problems/${problemId}/details?lang=${lang}`
        : `/problems/${problemId}/details`;
      const response = await axiosCodeBattleClient.get(url);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch problem details',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ Submissions ============
  /**
   * Submit general solution (authenticated)
   */
  async submitSolution(payload: SubmitSolutionRequest): Promise<ApiResponse<SubmitSolutionResponse>> {
    try {
      const response = await axiosCodeBattleClient.post('/submissions', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to submit solution',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Get my submissions (authenticated)
   */
  async getMySubmissions(): Promise<ApiResponse<Submission[]>> {
    try {
      const response = await axiosCodeBattleClient.get('/submissions/me');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch submissions',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ Events ============
  /**
   * Get all events (public)
   */
  async getAllEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await axiosCodeBattleClient.get('/events');
      // API response is already wrapped: { success: true, data: [...], message: "..." }
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch events',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Register guild to event (authenticated)
   */
  async registerGuildToEvent(eventId: string, guildId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosCodeBattleClient.post(`/events/${eventId}/guilds/${guildId}/register`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to register guild',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Get problems assigned to event (authenticated)
   */
  async getEventProblems(eventId: string): Promise<ApiResponse<Problem[]>> {
    try {
      const response = await axiosCodeBattleClient.get(`/events/${eventId}/problems`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch event problems',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ Rooms ============
  /**
   * Get rooms for an event (public)
   */
  async getEventRooms(eventId: string): Promise<ApiResponse<Room[]>> {
    try {
      const response = await axiosCodeBattleClient.get(`/events/${eventId}/rooms`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch event rooms',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Submit solution in a room during event (authenticated)
   */
  async submitRoomSolution(
    eventId: string,
    roomId: string,
    payload: SubmitSolutionRequest
  ): Promise<ApiResponse<SubmitSolutionResponse>> {
    try {
      const response = await axiosCodeBattleClient.post(
        `/events/${eventId}/rooms/${roomId}/submit`,
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to submit solution',
          details: error.normalized?.details,
          status: error.normalized?.status || error.response?.status,
        },
      };
    }
  },

  // ============ Event Requests ============
  /**
   * Create new event request (authenticated)
   */
  async createEventRequest(payload: CreateEventRequestPayload): Promise<ApiResponse<EventRequest>> {
    try {
      const response = await axiosCodeBattleClient.post('/event-requests', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to create event request',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Get guild event requests (authenticated)
   */
  async getGuildEventRequests(guildId: string): Promise<ApiResponse<EventRequest[]>> {
    try {
      const response = await axiosCodeBattleClient.get(`/event-requests/${guildId}`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch event requests',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ Admin - Event Requests ============
  /**
   * Get all event requests (admin only)
   */
  async getAllEventRequests(): Promise<ApiResponse<EventRequest[]>> {
    try {
      const response = await axiosCodeBattleClient.get('/admin/event-requests');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch event requests',
          details: error.normalized?.details,
        },
      };
    }
  },

  /**
   * Approve or reject event request (admin only)
   */
  async processEventRequest(
    requestId: string,
    payload: ProcessEventRequestPayload
  ): Promise<ApiResponse<EventRequest>> {
    try {
      const response = await axiosCodeBattleClient.post(
        `/admin/event-requests/${requestId}/process`,
        payload
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to process event request',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ Tags ============
  /**
   * Get all problem tags (public)
   */
  async getAllTags(): Promise<ApiResponse<Tag[]>> {
    try {
      const response = await axiosCodeBattleClient.get('/tags');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to fetch tags',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ SSE Connections ============
  /**
   * Create SSE connection for room updates (returns EventSource)
   * Note: auth_token should be passed as query parameter
   */
  createRoomSSE(eventId: string, roomId: string, connectedPlayerId: string, authToken: string): EventSource {
    const baseURL = process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL;
    const url = `${baseURL}/events/${eventId}/rooms/${roomId}/sse?connected_player_id=${connectedPlayerId}&auth_token=${authToken}`;

    console.log('Creating SSE connection to:', url.replace(authToken, 'REDACTED'));

    return new EventSource(url);
  },

  /**
   * Create SSE connection for event-wide leaderboard (returns EventSource)
   */
  createEventSSE(eventId: string, authToken: string): EventSource {
    const baseURL = process.env.NEXT_PUBLIC_CODE_BATTLE_API_URL;
    const url = `${baseURL}/events/${eventId}/sse?auth_token=${authToken}`;

    console.log('Creating event SSE connection to:', url.replace(authToken, 'REDACTED'));

    return new EventSource(url);
  },
};

export default eventServiceApi;
