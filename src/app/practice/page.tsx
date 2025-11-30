
"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import UnityPlayer from "@/components/unity/UnityPlayer";

function PracticeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params.get("userId") ?? undefined;
  const subjectCode = params.get("subject") ?? "PRF192";
  const topic = params.get("topic") ?? "basics";
  const difficulty = params.get("difficulty") ?? "easy";
  const count = Number(params.get("count") ?? 6);

  const [status, setStatus] = useState<string>("Starting practice session...");
  const [joinCode, setJoinCode] = useState<string | undefined>(undefined);
  const [matchId, setMatchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const startPractice = async () => {
      try {
        const res = await fetch("/api/game/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, subjectCode, topic, difficulty, count })
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setStatus(`Practice start failed: ${data?.error ?? res.status}`);
          return;
        }
        setJoinCode(String(data.joinCode));
        if (data?.match_id) setMatchId(String(data.match_id));
        setStatus("Practice ready. Auto-joining...");
      } catch (e: any) {
        setStatus(`Error: ${e?.message ?? e}`);
      }
    };
    startPractice();
  }, [userId, subjectCode, topic, difficulty, count]);

  useEffect(() => {
    if (!matchId) return;
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/quests/game/sessions/${matchId}/result`, { cache: 'no-store' });
        if (res.ok) {
          if (stopped) return;
          router.push(`/results/${matchId}`);
          return;
        }
      } catch { /* ignore transient */ }
      if (!stopped) setTimeout(poll, 2000);
    };
    const t = setTimeout(poll, 2000);
    return () => { stopped = true; clearTimeout(t as any); };
  }, [matchId, router]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Solo Practice</h1>
      <p style={{ marginBottom: 12 }}>{status}</p>
      <UnityPlayer initialJoinCode={joinCode} autoConnectViaBridge={true} showJoinInput={false} userId={userId} />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
