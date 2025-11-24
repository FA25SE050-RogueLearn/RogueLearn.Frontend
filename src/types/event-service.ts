// roguelearn-web/src/types/event-service.ts
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
  id: string;
  title: string;
  description: string;
  type: string; // 'code_battle', 'hackathon', 'seminar', 'workshop', 'social'
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  started_date: string;
  end_date: string;
  max_guilds: number | null;
  max_players_per_guild: number | null;
  assignment_date: string | null;
  guilds_left: number;
  current_participants: number;
  // Legacy PascalCase fields for backward compatibility
  ID?: string;
  Title?: string;
  Description?: string;
  Type?: string;
  Status?: 'pending' | 'active' | 'completed' | 'cancelled';
  StartedDate?: string;
  EndDate?: string;
  MaxGuilds?: number | null;
  MaxPlayersPerGuild?: number | null;
  OriginalRequestID?: string | null;
  AssignmentDate?: string | null;
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
  // User leaderboard fields
  user_id?: string;
  username?: string;
  player_id?: string;
  player_name?: string;
  // Guild leaderboard fields
  guild_id?: string;
  guild_name?: string;
  // Common fields
  total_score?: number;
  score?: number;
  problems_solved?: number;
  last_submission_time?: string;
  snapshot_date?: string;
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

// MODIFIED: This interface has been updated to accurately reflect the JSON response
// from the Go backend's general /submissions endpoint. It now includes the 'success'
// boolean property, resolving the TypeScript compilation error.
export interface SubmitSolutionResponse {
  success: boolean;
  message: string;
  status: string; // e.g., 'accepted', 'wrong_answer'
  submission_id?: string; // Kept for potential compatibility
  stdout?: string;
  stderr?: string;
  error?: string; // Corresponds to error_type
  code_problem_id?: string;
  problem_title?: string;
  language_id?: string;
  language_name?: string;
  submitted_at?: string;
  execution_time_ms?: string;
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

// Guild Registration Types
export interface RegisterGuildPayload {
  members: Array<{ user_id: string }>;
}

export interface RegisteredMember {
  user_id: string;
  username?: string;
  registered_at?: string;
}

export interface RegisteredGuild {
  guild_id: string;
  guild_name?: string;
  members: RegisteredMember[];
  registered_at: string;
}

export interface EventWithRegistrationInfo extends Event {
  registered_guilds_count?: number;
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