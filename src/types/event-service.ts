// Event Service API Types

export interface Problem {
  id: string;
  title: string;
  problem_statement: string;
  difficulty: number;
}

export interface ProblemDetails extends Problem {
  test_cases: TestCase[];
  solution_stub?: string; // Code stub for the requested language
  driver_code?: string; // Driver code template
  time_constraint_ms?: number;
  space_constraint_mb?: number;
}

export interface TestCase {
  test_case_id: string;
  problem_id: string;
  input: string;
  expected_output: string;
  is_sample: boolean;
  explanation?: string;
}

export interface Language {
  language_id: string;
  name: string;
  version: string;
  file_extension: string;
}

export interface Submission {
  code_problem_id: string;
  problem_title: string;
  language_name: string;
  status: string; // 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error', etc.
  submitted_at: string;
}

export interface TestResult {
  test_case_id: string;
  passed: boolean;
  actual_output?: string;
  error_message?: string;
  execution_time_ms?: number;
}

export interface Event {
  ID: string;
  Title: string;
  Description: string;
  Type: string; // 'code_battle', 'hackathon', 'seminar', 'workshop', 'social'
  Status: 'pending' | 'active' | 'completed' | 'cancelled';
  StartedDate: string;
  EndDate: string;
  MaxGuilds: number | null;
  MaxPlayersPerGuild: number | null;
  NumberOfRooms: number | null;
  GuildsPerRoom: number | null;
  RoomNamingPrefix: string | null;
  OriginalRequestID: string | null;
  AssignmentDate: string | null;
}

export interface Room {
  ID: string;
  EventID: string;
  Name: string;
  Description: string;
  CreatedDate: string;
}

export interface EventRequest {
  request_id: string;
  requester_guild_id: string;
  event_type: 'code_battle' | 'hackathon';
  title: string;
  description: string;
  proposed_start_date: string;
  proposed_end_date: string;
  participation: {
    max_guilds: number;
    max_players_per_guild: number;
  };
  room_configuration: {
    number_of_rooms: number;
    guilds_per_room: number;
    room_naming_prefix: string;
  };
  event_specifics: {
    code_battle?: {
      topics: string[];
      distribution: ProblemDistribution[];
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProblemDistribution {
  number_of_problems: number;
  difficulty: number;
  score: number;
}

export interface Leaderboard {
  room_id?: string;
  event_id?: string;
  rankings: LeaderboardEntry[];
  last_updated: string;
}

export interface LeaderboardEntry {
  rank: number;
  player_id?: string;
  guild_id?: string;
  player_name?: string;
  guild_name?: string;
  total_score: number;
  problems_solved: number;
  last_submission_time?: string;
}

export interface Tag {
  id: string;
  name: string;
}

// SSE Event Types
export interface SSEEvent {
  event: string;
  data: any;
}

export type SSEEventType =
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'LEADERBOARD_UPDATED'
  | 'CORRECT_SOLUTION_SUBMITTED'
  | 'WRONG_SOLUTION_SUBMITTED'
  | 'EVENT_STARTED'
  | 'EVENT_ENDED'
  | 'ROOM_ASSIGNED';

// API Request/Response Types
export interface SubmitSolutionRequest {
  problem_id: string;
  language: string;
  code: string;
}

export interface SubmitSolutionResponse {
  submission_id: string;
  status: string;
  message: string;
}

export interface CreateEventRequestPayload {
  requester_guild_id: string;
  event_type: 'code_battle' | 'hackathon';
  title: string;
  description: string;
  proposed_start_date: string;
  proposed_end_date: string;
  participation: {
    max_guilds: number;
    max_players_per_guild: number;
  };
  room_configuration: {
    number_of_rooms: number;
    guilds_per_room: number;
    room_naming_prefix: string;
  };
  event_specifics: {
    code_battle?: {
      topics: string[];
      distribution: ProblemDistribution[];
    };
  };
  notes?: string;
}

export interface ProcessEventRequestPayload {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface PaginationMetadata {
  total_count: number;
  total_pages: number;
  page_index: number;
  page_size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: PaginationMetadata;
  error?: {
    message: string;
    details?: any;
    status?: number;
  };
}
