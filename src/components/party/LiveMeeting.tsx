"use client";
import React from "react";

export default function LiveMeeting() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Live Meeting (Preview)</h4>
      <p className="text-xs text-white/70">
        Real-time collaboration via WebRTC (e.g., Jitsi) will be integrated in a future iteration.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded border border-white/10 bg-white/5 p-4 text-center">Video/Screen</div>
        <div className="rounded border border-white/10 bg-white/5 p-4 text-center">Participants</div>
        <div className="rounded border border-white/10 bg-white/5 p-4 text-center">Chat</div>
      </div>
    </div>
  );
}