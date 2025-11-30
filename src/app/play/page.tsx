"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import UnityPlayer from "@/components/unity/UnityPlayer";
import { createClient } from "@/utils/supabase/client";

// Simple Play page to host the Unity WebGL client and provide a join-code based Relay connection flow.
// Usage: navigate to /play or /play?code=ABCDEF

export default function PlayPage() {
  const params = useSearchParams();
  const initialCode = params.get("code") ?? undefined;
  const [userId, setUserId] = useState<string | undefined>(undefined);

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

  return (
    <div style={{ padding: 16 }}>
      <h1>Play (Unity WebGL)</h1>
      <p style={{ marginBottom: 12 }}>
        {initialCode
          ? "Invite accepted. Connecting automatically to the lobby..."
          : "Enter the join code provided by the host/headless server. This page embeds the Unity WebGL client using react-unity-webgl."}
      </p>
      {/* If a code is present, auto-connect by sending it to Unity via the bridge; otherwise rely on Unity UI. */}
      <UnityPlayer
        initialJoinCode={initialCode}
        autoConnectViaBridge={!!initialCode}
        showJoinInput={false}
        userId={userId}
      />
    </div>
  );
}