"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, RefreshCw, Video } from "lucide-react";
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
import { toast } from "sonner";
import { usePartyRole } from "@/hooks/usePartyRole";

interface Props {
  partyId: string;
  variant?: "full" | "compact";
  showList?: boolean;
  onCreated?: () => void;
  refreshAt?: number;
}

type CreateState = {
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  spaceName?: string;
};

export default function MeetingManagement({ partyId, variant = "full", showList = true, onCreated, refreshAt }: Props) {
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
      title: "Study Sprint",
      start: now.toISOString(),
      end: in30.toISOString(),
      spaceName: "",
    };
  });
  const [dateError, setDateError] = useState<string | null>(null);

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
  const { role, loading: roleLoading } = usePartyRole(partyId);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [search, setSearch] = useState<string>("");
  const [recordingsById, setRecordingsById] = useState<Record<string, any[] | null>>({});
  const [recordingsLoading, setRecordingsLoading] = useState<Record<string, boolean>>({});
  const [recordingLinkById, setRecordingLinkById] = useState<Record<string, string | null>>({});
  const [recordingMetaById, setRecordingMetaById] = useState<Record<string, { url: string; fileId?: string | null } | null>>({});
  const [syncingById, setSyncingById] = useState<Record<string, boolean>>({});

  

  const reloadMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const res = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(res.data ?? []);
      const active = detectActiveMeeting(res.data ?? []);
      setActiveMeeting(active ? { meeting: active, google: null } : { meeting: null, google: null });
    } catch {}
    finally {
      setLoadingMeetings(false);
    }
  }, [partyId]);

  const filteredMeetings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partyMeetings;
    return partyMeetings.filter((m) => (m.title ?? "").toLowerCase().includes(q));
  }, [partyMeetings, search]);

  const sortedMeetings = useMemo(() => {
    return [...filteredMeetings].sort((a, b) => {
      const ta = new Date(a.scheduledStartTime || a.actualStartTime || 0).getTime();
      const tb = new Date(b.scheduledStartTime || b.actualStartTime || 0).getTime();
      return tb - ta;
    });
  }, [filteredMeetings]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedMeetings.length / pageSize)), [sortedMeetings.length]);
  const pagedMeetings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedMeetings.slice(start, start + pageSize);
  }, [sortedMeetings, page]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // When a meeting transitions to EndedProcessing, the first details fetch might be empty.
  // Avoid setTimeout: rely on user-driven retry and expand-triggered fetch.
  // We intentionally do not auto-retry here to prevent unnecessary polling.

  function isUnauthorized(err: any): boolean {
    const msg = typeof err?.message === "string" ? err.message : "";
    return (err?.status === 401) || (err?.response?.status === 401) || /\b401\b/.test(msg);
  }

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

  function getParticipantName(participant: any): string {
    if (participant?.signedinUser) {
      return participant.signedinUser.displayName as string;
    }
    if (participant?.anonymousUser) {
      return `${participant.anonymousUser.displayName} (Guest)`;
    }
    return "Unknown User";
  }

  function linkifySummary(text?: string | null): React.ReactNode {
    const t = (text ?? "").trim();
    if (!t) return "No summary available.";
    const lines = t.split(/\r?\n/);
    const nodes: React.ReactNode[] = [];
    let listType: "ul" | "ol" | null = null;
    let listItems: React.ReactNode[] = [];
    const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const boldLineRegex = /^\*\*(.+?)\*\*$/;
    const renderBoldInline = (s: string) => {
      const res: React.ReactNode[] = [];
      let last = 0;
      let i = 0;
      const re = /\*\*([^*]+)\*\*/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(s))) {
        if (m.index > last) res.push(<span key={`t-${i++}`}>{s.slice(last, m.index)}</span>);
        res.push(<span key={`b-${i++}`} className="font-extrabold text-base md:text-lg">{m[1]}</span>);
        last = re.lastIndex;
      }
      if (last < s.length) res.push(<span key={`t-${i++}`}>{s.slice(last)}</span>);
      return res;
    };
    const renderInline = (s: string) => {
      const tokens = s.split(urlRegex);
      return tokens.map((tok, idx) => {
        if (isUrl(tok)) {
          return (
            <a key={idx} href={tok} target="_blank" rel="noopener noreferrer" className="text-[#f5c16c] underline">
              {tok}
            </a>
          );
        }
        return <React.Fragment key={idx}>{renderBoldInline(tok)}</React.Fragment>;
      });
    };
    const flushList = () => {
      if (listType && listItems.length > 0) {
        nodes.push(
          listType === "ul" ? (
            <ul key={`list-${nodes.length}`} className="ml-6 mb-2 list-disc">
              {listItems}
            </ul>
          ) : (
            <ol key={`list-${nodes.length}`} className="ml-6 mb-2 list-decimal">
              {listItems}
            </ol>
          )
        );
      }
      listType = null;
      listItems = [];
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) { flushList(); continue; }
      if (boldLineRegex.test(line)) {
        flushList();
        const content = line.replace(/^\*\*(.+?)\*\*$/, "$1");
        nodes.push(
          <h3 key={`hb-${nodes.length}`} className="mt-4 mb-2 font-extrabold text-xl">
            {renderInline(content)}
          </h3>
        );
        continue;
      }
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        flushList();
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const Tag = `h${level}` as any;
        nodes.push(
          React.createElement(
            Tag,
            { key: `h-${nodes.length}`, className: "mt-4 mb-2 font-bold text-lg" },
            renderInline(content)
          )
        );
        continue;
      }
      const listMatch = line.match(/^(\*|\-|\d+\.)\s+(.*)$/);
      if (listMatch) {
        const marker = listMatch[1];
        const content = listMatch[2];
        const type: "ul" | "ol" = /^\d+\.$/.test(marker) ? "ol" : "ul";
        if (listType && listType !== type) flushList();
        listType = type;
        listItems.push(<li key={`li-${listItems.length}`} className="mb-1">{renderInline(content)}</li>);
        continue;
      }
      flushList();
      nodes.push(<p key={`p-${nodes.length}`} className="mt-2">{renderInline(line)}</p>);
    }
    flushList();
    return <>{nodes}</>;
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
    let mounted = true;
    const init = async () => {
      await reloadMeetings();
      try {
        const memRes = await partiesApi.getMembers(partyId);
        if (mounted) setPartyMembers(memRes.data ?? []);
      } catch (memErr) {
        console.warn("[Party] failed to load members:", memErr);
      }
    };
    init();
    return () => { mounted = false; };
  }, [partyId, reloadMeetings, refreshAt]);

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
      let token = await getAccessToken(requiredBothScopes);
      setActiveToken(token);
      try {
        sessionStorage.setItem(`meetingToken:${partyId}`, token);
      } catch (_) { }
      // 2) Create Google Meet space
      let created: any;
      try {
        created = await googleMeetApi.createSpace(token, { config: {} });
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`meetingToken:${partyId}`, refreshed); } catch (_) {}
            created = await googleMeetApi.createSpace(token, { config: {} });
          } catch {
            try {
              const gisToken = await requestToken(requiredBothScopes);
              token = gisToken;
              setActiveToken(gisToken);
              try { sessionStorage.setItem(`meetingToken:${partyId}`, gisToken); } catch (_) {}
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
      // Fallback: if token lacks scopes, request via GIS and retry
      if (!created?.meetingUri) {
        try {
          const gisToken = await requestToken(requiredBothScopes);
          token = gisToken;
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
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`meetingToken:${partyId}`, refreshed); } catch (_) {}
            const space = await googleMeetApi.getSpace(
              token,
              created.name ?? meetingCode ?? ""
            );
            const cfg = space?.config as any;
            const title = (cfg?.title ?? "").trim();
            if (!spaceName && title) spaceName = title;
          } catch {
            try {
              const gisToken = await requestToken(requiredBothScopes);
              token = gisToken;
              setActiveToken(gisToken);
              try { sessionStorage.setItem(`meetingToken:${partyId}`, gisToken); } catch (_) {}
              const space = await googleMeetApi.getSpace(
                token,
                created.name ?? meetingCode ?? ""
              );
              const cfg = space?.config as any;
              const title = (cfg?.title ?? "").trim();
              if (!spaceName && title) spaceName = title;
            } catch (reqErr: any) {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        }
      }
      // 3) Upsert meeting metadata to backend
      const payload: MeetingDto = {
        organizerId: authUserId as string,
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
      // Optimistically add new meeting to the list for instant feedback
      setPartyMeetings((prev) => {
        const id = (saved?.meetingId ?? payload.meetingId) as string | undefined;
        const filtered = id ? prev.filter(m => m.meetingId !== id) : prev;
        return [saved ?? payload, ...filtered];
      });
      // Reload from server to reconcile with backend state
      const listRes = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(listRes.data ?? []);
      try { setTimeout(() => { reloadMeetings(); }, 500); } catch {}
      setNeedsAuth(false);
      setCreateState((prev) => {
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 60 * 1000);
        return { title: "Study Sprint", start: now.toISOString(), end: in30.toISOString(), spaceName: "" };
      });
      if (typeof onCreated === "function") {
        try { onCreated(); } catch {}
      }
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
      let expectedSpace = (meeting?.spaceName ?? "").trim();
      if (!expectedSpace) {
        try {
          const link = meeting?.meetingLink ?? null;
          const codeMatch = link ? link.match(/meet\.google\.com\/(?:lookup\/)?([a-z0-9\-]+)/i) : null;
          const code = codeMatch?.[1] ?? null;
          if (code) {
            const space = await googleMeetApi.getSpace(token, code);
            const name = space?.name ?? "";
            expectedSpace = name?.split("/")?.pop?.() ?? expectedSpace;
          }
        } catch (_) { }
      }
      let matchedConferenceId: string | null = null;
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
              const newToken = refreshed;
              setActiveToken(newToken);
              try { sessionStorage.setItem(`meetingToken:${partyId}`, newToken); } catch (_) {}
              rec = await googleMeetApi.getConferenceRecord(newToken, rid);
            } catch {
              try {
                const gisToken = await requestToken(requiredBothScopes);
                const newToken = gisToken;
                setActiveToken(newToken);
                try { sessionStorage.setItem(`meetingToken:${partyId}`, newToken); } catch (_) {}
                rec = await googleMeetApi.getConferenceRecord(newToken, rid);
              } catch { }
            }
          }
        }
        const spaceName = (rec?.space ?? "").split("/").pop();
        if (spaceName && expectedSpace && spaceName === expectedSpace) {
          matchedConferenceId = rec?.name?.split("/")?.pop?.() ?? rid;
          break;
        }
      }
      let participantsRaw: any[] = [];
      if (matchedConferenceId) {
        const participantsRes = await googleMeetApi.listParticipants(token, matchedConferenceId);
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
        const already = mapped.some((mp) => (mp.roleInMeeting ?? "").toLowerCase() === "organizer");
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
      const canSync = Date.now() - endedAt >= 5 * 60 * 1000;
      if (!canSync) throw new Error("Sync available ~5 minutes after meeting ends");
      const initialToken = activeToken ?? (await getAccessToken(requiredBothScopes));
      let effectiveToken = initialToken;
      const meetingId = meeting.meetingId!;
      setSyncingById((prev) => ({ ...prev, [meetingId]: true }));
      let link = recordingLinkById[meetingId] ?? "";
      let meta = recordingMetaById[meetingId] ?? null;
      if (!link) {
        const found = await handleListRecordingsFor(meeting);
        if (found) {
          link = found.url;
          meta = { url: found.url, fileId: found.fileId } as any;
        }
      }
      if (!link) throw new Error("No generated recording available yet");
      const artifacts: ArtifactInputDto[] = [
        { artifactType: "recording", url: link, fileId: meta?.fileId ?? null }
      ];
      await meetingsApi.processArtifactsAndSummarize(meetingId, artifacts, effectiveToken);
      toast.success("recording process successfully");
      const completed: MeetingDto = { ...meeting, status: MeetingStatus.Completed } as MeetingDto;
      try { await meetingsApi.upsertMeeting(completed); } catch { }
      const listRes = await meetingsApi.getPartyMeetings(partyId);
      setPartyMeetings(listRes.data ?? []);
      try { await loadDetailsIfNeeded(meetingId, true); } catch {}
      setNeedsAuth(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to sync transcripts");
    } finally {
      if (meeting?.meetingId) setSyncingById((prev) => ({ ...prev, [meeting.meetingId!]: false }));
    }
  }

  async function handleListRecordingsFor(meeting: MeetingDto): Promise<{ url: string; fileId: string | null } | null> {
    try {
      if (!meeting?.meetingId) throw new Error("No meeting to list recordings");
      const meetingId = meeting.meetingId as string;
      setRecordingsLoading((prev) => ({ ...prev, [meetingId]: true }));
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
            try { sessionStorage.setItem(`meetingToken:${partyId}`, refreshed); } catch (_) {}
            confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
          } catch {
            try {
              const gisToken = await requestToken(requiredBothScopes);
              token = gisToken;
              setActiveToken(gisToken);
              try { sessionStorage.setItem(`meetingToken:${partyId}`, gisToken); } catch (_) {}
              confList = await googleMeetApi.listConferenceRecords(token, { pageSize: 10 });
            } catch {
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
            expectedResourceName = space?.name ?? null;
            expectedSpace = (expectedResourceName ?? "").split("/").pop() ?? "";
          } catch (e: any) {
            if (isUnauthorized(e)) {
              try {
                const refreshed = await refreshAccessToken();
                token = refreshed;
                setActiveToken(refreshed);
                try { sessionStorage.setItem(`meetingToken:${partyId}`, refreshed); } catch (_) {}
                const space = await googleMeetApi.getSpace(token, code);
                expectedResourceName = space?.name ?? null;
                expectedSpace = (expectedResourceName ?? "").split("/").pop() ?? "";
              } catch {
                try {
                  const gisToken = await requestToken(requiredBothScopes);
                  token = gisToken;
                  setActiveToken(gisToken);
                  try { sessionStorage.setItem(`meetingToken:${partyId}`, gisToken); } catch (_) {}
                  const space = await googleMeetApi.getSpace(token, code);
                  expectedResourceName = space?.name ?? null;
                  expectedSpace = (expectedResourceName ?? "").split("/").pop() ?? "";
                } catch {
                  setNeedsAuth(true);
                  throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
                }
              }
            }
          }
        }
      }
      let matchedConferenceId: string | null = null;
      const candidates = records.slice(0, 5);
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
              try { sessionStorage.setItem(`meetingToken:${partyId}`, refreshed); } catch (_) {}
              rec = await googleMeetApi.getConferenceRecord(token, rid);
            } catch {
              try {
                const gisToken = await requestToken(requiredBothScopes);
                token = gisToken;
                setActiveToken(gisToken);
                try { sessionStorage.setItem(`meetingToken:${partyId}`, gisToken); } catch (_) {}
                rec = await googleMeetApi.getConferenceRecord(token, rid);
              } catch {}
            }
          }
        }
        const spaceName = (rec?.space ?? "").split("/").pop();
        if (spaceName && expectedSpace && spaceName === expectedSpace) {
          matchedConferenceId = rec?.name?.split("/")?.pop?.() ?? rid;
          break;
        }
      }
      const conferenceId = matchedConferenceId ?? undefined;
      if (!conferenceId) throw new Error("Unable to determine conferenceId");
      let recordingsRes: any;
      try {
        recordingsRes = await googleMeetApi.listRecordings(token, conferenceId);
      } catch (e: any) {
        if (isUnauthorized(e)) {
          try {
            const refreshed = await refreshAccessToken();
            token = refreshed;
            setActiveToken(refreshed);
            try { sessionStorage.setItem(`meetingToken:${partyId}`, refreshed); } catch (_) {}
            recordingsRes = await googleMeetApi.listRecordings(token, conferenceId);
          } catch {
            try {
              const gisToken = await requestToken(requiredBothScopes);
              token = gisToken;
              setActiveToken(gisToken);
              try { sessionStorage.setItem(`meetingToken:${partyId}`, gisToken); } catch (_) {}
              recordingsRes = await googleMeetApi.listRecordings(token, conferenceId);
            } catch {
              setNeedsAuth(true);
              throw new Error("Authorization required to access Google Meet. Click Authorize and retry.");
            }
          }
        } else {
          throw e;
        }
      }
      const recordings: any[] = recordingsRes?.recordings ?? recordingsRes?.items ?? [];
      setRecordingsById((prev) => ({ ...prev, [meetingId]: recordings }));
      const generated = recordings.filter((r: any) => r?.state === "FILE_GENERATED");
      let cleanUrl = "";
      let fileId: string | null = null;
      if (generated.length > 0) {
        const r = generated[0];
        const driveId = r?.driveDestination?.file ?? r?.driveFile?.id ?? null;
        let link = r?.driveDestination?.exportUri ?? r?.driveFile?.uri ?? r?.driveFile?.resourceUri ?? r?.docsDocument?.uri ?? r?.docsDocument?.resourceUri ?? null;
        if (!link && driveId) link = `https://drive.google.com/file/d/${driveId}/view`;
        cleanUrl = typeof link === "string" ? link.replace(/[`\s]+/g, "").trim() : "";
        fileId = r?.driveDestination?.file ?? r?.driveFile?.id ?? r?.docsDocument?.id ?? null;
      }
      if (cleanUrl) {
        setRecordingLinkById((prev) => ({ ...prev, [meetingId]: cleanUrl }));
        setRecordingMetaById((prev) => ({ ...prev, [meetingId]: { url: cleanUrl, fileId } }));
        toast.info("recording found, pls wait for processing");
        return { url: cleanUrl, fileId };
      } else {
        setRecordingLinkById((prev) => ({ ...prev, [meetingId]: null }));
        setRecordingMetaById((prev) => ({ ...prev, [meetingId]: null }));
        toast.info("No recordings yet or still being generated. Try again in ~5 minutes.");
        return null;
      }
    } catch (e: any) {
      // setError(e?.message ?? "Failed to list recordings");
      return null;
    } finally {
      setRecordingsLoading((prev) => ({ ...prev, [meeting.meetingId as string]: false }));
    }
  }

  

  async function handleAuthorize() {
    setError(null);
    try {
      const newToken = await requestToken(requiredBothScopes);
      setActiveToken(newToken);
      try { sessionStorage.setItem(`meetingToken:${partyId}`, newToken); } catch (_) {}
      setNeedsAuth(false);
    } catch (e: any) {
      setError(e?.message ?? "Authorization failed");
    }
  }


  async function loadDetailsIfNeeded(meetingId: string, force = false) {
    if (!meetingId) return;
    if (!force) {
      const existing = detailsById[meetingId] ?? null;
      if (existing && (existing.participants?.length ?? 0) > 0) return;
      if (detailsLoading[meetingId]) return;
    }
    setDetailsLoading((prev) => ({ ...prev, [meetingId]: true }));
    try {
      const res = await meetingsApi.getMeetingDetails(meetingId);
      const next = res.data ?? null;
      setDetailsById((prev) => ({ ...prev, [meetingId]: next }));
    } catch (e: any) {
      setDetailsById((prev) => ({ ...prev, [meetingId]: null }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [meetingId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      {error && <span className="text-xs text-red-400">{error}</span>}

      

      {/* Create meeting section */}
      {variant !== "compact" && (
        roleLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-[#f5c16c]" />
          </div>
        ) : role && role !== "Member" ? (
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
                  const now = new Date();
                  if (dt < now) {
                    setDateError("Start time cannot be in the past");
                    return;
                  }
                  setDateError(null);
                  const newStart = dt.toISOString();
                  setCreateState((s) => {
                    // If end is before or equal to new start, adjust end to 30 mins after start
                    const currentEnd = new Date(s.end);
                    if (currentEnd <= dt) {
                      const newEnd = new Date(dt.getTime() + 30 * 60 * 1000);
                      return { ...s, start: newStart, end: newEnd.toISOString() };
                    }
                    return { ...s, start: newStart };
                  });
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
                  const startDt = new Date(createState.start);
                  if (dt <= startDt) {
                    setDateError("End time must be after start time");
                    return;
                  }
                  setDateError(null);
                  setCreateState((s) => ({
                    ...s,
                    end: dt.toISOString(),
                  }));
                }}
                className="w-full rounded border border-white/20 bg-white/10 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          </div>
          {dateError && (
            <div className="mt-2 text-xs text-red-400">{dateError}</div>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleCreateMeeting}
              disabled={creating || !!dateError}
              aria-busy={creating}
              className="rounded bg-fuchsia-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </span>
              ) : (
                "Create Meeting"
              )}
            </button>
            {needsAuth && (
              <button
                onClick={handleAuthorize}
                className="rounded bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-3 py-2 text-xs font-medium text-black"
              >
                Authorize Google Meet
              </button>
            )}
          </div>
        </div>
        ) : null
      )}



      {showList && (
      <div className="rounded border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-xs font-semibold">Meetings</h5>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Search meetings"
                className="rounded border border-white/20 bg-transparent px-3 py-1.5 text-xs text-white placeholder-white/50 min-w-[200px]"
              />
            </div>
            {loadingMeetings && <span className="text-xs text-white/60">Loading...</span>}
            <button
              onClick={() => { reloadMeetings(); }}
              disabled={loadingMeetings}
              className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Refresh meetings"
            >
              <RefreshCw className={`h-4 w-4 ${loadingMeetings ? "animate-spin" : ""}`} />
            </button>
            {needsAuth && (
              <button
                onClick={handleAuthorize}
                className="rounded bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-3 py-1.5 text-xs font-medium text-black"
              >
                Authorize Google Meet
              </button>
            )}
          </div>
        </div>
        {sortedMeetings.length === 0 ? (
          <div className="text-xs text-white/60">No meetings found.</div>
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
            {pagedMeetings.map((m) => {
                const id = m.meetingId ?? `${m.title}-${m.scheduledStartTime}`;
                const details = m.meetingId ? detailsById[m.meetingId] : null;
                const isLoading = m.meetingId
                  ? detailsLoading[m.meetingId]
                  : false;
                return (
                  <AccordionItem key={id} value={m.meetingId ?? id}>
                    <AccordionTrigger>
                    <div className="flex w-full items-center justify-between">
                      <div className="min-w-0">
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
                        {/* Space name hidden for cleaner UI */}
                        <div className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                          <div className="text-[11px] text-white/60">
                            <span className="text-white/70">Scheduled:</span>{" "}
                            {new Date(m.scheduledStartTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}{" "}
                            •{" "}
                            {new Date(m.scheduledEndTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </div>
                          <div className="text-[11px] text-white/60">
                            <span className="text-white/70">Actual:</span>{" "}
                            {m.actualStartTime ? new Date(m.actualStartTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}{" "}
                            •{" "}
                            {m.actualEndTime ? new Date(m.actualEndTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                          </div>
                      </div>
                    </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.meetingLink && m.status === MeetingStatus.Active && (() => {
                          const now = Date.now();
                          const start = new Date(m.scheduledStartTime).getTime();
                          const end = new Date(m.scheduledEndTime).getTime();
                          const within = now >= start && now <= end;
                          const restrictRole = role === "Member";
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
                          </>
                        )}
                      </div>
                    </div>
                    </AccordionTrigger>
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
                        <div className="space-y-2">
                          <div className="text-[11px] text-white/60">No details available.</div>
                          {m.meetingId && (
                            <button
                              onClick={() => loadDetailsIfNeeded(m.meetingId!, true)}
                              disabled={!!detailsLoading[m.meetingId!]}
                              className="rounded border border-white/20 bg-transparent px-3 py-1.5 text-[11px] text-white hover:bg-white/10 disabled:opacity-50"
                            >
                              {detailsLoading[m.meetingId!] ? "Retrying…" : "Retry fetching details"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-white">
                            {details.meeting?.title}
                          </div>
                          <div className="text-xs text-white/70">
                            Participants ({(details.participants?.filter((p) => (p.roleInMeeting ?? "").toLowerCase() !== "organizer").length) ?? 0})
                          </div>
                          {((details.participants?.length ?? 0) === 0) && m.meetingId && (
                            <div className="flex items-center gap-2 text-[11px] text-white/60">
                              <span>Participants not available yet.</span>
                              <button
                                onClick={() => loadDetailsIfNeeded(m.meetingId!, true)}
                                disabled={!!detailsLoading[m.meetingId!]}
                                className="rounded border border-white/20 bg-transparent px-2 py-1 text-[11px] text-white hover:bg-white/10 disabled:opacity-50"
                              >
                                {detailsLoading[m.meetingId!] ? "Retrying…" : "Retry"}
                              </button>
                            </div>
                          )}
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
                            {(() => {
                              const orgs = (details.participants ?? []).filter((p) => (p.roleInMeeting ?? "").toLowerCase() === "organizer");
                              if (orgs.length > 0) return orgs.map((p, idx) => (
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
                              ));
                              const organizerAuthId = details.meeting?.organizerId ?? "";
                              const organizerMember = partyMembers.find((m) => m.authUserId === organizerAuthId) ?? null;
                              const organizerName = getMemberDisplayName(organizerMember) ?? organizerAuthId;
                              return [
                                <li key={organizerAuthId} className="rounded border border-white/10 bg-white/5 p-2">
                                  <div className="text-xs text-white">
                                    {organizerName}
                                    <span className="ml-2 text-white/60">organizer</span>
                                  </div>
                                </li>
                              ];
                            })()}
                          </ul>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-white/70">Summary</div>
                            {role && role !== "Member" && (
                              <button
                                onClick={() => handleSyncMeetingFor(m)}
                                disabled={!!syncingById[m.meetingId!] || m.status === MeetingStatus.Completed}
                                className="group inline-flex items-center gap-2 rounded-lg border border-[#f5c16c]/40 bg-linear-to-r from-[#f5c16c] to-[#d4a855] px-3 py-1.5 text-xs font-bold text-black shadow-[0_0_15px_rgba(245,193,108,0.25)] hover:from-[#d4a855] hover:to-[#f5c16c] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {syncingById[m.meetingId!] ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                                Transcript
                              </button>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap rounded border border-white/10 bg-white/5 p-3 text-xs text-white/80 mt-2">
                            {linkifySummary(details.summaryText)}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        )}
        {sortedMeetings.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-white/60">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setExpandedId(""); setPage((p) => Math.max(1, p - 1)); }}
                disabled={page === 1}
                className="rounded bg-white/10 px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => { setExpandedId(""); setPage((p) => Math.min(totalPages, p + 1)); }}
                disabled={page >= totalPages}
                className="rounded bg-white/10 px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      )}
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
