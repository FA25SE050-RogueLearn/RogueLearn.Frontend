"use client";
import { useEffect, useRef, useState } from "react";

export type WsStatus = "idle" | "connecting" | "open" | "error" | "closed";

export type UseGameWsOptions = {
  url?: string | null;
  autoConnect?: boolean;
};

export function useGameWs(opts: UseGameWsOptions) {
  const { url, autoConnect = true } = opts;
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>("idle");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !autoConnect || wsRef.current) return;
    let cancelled = false;
    const schedule = (fn: () => void) => {
      Promise.resolve().then(() => {
        if (!cancelled) fn();
      });
    };
    try {
      schedule(() => setStatus("connecting"));
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setStatus("open");
      ws.onmessage = (ev) => setLastMessage(typeof ev.data === "string" ? ev.data : String(ev.data));
      ws.onerror = (ev: Event) => {
        setStatus("error");
        setError("WebSocket error");
      };
      ws.onclose = () => setStatus("closed");
    } catch (e: any) {
      const message = e?.message ?? String(e);
      schedule(() => {
        setStatus("error");
        setError(message);
      });
    }
    return () => {
      cancelled = true;
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, [url, autoConnect]);

  return { status, lastMessage, error };
}
