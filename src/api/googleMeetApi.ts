/**
 * Google Meet REST API client
 * Lightweight fetch wrappers using an OAuth access token acquired via GIS.
 */

export interface SpaceConfig {
  accessType?: string;
  entryPointAccess?: string;
  moderationRestrictions?: string[];
  autoArtifactConfig?: Record<string, unknown> | null;
}

export interface CreateSpaceRequest {
  config?: SpaceConfig;
}
export interface CreateSpaceResponse {
  name?: string; // resource name
  meetingUri?: string;
  spaceId?: string;
  config?: SpaceConfig;
}

// Space resource returned by GET /spaces/{name}
export interface SpaceResource {
  name?: string; // e.g., spaces/{space}
  meetingUri?: string; // e.g., https://meet.google.com/abc-def-ghi
  meetingCode?: string; // e.g., abc-def-ghi
  config?: SpaceConfig;
  activeConference?: Record<string, unknown> | null;
}

const BASE = "https://meet.googleapis.com/v2";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export const googleMeetApi = {
  // Create meeting space
  async createSpace(token: string, body: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    const res = await fetch(`${BASE}/spaces`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) throw new Error(`Create space failed: ${res.status}`);
    return res.json();
  },
  
  // Get a meeting space by resource name or by alias (meetingCode)
  // Per docs, GET allows using the alias spaces/{meetingCode}, while endActiveConference requires spaces/{space}.
  async getSpace(token: string, nameOrCode: string): Promise<SpaceResource> {
    // Accept raw meeting code like "abc-def-ghi" or full resource like "spaces/abc-def-ghi" or "spaces/{space}"
    const name = nameOrCode.startsWith("spaces/") ? nameOrCode : `spaces/${nameOrCode}`;
    const res = await fetch(`${BASE}/${name}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error(`Get space failed: ${res.status}`);
    return res.json();
  },
  
  // End an active conference within a meeting space (requires meetings.space.created scope)
  async endActiveConference(token: string, spaceNameOrId: string): Promise<{}> {
    const name = spaceNameOrId.startsWith("spaces/") ? spaceNameOrId : `spaces/${spaceNameOrId}`;
    const res = await fetch(`${BASE}/${name}:endActiveConference`, {
      method: "POST",
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`End active conference failed: ${res.status}`);
    return res.json(); // empty object on success
  },

  // List past conferences
  async listConferenceRecords(token: string, opts?: { pageSize?: number; pageToken?: string }) {
    const params = new URLSearchParams();
    if (opts?.pageSize) params.set("pageSize", String(opts.pageSize));
    if (opts?.pageToken) params.set("pageToken", opts.pageToken);
    const res = await fetch(`${BASE}/conferenceRecords?${params.toString()}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`List conferences failed: ${res.status}`);
    return res.json();
  },

  // Participants for a conference
  async listParticipants(token: string, conferenceId: string) {
    const res = await fetch(`${BASE}/conferenceRecords/${conferenceId}/participants`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`List participants failed: ${res.status}`);
    return res.json();
  },

  // Participant sessions
  async listParticipantSessions(token: string, conferenceId: string, participantId: string) {
    const res = await fetch(
      `${BASE}/conferenceRecords/${conferenceId}/participants/${participantId}/participantSessions`,
      { headers: authHeaders(token) }
    );
    if (!res.ok) throw new Error(`List participant sessions failed: ${res.status}`);
    return res.json();
  },

  // Recordings
  async listRecordings(token: string, conferenceId: string) {
    const res = await fetch(`${BASE}/conferenceRecords/${conferenceId}/recordings`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`List recordings failed: ${res.status}`);
    return res.json();
  },

  // Transcripts and entries
  async listTranscripts(token: string, conferenceId: string) {
    const res = await fetch(`${BASE}/conferenceRecords/${conferenceId}/transcripts`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`List transcripts failed: ${res.status}`);
    return res.json();
  },
  async listTranscriptEntries(token: string, conferenceId: string, transcriptId: string) {
    const res = await fetch(
      `${BASE}/conferenceRecords/${conferenceId}/transcripts/${transcriptId}/entries`,
      { headers: authHeaders(token) }
    );
    if (!res.ok) throw new Error(`List transcript entries failed: ${res.status}`);
    return res.json();
  },
};

export default googleMeetApi;