"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, UploadCloud, FileText, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import lecturerVerificationApi from "@/api/lecturerVerificationApi";
import { MyLecturerVerificationRequestDto, LecturerVerificationStatus } from "@/types/lecturer-verification";
import { toast } from "sonner";
import { getMyContext } from "@/api/usersApi";

export function LecturerVerificationPanel() {
  const [email, setEmail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MyLecturerVerificationRequestDto[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? "");
    };
    load();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lecturerVerificationApi.getMyRequests();
      if (res.isSuccess) {
        const normalize = (s: string | null | undefined): LecturerVerificationStatus => {
          const v = (s || '').toLowerCase();
          if (v === 'approved') return 'Approved';
          if (v === 'rejected' || v === 'declined') return 'Rejected';
          return 'Pending';
        };
        const normalized = (res.data || []).map(r => ({ ...r, status: normalize(r.status) }));
        setItems(normalized);
        const hasApproved = normalized.some(i => i.status === 'Approved');
        if (hasApproved) {
          try { await getMyContext(); } catch {}
        }
      }
    } catch (e: any) {
      setError(e?.normalized?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !staffId) {
      toast.error("Email and Staff ID are required");
      return;
    }
    setSubmitting(true);
    try {
      if (file) {
        const res = await lecturerVerificationApi.createRequestForm(email, staffId, file);
        if (res.isSuccess) {
          toast.success("Verification request submitted");
          setStaffId("");
          setFile(null);
          setScreenshotUrl("");
          await fetchList();
        }
      } else {
        const res = await lecturerVerificationApi.createRequest({ email, staffId, screenshotUrl: screenshotUrl || null });
        if (res.isSuccess) {
          toast.success("Verification request submitted");
          setStaffId("");
          setScreenshotUrl("");
          await fetchList();
        }
      }
    } catch (err: any) {
      const msg = err?.normalized?.message || "Failed to submit request";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const hasApproved = items.some(i => i.status === 'Approved');
  const hasPending = items.some(i => i.status === 'Pending');
  const hasAnySubmission = items.some(i => i.status !== 'Rejected');

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-3xl font-bold text-white">Class Advancement: Lecturer</div>
        <div className="text-white/70">Submit your credentials to unlock Lecturer privileges.</div>
      </div>

      <div className="flex items-center justify-between px-8 py-4 bg-[#1E1B2E] rounded-xl border border-[#2D2842]">
        <Step status="completed" label="Player" />
        <div className="h-0.5 w-16 bg-[#d4a353]" />
        <Step status={hasAnySubmission ? 'completed' : 'active'} label="Submission" />
        <div className="h-0.5 w-16 bg-[#2D2842]" />
        <Step status={hasPending ? 'active' : (hasApproved ? 'completed' : 'pending')} label="Game Master Review" />
        <div className="h-0.5 w-16 bg-[#2D2842]" />
        <Step status={hasApproved ? 'completed' : 'pending'} label="Lecturer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-[#1E1B2E] p-6 rounded-xl border border-[#2D2842]">
            <div className="text-xs font-bold mb-4 uppercase tracking-wider text-[#d4a353]">Request Details</div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Staff Identification Rune (ID)</label>
                <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)} placeholder="Ex: AnhPHM2" className="w-full bg-[#13111C] border border-[#2D2842] text-white rounded-lg px-4 py-2 focus:border-[#d4a353] outline-none" />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 mb-1">Comm Channel (Email)</label>
                <input type="text" value={email} disabled className="w-full bg-[#13111C] border border-[#2D2842] text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed" />
              </div>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed ${dragActive ? 'border-[#d4a353]' : 'border-[#2D2842]'} bg-[#13111C] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition`}
              >
                <div className="p-3 bg-[#1E1B2E] rounded-full mb-3">
                  <UploadCloud className="text-[#d4a353]" />
                </div>
                <div className="text-sm text-gray-300 font-medium">{file ? file.name : 'Drop Credentials Here'}</div>
                <div className="text-xs text-gray-500 mt-1">ID Card or Teaching Certificate (Max 5MB)</div>
              </div>
              <button className="w-full mt-6 bg-[#d4a353] hover:bg-[#b88a3f] text-[#13111C] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                <FileText className="size-4" /> Submit Request
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#d4a353]">Previous Petitions</div>
            <button onClick={fetchList} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
              <RefreshCw className="size-3" /> Refresh
            </button>
          </div>
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center gap-2 text-amber-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-rose-400"><AlertCircle className="h-4 w-4" /> {error}</div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="rounded-lg border border-[#2D2842] bg-[#1E1B2E] p-6 text-center text-white/70">No requests yet.</div>
            )}
            {!loading && !error && items.length > 0 && (
              items.map((r) => {
                const docs = r.documents || {};
                const emailDoc = (docs as any)?.email as string | undefined;
                const staffIdDoc = (docs as any)?.staffId as string | undefined;
                const shot = r.screenshotUrl || ((docs as any)?.screenshotUrl as string | undefined);
                const submitted = r.submittedAt ? new Date(r.submittedAt).toLocaleString() : null;
                const isApproved = r.status === 'Approved';
                const isRejected = r.status === 'Rejected';
                const borderLeft = isApproved ? 'border-l-emerald-500' : isRejected ? 'border-l-red-500' : 'border-l-[#d4a353]';
                const badgeClass = isApproved
                  ? 'text-emerald-300 bg-emerald-900/30 border border-emerald-800/40'
                  : isRejected
                    ? 'text-rose-300 bg-rose-900/30 border border-rose-800/40'
                    : 'text-amber-200 bg-amber-900/30 border border-amber-800/40';
                const badgeText: LecturerVerificationStatus = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending';
                return (
                  <div key={r.id} className={`relative overflow-hidden bg-[#1E1B2E] rounded-xl border border-[#2D2842] p-4 ${borderLeft} border-l-4`}>
                    <div className={`absolute top-2 right-2 ${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest`}>{badgeText}</div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded bg-[#13111C]" />
                      <div>
                        <div className="text-white font-bold text-sm">{emailDoc || email || 'Application'}</div>
                        {submitted && <div className="text-xs text-gray-500">Submitted: {submitted}</div>}
                      </div>
                    </div>
                    <div className="bg-[#13111C] rounded-lg p-2 flex items-center gap-3 border border-[#2D2842]">
                      <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                        <FileText className="text-gray-400 size-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs text-gray-300 truncate">{staffIdDoc || 'Staff ID'}</div>
                        <div className="text-[10px] text-gray-600">{shot ? 'Attachment' : 'No attachment'}</div>
                      </div>
                      {shot && <a href={shot} target="_blank" rel="noreferrer" className="text-xs text-[#d4a353] hover:underline">View</a>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ status, label }: { status: 'completed' | 'active' | 'pending'; label: string }) {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const colorClass = isCompleted ? 'text-[#d4a353] border-[#d4a353]' : isActive ? 'text-white border-white bg-white/10' : 'text-gray-600 border-gray-600';
  const icon = isCompleted ? <CheckCircle className="size-4" /> : isActive ? <Clock className="size-4" /> : <Clock className="size-4" />;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${colorClass}`}>{icon}</div>
      <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
}