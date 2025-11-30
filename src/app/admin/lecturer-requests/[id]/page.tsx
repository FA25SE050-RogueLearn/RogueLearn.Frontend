"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import lecturerVerificationApi from "@/api/lecturerVerificationApi";
import { AdminLecturerVerificationRequestDetail } from "@/types/lecturer-verification";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLecturerRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = String(params?.id || params?.requestId || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminLecturerVerificationRequestDetail | null>(null);
  const [note, setNote] = useState("");
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [acting, setActing] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lecturerVerificationApi.adminGet(requestId);
      if (res.isSuccess) setDetail(res.data);
    } catch (e: any) {
      setError(e?.normalized?.message || 'Failed to load detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (requestId) fetchDetail(); }, [requestId]);

  const approve = async () => {
    if (!requestId) return;
    setActing(true);
    try {
      await lecturerVerificationApi.adminApprove(requestId, note ? { note } : undefined);
      toast.success('Request approved');
      await fetchDetail();
    } catch (e: any) {
      toast.error(e?.normalized?.message || 'Approve failed');
    } finally {
      setActing(false);
    }
  };

  const decline = async () => {
    if (!requestId || !declineReason.trim()) { toast.error('Reason is required'); return; }
    setActing(true);
    try {
      await lecturerVerificationApi.adminDecline(requestId, { reason: declineReason.trim() });
      toast.success('Request rejected');
      setDeclineOpen(false);
      setDeclineReason("");
      await fetchDetail();
    } catch (e: any) {
      toast.error(e?.normalized?.message || 'Reject failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#beaca3]/30 text-[#2c2f33] hover:bg-[#beaca3]/20">
            <Link href="/admin/lecturer-requests" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#2c2f33]">Request Detail</h1>
            <p className="text-sm text-[#2c2f33]/60">Review submitted information and take action</p>
          </div>
        </div>

        <Card className="bg-white border-[#beaca3]/30">
          <CardHeader className="border-b border-[#beaca3]/20">
            <CardTitle className="text-[#2c2f33]">Submitted Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {loading && <div className="flex items-center gap-2 text-[#7289da]"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
            {error && <div className="flex items-center gap-2 text-[#e07a5f]"><AlertCircle className="h-4 w-4" /> {error}</div>}
            {!loading && !error && detail && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#2c2f33]">{detail.email}</p>
                    <p className="text-xs text-[#2c2f33]/50">Staff ID: {detail.staffId}</p>
                    <p className="text-xs text-[#2c2f33]/50">User: {detail.authUserId}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${/^approved$/i.test(detail.status || '') ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : /^(declined|rejected)$/i.test(detail.status || '') ? 'text-[#e07a5f] bg-[#e07a5f]/10 border-[#e07a5f]/30' : 'text-[#7289da] bg-[#7289da]/10 border-[#7289da]/30'}`}>
                    {/^declined$/i.test(detail.status || '') ? 'Rejected' : (detail.status || '')}
                  </span>
                </div>
                {detail.screenshotUrl && (
                  <div className="rounded-lg border border-[#beaca3]/30 bg-[#f4f6f8] p-4">
                    <p className="text-xs text-[#2c2f33]/50 mb-2">Screenshot</p>
                    <img src={detail.screenshotUrl} alt="Proof screenshot" className="max-h-80 rounded" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm text-[#2c2f33]/70" htmlFor="note">Note (optional)</label>
                  <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} disabled={/^(approved|declined|rejected)$/i.test(detail.status || '')} className="border-[#beaca3]/30 disabled:opacity-60" />
                </div>
                {/^(approved|declined|rejected)$/i.test(detail.status || '') ? null : (
                  <div className="flex items-center gap-3">
                    <Button disabled={acting} onClick={approve} className="bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
                    <Button disabled={acting} variant="outline" onClick={() => setDeclineOpen(true)} className="border-[#e07a5f]/30 text-[#e07a5f] hover:bg-[#e07a5f]/10">Reject</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
          <DialogContent className="bg-white border-[#beaca3]/30 text-[#2c2f33] max-w-md">
            <DialogHeader><DialogTitle>Reject Request</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <label htmlFor="declineReason" className="text-sm text-[#2c2f33]/70">Reason</label>
              <Input id="declineReason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Reason is required" className="border-[#beaca3]/30" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeclineOpen(false)} className="border-[#beaca3]/30">Cancel</Button>
              <Button onClick={decline} disabled={acting} className="bg-[#e07a5f] hover:bg-[#d06a4f] text-white">Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
