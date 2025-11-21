"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Swords, Video, Calendar, Clock, Users, ExternalLink, Play, Square, AlertCircle } from "lucide-react";
import { useGoogleMeet, MeetScopes } from "@/hooks/useGoogleMeet";
import googleMeetApi from "@/api/googleMeetApi";
import meetingsApi from "@/api/meetingsApi";
import guildsApi from "@/api/guildsApi";
import type { GuildMemberDto, GuildRole } from "@/types/guilds";
import type { MeetingDto, MeetingParticipantDto, ArtifactInputDto, MeetingDetailsDto } from "@/types/meetings";
import { createClient } from "@/utils/supabase/client";
import { datetimeLocalBangkok, formatBangkok } from "@/utils/time";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface Props {
  guildId: string;
}

type CreateState = {
  title: string;
  start: string;
  end: string;
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
      title: "Guild Meetup",
      start: now.toUTCString(),
      end: in30.toUTCString(),
    };
  });

  const [activeMeeting, setActiveMeeting] = useState<{
    meeting: MeetingDto | null;
    google: { space?: string | null; meetingUri?: string | null } | null;
  }>({ meeting: null, google: null });

  const [guildMeetings, setGuildMeetings] = useState<MeetingDto[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsById, setDetailsById] = useState<Record<string, MeetingDetailsDto | null>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [members, setMembers] = useState<GuildMemberDto[]>([]);

  function detectActiveMeeting(list: MeetingDto[]): MeetingDto | null {
    const now = Date.now();
    const byActualStart = list
      .filter((m) => !!m.actualStartTime && !m.actualEndTime)
      .sort((a, b) => new Date(b.actualStartTime || 0).getTime() - new Date(a.actualStartTime || 0).getTime());
    if (byActualStart.length > 0) return byActualStart[0];
    const scheduledActive = list
      .filter((m) => {
        const start = new Date(m.scheduledStartTime).getTime();
        const end = new Date(m.scheduledEndTime).getTime();
        return start <= now && now <= end && !m.actualEndTime;
      })
      .sort((a, b) => new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime());
    return scheduledActive.length > 0 ? scheduledActive[0] : null;
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
      const token = await requestToken(requiredBothScopes);
      setActiveToken(token);
      try {
        sessionStorage.setItem(`guildMeetingToken:${guildId}`, token);
      } catch (_) {}
      const created = await googleMeetApi.createSpace(token, { config: {} });
      const payload: MeetingDto = {
        organizerId: authUserId,
        partyId: null,
        guildId,
        title: createState.title,
        scheduledStartTime: createState.start,
        scheduledEndTime: createState.end,
        actualStartTime: new Date().toISOString(),
        meetingLink: created.meetingUri ?? "",
      };
      const upsertRes = await meetingsApi.upsertMeeting(payload);
      const saved = upsertRes.data as MeetingDto;
      setActiveMeeting({
        meeting: saved ?? payload,
        google: { space: created.spaceId ?? null, meetingUri: created.meetingUri ?? null },
      });
      const listRes = await meetingsApi.getGuildMeetings(guildId);
      setGuildMeetings(listRes.data ?? []);
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

  async function handleEndMeeting() {
    setError(null);
    setEnding(true);
    try {
      if (!activeMeeting.meeting?.meetingId) throw new Error("No active meeting to end");
      const token = activeToken ?? (await requestToken(requiredBothScopes));
      if (members.length === 0) {
        try {
          const memRes = await guildsApi.getMembers(guildId);
          setMembers(memRes.data ?? []);
        } catch (memErr) {
          console.warn("[Guild] failed to load members on endMeeting:", memErr);
        }
      }
      let spaceName: string | null = activeMeeting.google?.space ?? null;
      if (!spaceName) {
        const link = activeMeeting.meeting?.meetingLink ?? "";
        const codeMatch = link.match(/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i);
        const code = codeMatch?.[0] ?? null;
        if (code) {
          const space = await googleMeetApi.getSpace(token, code);
          spaceName = space?.name ?? null;
        }
      }
      const confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      if (!records || records.length === 0) throw new Error("No conference records found");
      const latest = records[0];
      const conferenceId: string = latest?.name?.split("/")?.pop?.() ?? latest?.conferenceId ?? latest?.id;
      if (!conferenceId) throw new Error("Unable to determine conferenceId");

      const participantsRes = await googleMeetApi.listParticipants(token, conferenceId);
      const participantsRaw: any[] = participantsRes?.participants ?? participantsRes?.items ?? [];

      const membersByName = new Map<string, GuildMemberDto>();
      const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
      for (const m of members) {
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

        let matched: GuildMemberDto | undefined;
        if (displayName) {
          matched = membersByName.get(norm(displayName));
        }
        const email = p?.signedinUser?.email ?? p?.email ?? undefined;
        if (!matched && email) {
          matched = membersByName.get(norm(email));
        }

        if (!matched) {
          console.warn("[Mapping] Skipping participant with no guild match:", { displayName, email, role, type });
          continue;
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

      if (authUserId) {
        const already = mapped.some((mp) => mp.userId === authUserId);
        if (!already) {
          const organizerMember = members.find((m) => m.authUserId === authUserId);
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

      const dedup = Array.from(
        mapped.reduce((acc, mp) => acc.set(mp.userId ?? "", mp), new Map<string, MeetingParticipantDto>()).values()
      );

      const transcriptsRes = await googleMeetApi.listTranscripts(token, conferenceId);
      const transcripts: any[] = transcriptsRes?.transcripts ?? transcriptsRes?.items ?? [];
      const artifacts: ArtifactInputDto[] = [];
      for (const t of transcripts) {
        const transcriptId: string = t?.name?.split("/")?.pop?.() ?? t?.transcriptId ?? t?.id;
        const entries = await googleMeetApi.listTranscriptEntries(token, conferenceId, transcriptId);
        const exportUri = t?.docsDocument?.uri ?? t?.docsDocument?.resourceUri ?? null;
        artifacts.push({
          artifactType: "transcript",
          url: exportUri ?? `https://meet.google.com/transcript/${transcriptId}`,
          state: t?.state ?? null,
          exportUri: exportUri ?? null,
          docsDocumentId: t?.docsDocument?.id ?? null,
        });
      }

      const meetingId = activeMeeting.meeting.meetingId as string;
      if (dedup.length > 0) {
        try {
          await meetingsApi.upsertParticipants(meetingId, dedup);
        } catch (err: any) {
          console.error("[Backend] upsertParticipants 400/ERR:", err?.response?.status, err?.response?.data ?? err?.message);
          throw err;
        }
      }
      if (artifacts.length > 0) {
        await meetingsApi.processArtifactsAndSummarize(meetingId, artifacts);
      }

      const updated: MeetingDto = { ...activeMeeting.meeting, actualEndTime: new Date().toISOString() } as MeetingDto;
      setActiveMeeting((prev) => ({ ...prev, meeting: updated }));
      try {
        if (activeMeeting.meeting?.meetingId) {
          await meetingsApi.upsertMeeting(updated);
        }
      } catch (persistErr) {
        console.warn("[Backend] upsertMeeting failed while setting actualEndTime:", persistErr);
      }

      const detailsRes = await meetingsApi.getMeetingDetails(meetingId);
      setDetailsById((prev) => ({ ...prev, [meetingId]: detailsRes.data ?? null }));
      setExpandedId(meetingId);

      try {
        if (!spaceName && latest?.name) {
          const record = await googleMeetApi.getConferenceRecord(token, latest.name);
          spaceName = record?.space ?? spaceName ?? null;
        }
        if (spaceName) {
          await googleMeetApi.endActiveConference(token, spaceName);
        }
      } catch (_) {}

      const listRes = await meetingsApi.getGuildMeetings(guildId);
      setGuildMeetings(listRes.data ?? []);
      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 60 * 1000);
      const created = await googleMeetApi.createSpace(token, { config: {} });
      const payload: MeetingDto = {
        organizerId: authUserId as string,
        partyId: null,
        guildId,
        title: createState.title,
        scheduledStartTime: now.toISOString(),
        scheduledEndTime: in30.toISOString(),
        actualStartTime: now.toISOString(),
        meetingLink: created.meetingUri ?? "",
      };
      const upsertRes = await meetingsApi.upsertMeeting(payload);
      const saved = upsertRes.data as MeetingDto;
      setActiveMeeting({
        meeting: saved ?? payload,
        google: { space: created.spaceId ?? null, meetingUri: created.meetingUri ?? null },
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to end meeting");
    } finally {
      setEnding(false);
    }
  }

  async function logActiveMeetingDetails() {
    try {
      if (!activeMeeting.meeting) {
        console.log("No active meeting");
        return;
      }
      const token = activeToken ?? (await requestToken(requiredReadonlyScopes));
      const link = activeMeeting.meeting.meetingLink ?? "";
      const codeMatch = link.match(/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i);
      const identifier = activeMeeting.google?.space ?? codeMatch?.[0] ?? "";
      const space = identifier ? await googleMeetApi.getSpace(token, identifier) : null;
      const confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 5 });
      const records: any[] = confList?.conferenceRecords ?? confList?.records ?? [];
      const latest = records[0];
      const conferenceId: string = latest?.name?.split("/")?.pop?.() ?? latest?.conferenceId ?? latest?.id;
      const participants = conferenceId ? await googleMeetApi.listParticipants(token, conferenceId) : null;
      const recordings = conferenceId ? await googleMeetApi.listRecordings(token, conferenceId) : null;
      const transcripts = conferenceId ? await googleMeetApi.listTranscripts(token, conferenceId) : null;
      console.group("Google Meet Details");
      console.log("Space", space);
      console.log("ConferenceRecord", latest);
      console.log("Participants", participants);
      console.log("Recordings", recordings);
      console.log("Transcripts", transcripts);
      console.groupEnd();
    } catch (e: any) {
      console.error("Failed to log Google Meet details", e?.message ?? e);
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

      {/* Create Meeting Card - Guild Master Only */}
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
                    setCreateState((s) => ({ ...s, start: new Date(ms).toISOString() }));
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
                    setCreateState((s) => ({ ...s, end: new Date(ms).toISOString() }));
                  }}
                  className="w-full rounded-lg border border-[#f5c16c]/20 bg-black/40 p-2.5 text-sm text-white focus:border-[#f5c16c]/50 focus:outline-none focus:ring-2 focus:ring-[#f5c16c]/20"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleCreateMeeting}
                disabled={creating}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#f5c16c] to-[#d4a855] px-4 py-2.5 text-sm font-medium text-black transition-all hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {creating ? "Creating..." : "Create Meeting"}
              </button>
              {activeMeeting.meeting?.meetingLink && (
                <a
                  href={activeMeeting.meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-[#f5c16c]/30 bg-transparent px-4 py-2.5 text-sm font-medium text-[#f5c16c] transition-all hover:bg-[#f5c16c]/10"
                >
                  <Video className="h-4 w-4" />
                  Join in Google Meet
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Meeting Card */}
      {activeMeeting.meeting && (
        <div className={ACTIVE_MEETING_CLASS}>
          {/* Texture overlay */}
          <div className="pointer-events-none absolute inset-0" style={CARD_TEXTURE} />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium uppercase tracking-wide text-emerald-400">Live Meeting</span>
                </div>
                <h5 className="text-lg font-semibold text-white">{activeMeeting.meeting.title}</h5>
                {activeMeeting.meeting?.meetingLink && (
                  <p className="mt-1 text-xs text-white/50">{activeMeeting.meeting.meetingLink}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeMeeting.meeting?.meetingLink && (
                  <a
                    href={activeMeeting.meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={logActiveMeetingDetails}
                  className="rounded-lg border border-[#f5c16c]/30 bg-[#f5c16c]/5 px-4 py-2.5 text-sm font-medium text-[#f5c16c] transition-all hover:bg-[#f5c16c]/10"
                >
                  Log Details
                </button>
                {(myRole === "GuildMaster" || authUserId === activeMeeting.meeting?.organizerId) && (
                  <button
                    onClick={handleEndMeeting}
                    disabled={ending}
                    className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-rose-700 disabled:opacity-50"
                  >
                    <Square className="h-4 w-4" />
                    {ending ? "Ending..." : "End Meeting"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-xs font-semibold">Past Meetings</h5>
          {loadingMeetings && <span className="text-xs text-white/60">Loading...</span>}
        </div>
        {guildMeetings.length === 0 ? (
          <div className="text-xs text-white/60">No meetings yet.</div>
        ) : (
          <Accordion type="single" collapsible value={expandedId ?? undefined} onValueChange={(val) => {
            const v = typeof val === "string" ? val : null;
            setExpandedId(v ?? null);
            if (v) loadDetailsIfNeeded(v);
          }}>
            {guildMeetings.map((m) => {
              const id = m.meetingId ?? `${m.title}-${m.scheduledStartTime}`;
              const details = m.meetingId ? detailsById[m.meetingId] : null;
              const isLoading = m.meetingId ? detailsLoading[m.meetingId] : false;
              return (
                <AccordionItem key={id} value={m.meetingId ?? id}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{m.title}</div>
                        <div className="text-[11px] text-white/60">
                          {formatBangkok(m.scheduledStartTime, { includeSeconds: false, separator: " " })} – {formatBangkok(m.scheduledEndTime, { includeSeconds: false, separator: " " })}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {isLoading ? (
                      <div className="text-xs text-white/60">Loading details...</div>
                    ) : details ? (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-white">{details.meeting?.title}</div>
                        <div className="text-xs text-white/70">Participants ({details.participants?.length ?? 0})</div>
                        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {details.participants?.map((p, idx) => (
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
      </div>


    </div>
  );
}