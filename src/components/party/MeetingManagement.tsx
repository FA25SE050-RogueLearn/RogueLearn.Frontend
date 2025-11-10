"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useGoogleMeet, MeetScopes } from "@/hooks/useGoogleMeet";
import googleMeetApi from "@/api/googleMeetApi";
import meetingsApi from "@/api/meetingsApi";
import partiesApi from "@/api/partiesApi";
import type { PartyMemberDto } from "@/types/parties";
import { MeetingDto, MeetingParticipantDto, ArtifactInputDto, MeetingDetailsDto } from "@/types/meetings";
import { createClient } from "@/utils/supabase/client";

interface Props {
  partyId: string;
}

type CreateState = {
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
};

export default function MeetingManagement({ partyId }: Props) {
  const { requestToken } = useGoogleMeet();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const [createState, setCreateState] = useState<CreateState>(() => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60 * 1000);
    return {
      title: "Study Sprint",
      start: now.toISOString(),
      end: in30.toISOString(),
    };
  });

  // Active meeting state for the current session
  const [activeMeeting, setActiveMeeting] = useState<{
    meeting: MeetingDto | null;
    google: { spaceId?: string | null; meetingUri?: string | null } | null;
  }>({ meeting: null, google: null });

  const [partyMeetings, setPartyMeetings] = useState<MeetingDto[]>([]);
  const [selectedMeetingDetails, setSelectedMeetingDetails] = useState<MeetingDetailsDto | null>(null);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [partyMembers, setPartyMembers] = useState<PartyMemberDto[]>([]);

  // Helper: derive a friendly display name for a party member
  function getMemberDisplayName(m?: PartyMemberDto | null): string | undefined {
    if (!m) return undefined;
    const username = (m.username ?? "").trim();
    if (username) return username;
    const full = `${(m.firstName ?? "").trim()} ${(m.lastName ?? "").trim()}`.trim();
    if (full) return full;
    const email = (m.email ?? "").trim();
    return email || undefined;
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    // Restore token for this party session if available
    try {
      const cached = sessionStorage.getItem(`meetingToken:${partyId}`);
      if (cached) setActiveToken(cached);
    } catch (_) {}
  }, [partyId]);

  useEffect(() => {
    // Load meetings for this party
    let mounted = true;
    const load = async () => {
      setLoadingMeetings(true);
      try {
        const res = await meetingsApi.getPartyMeetings(partyId);
        if (!mounted) return;
        setPartyMeetings(res.data ?? []);
        // Also load party members for participant mapping
        try {
          const memRes = await partiesApi.getMembers(partyId);
          if (!mounted) return;
          setPartyMembers(memRes.data ?? []);
        } catch (memErr) {
          console.warn("[Party] failed to load members:", memErr);
        }
      } catch (e: any) {
        // Silent fail for list
      } finally {
        if (!mounted) return;
        setLoadingMeetings(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [partyId]);

  const requiredCreateScopes: MeetScopes[] = [
    "https://www.googleapis.com/auth/meetings.space.created",
  ];
  const requiredReadonlyScopes: MeetScopes[] = [
    "https://www.googleapis.com/auth/meetings.space.readonly",
  ];
  const requiredBothScopes: MeetScopes[] = [
    "https://www.googleapis.com/auth/meetings.space.created",
    "https://www.googleapis.com/auth/meetings.space.readonly",
  ];

  async function handleCreateMeeting() {
    setError(null);
    setCreating(true);
    try {
      if (!authUserId) throw new Error("Not authenticated");
      // 1) Get token for creating a space and future readonly calls
      const token = await requestToken(requiredBothScopes);
      setActiveToken(token);
      try { sessionStorage.setItem(`meetingToken:${partyId}`, token); } catch (_) {}
      // 2) Create Google Meet space
      const created = await googleMeetApi.createSpace(token, { config: {} });
      // 3) Upsert meeting metadata to backend
      const payload: MeetingDto = {
        organizerId: authUserId,
        partyId,
        title: createState.title,
        scheduledStartTime: createState.start,
        scheduledEndTime: createState.end,
        actualStartTime: new Date().toISOString(),
        // Use meetingLink field to store the Google Meet join URL so all party members can see and join
        meetingLink: created.meetingUri ?? "",
      };
      const upsertRes = await meetingsApi.upsertMeeting(payload);
      const saved = upsertRes.data as MeetingDto;
      setActiveMeeting({
        meeting: saved ?? payload,
        google: { spaceId: created.spaceId ?? null, meetingUri: created.meetingUri ?? null },
      });
      // Reload list
      const listRes = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(listRes.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create meeting");
    } finally {
      setCreating(false);
    }
  }

  async function handleEndMeeting() {
    setError(null);
    setEnding(true);
    try {
      if (!activeMeeting.meeting?.meetingId) throw new Error("No active meeting to end");
      // 1) Use cached token if available; otherwise, request readonly token
      const token = activeToken ?? (await requestToken(requiredCreateScopes));
      // Ensure we have party members loaded for mapping
      if (partyMembers.length === 0) {
        try {
          const memRes = await partiesApi.getMembers(partyId);
          setPartyMembers(memRes.data ?? []);
        } catch (memErr) {
          console.warn("[Party] failed to load members on endMeeting:", memErr);
        }
      }
      // 2) Find most recent conference record (assumes just-ended meeting)
      const confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
      console.log("[GoogleMeet] conferenceRecords response:", confList);
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      if (!records || records.length === 0) throw new Error("No conference records found");
      const latest = records[0];
      const conferenceId: string = latest?.name?.split("/")?.pop?.() ?? latest?.conferenceId ?? latest?.id;
      if (!conferenceId) throw new Error("Unable to determine conferenceId");
      console.log("[GoogleMeet] latest conferenceId:", conferenceId);

      // 3) Gather participants
      const participantsRes = await googleMeetApi.listParticipants(token, conferenceId);
      console.log("[GoogleMeet] participants raw response:", participantsRes);
      const participantsRaw: any[] = participantsRes?.participants ?? participantsRes?.items ?? [];

      // Build helper indexes from party members for mapping
      const membersByName = new Map<string, PartyMemberDto>();
      const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
      for (const m of partyMembers) {
        if (m.username) membersByName.set(norm(m.username), m);
        const full = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
        if (full) membersByName.set(norm(full), m);
        if (m.email) membersByName.set(norm(m.email), m);
      }

      const mapped: MeetingParticipantDto[] = [];
      for (const p of participantsRaw) {
        const role = p?.role ?? p?.participantRole ?? "participant";
        const join = p?.earliestStartTime ?? p?.joinTime ?? null;
        const leave = p?.endTime ?? p?.leaveTime ?? null;
        const type = p?.type ?? p?.participantType ?? undefined;
        const displayName: string | undefined = p?.signedinUser?.displayName ?? p?.displayName ?? undefined;

        let matched: PartyMemberDto | undefined;
        // Prefer signed-in participants; attempt to match by display name or email
        if (displayName) {
          matched = membersByName.get(norm(displayName));
        }
        const email = p?.signedinUser?.email ?? p?.email ?? undefined;
        if (!matched && email) {
          matched = membersByName.get(norm(email));
        }

        if (!matched) {
          console.warn("[Mapping] Skipping participant with no party match:", { displayName, email, role, type });
          continue; // Skip unknown users to avoid 400 from backend
        }

        mapped.push({
          userId: matched.authUserId,
          roleInMeeting: role,
          joinTime: join,
          leaveTime: leave,
          type,
          displayName: displayName ?? undefined,
          meetingId: activeMeeting.meeting?.meetingId,
        });
      }

      // Ensure organizer is included
      if (authUserId) {
        const already = mapped.some((mp) => mp.userId === authUserId);
        if (!already) {
          // Derive a friendly display name for the organizer from party members
          const organizerMember = partyMembers.find((m) => m.authUserId === authUserId);
          const organizerDisplayName = getMemberDisplayName(organizerMember);
          mapped.push({
            userId: authUserId,
            roleInMeeting: "organizer",
            joinTime: activeMeeting.meeting?.actualStartTime ?? null,
            leaveTime: new Date().toISOString(),
            type: "signedin",
            displayName: organizerDisplayName,
            meetingId: activeMeeting.meeting?.meetingId,
          });
        }
      }

      // Deduplicate by userId in case of multiple entries
      const dedup = Array.from(
        mapped.reduce((acc, mp) => acc.set(mp.userId ?? "", mp), new Map<string, MeetingParticipantDto>()).values()
      );
      console.log("[GoogleMeet] participants mapped to party members:", dedup);

      // 4) Gather transcript artifacts
      const transcriptsRes = await googleMeetApi.listTranscripts(token, conferenceId);
      console.log("[GoogleMeet] transcripts raw response:", transcriptsRes);
      const transcripts: any[] = transcriptsRes?.transcripts ?? transcriptsRes?.items ?? [];
      const artifacts: ArtifactInputDto[] = [];
      for (const t of transcripts) {
        const transcriptId: string = t?.name?.split("/")?.pop?.() ?? t?.transcriptId ?? t?.id;
        const entries = await googleMeetApi.listTranscriptEntries(token, conferenceId, transcriptId);
        console.log(`[GoogleMeet] transcript ${transcriptId} entries:`, entries);
        const exportUri = t?.docsDocument?.uri ?? t?.docsDocument?.resourceUri ?? null;
        artifacts.push({
          artifactType: "transcript",
          url: exportUri ?? `https://meet.google.com/transcript/${transcriptId}`,
          state: t?.state ?? null,
          exportUri: exportUri ?? null,
          docsDocumentId: t?.docsDocument?.id ?? null,
        });
        // Optionally, attach recording artifact similarly if needed later
      }
      console.log("[Artifacts] Prepared artifacts for backend:", artifacts);

      // 5) Send data to backend
      const meetingId = activeMeeting.meeting.meetingId as string;
      if (dedup.length > 0) {
        console.log("[Backend] upsertParticipants payload:", dedup);
        try {
          await meetingsApi.upsertParticipants(meetingId, dedup);
        } catch (err: any) {
          console.error("[Backend] upsertParticipants 400/ERR:", err?.response?.status, err?.response?.data ?? err?.message);
          throw err; // rethrow to surface the ending error message
        }
      } else {
        console.warn("[Backend] No valid participants to upsert; skipping to avoid 400.");
      }
      if (artifacts.length > 0) {
        console.log("[Backend] processArtifactsAndSummarize payload:", artifacts);
        await meetingsApi.processArtifactsAndSummarize(meetingId, artifacts);
      }

      // 6) Mark actual end time client-side and refresh details
      const updated: MeetingDto = { ...activeMeeting.meeting, actualEndTime: new Date().toISOString() } as MeetingDto;
      setActiveMeeting((prev) => ({ ...prev, meeting: updated }));

      const detailsRes = await meetingsApi.getMeetingDetails(meetingId);
      console.log("[Backend] meeting details response:", detailsRes);
      setSelectedMeetingDetails(detailsRes.data ?? null);

      // Refresh list
      const listRes = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(listRes.data ?? []);
      // After saving all information to the backend, end active session state and clear token
      setActiveMeeting({ meeting: null, google: null });
      setActiveToken(null);
      try { sessionStorage.removeItem(`meetingToken:${partyId}`); } catch (_) {}
    } catch (e: any) {
      setError(e?.message ?? "Failed to end meeting");
    } finally {
      setEnding(false);
    }
  }

  async function loadDetails(meetingId: string) {
    try {
      const res = await meetingsApi.getMeetingDetails(meetingId);
      setSelectedMeetingDetails(res.data ?? null);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Meeting Management</h4>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {/* Create meeting section */}
      <div className="rounded border border-white/10 bg-white/5 p-4">
        <h5 className="mb-3 text-xs font-semibold">Create a meeting</h5>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-[11px] text-white/70">Title</label>
            <input
              type="text"
              value={createState.title}
              onChange={(e) => setCreateState((s) => ({ ...s, title: e.target.value }))}
              className="w-full rounded border border-white/20 bg-white/10 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              placeholder="Study Sprint"
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/70">Start</label>
            <input
              type="datetime-local"
              value={new Date(createState.start).toISOString().slice(0,16)}
              onChange={(e) => {
                const dt = new Date(e.target.value);
                setCreateState((s) => ({ ...s, start: new Date(dt).toISOString() }));
              }}
              className="w-full rounded border border-white/20 bg-white/10 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/70">End</label>
            <input
              type="datetime-local"
              value={new Date(createState.end).toISOString().slice(0,16)}
              onChange={(e) => {
                const dt = new Date(e.target.value);
                setCreateState((s) => ({ ...s, end: new Date(dt).toISOString() }));
              }}
              className="w-full rounded border border-white/20 bg-white/10 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleCreateMeeting}
            disabled={creating}
            className="rounded bg-fuchsia-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Meeting"}
          </button>
          {activeMeeting.meeting?.meetingLink && (
            <a
              href={activeMeeting.meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-white/10 px-4 py-2 text-xs font-medium text-white"
            >
              Join in Google Meet ↗
            </a>
          )}
        </div>
      </div>

      {/* Active meeting controls */}
      {activeMeeting.meeting && (
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/70">Active Meeting</div>
              <div className="text-sm font-medium text-white">{activeMeeting.meeting.title}</div>
              {activeMeeting.meeting?.meetingLink && (
                <div className="text-xs text-white/60">{activeMeeting.meeting.meetingLink}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEndMeeting}
                disabled={ending}
                className="rounded bg-red-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
              >
                {ending ? "Ending..." : "End Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past meetings list */}
      <div className="rounded border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-xs font-semibold">Past Meetings</h5>
          {loadingMeetings && <span className="text-xs text-white/60">Loading...</span>}
        </div>
        {partyMeetings.length === 0 ? (
          <div className="text-xs text-white/60">No meetings yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {partyMeetings.map((m) => (
              <li key={(m.meetingId ?? m.title) + m.scheduledStartTime} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{m.title}</div>
                    <div className="text-[11px] text-white/60">
                      {new Date(m.scheduledStartTime).toLocaleString()} – {new Date(m.scheduledEndTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.meetingId && (
                      <button
                        onClick={() => loadDetails(m.meetingId!)}
                        className="rounded bg-white/10 px-3 py-2 text-[11px] text-white"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected meeting details */}
      {selectedMeetingDetails && (
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <h5 className="mb-2 text-xs font-semibold">Meeting Details</h5>
          <div className="space-y-2">
            <div className="text-sm font-medium text-white">{selectedMeetingDetails.meeting?.title}</div>
            <div className="text-xs text-white/70">Participants ({selectedMeetingDetails.participants?.length ?? 0})</div>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {selectedMeetingDetails.participants?.map((p, idx) => (
                <li key={(p.userId ?? String(idx)) + (p.joinTime ?? "")} className="rounded border border-white/10 bg-white/5 p-2">
                  <div className="text-xs text-white">
                    {p.displayName ?? p.userId}
                    <span className="ml-2 text-white/60">{p.roleInMeeting ?? "participant"}</span>
                  </div>
                  <div className="text-[11px] text-white/60">
                    {p.joinTime ? new Date(p.joinTime).toLocaleTimeString() : ""}
                    {p.leaveTime ? ` → ${new Date(p.leaveTime).toLocaleTimeString()}` : ""}
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-xs text-white/70">Summary</div>
            <div className="whitespace-pre-wrap rounded border border-white/10 bg-white/5 p-3 text-xs text-white/80">
              {selectedMeetingDetails.summaryText ?? "No summary available."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}