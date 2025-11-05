"use client";
import React from "react";

export default function MeetingScheduler() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Meeting Scheduler (Preview)</h4>
      <p className="text-xs text-white/70">
        Calendar integration and voting will be added in a future iteration.
        For now, this is a placeholder.
      </p>
      <div className="rounded border border-white/10 bg-white/5 p-6 text-center text-white/70">
        <span>Calendar will appear here.</span>
      </div>
    </div>
  );
}