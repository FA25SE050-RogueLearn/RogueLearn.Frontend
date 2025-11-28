"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, UploadCloud, FileText, CheckCircle, Clock, RefreshCw, GraduationCap, Sparkles } from "lucide-react";
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
  const [hasLecturerRole, setHasLecturerRole] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? "");
    };
    load();
  }, []);

  useEffect(() => {
    const checkRoles = async () => {
      try {
        const ctx = await getMyContext().catch(() => ({ data: { roles: [] } } as any));
        const ctxRoles: string[] = Array.isArray(ctx?.data?.roles) ? ctx.data.roles : [];
        const hasLecturer = ctxRoles.some(r => (String(r || '').toLowerCase().replace(/\s+/g, '')) === 'verifiedlecturer');
        setHasLecturerRole(hasLecturer);
      } catch {}
    };
    checkRoles();
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
        try {
          const ctx = await getMyContext().catch(() => ({ data: { roles: [] } } as any));
          const ctxRoles: string[] = Array.isArray(ctx?.data?.roles) ? ctx.data.roles : [];
          const hasLecturer = ctxRoles.some(r => (String(r || '').toLowerCase().replace(/\s+/g, '')) === 'verifiedlecturer');
          setHasLecturerRole(hasLecturer);
        } catch {}
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

  const submissionStatus: 'completed' | 'active' | 'pending' = (!hasLecturerRole && hasApproved)
    ? 'active'
    : (hasAnySubmission ? 'completed' : 'active');
  const reviewStatus: 'completed' | 'active' | 'pending' = hasLecturerRole
    ? 'completed'
    : (hasPending ? 'active' : 'pending');
  const lecturerStatus: 'completed' | 'active' | 'pending' = hasLecturerRole ? 'completed' : 'pending';

  const latestRequest = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const ta = new Date(a.submittedAt).getTime();
      const tb = new Date(b.submittedAt).getTime();
      return tb - ta;
    });
    return sorted[0] || null;
  }, [items]);
  const showRevokedInfo = !!latestRequest && latestRequest.status === 'Approved' && !hasLecturerRole;

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-gradient-to-r from-[#2a140f]/95 via-[#1a0b08]/95 to-[#2a140f]/95 p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,49,135,0.15),transparent_50%)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#f5c16c]/30 bg-gradient-to-br from-[#d23187]/20 to-[#f5c16c]/20 shadow-lg">
            <GraduationCap className="h-7 w-7 text-[#f5c16c]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Class Advancement: Lecturer</h2>
            <p className="text-sm text-[#f5c16c]/70">Submit your credentials to unlock Lecturer privileges</p>
          </div>
        </div>
      </div>

      {showRevokedInfo && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          Your latest verification was approved, but you do not currently hold the Verified Lecturer role. You may have been revoked. Please submit a new verification request.
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-6 py-5 rounded-[20px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95">
        <Step status="completed" label="Player" />
        <div className="h-0.5 w-12 bg-gradient-to-r from-[#d23187] to-[#f5c16c]" />
        <Step status={submissionStatus} label="Submission" />
        <div className={`h-0.5 w-12 ${reviewStatus !== 'pending' ? 'bg-gradient-to-r from-[#d23187] to-[#f5c16c]' : 'bg-[#f5c16c]/20'}`} />
        <Step status={reviewStatus} label="Review" />
        <div className={`h-0.5 w-12 ${lecturerStatus === 'completed' ? 'bg-gradient-to-r from-[#d23187] to-[#f5c16c]' : 'bg-[#f5c16c]/20'}`} />
        <Step status={lecturerStatus} label="Lecturer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#d23187]/10 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-[#f5c16c]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5c16c]/80">Request Details</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#f5c16c]/60 uppercase tracking-wider mb-2">Staff Identification (ID)</label>
                <input 
                  type="text" 
                  value={staffId} 
                  onChange={(e) => setStaffId(e.target.value)} 
                  placeholder="Ex: AnhPHM2" 
                  className="w-full bg-[#0b0504]/60 border border-[#f5c16c]/20 text-white rounded-xl px-4 py-3 focus:border-[#f5c16c]/50 focus:ring-1 focus:ring-[#f5c16c]/30 outline-none transition placeholder:text-white/30" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#f5c16c]/60 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="text" 
                  value={email} 
                  disabled 
                  className="w-full bg-[#0b0504]/40 border border-[#f5c16c]/10 text-white/50 rounded-xl px-4 py-3 cursor-not-allowed" 
                />
              </div>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed ${dragActive ? 'border-[#f5c16c]/50 bg-[#f5c16c]/5' : 'border-[#f5c16c]/20'} bg-[#0b0504]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[#f5c16c]/30`}
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-[#d23187]/20 to-[#f5c16c]/20 border border-[#f5c16c]/30 mb-3">
                  <UploadCloud className="h-5 w-5 text-[#f5c16c]" />
                </div>
                <div className="text-sm text-white font-medium">{file ? file.name : 'Drop Credentials Here'}</div>
                <div className="text-xs text-[#f5c16c]/50 mt-1">ID Card or Teaching Certificate (Max 5MB)</div>
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-[#d23187] via-[#f061a6] to-[#f5c16c] hover:opacity-90 text-[#1a0b08] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(210,49,135,0.3)] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Petitions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#d23187]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5c16c]/80">Previous Petitions</span>
            </div>
            <button onClick={fetchList} className="text-xs text-[#f5c16c]/50 hover:text-[#f5c16c] flex items-center gap-1 transition">
              <RefreshCw className="size-3" /> Refresh
            </button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-[#f5c16c]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-rose-400 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="rounded-[20px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-8 text-center">
                <div className="text-4xl opacity-30 mb-2">📜</div>
                <p className="text-sm text-[#f5c16c]/50">No requests yet</p>
              </div>
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
                const borderColor = isApproved ? 'border-l-emerald-500' : isRejected ? 'border-l-rose-500' : 'border-l-[#f5c16c]';
                const badgeClass = isApproved
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : isRejected
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    : 'text-[#f5c16c] bg-[#f5c16c]/10 border-[#f5c16c]/30';
                const badgeText: LecturerVerificationStatus = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending';
                return (
                  <div key={r.id} className={`relative overflow-hidden rounded-xl border border-[#f5c16c]/20 bg-gradient-to-br from-[#1f0d09]/95 to-[#2a1510]/95 p-4 ${borderColor} border-l-4`}>
                    <div className={`absolute top-3 right-3 ${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest`}>{badgeText}</div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#d23187]/10 border border-[#d23187]/20 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-[#d23187]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{emailDoc || email || 'Application'}</div>
                        {submitted && <div className="text-xs text-[#f5c16c]/50">Submitted: {submitted}</div>}
                      </div>
                    </div>
                    <div className="bg-[#0b0504]/60 rounded-lg p-3 flex items-center gap-3 border border-[#f5c16c]/10">
                      <div className="w-9 h-9 bg-[#f5c16c]/10 rounded-lg flex items-center justify-center border border-[#f5c16c]/20">
                        <FileText className="text-[#f5c16c] size-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs text-white/80 truncate">{staffIdDoc || 'Staff ID'}</div>
                        <div className="text-[10px] text-[#f5c16c]/40">{shot ? 'Attachment included' : 'No attachment'}</div>
                      </div>
                      {shot && <a href={shot} target="_blank" rel="noreferrer" className="text-xs text-[#d23187] hover:text-[#f061a6] transition">View</a>}
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
  
  const containerClass = isCompleted 
    ? 'border-[#d23187] bg-gradient-to-br from-[#d23187]/20 to-[#f5c16c]/20' 
    : isActive 
      ? 'border-[#f5c16c] bg-[#f5c16c]/10' 
      : 'border-[#f5c16c]/30 bg-transparent';
  
  const iconClass = isCompleted 
    ? 'text-[#d23187]' 
    : isActive 
      ? 'text-[#f5c16c]' 
      : 'text-[#f5c16c]/40';
  
  const labelClass = isCompleted 
    ? 'text-[#d23187]' 
    : isActive 
      ? 'text-white' 
      : 'text-[#f5c16c]/40';

  const icon = isCompleted ? <CheckCircle className="size-4" /> : isActive ? <Clock className="size-4" /> : <Clock className="size-4" />;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${containerClass} ${iconClass}`}>
        {icon}
      </div>
      <div className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${labelClass}`}>{label}</div>
    </div>
  );
}