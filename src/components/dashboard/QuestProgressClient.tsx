"use client";
import { useMemo, useState } from "react";
import type { StudentTermSubjectItem } from "@/types/user-profile";

type Props = {
  subjects: StudentTermSubjectItem[];
};

export default function QuestProgressClient({ subjects }: Props) {
  const semesters = useMemo(() => Array.from(new Set((subjects || []).map(s => s.semester).filter(Boolean))).map(String), [subjects]);
  const [status, setStatus] = useState<string>("all");
  const [semester, setSemester] = useState<string>("all");

  const filtered = useMemo(() => {
    return (subjects || []).filter(s => {
      const st = (s.status || "").toLowerCase();
      const statusOk = status === "all"
        ? true
        : status === "not_started"
        ? st.includes("not")
        : status === "studying"
        ? st.includes("studying")
        : status === "passed"
        ? st.includes("pass")
        : status === "failed"
        ? st.includes("fail")
        : true;
      const semOk = semester === "all" ? true : `${s.semester ?? ""}` === `${semester}`;
      return statusOk && semOk;
    });
  }, [subjects, status, semester]);

  return (
    <div className="rounded-[24px] border border-[#f5c16c]/18 bg-[#1a0b08]/80 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.35em] text-[#f5c16c]/70">Your Quest Progress</p>
        <div className="flex gap-2">
          <button onClick={() => setStatus("all")} className={`px-3 py-1 rounded-full border ${status==='all' ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>All</button>
          <button onClick={() => setStatus("not_started")} className={`px-3 py-1 rounded-full border ${status==='not_started' ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>Not Started</button>
          <button onClick={() => setStatus("studying")} className={`px-3 py-1 rounded-full border ${status==='studying' ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>Studying</button>
          <button onClick={() => setStatus("passed")} className={`px-3 py-1 rounded-full border ${status==='passed' ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>Passed</button>
          <button onClick={() => setStatus("failed")} className={`px-3 py-1 rounded-full border ${status==='failed' ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>Failed</button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#f5c16c]/70">Semester:</span>
        <button onClick={() => setSemester("all")} className={`px-3 py-1 rounded-full border ${semester==='all' ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>All</button>
        {semesters.map(sm => (
          <button key={sm} onClick={() => setSemester(sm)} className={`px-3 py-1 rounded-full border ${semester===sm ? 'border-[#f5c16c] bg-[#f5c16c]/15 text-white' : 'border-[#f5c16c]/30 text-[#f5c16c]'}`}>{sm}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
        {filtered.slice(0,50).map(s => (
          <div key={s.id} className="group flex items-center justify-between rounded-xl border border-[#2D2842]/80 bg-[#1F0E0B] p-4 hover:border-[#d4a353] hover:shadow-[0_0_15px_rgba(212,163,83,0.12)] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#130A07] flex items-center justify-center border border-[#2D2842] group-hover:border-[#d4a353]">
                <span className="text-xl">📜</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm leading-tight">{s.subjectName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#d4a353] font-mono tracking-wider">{s.subjectCode}</span>
                  {s.semester ? <span className="text-[10px] text-white/60">• Sem. {s.semester}</span> : null}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {(() => {
                const st = (s.status || "").toLowerCase();
                if (st.includes("fail")) {
                  return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">FAILED</span>;
                }
                if (st.includes("pass")) {
                  return <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">PASSED</span>;
                }
                if (st.includes("studying")) {
                  return <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20 animate-pulse">IN PROGRESS</span>;
                }
                return <span className="px-3 py-1 rounded-full bg-[#f5c16c]/10 text-[#f5c16c] text-xs font-bold border border-[#f5c16c]/20">NOT STARTED</span>;
              })()}
              {s.grade ? (
                <span className="px-3 py-1 rounded-full bg-[#2d140f]/40 text-[#f5c16c] text-xs font-bold border border-[#f5c16c]/30">{s.grade}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}