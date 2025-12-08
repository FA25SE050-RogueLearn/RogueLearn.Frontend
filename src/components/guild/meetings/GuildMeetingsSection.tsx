"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Swords, Video, Calendar, Clock, Users, ExternalLink, Play, Square, AlertCircle, FileText } from "lucide-react";
import { useGoogleMeet, MeetScopes } from "@/hooks/useGoogleMeet";
import googleMeetApi from "@/api/googleMeetApi";
import meetingsApi from "@/api/meetingsApi";
import guildsApi from "@/api/guildsApi";
import type { GuildMemberDto, GuildRole } from "@/types/guilds";
import type { MeetingDto, MeetingParticipantDto, ArtifactInputDto, MeetingDetailsDto } from "@/types/meetings";
import { MeetingStatus } from "@/types/meetings";
import { createClient } from "@/utils/supabase/client";
import { datetimeLocalBangkok, formatBangkok } from "@/utils/time";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
  guildId: string;
}

type CreateState = {
  title: string;
  start: string;
  end: string;
  spaceName?: string;
};

// RPG Design Constants
const CARD_TEXTURE = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  backgroundSize: "100px",
  backgroundBlendMode: "overlay" as const,
  opacity: 0.25,
};

const MEETING_CARD_CLASS = "relative overflow-hidden rounded-[28px] border border-[#f5c16c]/30 bg-gradient-to-br from-[#2d1810] via-[#1a0a08] to-black shadow-xl";

const ACTIVE_MEETING_CLASS = "relative overflow-hidden rounded-[28px] border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/50 via-[#1a0a08] to-black shadow-[0_0_30px_rgba(16,185,129,0.2)]";

