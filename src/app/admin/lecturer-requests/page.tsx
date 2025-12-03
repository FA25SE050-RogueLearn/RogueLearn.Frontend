"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import lecturerVerificationApi from "@/api/lecturerVerificationApi";
import { AdminLecturerVerificationRequestListItem, LecturerVerificationStatus } from "@/types/lecturer-verification";
import Link from "next/link";

export default function AdminLecturerRequestsPage() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminLecturerVerificationRequestListItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const paramStatus = status === 'Rejected' ? 'Declined' : (status === 'all' ? undefined : status);
      const res = await lecturerVerificationApi.adminList({ status: paramStatus, page: 1, size: 20 });
      if (res.isSuccess) {
        const normalize = (s: string | null | undefined): LecturerVerificationStatus => {
          const v = (s || '').toLowerCase();
          if (v === 'approved') return 'Approved';
          if (v === 'rejected' || v === 'declined') return 'Rejected';
          return 'Pending';
        };
        let data = (res.data?.items || []).map(i => ({ ...i, status: normalize(i.status) }));
        if (search.trim()) {
          const q = search.toLowerCase();
          data = data.filter(d => (d.email ?? '').toLowerCase().includes(q) || d.userId.toLowerCase().includes(q));
        }
        setItems(data);
      }
    } catch (e: any) {
      setError(e?.normalized?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [status]);
  useEffect(() => { setPage(1); }, [status, search, items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="p-6 rounded-lg border border-[#f5c16c]/20 bg-[#1a0b08]/80">
          <h1 className="text-3xl font-bold tracking-tight text-white">Lecturer Verification Requests</h1>
          <p className="text-white/50 mt-2">Review, approve, or decline lecturer verification submissions</p>
        </div>

        <Card className="bg-[#1a0b08]/80 border-[#f5c16c]/20">
          <CardHeader className="border-b border-[#f5c16c]/10">
            <div className="flex items-center gap-3">
              <Input placeholder="Search by email or user id" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 border-[#f5c16c]/20 bg-black/30 text-white placeholder:text-white/40" />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48 border-[#f5c16c]/20 bg-black/30 text-white"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent className="bg-[#1a0b08] border-[#f5c16c]/20">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchList} className="border-[#f5c16c]/30 text-[#f5c16c] hover:bg-[#f5c16c]/10">Refresh</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {loading && <div className="flex items-center gap-2 text-[#f5c16c]"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
            {error && <div className="flex items-center gap-2 text-red-400"><AlertCircle className="h-4 w-4" /> {error}</div>}
            {!loading && !error && items.length === 0 && <p className="text-center text-white/40">No requests found.</p>}
            {!loading && !error && items.length > 0 && (
              <div className="space-y-3">
                {pagedItems.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-lg border border-[#f5c16c]/20 bg-black/30 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{it.email}</p>
                      <p className="text-xs text-white/50">User: {it.userId} • Staff ID: {it.staffId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${it.status === 'Approved' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' : it.status === 'Rejected' ? 'text-red-400 bg-red-500/20 border-red-500/30' : 'text-[#f5c16c] bg-[#f5c16c]/20 border-[#f5c16c]/30'}`}>{it.status}</span>
                      <Button asChild size="sm" className="bg-gradient-to-r from-[#f5c16c] to-[#d4a855] text-black font-semibold hover:from-[#d4a855] hover:to-[#f5c16c]">
                        <Link href={`/admin/lecturer-requests/${it.id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-white/50">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded bg-black/30 px-3 py-1.5 text-xs text-white border border-[#f5c16c]/20 disabled:opacity-50 hover:bg-[#f5c16c]/10">Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded bg-black/30 px-3 py-1.5 text-xs text-white border border-[#f5c16c]/20 disabled:opacity-50 hover:bg-[#f5c16c]/10">Next</button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
