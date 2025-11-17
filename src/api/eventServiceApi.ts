// roguelearn-web/src/api/eventServiceApi.ts
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

  // ADDED: New function to find a suitable problem for a quest step.
  /**
   * Find a single problem by topic and difficulty (for quest steps).
   * This assumes the backend exposes a GET /problems/find endpoint with these filters.
   */
  async findProblem(topic: string, difficulty: string): Promise<ApiResponse<Problem>> {
    try {
      const response = await axiosCodeBattleClient.get('/problems/find', {
        params: { topic, difficulty },
      });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: { message: 'Problem not found or invalid response' } };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.normalized?.message || 'Failed to find a suitable problem',
          details: error.normalized?.details,
        },
      };
    }
  },

  // ============ Submissions ============
  /**
   * Submit general solution (authenticated) for practice or non-event quests.
   */
  async submitSolution(payload: SubmitSolutionRequest): Promise<ApiResponse<SubmitSolutionResponse>> {
    try {
      const response = await axiosCodeBattleClient.post('/submissions', payload);
      // The backend response for /submissions is expected to be the submission result directly
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
   * Get all events (public) with pagination support
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of items per page
   * @param type - Optional event type filter (e.g., 'code_battle')
   */
  async getAllEvents(page: number = 1, pageSize: number = 6, type?: string): Promise<ApiResponse<Event[]>> {
    try {
      const params: any = { page_index: page, page_size: pageSize };
      if (type) {
        params.type = type;
      }
      const response = await axiosCodeBattleClient.get('/events', { params });
      console.log('📦 Events API response:', response.data);

      // API response is wrapped: { success: true, data: { items: [...], total_count, ... }, message: "..." }
      if (response.data.success && response.data.data) {
        // Handle paginated response format: data.items contains the actual array
        const eventsData = response.data.data.items || response.data.data;
        console.log('✅ Extracted events:', eventsData);
        console.log('📊 Pagination info:', {
          total_count: response.data.data.total_count,
          total_pages: response.data.data.total_pages,
          page_index: response.data.data.page_index,
          page_size: response.data.data.page_size
        });
        return {
          success: true,
          data: Array.isArray(eventsData) ? eventsData : [],
          pagination: {
            total_count: response.data.data.total_count,
            total_pages: response.data.data.total_pages,
            page_index: response.data.data.page_index,
            page_size: response.data.data.page_size
          }
        };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      console.error('❌ Error fetching events:', error);
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
   * Get rooms for an event (public) with pagination support
   * @param eventId - Event ID
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of items per page
   */
  async getEventRooms(eventId: string, page: number = 1, pageSize: number = 6): Promise<ApiResponse<Room[]>> {
    try {
      const response = await axiosCodeBattleClient.get(`/events/${eventId}/rooms`, {
        params: { page_index: page, page_size: pageSize }
      });
      console.log('📦 Rooms API response:', response.data);

      if (response.data.success && response.data.data) {
        // Handle both paginated and non-paginated response formats
        const roomsData = response.data.data.items || response.data.data;
        console.log('✅ Extracted rooms:', roomsData);

        // Check if response has pagination metadata
        if (response.data.data.total_count !== undefined) {
          console.log('📊 Rooms pagination info:', {
            total_count: response.data.data.total_count,
            total_pages: response.data.data.total_pages,
            page_index: response.data.data.page_index,
            page_size: response.data.data.page_size
          });

          return {
            success: true,
            data: Array.isArray(roomsData) ? roomsData : [],
            pagination: {
              total_count: response.data.data.total_count,
              total_pages: response.data.data.total_pages,
              page_index: response.data.data.page_index,
              page_size: response.data.data.page_size
            }
          };
        }

        return { success: true, data: Array.isArray(roomsData) ? roomsData : [] };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      console.error('❌ Error fetching rooms:', error);
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
      console.log('🚀 Creating event request with payload:', payload);
      const response = await axiosCodeBattleClient.post('/event-requests', payload);
      console.log('✅ Event request response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Event request error:', {
        message: error.normalized?.message,
        details: error.normalized?.details,
        status: error.normalized?.status,
        raw: error.response?.data
      });
      return {
        success: false,
        error: {
          message: error.normalized?.message || error.response?.data?.message || error.response?.data?.error_message || 'Failed to create event request',
          details: error.normalized?.details || error.response?.data?.data,
        },
      };
    }
  },

  /**
   * Get guild event requests (authenticated)
   */
  async getGuildEventRequests(guildId: string): Promise<ApiResponse<EventRequest[]>> {
    try {
      console.log('🔍 Fetching event requests for guild:', guildId);
      const response = await axiosCodeBattleClient.get(`/event-requests/${guildId}`);
      console.log('📦 Event requests response:', response.data);

      if (response.data.success && response.data.data) {
        // Handle paginated response format: data.items contains the actual array
        const requestsData = response.data.data.items || response.data.data;
        console.log('✅ Extracted event requests:', requestsData);
        return { success: true, data: Array.isArray(requestsData) ? requestsData : [] };
      }

      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      console.error('❌ Error fetching event requests:', error);
      return {
        success: false,
        error: {
          message: error.normalized?.message || error.response?.data?.message || 'Failed to fetch event requests',
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
      console.log('📦 Admin event requests response:', response.data);

      if (response.data.success && response.data.data) {
        // Handle paginated response format: data.items contains the actual array
        const requestsData = response.data.data.items || response.data.data;
        console.log('✅ Extracted admin event requests:', requestsData);
        return { success: true, data: Array.isArray(requestsData) ? requestsData : [] };
      }

      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      console.error('❌ Error fetching admin event requests:', error);
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
      console.log('📦 Raw tags API response:', response.data);

      if (response.data.success && response.data.data) {
        // Handle paginated response format: data.items contains the actual array
        const tagsData = response.data.data.items || response.data.data;
        console.log('✅ Extracted tags:', tagsData);
        return { success: true, data: Array.isArray(tagsData) ? tagsData : [] };
      }
      return { success: false, error: { message: 'Invalid response format' } };
    } catch (error: any) {
      console.error('❌ Error fetching tags:', error);
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