export default function GuildMeetingsSection({ guildId }: Props) {
  const { getAccessToken, requestToken, refreshAccessToken } = useGoogleMeet();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(false);

  const [createState, setCreateState] = useState<CreateState>(() => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60 * 1000);
    return {
      title: "Guild Meetup",
      start: now.toISOString(),
      end: in30.toISOString(),
    };
  });
  const [dateError, setDateError] = useState<string | null>(null);

  const [activeMeeting, setActiveMeeting] = useState<{
    meeting: MeetingDto | null;
    google: { space?: string | null; meetingUri?: string | null } | null;
  }>({ meeting: null, google: null });

  const [guildMeetings, setGuildMeetings] = useState<MeetingDto[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const [detailsById, setDetailsById] = useState<Record<string, MeetingDetailsDto | null>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [members, setMembers] = useState<GuildMemberDto[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;

  function isUnauthorized(err: any): boolean {
    const msg = typeof err?.message === "string" ? err.message : "";
    return (err?.status === 401) || (err?.response?.status === 401) || /\b401\b/.test(msg);
  }

  function detectActiveMeeting(list: MeetingDto[]): MeetingDto | null {
    const byStatus = list.filter((m) => m.status === MeetingStatus.Active);
    if (byStatus.length > 0) {
      return byStatus.sort((a, b) => new Date(b.actualStartTime || b.scheduledStartTime || 0).getTime() - new Date(a.actualStartTime || a.scheduledStartTime || 0).getTime())[0];
    }
    return null;
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`guildMeetingToken:${guildId}`);
      if (cached) setActiveToken(cached);
    } catch (_) {}
  }, [guildId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingMeetings(true);
      try {
        const [mList, mMembers] = await Promise.all([
          meetingsApi.getGuildMeetings(guildId),
          guildsApi.getMembers(guildId),
        ]);
        if (!mounted) return;
        setGuildMeetings(mList.data ?? []);
        setMembers(mMembers.data ?? []);
        const active = detectActiveMeeting(mList.data ?? []);
        if (active) {
          setActiveMeeting({ meeting: active, google: null });
        } else {
          setActiveMeeting({ meeting: null, google: null });
        }
      } catch (e: any) {
      } finally {
        if (!mounted) return;
        setLoadingMeetings(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [guildId]);

  const myRole: GuildRole | null = useMemo(() => {
    if (!authUserId) return null;
    const me = members.find((m) => m.authUserId === authUserId);
    return me?.role ?? null;
  }, [members, authUserId]);

  const sortedMeetings = useMemo(() => {
    return [...guildMeetings].sort((a, b) => {
      const sa = (a.spaceName ?? '').toLowerCase();
      const sb = (b.spaceName ?? '').toLowerCase();
      if (sa && sb) return sa.localeCompare(sb);
      if (sa) return -1;
      if (sb) return 1;
      return (a.title ?? '').toLowerCase().localeCompare((b.title ?? '').toLowerCase());
    });
  }, [guildMeetings]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil((sortedMeetings.length || 0) / pageSize)), [sortedMeetings.length]);
  const safePage = useMemo(() => Math.min(Math.max(1, page), pageCount), [page, pageCount]);
  const pagedMeetings = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return sortedMeetings.slice(start, end);
  }, [sortedMeetings, safePage]);

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
      let token = await getAccessToken(requiredBothScopes);
      setActiveToken(token);
      try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, token); } catch (_) {}
      let created: any;
      try {
        created = await googleMeetApi.createSpace(token, { config: {} });
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
            created = await googleMeetApi.createSpace(token, { config: {} });
          } catch {
            try {
              const gisToken = await requestToken(requiredBothScopes);
              token = gisToken;
              setActiveToken(gisToken);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, gisToken); } catch (_) {}
              created = await googleMeetApi.createSpace(gisToken, { config: {} });
            } catch (reqErr: any) {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        } else {
          throw e;
        }
      }
      if (!created?.meetingUri) {
        try {
          const gisToken = await requestToken(requiredBothScopes);
          token = gisToken;
          setActiveToken(gisToken);
          try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, gisToken); } catch (_) {}
          created = await googleMeetApi.createSpace(gisToken, { config: {} });
        } catch (_) {}
      }
      const codeMatch = (created.meetingUri ?? '').match(/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i);
      const meetingCode = codeMatch?.[0] ?? undefined;
      let spaceName: string | undefined = (createState.spaceName ?? '').trim() || created.name?.split('/')?.pop?.();
      try {
        const space = await googleMeetApi.getSpace(token, created.name ?? meetingCode ?? '');
        const cfg = space?.config as any;
        const title = (cfg?.title ?? '').trim();
        if (title) spaceName = title;
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
            const space = await googleMeetApi.getSpace(token, created.name ?? meetingCode ?? '');
            const cfg = space?.config as any;
            const title = (cfg?.title ?? '').trim();
            if (title) spaceName = title;
          } catch {
            try {
              const gisToken = await requestToken(requiredBothScopes);
              token = gisToken;
              setActiveToken(gisToken);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, gisToken); } catch (_) {}
              const space = await googleMeetApi.getSpace(token, created.name ?? meetingCode ?? '');
              const cfg = space?.config as any;
              const title = (cfg?.title ?? '').trim();
              if (title) spaceName = title;
            } catch (reqErr: any) {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        }
      }
      const payload: MeetingDto = {
        organizerId: authUserId,
        partyId: null,
        guildId,
        title: createState.title,
        scheduledStartTime: createState.start,
        scheduledEndTime: createState.end,
        actualStartTime: new Date().toISOString(),
        meetingLink: created.meetingUri ?? "",
        meetingCode,
        spaceName,
        status: MeetingStatus.Active,
      };
      const upsertRes = await meetingsApi.upsertMeeting(payload);
      const saved = upsertRes.data as MeetingDto;
      setActiveMeeting({
        meeting: saved ?? payload,
        google: { space: created.spaceId ?? null, meetingUri: created.meetingUri ?? null },
      });
      const listRes = await meetingsApi.getGuildMeetings(guildId);
      setGuildMeetings(listRes.data ?? []);
      setNeedsAuth(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create meeting");
    } finally {
      setCreating(false);
    }
  }

  function getMemberDisplayName(m?: GuildMemberDto | null): string | undefined {
    if (!m) return undefined;
    const username = (m.username ?? "").trim();
    if (username) return username;
    const full = `${(m.firstName ?? "").trim()} ${(m.lastName ?? "").trim()}`.trim();
    if (full) return full;
    const email = (m.email ?? "").trim();
    return email || undefined;
  }

  function getParticipantName(participant: any): string {
    if (participant?.signedinUser) return participant.signedinUser.displayName as string;
    if (participant?.anonymousUser) return `${participant.anonymousUser.displayName} (Guest)`;
    return "Unknown User";
  }

  async function handleEndMeetingFor(meeting: MeetingDto) {
    setError(null);
    setEnding(true);
    try {
      if (!meeting?.meetingId) throw new Error("No meeting to end");
      let token = activeToken ?? (await getAccessToken(requiredBothScopes));
      if (members.length === 0) {
        try {
          const memRes = await guildsApi.getMembers(guildId);
          setMembers(memRes.data ?? []);
        } catch (_) {}
      }
      let spaceName: string | null = activeMeeting.google?.space ?? null;
      if (!spaceName) {
        const link = meeting?.meetingLink ?? "";
        const codeMatch = link.match(/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i);
        const code = codeMatch?.[0] ?? null;
        if (code) {
          try {
            const space = await googleMeetApi.getSpace(token, code);
            spaceName = space?.name ?? null;
          } catch (e: any) {
            if (isUnauthorized(e)) {
              try {
                const refreshed = await refreshAccessToken();
                token = refreshed;
                setActiveToken(refreshed);
                try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
                const space = await googleMeetApi.getSpace(token, code);
                spaceName = space?.name ?? null;
              } catch {
                try {
                  const gisToken = await requestToken(requiredBothScopes);
                  token = gisToken;
                  setActiveToken(gisToken);
                  try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, gisToken); } catch (_) {}
                  const space = await googleMeetApi.getSpace(token, code);
                  spaceName = space?.name ?? null;
                } catch (reqErr: any) {
                  setNeedsAuth(true);
                  throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
                }
              }
            }
          }
        }
      }
      let confList: any;
      try {
        confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
            confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
          } catch {
            try {
              const newToken = await requestToken(requiredBothScopes);
              token = newToken;
              setActiveToken(newToken);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
              confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
            } catch (reqErr: any) {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        } else {
          throw e;
        }
      }
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      if (!records || records.length === 0) throw new Error("No conference records found");
      let expectedSpace = (meeting?.spaceName ?? "").trim();
      let expectedResourceName: string | null = null;
      if (!expectedSpace) {
        const link = meeting?.meetingLink ?? "";
        const codeMatch = link.match(/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i);
        const code = codeMatch?.[0] ?? null;
        if (code) {
          try {
            const space = await googleMeetApi.getSpace(token, code);
            expectedResourceName = space?.name ?? null; // spaces/{space}
            expectedSpace = (expectedResourceName ?? "").split("/").pop() ?? "";
          } catch (e: any) {
            if (isUnauthorized(e)) {
              try {
                const refreshed = await refreshAccessToken();
                token = refreshed;
                setActiveToken(refreshed);
                try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
                const space = await googleMeetApi.getSpace(token, code);
                expectedResourceName = space?.name ?? null;
                expectedSpace = (expectedResourceName ?? "").split("/").pop() ?? "";
              } catch {
                try {
                  const gisToken = await requestToken(requiredBothScopes);
                  token = gisToken;
                  setActiveToken(gisToken);
                  try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, gisToken); } catch (_) {}
                  const space = await googleMeetApi.getSpace(token, code);
                  expectedResourceName = space?.name ?? null;
                  expectedSpace = (expectedResourceName ?? "").split("/").pop() ?? "";
                } catch (reqErr: any) {
                  setNeedsAuth(true);
                  throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
                }
              }
            }
          }
        }
      }
      let matchedConferenceId: string | null = null;
      let matchedSpaceResource: string | null = null;
      const candidates = records.slice(0, 3);
      for (const r of candidates) {
        const rid = r?.name?.split("/")?.pop?.() ?? r?.conferenceId ?? r?.id;
        if (!rid) continue;
        let rec: any;
        try {
          rec = await googleMeetApi.getConferenceRecord(token, rid);
        } catch (e: any) {
          if (isUnauthorized(e)) {
            try {
              const refreshed = await refreshAccessToken();
              token = refreshed;
              setActiveToken(refreshed);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
              rec = await googleMeetApi.getConferenceRecord(token, rid);
            } catch {
              try {
                const newToken = await requestToken(requiredBothScopes);
                token = newToken;
                setActiveToken(newToken);
                try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
                rec = await googleMeetApi.getConferenceRecord(token, rid);
              } catch {}
            }
          }
        }
        const spaceName = (rec?.space ?? "").split("/").pop();
        if (spaceName && expectedSpace && spaceName === expectedSpace) {
          matchedConferenceId = rec?.name?.split("/")?.pop?.() ?? rid;
          matchedSpaceResource = rec?.space ?? null; // full resource name
          break;
        }
      }
      let participantsRaw: any[] = [];
      if (matchedConferenceId) {
        let participantsRes: any;
        try {
          participantsRes = await googleMeetApi.listParticipants(token, matchedConferenceId);
        } catch (e: any) {
          if (isUnauthorized(e)) {
            try {
              const refreshed = await refreshAccessToken();
              token = refreshed;
              setActiveToken(refreshed);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
              participantsRes = await googleMeetApi.listParticipants(token, matchedConferenceId);
            } catch {
              try {
                const newToken = await requestToken(requiredBothScopes);
                token = newToken;
                setActiveToken(newToken);
                try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
                participantsRes = await googleMeetApi.listParticipants(token, matchedConferenceId);
              } catch (reqErr: any) {
                setNeedsAuth(true);
                throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
              }
            }
          } else {
            throw e;
          }
        }
        participantsRaw = participantsRes?.participants ?? participantsRes?.items ?? [];
      }
      const mapped: MeetingParticipantDto[] = [];
      for (const p of participantsRaw) {
        mapped.push({
          userId: undefined,
          roleInMeeting: p?.role ?? p?.participantRole ?? "participant",
          joinTime: p?.earliestStartTime ?? p?.joinTime ?? null,
          leaveTime: p?.endTime ?? p?.leaveTime ?? null,
          type: p?.type ?? p?.participantType ?? undefined,
          displayName: getParticipantName(p),
          meetingId: meeting?.meetingId,
        });
      }
      if (authUserId) {
        const already = mapped.some((mp) => mp.userId === authUserId);
        if (!already) {
          const organizerMember = members.find((m) => m.authUserId === authUserId);
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
      setActiveMeeting((prev) => ({ ...prev, meeting: updated }));
      try { await meetingsApi.upsertMeeting(updated); } catch (_) {}
      const detailsRes = await meetingsApi.getMeetingDetails(meetingId);
      setDetailsById((prev) => ({ ...prev, [meetingId]: detailsRes.data ?? null }));
      setExpandedId(meetingId);
      try {
        const endResource = matchedSpaceResource ?? expectedResourceName ?? spaceName;
        if (endResource) {
          await googleMeetApi.endActiveConference(token, endResource);
        }
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
            const endResource = matchedSpaceResource ?? expectedResourceName ?? spaceName;
            if (endResource) await googleMeetApi.endActiveConference(token, endResource);
          } catch {
            try {
              const newToken = await requestToken(requiredBothScopes);
              token = newToken;
              setActiveToken(newToken);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
              const endResource = matchedSpaceResource ?? expectedResourceName ?? spaceName;
              if (endResource) await googleMeetApi.endActiveConference(token, endResource);
            } catch (reqErr: any) {
              setNeedsAuth(true);
            }
          }
        }
      }
      const listRes = await meetingsApi.getGuildMeetings(guildId);
      setGuildMeetings(listRes.data ?? []);
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
      if (Date.now() - endedAt < 10 * 60 * 1000) throw new Error("Sync available ~10 minutes after meeting ends");
      let token = activeToken ?? (await getAccessToken(requiredBothScopes));
      let confList: any;
      try {
        confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
            confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
          } catch {
            try {
              const newToken = await requestToken(requiredBothScopes);
              token = newToken;
              setActiveToken(newToken);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
              confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
            } catch (reqErr: any) {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        } else {
          throw e;
        }
      }
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      if (!records || records.length === 0) throw new Error("No conference records found");
      const latest = records[0];
      const conferenceId: string = latest?.name?.split("/")?.pop?.() ?? latest?.conferenceId ?? latest?.id;
      if (!conferenceId) throw new Error("Unable to determine conferenceId");
      let transcriptsRes: any;
      try {
        transcriptsRes = await googleMeetApi.listTranscripts(token, conferenceId);
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, refreshed); } catch (_) {}
            transcriptsRes = await googleMeetApi.listTranscripts(token, conferenceId);
          } catch {
            try {
              const newToken = await requestToken(requiredBothScopes);
              token = newToken;
              setActiveToken(newToken);
              try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
              transcriptsRes = await googleMeetApi.listTranscripts(token, conferenceId);
            } catch (reqErr: any) {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        } else {
          throw e;
        }
      }
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
      setActiveMeeting((prev) => ({ ...prev, meeting: completed }));
      try { await meetingsApi.upsertMeeting(completed); } catch {}
      const listRes = await meetingsApi.getGuildMeetings(guildId);
      setGuildMeetings(listRes.data ?? []);
      setNeedsAuth(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to sync transcripts");
    }
  }

  async function handleAuthorize() {
    setError(null);
    try {
      const newToken = await requestToken(requiredBothScopes);
      setActiveToken(newToken);
      try { sessionStorage.setItem(`guildMeetingToken:${guildId}`, newToken); } catch (_) {}
      setNeedsAuth(false);
    } catch (e: any) {
      setError(e?.message ?? "Authorization failed");
    }
  }

  async function loadDetailsIfNeeded(meetingId: string) {
    if (!meetingId) return;
    if (detailsById[meetingId] || detailsLoading[meetingId]) return;
    setDetailsLoading((prev) => ({ ...prev, [meetingId]: true }));
    try {
      const res = await meetingsApi.getMeetingDetails(meetingId);
      setDetailsById((prev) => ({ ...prev, [meetingId]: res.data ?? null }));
    } catch (e) {
      setDetailsById((prev) => ({ ...prev, [meetingId]: null }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [meetingId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f5c16c]/10 p-2">
            <Swords className="h-5 w-5 text-[#f5c16c]" />
          </div>
          <h4 className="text-lg font-semibold text-[#f5c16c]">Guild Meetings</h4>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {myRole === "GuildMaster" && (
        <div className={MEETING_CARD_CLASS}>
          {/* Texture overlay */}
          <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          
          <div className="relative p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-[#f5c16c]/10 p-2">
                <Calendar className="h-5 w-5 text-[#f5c16c]" />
              </div>
              <h5 className="text-base font-semibold text-[#f5c16c]">Schedule New Meeting</h5>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-medium text-[#f5c16c]/70">Title</label>
                <input
                  type="text"
                  value={createState.title}
                  onChange={(e) => setCreateState((s) => ({ ...s, title: e.target.value }))}
                  className="w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#f5c16c]/50 focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/20"
                  placeholder="Guild Strategy Session"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-[#f5c16c]/70">Start Time</label>
                <input
                  type="datetime-local"
                  value={datetimeLocalBangkok(createState.start)}
                  onChange={(e) => {
                    const [d, t] = e.target.value.split("T");
                    const [y, m, day] = d.split("-").map((n) => parseInt(n, 10));
                    const [h, min] = t.split(":").map((n) => parseInt(n, 10));
                    const ms = Date.UTC(y, m - 1, day, h - 7, min);
                    const dt = new Date(ms);
                    const now = new Date();
                    if (dt < now) {
                      setDateError("Start time cannot be in the past");
                      return;
                    }
                    setDateError(null);
                    const newStart = dt.toISOString();
                    setCreateState((s) => {
                      const currentEnd = new Date(s.end);
                      if (currentEnd <= dt) {
                        const newEnd = new Date(dt.getTime() + 30 * 60 * 1000);
                        return { ...s, start: newStart, end: newEnd.toISOString() };
                      }
                      return { ...s, start: newStart };
                    });
                  }}
                  className="w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-2.5 text-sm text-white focus:border-[#f5c16c]/50 focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-[#f5c16c]/70">End Time</label>
                <input
                  type="datetime-local"
                  value={datetimeLocalBangkok(createState.end)}
                  onChange={(e) => {
                    const [d, t] = e.target.value.split("T");
                    const [y, m, day] = d.split("-").map((n) => parseInt(n, 10));
                    const [h, min] = t.split(":").map((n) => parseInt(n, 10));
                    const ms = Date.UTC(y, m - 1, day, h - 7, min);
                    const dt = new Date(ms);
                    const startDt = new Date(createState.start);
                    if (dt <= startDt) {
                      setDateError("End time must be after start time");
                      return;
                    }
                    setDateError(null);
                    setCreateState((s) => ({ ...s, end: dt.toISOString() }));
                  }}
                  className="w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-2.5 text-sm text-white focus:border-[#f5c16c]/50 focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/20"
                />
              </div>
            </div>
            
            {dateError && (
              <div className="mt-2 text-xs text-red-400">{dateError}</div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleCreateMeeting}
                disabled={creating || !!dateError}
                className="flex items-center gap-2 rounded-lg bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {creating ? "Creating..." : "Create Meeting"}
              </button>
              {needsAuth && (myRole === "GuildMaster") && (
                <button
                  onClick={handleAuthorize}
                  className="rounded bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-3 py-2 text-xs font-medium text-black"
                >
                  Authorize Google Meet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      

      <div className="rounded border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-xs font-semibold">Meetings</h5>
          <div className="flex items-center gap-2">
            {loadingMeetings && <span className="text-xs text-white/60">Loading...</span>}
            {needsAuth && (myRole === "GuildMaster") && (
              <button
                onClick={handleAuthorize}
                className="rounded bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-3 py-1.5 text-xs font-medium text-black"
              >
                Authorize Google Meet
              </button>
            )}
          </div>
        </div>
        {guildMeetings.length === 0 ? (
          <div className="text-xs text-white/60">No meetings yet.</div>
        ) : (
          <Accordion type="single" collapsible value={expandedId} onValueChange={(val) => {
            const v = typeof val === "string" ? val : "";
            setExpandedId(v);
            if (v) loadDetailsIfNeeded(v);
          }}>
            {pagedMeetings.map((m) => {
              const id = m.meetingId ?? `${m.title}-${m.scheduledStartTime}`;
              const details = m.meetingId ? detailsById[m.meetingId] : null;
              const isLoading = m.meetingId ? detailsLoading[m.meetingId] : false;
              return (
                <AccordionItem key={id} value={m.meetingId ?? id}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-white truncate">{m.title}</div>
                          {m.status && (
                            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/80">{m.status}</span>
                          )}
                        </div>
                        <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                          <div className="text-[11px] text-white/60">
                            <span className="text-white/70">Scheduled:</span> {new Date(m.scheduledStartTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} • {new Date(m.scheduledEndTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </div>
                          <div className="text-[11px] text-white/60">
                            <span className="text-white/70">Actual:</span> {m.actualStartTime ? new Date(m.actualStartTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"} • {m.actualEndTime ? new Date(m.actualEndTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {m.meetingLink && m.status === MeetingStatus.Active && (() => {
                          const now = Date.now();
                          const start = new Date(m.scheduledStartTime).getTime();
                          const end = new Date(m.scheduledEndTime).getTime();
                          const within = now >= start && now <= end;
                          const restrictRole = myRole === "Member";
                          const disableJoin = restrictRole && !within;
                          const cls = disableJoin
                            ? "rounded border border-white/20 bg-transparent px-3 py-1.5 text-xs font-medium text-white opacity-50 cursor-not-allowed"
                            : "rounded border border-white/20 bg-transparent px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10";
                          return (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={m.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-disabled={disableJoin}
                                    className={cls}
                                    onClick={(e) => { if (disableJoin) e.preventDefault(); }}
                                  >
                                    Join Meet ↗
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {disableJoin
                                    ? `Available between ${formatBangkok(m.scheduledStartTime, { includeSeconds: false })} and ${formatBangkok(m.scheduledEndTime, { includeSeconds: false })}`
                                    : "Join Google Meet"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })()}
                        {(myRole === "GuildMaster" || authUserId === m.organizerId) && (
                          <>
                          {m.status === MeetingStatus.Active && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleEndMeetingFor(m); }}
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
                                onClick={(e) => { e.preventDefault(); handleSyncMeetingFor(m); }}
                                disabled={!(m.status === MeetingStatus.EndedProcessing && m.actualEndTime && (Date.now() - new Date(m.actualEndTime).getTime() >= 10 * 60 * 1000))}
                                className="group inline-flex items-center gap-2 rounded-lg border border-[#f5c16c]/40 bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_15px_rgba(245,193,108,0.25)] hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FileText className="h-4 w-4" />
                                Transcript
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
                  </AccordionTrigger>
                  <AccordionContent>
                    {isLoading ? (
                      <div className="text-xs text-white/60">Loading details...</div>
                    ) : details ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-white">{details.meeting?.title}</div>
                        <div className="text-xs text-white/70">Participants ({(details.participants?.filter((p) => (p.roleInMeeting ?? "").toLowerCase() !== "organizer").length) ?? 0})</div>
                        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {details.participants?.filter((p) => (p.roleInMeeting ?? "").toLowerCase() !== "organizer").map((p, idx) => (
                            <li key={(p.userId ?? String(idx)) + (p.joinTime ?? "")} className="rounded border border-white/10 bg-white/5 p-2">
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
                            <li key={(p.userId ?? String(idx)) + (p.joinTime ?? "")} className="rounded border border-white/10 bg-white/5 p-2">
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
                    ) : (
                      <div className="text-xs text-white/60">No details available.</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
        {guildMeetings.length > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-white/70">
              <span>Showing {(safePage - 1) * pageSize + 1}–{Math.min(sortedMeetings.length, safePage * pageSize)} of {sortedMeetings.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className={`rounded border border-[#f5c16c]/30 px-3 py-1.5 text-xs ${safePage===1?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Prev</button>
              <span className="text-xs text-white/70">Page {safePage} of {pageCount}</span>
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} className={`rounded border border-[#f5c16c]/30 px-3 py-1.5 text-xs ${safePage===pageCount?'text-[#f5c16c]/50':'text-[#f5c16c]'}`}>Next</button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
