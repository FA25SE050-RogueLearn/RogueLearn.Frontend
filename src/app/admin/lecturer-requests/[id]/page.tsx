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
    if (!requestId || !declineReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setActing(true);
    try {
      await lecturerVerificationApi.adminDecline(requestId, { reason: declineReason.trim() });
      toast.success('Request declined');
      setDeclineOpen(false);
      setDeclineReason("");
      await fetchDetail();
    } catch (e: any) {
      toast.error(e?.normalized?.message || 'Decline failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-amber-700/50 bg-amber-900/20 text-amber-300 hover:bg-amber-800/30">
            <Link href="/admin/lecturer-requests" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-amber-100">Request Detail</h1>
            <p className="text-sm text-amber-700">Review submitted information and take action</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-amber-900/30 bg-linear-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <CardTitle className="text-amber-100">Submitted Information</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-6">
            {loading && (
              <div className="flex items-center gap-2 text-amber-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-rose-400"><AlertCircle className="h-4 w-4" /> {error}</div>
            )}
            {!loading && !error && detail && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-100">{detail.email}</p>
                    <p className="text-xs text-amber-700">Staff ID: {detail.staffId}</p>
                    <p className="text-xs text-amber-700">User: {detail.userId}</p>
                  </div>
                  <span className="text-xs text-amber-400">{detail.status}</span>
                </div>
                {detail.screenshotUrl && (
                  <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
                    <p className="text-xs text-amber-700 mb-2">Screenshot</p>
                    <img src={detail.screenshotUrl} alt="Proof screenshot" className="max-h-80 rounded" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm text-amber-300" htmlFor="note">Note (optional)</label>
                  <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} className="bg-black/30 border-amber-900/40 text-amber-200" />
                </div>
                <div className="flex items-center gap-3">
                  <Button disabled={acting} onClick={approve} className="bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
                  <Button disabled={acting} variant="outline" onClick={() => setDeclineOpen(true)} className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Decline</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
          <DialogContent className="bg-[#1a1410] border-amber-900/30 text-amber-100 max-w-md">
            <DialogHeader>
              <DialogTitle>Decline Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <label htmlFor="declineReason" className="text-sm text-amber-300">Reason</label>
              <Input id="declineReason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Reason is required" className="bg-black/30 border-amber-900/40 text-amber-200" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeclineOpen(false)} className="border-amber-700/50 text-amber-300">Cancel</Button>
              <Button onClick={decline} disabled={acting} className="bg-rose-600 hover:bg-rose-700 text-white">Decline</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}