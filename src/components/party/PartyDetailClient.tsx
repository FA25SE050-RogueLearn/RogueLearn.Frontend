"use client";
import React from "react";
import { DashboardFrame } from "../layout/DashboardFrame";

interface TabsProps {
  active: string;
  onChange: (tab: string) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  const tabs = ["dashboard", "stash", "meetings"];
  return (
    <div className="mb-6 flex gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={
            "rounded-lg px-4 py-2 text-sm font-medium transition-all " +
            (active === t
              ? "bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black"
              : "border border-[#f5c16c]/20 bg-black/40 text-white/70 hover:border-[#f5c16c]/40 hover:bg-black/60 hover:text-white")
          }
        >
          {t === "dashboard" && "Dashboard"}
          {t === "stash" && "Stash"}
          {t === "meetings" && "Meetings"}
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
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0a0506] via-[#120806] to-[#0a0506] text-foreground">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0506]/95 via-[#1a0a08]/90 to-[#0a0506]/95" />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-20"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            backgroundSize: "100px",
          }}
        />
      </div>

      <div className="relative z-10">
        <DashboardFrame>
          <div className="space-y-6">
            <header className="overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-6">
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                  backgroundSize: "100px",
                  backgroundBlendMode: "overlay",
                }}
              />
              <div className="relative">
                {header}
              </div>
            </header>
            <section className="overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-6">
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                  backgroundSize: "100px",
                  backgroundBlendMode: "overlay",
                }}
              />
              <div className="relative">
                {children}
              </div>
            </section>
          </div>
        </DashboardFrame>
      </div>
    </div>
  );
}
