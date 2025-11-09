"use client";
import React from "react";

interface TabsProps {
  active: string;
  onChange: (tab: string) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  const tabs = ["dashboard", "stash", "meetings", "scheduler", "live"];
  return (
    <div className="mb-4 flex gap-2">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={
            "rounded px-3 py-2 text-xs font-medium " +
            (active === t ? "bg-fuchsia-600 text-white" : "bg-white/10 text-white/80")
          }
        >
          {t === "dashboard" && "Dashboard"}
          {t === "stash" && "Stash"}
          {t === "meetings" && "Meetings"}
          {t === "scheduler" && "Scheduler"}
          {t === "live" && "Live Meeting"}
        </button>
      ))}
    </div>
  );
}

export default function PartyDetailClient({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
        {header}
      </header>
      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        {children}
      </section>
    </div>
  );
}