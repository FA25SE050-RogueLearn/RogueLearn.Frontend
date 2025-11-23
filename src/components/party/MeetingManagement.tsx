"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useGoogleMeet, MeetScopes } from "@/hooks/useGoogleMeet";
import googleMeetApi from "@/api/googleMeetApi";
import meetingsApi from "@/api/meetingsApi";
import partiesApi from "@/api/partiesApi";
import type { PartyMemberDto } from "@/types/parties";
import {
  MeetingDto,
  MeetingParticipantDto,
  ArtifactInputDto,
  MeetingDetailsDto,
  MeetingStatus,
} from "@/types/meetings";
import { createClient } from "@/utils/supabase/client";
import { datetimeLocalBangkok, formatBangkok } from "@/utils/time";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { usePartyRole } from "@/hooks/usePartyRole";

interface Props {
  partyId: string;
}

type CreateState = {
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  spaceName?: string;
};

export default function MeetingManagement({ partyId }: Props) {
  const { getAccessToken, requestToken } = useGoogleMeet();
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
      spaceName: "",
    };
  });

  // Active meeting state for the current session
  const [activeMeeting, setActiveMeeting] = useState<{
    meeting: MeetingDto | null;
    google: { spaceId?: string | null; meetingUri?: string | null } | null;
  }>({ meeting: null, google: null });

  const [partyMeetings, setPartyMeetings] = useState<MeetingDto[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const [detailsById, setDetailsById] = useState<
    Record<string, MeetingDetailsDto | null>
  >({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [partyMembers, setPartyMembers] = useState<PartyMemberDto[]>([]);
  const { role } = usePartyRole(partyId);

  // Helper: derive a friendly display name for a party member
  function getMemberDisplayName(m?: PartyMemberDto | null): string | undefined {
    if (!m) return undefined;
    const username = (m.username ?? "").trim();
    if (username) return username;
    const full = `${(m.firstName ?? "").trim()} ${(
      m.lastName ?? ""
    ).trim()}`.trim();
    if (full) return full;
    const email = (m.email ?? "").trim();
    return email || undefined;
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    // Restore token for this party session if available
    try {
      const cached = sessionStorage.getItem(`meetingToken:${partyId}`);
      if (cached) setActiveToken(cached);
    } catch (_) { }
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
        const active = detectActiveMeeting(res.data ?? []);
        if (active) {
          setActiveMeeting({ meeting: active, google: null });
        } else {
          setActiveMeeting({ meeting: null, google: null });
        }
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
    return () => {
      mounted = false;
    };
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
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  async function handleCreateMeeting() {
    setError(null);
    setCreating(true);
    try {
      if (!authUserId) throw new Error("Not authenticated");
      // 1) Get token for creating a space and future readonly calls
      const token = await getAccessToken(requiredBothScopes);
      setActiveToken(token);
      try {
        sessionStorage.setItem(`meetingToken:${partyId}`, token);
      } catch (_) { }
      // 2) Create Google Meet space
      let created = await googleMeetApi.createSpace(token, { config: {} });
      // Fallback: if token lacks scopes, request via GIS and retry
      if (!created?.meetingUri) {
        try {
          const gisToken = await requestToken(requiredBothScopes);
          setActiveToken(gisToken);
          try {
            sessionStorage.setItem(`meetingToken:${partyId}`, gisToken);
          } catch (_) { }
          created = await googleMeetApi.createSpace(gisToken, { config: {} });
        } catch (fallbackErr) { }
      }
      const codeMatch = (created.meetingUri ?? "").match(
        /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i
      );
      const meetingCode = codeMatch?.[0] ?? undefined;
      let spaceName: string | undefined =
        (createState.spaceName ?? "").trim() ||
        created.name?.split("/")?.pop?.();
      try {
        const space = await googleMeetApi.getSpace(
          token,
          created.name ?? meetingCode ?? ""
        );
        const cfg = space?.config as any;
        const title = (cfg?.title ?? "").trim();
        if (!spaceName && title) spaceName = title;
      } catch { }
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
        meetingCode,
        spaceName,
        status: MeetingStatus.Active,
      };
      const upsertRes = await meetingsApi.upsertMeeting(payload);
      const saved = upsertRes.data as MeetingDto;
      setActiveMeeting({
        meeting: saved ?? payload,
        google: {
          spaceId: created.spaceId ?? null,
          meetingUri: created.meetingUri ?? null,
        },
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

  async function handleEndMeetingFor(meeting: MeetingDto) {
    setError(null);
    setEnding(true);
    try {
      if (!meeting?.meetingId) throw new Error("No meeting to end");
      const token = activeToken ?? (await getAccessToken(requiredBothScopes));
      try {
        const link = meeting?.meetingLink ?? null;
        const codeMatch = link ? link.match(/meet\.google\.com\/(?:lookup\/)?([a-z0-9\-]+)/i) : null;
        const code = codeMatch?.[1] ?? null;
        if (code) {
          await googleMeetApi.endActiveConference(token, code);
        }
      } catch (_) { }
      if (partyMembers.length === 0) {
        try {
          const memRes = await partiesApi.getMembers(partyId);
          setPartyMembers(memRes.data ?? []);
        } catch (_) { }
      }
      const confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      if (!records || records.length === 0) throw new Error("No conference records found");
      const latest = records[0];
      const conferenceId: string = latest?.name?.split("/")?.pop?.() ?? latest?.conferenceId ?? latest?.id;
      if (!conferenceId) throw new Error("Unable to determine conferenceId");
      const participantsRes = await googleMeetApi.listParticipants(token, conferenceId);
      const participantsRaw: any[] = participantsRes?.participants ?? participantsRes?.items ?? [];
      const mapped: MeetingParticipantDto[] = [];
      for (const p of participantsRaw) {
        mapped.push({
          userId: undefined,
          roleInMeeting: p?.role ?? p?.participantRole ?? "participant",
          joinTime: p?.earliestStartTime ?? p?.joinTime ?? null,
          leaveTime: p?.endTime ?? p?.leaveTime ?? null,
          type: p?.type ?? p?.participantType ?? undefined,
          displayName: p?.signedinUser?.displayName ?? p?.displayName ?? "Unknown",
          meetingId: meeting?.meetingId,
        });
      }
      if (authUserId) {
        const already = mapped.some((mp) => mp.userId === authUserId);
        if (!already) {
          const organizerMember = partyMembers.find((m) => m.authUserId === authUserId);
          const organizerDisplayName = getMemberDisplayName(organizerMember);
          mapped.push({
            userId: authUserId,
            roleInMeeting: "organizer",
            joinTime: meeting?.actualStartTime ?? null,
            leaveTime: new Date().toISOString(),
            type: "signedin",
            displayName: organizerDisplayName,
            meetingId: meeting?.meetingId,
          });
        }
      }
      const dedup = Array.from(
        mapped.reduce(
          (acc, mp) => acc.set((mp.userId ?? mp.displayName ?? ""), mp),
          new Map<string, MeetingParticipantDto>()
        ).values()
      );
      const meetingId = meeting.meetingId as string;
      if (dedup.length > 0) {
        await meetingsApi.upsertParticipants(meetingId, dedup);
      }
      const updated: MeetingDto = { ...meeting, actualEndTime: new Date().toISOString(), status: MeetingStatus.EndedProcessing } as MeetingDto;
      try { await meetingsApi.upsertMeeting(updated); } catch { }
      const listRes = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(listRes.data ?? []);
      try {
        const detailsRes = await meetingsApi.getMeetingDetails(meetingId);
        setDetailsById((prev) => ({ ...prev, [meetingId]: detailsRes.data ?? null }));
      } catch {
        setDetailsById((prev) => ({ ...prev, [meetingId]: { meeting: updated, participants: dedup, summaryText: prev[meetingId]?.summaryText ?? null } as any }));
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to end meeting");
    } finally {
      setEnding(false);
    }
  }

  async function handleSyncMeetingFor(meeting: MeetingDto) {
    setError(null);
    try {
      if (!meeting?.meetingId) throw new Error("No meeting to sync");
      if (!meeting.actualEndTime) throw new Error("Meeting has no end time yet");
      const endedAt = new Date(meeting.actualEndTime).getTime();
      const canSync = Date.now() - endedAt >= 10 * 60 * 1000;
      if (!canSync) throw new Error("Sync available ~10 minutes after meeting ends");
      const token = activeToken ?? (await getAccessToken(requiredBothScopes));
      const confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      if (!records || records.length === 0) throw new Error("No conference records found");
      const latest = records[0];
      const conferenceId: string = latest?.name?.split("/")?.pop?.() ?? latest?.conferenceId ?? latest?.id;
      if (!conferenceId) throw new Error("Unable to determine conferenceId");
      const transcriptsRes = await googleMeetApi.listTranscripts(token, conferenceId);
      const transcripts: any[] = transcriptsRes?.transcripts ?? transcriptsRes?.items ?? [];
      const artifacts: ArtifactInputDto[] = [];
      for (const t of transcripts) {
        const transcriptId: string = t?.name?.split("/")?.pop?.() ?? t?.transcriptId ?? t?.id;
        const exportUri = t?.docsDocument?.uri ?? t?.docsDocument?.resourceUri ?? null;
        artifacts.push({
          artifactType: "transcript",
          url: exportUri ?? `https://meet.google.com/transcript/${transcriptId}`,
          state: t?.state ?? null,
          exportUri: exportUri ?? null,
          docsDocumentId: t?.docsDocument?.id ?? null,
        });
      }
      if (artifacts.length > 0) {
        await meetingsApi.processArtifactsAndSummarize(meeting.meetingId as string, artifacts);
      }
      const completed: MeetingDto = { ...meeting, status: MeetingStatus.Completed } as MeetingDto;
      try { await meetingsApi.upsertMeeting(completed); } catch { }
      const listRes = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(listRes.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to sync transcripts");
    }
  }

  async function loadDetailsIfNeeded(meetingId: string) {
    if (!meetingId) return;
    if (detailsById[meetingId] || detailsLoading[meetingId]) return;
    setDetailsLoading((prev) => ({ ...prev, [meetingId]: true }));
    try {
      const res = await meetingsApi.getMeetingDetails(meetingId);
      setDetailsById((prev) => ({ ...prev, [meetingId]: res.data ?? null }));
    } catch (e: any) {
      setDetailsById((prev) => ({ ...prev, [meetingId]: null }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [meetingId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Meeting Management</h4>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {/* Create meeting section */}
      {role && role !== "Member" && (
        <div className="rounded border border-white/10 bg-white/5 p-4">
          <h5 className="mb-3 text-xs font-semibold">Create a meeting</h5>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="block text-[11px] text-white/70">Title</label>
              <input
                type="text"
                value={createState.title}
                onChange={(e) =>
                  setCreateState((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full rounded border border-white/20 bg-white/10 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                placeholder="Study Sprint"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/70">Start</label>
              <input
                type="datetime-local"
                value={datetimeLocalBangkok(createState.start)}
                onChange={(e) => {
                  const dt = new Date(e.target.value);
                  setCreateState((s) => ({
                    ...s,
                    start: new Date(dt).toISOString(),
                  }));
                }}
                className="w-full rounded border border-white/20 bg-white/10 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/70">End</label>
              <input
                type="datetime-local"
                value={datetimeLocalBangkok(createState.end)}
                onChange={(e) => {
                  const dt = new Date(e.target.value);
                  setCreateState((s) => ({
                    ...s,
                    end: new Date(dt).toISOString(),
                  }));
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
          </div>
        </div>
      )}



      <div className="rounded border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-xs font-semibold">Meetings</h5>
          {loadingMeetings && (
            <span className="text-xs text-white/60">Loading...</span>
          )}
        </div>
        {partyMeetings.length === 0 ? (
          <div className="text-xs text-white/60">No meetings yet.</div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={expandedId}
            onValueChange={(val) => {
              const v = typeof val === "string" ? val : "";
              setExpandedId(v);
              if (v) loadDetailsIfNeeded(v);
            }}
          >
            {[...partyMeetings]
              .sort((a, b) => {
                const sa = (a.spaceName ?? "").toLowerCase();
                const sb = (b.spaceName ?? "").toLowerCase();
                if (sa && sb) return sa.localeCompare(sb);
                if (sa) return -1;
                if (sb) return 1;
                return (a.title ?? "")
                  .toLowerCase()
                  .localeCompare((b.title ?? "").toLowerCase());
              })
              .map((m) => {
                const id = m.meetingId ?? `${m.title}-${m.scheduledStartTime}`;
                const details = m.meetingId ? detailsById[m.meetingId] : null;
                const isLoading = m.meetingId
                  ? detailsLoading[m.meetingId]
                  : false;
                return (
                  <AccordionItem key={id} value={m.meetingId ?? id}>
                    <div className="flex w-full items-center justify-between gap-4 py-4">
                      <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                        <div className="flex w-full items-center justify-between">
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-white truncate">
                                {m.title}
                              </div>
                              {m.status && (
                                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
                                  {m.status}
                                </span>
                              )}
                            </div>
                            {m.spaceName && (
                              <div className="text-[11px] text-white/70 truncate">
                                Space Name: {m.spaceName}
                              </div>
                            )}
                            <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                              <div className="text-[11px] text-white/60">
                                <span className="text-white/70">Scheduled:</span>{" "}
                                {formatBangkok(m.scheduledStartTime, { includeSeconds: false, separator: " " })}{" "}
                                –{" "}
                                {formatBangkok(m.scheduledEndTime, { includeSeconds: false, separator: " " })}
                              </div>
                              <div className="text-[11px] text-white/60">
                                <span className="text-white/70">Actual:</span>{" "}
                                {m.actualStartTime ? formatBangkok(m.actualStartTime, { includeSeconds: false, separator: " " }) : "—"}{" "}
                                –{" "}
                                {m.actualEndTime ? formatBangkok(m.actualEndTime, { includeSeconds: false, separator: " " }) : "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.meetingLink && m.status === MeetingStatus.Active && (
                          <a
                            href={m.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            Join Meet ↗
                          </a>
                        )}
                        {role && role !== "Member" && (
                          <>
                            {m.status === MeetingStatus.Active && (
                              <button
                                onClick={() => handleEndMeetingFor(m)}
                                disabled={ending}
                                className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                              >
                                End Meeting
                              </button>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <button
                                      onClick={() => handleSyncMeetingFor(m)}
                                      disabled={!(m.status === MeetingStatus.EndedProcessing && m.actualEndTime && (Date.now() - new Date(m.actualEndTime).getTime() >= 10 * 60 * 1000))}
                                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                                    >
                                      Sync Transcript
                                    </button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {!(m.status === MeetingStatus.EndedProcessing && m.actualEndTime && (Date.now() - new Date(m.actualEndTime).getTime() >= 10 * 60 * 1000))
                                    ? "Available ~10 minutes after meeting ends"
                                    : "Sync transcripts from Google Meet"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    </div>
                    <AccordionContent>
                      {!m.meetingId ? (
                        <div className="text-[11px] text-white/60">
                          Details unavailable
                        </div>
                      ) : isLoading ? (
                        <div className="text-[11px] text-white/60">
                          Loading details…
                        </div>
                      ) : !details ? (
                        <div className="text-[11px] text-white/60">
                          No details available.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-white">
                            {details.meeting?.title}
                          </div>
                          <div className="text-xs text-white/70">
                            Participants ({(details.participants?.filter((p) => (p.roleInMeeting ?? "").toLowerCase() !== "organizer").length) ?? 0})
                          </div>
                          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {details.participants?.filter((p) => (p.roleInMeeting ?? "").toLowerCase() !== "organizer").map((p, idx) => (
                              <li
                                key={(p.userId ?? String(idx)) + (p.joinTime ?? "")}
                                className="rounded border border-white/10 bg-white/5 p-2"
                              >
                                <div className="text-xs text-white">
                                  {p.displayName ?? p.userId}
                                  <span className="ml-2 text-white/60">{p.roleInMeeting ?? "participant"}</span>
                                </div>
                                <div className="text-[11px] text-white/60">
                                  {p.joinTime ? formatBangkok(p.joinTime, { includeSeconds: false, separator: " " }) : ""}
                                  {p.leaveTime ? ` → ${formatBangkok(p.leaveTime, { includeSeconds: false, separator: " " })}` : ""}
                                </div>
                              </li>
                            ))}
                          </ul>
                          <div className="my-2 border-t border-white/10" />
                          <div className="text-xs text-white/70">Organizer</div>
                          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {details.participants?.filter((p) => (p.roleInMeeting ?? "").toLowerCase() === "organizer").map((p, idx) => (
                              <li
                                key={(p.userId ?? String(idx)) + (p.joinTime ?? "")}
                                className="rounded border border-white/10 bg-white/5 p-2"
                              >
                                <div className="text-xs text-white">
                                  {p.displayName ?? p.userId}
                                  <span className="ml-2 text-white/60">{p.roleInMeeting ?? "organizer"}</span>
                                </div>
                                <div className="text-[11px] text-white/60">
                                  {p.joinTime ? formatBangkok(p.joinTime, { includeSeconds: false, separator: " " }) : ""}
                                  {p.leaveTime ? ` → ${formatBangkok(p.leaveTime, { includeSeconds: false, separator: " " })}` : ""}
                                </div>
                              </li>
                            ))}
                          </ul>
                          <div className="text-xs text-white/70">Summary</div>
                          <div className="whitespace-pre-wrap rounded border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                            {details.summaryText ?? "No summary available."}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        )}
      </div>
    </div>
  );
}
function detectActiveMeeting(list: MeetingDto[]): MeetingDto | null {
  const byStatus = list.filter((m) => m.status === MeetingStatus.Active);
  if (byStatus.length > 0) {
    return byStatus.sort(
      (a, b) =>
        new Date(b.actualStartTime || b.scheduledStartTime || 0).getTime() -
        new Date(a.actualStartTime || a.scheduledStartTime || 0).getTime()
    )[0];
  }
  return null;
}
