"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type CursorUser = { clientId: number; name: string; color: string };
type CursorUsersContextType = {
  users: CursorUser[];
  setLocalUser: (info: { name: string; color?: string }) => void;
};

const CursorUsersContext = createContext<CursorUsersContextType>({ users: [], setLocalUser: () => {} });

export const nameToColor = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

export function CursorUsersProvider({ provider, defaultName, defaultColor, children }: { provider: any; defaultName?: string; defaultColor?: string; children: React.ReactNode }) {
  const [users, setUsers] = useState<CursorUser[]>([]);

  const setLocalUser = useCallback((info: { name: string; color?: string }) => {
    const color = info.color ?? nameToColor(info.name || "user");
    provider?.awareness?.setLocalStateField?.("user", { name: info.name, color });
  }, [provider]);

  useEffect(() => {
    if (!provider?.awareness) return;
    const awareness = provider.awareness;
    setLocalUser({ name: defaultName || "Anonymous", color: defaultColor });
    const update = () => {
      const statesMap = awareness.getStates ? awareness.getStates() : awareness.states;
      const entries = Array.from(statesMap?.entries ? statesMap.entries() : Object.entries(statesMap || {}));
      const next: CursorUser[] = entries.map(([clientId, state]: any) => {
        const user = state?.user || {};
        return { clientId: Number(clientId), name: user.name || "Anonymous", color: user.color || nameToColor(String(clientId)) };
      });
      Promise.resolve().then(() => setUsers(next));
    };
    awareness.on?.("change", update);
    update();
    return () => {
      awareness.off?.("change", update);
    };
  }, [provider, defaultName, defaultColor, setLocalUser]);

  const value = useMemo(() => ({ users, setLocalUser }), [users, setLocalUser]);
  return <CursorUsersContext.Provider value={value}>{children}</CursorUsersContext.Provider>;
}

export const useCursorUsers = () => useContext(CursorUsersContext);