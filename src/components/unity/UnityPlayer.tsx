"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { unityPaths, unityRelayConfig, userApiBase } from "@/config/unity";

type UnityPlayerProps = {
  initialJoinCode?: string;
  gameObjectName?: string;
  joinMethodName?: string;
  className?: string;
  showJoinInput?: boolean;
  autoConnectViaBridge?: boolean;
  mode?: 'solo' | 'networked';
  packJson?: string;
  userId?: string;
};

export const UnityPlayer: React.FC<UnityPlayerProps> = ({
  initialJoinCode,
  gameObjectName,
  joinMethodName,
  className,
  showJoinInput = true,
  autoConnectViaBridge = false,
  mode,
  packJson,
  userId,
}) => {
  // Prevent multiple Unity initializations
  const unityInstanceRef = useRef<boolean>(false);
  const baseConfiguredRef = useRef<boolean>(false);

  const { unityProvider, sendMessage, isLoaded, loadingProgression, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: unityPaths.loaderUrl!,
    dataUrl: unityPaths.dataUrl!,
    frameworkUrl: unityPaths.frameworkUrl!,
    codeUrl: unityPaths.codeUrl!,
    companyName: "RogueLearn",
    productName: "BossFight2D",
    productVersion: "1.0",
  });

  const [joinCode, setJoinCode] = useState<string>(initialJoinCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Initializing Unity...");
  const [gameReady, setGameReady] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) {
      setStatus(`Loading Unity... ${Math.round(loadingProgression * 100)}%`);
    } else {
      setStatus("Unity loaded");
      // Set game ready after a short delay when loaded
      setTimeout(() => setGameReady(true), 1000);
      // Configure backend base right after Unity reports isLoaded
      try {
        if (!baseConfiguredRef.current && userApiBase) {
          baseConfiguredRef.current = true;
          const base = String(userApiBase);
          // Prefer RelayConnector proxy so the target exists in all scenes
          sendMessage("RelayConnector", "ConfigureUserApiBase", base);
        }
        if (userId) {
          sendMessage("RelayConnector", "ConfigureUserId", String(userId));
        }
        if (mode === 'solo' && packJson) {
          sendMessage("RelayConnector", "StartSoloPractice", packJson);
          setStatus("Personalized pack injected (solo mode)");
        }
      } catch (e: any) {
        console.warn("Failed to configure User API base in Unity on isLoaded:", e?.message ?? e);
      }
    }
  }, [isLoaded, loadingProgression]);

  // Listen for Unity's GameLoaded event
  useEffect(() => {
    // Retry bridge calls after Unity scene is initialized
    const onGameLoaded = () => {
      setGameReady(true);
      setStatus("Unity scene initialized");
      // As soon as the scene initializes, inform Unity of the User API base so GameSessionClient
      // can call the correct backend even in WebGL (avoids relative URL 404s against Next.js dev server).
      try {
        if (!baseConfiguredRef.current && userApiBase) {
          baseConfiguredRef.current = true;
          const base = String(userApiBase);
          sendMessage("RelayConnector", "ConfigureUserApiBase", base);
        }
        if (userId) {
          sendMessage("RelayConnector", "ConfigureUserId", String(userId));
        }
        if (mode === 'solo' && packJson) {
          sendMessage("RelayConnector", "StartSoloPractice", packJson);
          setStatus("Personalized pack injected (solo mode)");
        }
      } catch (e: any) {
        console.warn("Failed to configure User API base in Unity:", e?.message ?? e);
      }
    };
    addEventListener("GameLoaded", onGameLoaded);
    return () => removeEventListener("GameLoaded", onGameLoaded);
  }, [addEventListener, removeEventListener]);

  // Fallback retry loop if GameSessionClient is not yet present
  useEffect(() => {
    if (!gameReady) return;
    if (!mode) return;
    let tries = 0;
    const maxTries = 8;
    const tick = () => {
      try {
        if (userApiBase) sendMessage("RelayConnector", "ConfigureUserApiBase", String(userApiBase));
        if (userId) sendMessage("RelayConnector", "ConfigureUserId", String(userId));
        if (mode === 'solo' && packJson) {
          sendMessage("RelayConnector", "StartSoloPractice", packJson);
          setStatus("Personalized pack injected (solo mode)");
        }
      } catch { /* ignore */ }
      tries++;
      if (tries < maxTries) setTimeout(tick, 500);
    };
    setTimeout(tick, 500);
  }, [gameReady, mode, packJson]);

  const doConnect = useCallback(
    (code: string) => {
      const goName = gameObjectName ?? unityRelayConfig.gameObjectName;
      const method = joinMethodName ?? unityRelayConfig.joinMethodName;

      if (!code || code.length < 6) {
        setError("Please enter a valid 6-character join code.");
        return;
      }

      try {
        sendMessage(goName, method, code);
        setStatus("Sent join code to Unity. Connecting...");
        setError(null);
      } catch (e: any) {
        setError(`Failed to send join code: ${e?.message ?? e}`);
      }
    },
    [sendMessage, gameObjectName, joinMethodName]
  );

  useEffect(() => {
    if (gameReady && initialJoinCode && autoConnectViaBridge && !unityInstanceRef.current) {
      unityInstanceRef.current = true;
      doConnect(initialJoinCode);
    }
  }, [gameReady, initialJoinCode, autoConnectViaBridge, doConnect]);

  return (
    <div className={className}>
      {showJoinInput && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="joinCode">Join Code</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              id="joinCode"
              type="text"
              placeholder="ABCDEF"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={12}
              style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
            <button onClick={() => doConnect(joinCode)} style={{ padding: "8px 12px" }}>
              Connect
            </button>
          </div>
        </div>
      )}
      {error && (
        <div style={{ color: "#b00020", marginBottom: 8 }}>Error: {error}</div>
      )}
      <div style={{ marginBottom: 8 }}>Status: {status}</div>
      <Unity style={{ width: "100%", height: 540, background: "#000" }} unityProvider={unityProvider} />
      {showJoinInput && (
        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Tip: The connect button calls Unity SendMessage to &quot;<code>{gameObjectName ?? unityRelayConfig.gameObjectName}</code>&quot;.
        </div>
      )}
    </div>
  );
};

export default UnityPlayer;
