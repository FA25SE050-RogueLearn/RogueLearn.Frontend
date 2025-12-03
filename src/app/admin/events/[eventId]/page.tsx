"use client";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Users, Calendar, ChevronLeft, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import eventServiceApi from "@/api/eventServiceApi";
import type { EventRequest } from "@/types/event-service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PageProps { params: Promise<{ eventId: string }>; }

export default function EventDetailPage({ params }: PageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const [eventRequest, setEventRequest] = useState<EventRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [tagNames, setTagNames] = useState<Record<string, string>>({});

  useEffect(() => { fetchEventRequest(); fetchTags(); }, [eventId]);

  const fetchTags = async () => {
    try {
      const response = await eventServiceApi.getAllTags();
      if (response.success && response.data) {
        const tagsMap: Record<string, string> = {};
        response.data.forEach(tag => { tagsMap[tag.id] = tag.name; });
        setTagNames(tagsMap);
      }
    } catch {}
  };

  const fetchEventRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventServiceApi.getAllEventRequests();
      if (response.success && response.data) {
        const request = response.data.find(req => ((req as any).id || req.request_id) === eventId);
        if (request) setEventRequest(request);
        else setError('Event request not found');
      } else { setError(response.error?.message || 'Failed to load event request'); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const handleApprove = async () => {
    if (!eventRequest) return;
    setProcessing(true);
    try {
      const requestId = (eventRequest as any).id || eventRequest.request_id;
      const response = await eventServiceApi.processEventRequest(requestId, { action: 'approve' });
      if (response.success) { toast.success('Event request approved'); setTimeout(() => router.push('/admin/events'), 1000); }
      else { setError(response.error?.message || 'Failed to approve'); toast.error('Failed to approve'); }
    } catch { setError('An unexpected error occurred'); toast.error('Error'); }
    finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!eventRequest || !rejectionReason.trim()) { toast.error('Rejection reason is required'); return; }
    setProcessing(true);
    try {
      const requestId = (eventRequest as any).id || eventRequest.request_id;
      const response = await eventServiceApi.processEventRequest(requestId, { action: 'decline', rejection_reason: rejectionReason.trim() });
      if (response.success) { toast.success('Event request rejected'); setShowRejectDialog(false); setRejectionReason(''); setTimeout(() => router.push('/admin/events'), 1000); }
      else { setError(response.error?.message || 'Failed to reject'); toast.error('Failed to reject'); }
    } catch { setError('An unexpected error occurred'); toast.error('Error'); }
    finally { setProcessing(false); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7289da]" />
          <span className="ml-3 text-white/60">Loading event request...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !eventRequest) {
    return (
      <AdminLayout>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <XCircle className="h-12 w-12 text-[#e07a5f]" />
          <p className="text-white/60">{error || 'Event request not found'}</p>
          <Button asChild variant="outline" className="border-[#beaca3]/30 text-white hover:bg-[#beaca3]/20">
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const participation = (eventRequest as any).participation_details || eventRequest.participation;
  const maxParticipants = participation.max_guilds * participation.max_players_per_guild;
  const eventType = eventRequest.event_type || (eventRequest.event_specifics?.code_battle ? 'code_battle' : 'unknown');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="border-[#beaca3]/30 text-white hover:bg-[#beaca3]/20">
            <Link href="/admin/events" className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">{eventRequest.title}</h1>
            <p className="text-sm text-white/60">Submitted by Guild {eventRequest.requester_guild_id}</p>
          </div>
        </div>

        <Card className="bg-[#1a1410] border-[#f5c16c]/30">
          <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-white">Event Overview</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <p className="text-sm text-white/70">{eventRequest.description}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Max Participants", value: maxParticipants, icon: Users },
                { label: "Start Date", value: new Date(eventRequest.proposed_start_date).toLocaleDateString('en-US'), icon: Calendar },
                { label: "End Date", value: new Date(eventRequest.proposed_end_date).toLocaleDateString('en-US'), icon: Clock },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-lg border border-[#beaca3]/30 bg-[#f4f6f8] p-4">
                    <div className="flex items-center gap-2 text-white/50"><Icon className="h-4 w-4" /><span className="text-xs">{stat.label}</span></div>
                    <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-[#1a1410] border-[#f5c16c]/30">
            <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-white">Event Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between"><span className="text-sm text-white/60">Event Type</span><span className="text-sm font-semibold text-white capitalize">{eventType.replace('_', ' ')}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-white/60">Max Guilds</span><span className="text-sm font-semibold text-white">{participation.max_guilds}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-white/60">Players per Guild</span><span className="text-sm font-semibold text-white">{participation.max_players_per_guild}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-white/60">Status</span><span className={`text-sm font-semibold capitalize ${eventRequest.status === 'pending' ? 'text-[#7289da]' : eventRequest.status === 'approved' ? 'text-emerald-600' : 'text-[#e07a5f]'}`}>{eventRequest.status}</span></div>
            </CardContent>
          </Card>

          {eventType === 'code_battle' && eventRequest.event_specifics?.code_battle && (
            <Card className="bg-[#1a1410] border-[#f5c16c]/30">
              <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-white">Problem Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <p className="text-xs text-white/50 uppercase tracking-wide">Topics</p>
                  <div className="flex flex-wrap gap-2">{eventRequest.event_specifics.code_battle.topics.map((topicId) => <span key={topicId} className="rounded-full border border-[#7289da]/30 bg-[#7289da]/10 px-3 py-1 text-xs text-[#7289da]">{tagNames[topicId] || topicId}</span>)}</div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white/50 uppercase tracking-wide">Difficulty Distribution</p>
                  {eventRequest.event_specifics.code_battle.distribution.map((dist) => (
                    <div key={dist.difficulty} className="flex items-center justify-between rounded-lg border border-[#beaca3]/30 bg-[#f4f6f8] p-3">
                      <div><p className="text-sm font-medium text-white">{dist.difficulty === 1 ? 'Easy' : dist.difficulty === 2 ? 'Medium' : 'Hard'}</p><p className="text-xs text-white/50">{dist.number_of_problems} problems x {dist.score} points</p></div>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {(eventRequest.notes || eventRequest.reviewed_by || eventRequest.rejection_reason) && (
          <Card className="bg-[#1a1410] border-[#f5c16c]/30">
            <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-white">Additional Information</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-6">
              {eventRequest.notes && <div className="space-y-2"><p className="text-xs text-white/50 uppercase tracking-wide">Notes</p><p className="text-sm text-white/70">{eventRequest.notes}</p></div>}
              {eventRequest.reviewed_by && <div className="flex items-center justify-between"><span className="text-sm text-white/60">Reviewed By</span><span className="text-sm font-semibold text-white">{eventRequest.reviewed_by}</span></div>}
              {eventRequest.reviewed_at && <div className="flex items-center justify-between"><span className="text-sm text-white/60">Reviewed At</span><span className="text-sm font-semibold text-white">{new Date(eventRequest.reviewed_at).toLocaleString('en-US')}</span></div>}
              {eventRequest.rejection_reason && <div className="space-y-2 rounded-lg border border-[#e07a5f]/30 bg-[#e07a5f]/10 p-4"><p className="text-xs text-[#e07a5f] uppercase tracking-wide">Rejection Reason</p><p className="text-sm text-[#e07a5f]">{eventRequest.rejection_reason}</p></div>}
            </CardContent>
          </Card>
        )}

        {eventRequest.status === 'pending' && (
          <Card className="bg-[#1a1410] border-[#f5c16c]/30">
            <CardHeader className="border-b border-[#beaca3]/20"><CardTitle className="text-white">Approval Decision</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row">
              <Button onClick={handleApprove} disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
                {processing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : <><CheckCircle className="mr-2 h-5 w-5" /> Approve Event</>}
              </Button>
              <Button onClick={() => setShowRejectDialog(true)} disabled={processing} variant="outline" className="flex-1 border-[#e07a5f]/30 text-[#e07a5f] hover:bg-[#e07a5f]/10 disabled:opacity-50">
                <XCircle className="mr-2 h-5 w-5" /> Reject Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Event Request</DialogTitle>
            <DialogDescription className="text-white/60">Please provide a reason for rejecting this event request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason..." className="min-h-[120px] border-[#beaca3]/30" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason(''); }} disabled={processing} className="border-[#beaca3]/30">Cancel</Button>
            <Button onClick={handleReject} disabled={processing || !rejectionReason.trim()} className="bg-[#e07a5f] hover:bg-[#d06a4f] text-white disabled:opacity-50">
              {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...</> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
