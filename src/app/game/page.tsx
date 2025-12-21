"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UnityPlayer from "@/components/unity/UnityPlayer";
import { useGameWs } from "@/hooks/useGameWs";
import { createClient } from "@/utils/supabase/client";

type Mode = "select" | "hosting" | "joining";

export default function GamePage() {
  const [mode, setMode] = useState<Mode>("select");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [hostInfo, setHostInfo] = useState<{ hostId?: string; message?: string } | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const ws = useGameWs({ url: wsUrl, autoConnect: !!wsUrl });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const reset = useCallback(() => {
    setMode("select");
    setIsStarting(false);
    setError(null);
    setJoinCode(null);
    setHostInfo(null);
    setWsUrl(null);
  }, []);

  const onHost = useCallback(async () => {
    setMode("hosting");
    setIsStarting(true);
    setError(null);
    setJoinCode(null);
    setHostInfo(null);
    setMatchId(null);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/game/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        throw new Error(`Host request failed: ${res.status}`);
      }
      const data = await res.json();
      if (!data?.joinCode) {
        throw new Error("No join code returned from backend");
      }
      setJoinCode(String(data.joinCode));
      setHostInfo({ hostId: data.hostId, message: data.message });
      setWsUrl(data.wsUrl ?? null);
      let mid = typeof data?.match_id === "string" ? data.match_id : null;
      if (!mid) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const payload = {
          user_id: userId,
          relay_join_code: String(data.joinCode),
          pack_spec: { subject: "PRN212", topic: "basics", difficulty: "easy", count: 10 },
        };
        const rawBase = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5051";
        let base = (rawBase || "").replace(/\/+$/, "");
        if (base.endsWith("/api")) base = base.slice(0, -4);
        const createUrl = `${base}/api/quests/game/sessions/create`;
        const createRes = await fetch(createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (createRes.ok) {
          const session = await createRes.json();
          mid = typeof session?.match_id === "string" ? session.match_id : null;
        }
      }
      setMatchId(mid ?? null);

      // Generate an invite link that will auto-join when accepted
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const invite = `${origin}/play?code=${encodeURIComponent(String(data.joinCode))}${mid ? `&match=${encodeURIComponent(mid)}` : ""}`;
      setInviteUrl(invite);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setIsStarting(false);
    }
  }, [userId]);

  const onJoin = useCallback(() => {
    setMode("joining");
    setError(null);
  }, []);

  const header = useMemo(() => {
    switch (mode) {
      case "hosting":
        return "Host Game";
      case "joining":
        return "Join Game";
      default:
        return "Game Navigation";
    }
  }, [mode]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">RogueLearn Multiplayer</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Host or join a Unity-powered session</p>
      </div>

      {mode === "select" && (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Host Game</CardTitle>
              <CardDescription>Start a new session and share a join code</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button className="w-full" onClick={onHost}>
                Host Game
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Join Game</CardTitle>
              <CardDescription>Launch the Unity WebGL client and enter a code</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button className="w-full" variant="secondary" onClick={onJoin}>
                Join Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {mode !== "select" && (
        <div className="w-full max-w-5xl mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{header}</CardTitle>
              <CardDescription>
                {mode === "hosting" && (
                  <span>Backend prepares host server, generates join code, and launches client.</span>
                )}
                {mode === "joining" && (
                  <span>Client launches immediately; enter a valid join code to connect.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {mode === "hosting" && (
                <div className="space-y-4">
                  {isStarting && (
                    <div className="text-sm text-muted-foreground">Starting host... please wait.</div>
                  )}
                  {error && (
                    <div className="text-red-500">Error: {error}</div>
                  )}
                  {joinCode && (
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Join Code</div>
                        <div className="text-2xl font-bold tracking-widest">{joinCode}</div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(joinCode)}
                      >
                        Copy Code
                      </Button>
                    </div>
                  )}

                  {inviteUrl && (
                    <div className="flex items-center justify-between rounded-md border p-4">
                      <div className="max-w-[70%]">
                        <div className="text-sm text-muted-foreground">Invite Link</div>
                        <div className="text-xs truncate">{inviteUrl}</div>
                        {matchId && (
                          <div className="text-xs text-muted-foreground mt-1">Session: {matchId}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(inviteUrl)}
                        >
                          Copy Invite
                        </Button>
                        <Button
                          onClick={() => window.open(inviteUrl!, "_blank")}
                        >
                          Open Play
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Optional: You can embed Unity here for host to spectate; players will typically use the invite link to auto-join. */}
                  <UnityPlayer className="mt-2" showJoinInput={false} autoConnectViaBridge={false} userId={userId ?? undefined} />
                </div>
              )}

              {mode === "joining" && (
                <div className="space-y-2">
                  {/* Launch Unity client immediately; join code entry is handled inside Unity's UI. */}
                  <UnityPlayer className="mt-2" showJoinInput={false} autoConnectViaBridge={false} userId={userId ?? undefined} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4 items-center">
            <Button variant="ghost" onClick={reset}>Back</Button>
            <div className="flex items-center gap-3">
              {wsUrl && (
                <div className="text-xs text-muted-foreground">
                  WS: {ws.status}{ws.error ? ` (${ws.error})` : ""}
                </div>
              )}
              {hostInfo?.message && (
                <div className="text-sm text-muted-foreground">{hostInfo.message}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
