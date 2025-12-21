import UnityPlayer from "@/components/unity/UnityPlayer";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initialCode = typeof params.code === "string" ? params.code : undefined;
  const match = typeof params.match === "string" ? params.match : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const qs = new URLSearchParams();
    if (initialCode) qs.set("code", initialCode);
    if (match) qs.set("match", match);
    const next = `/play${qs.toString() ? `?${qs.toString()}` : ""}`;
    const error = encodeURIComponent("Please log in to join a game session.");
    redirect(`/login?error=${error}&next=${encodeURIComponent(next)}`);
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Play (Unity WebGL)</h1>
      <p style={{ marginBottom: 12 }}>
        {initialCode
          ? "Invite accepted. Connecting automatically to the lobby..."
          : "Enter the join code provided by the host/headless server. This page embeds the Unity WebGL client using react-unity-webgl."}
      </p>
      <UnityPlayer
        initialJoinCode={initialCode}
        autoConnectViaBridge={!!initialCode}
        showJoinInput={false}
        userId={user.id}
      />
    </div>
  );
}
