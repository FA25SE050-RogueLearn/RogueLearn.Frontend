"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-amber-900/20 via-transparent to-amber-900/20 rounded-lg blur-xl" />
          <div className="relative p-6 rounded-lg border border-amber-900/30 bg-linear-to-br from-amber-950/30 to-transparent">
            <h1 className="text-3xl font-bold tracking-tight text-amber-100">Lecturer Verification Requests</h1>
            <p className="text-amber-700">Review, approve, or decline lecturer verification submissions</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-amber-900/30 bg-linear-to-br from-[#1f1812] to-[#1a1410]">
          <CardHeader className="relative border-b border-amber-900/20">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by email or user id"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-black/20 border-amber-900/30 text-sm"
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48 bg-black/20 border-amber-900/30">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1410] border-amber-900/30">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchList} className="border-amber-700/50 text-amber-300">Refresh</Button>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-6">
            {loading && (
              <div className="flex items-center gap-2 text-amber-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-rose-400"><AlertCircle className="h-4 w-4" /> {error}</div>
            )}
            {!loading && !error && items.length === 0 && (
              <p className="text-center text-amber-700">No requests found.</p>
            )}
            {!loading && !error && items.length > 0 && (
              <div className="space-y-3">
                {pagedItems.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-lg border border-amber-900/30 bg-linear-to-r from-amber-950/30 to-transparent p-4">
                    <div>
                      <p className="text-sm font-semibold text-amber-100">{it.email}</p>
                      <p className="text-xs text-amber-700">User: {it.userId} • Staff ID: {it.staffId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${it.status === 'Approved' ? 'text-emerald-300 bg-emerald-900/30 border border-emerald-800/40' : it.status === 'Rejected' ? 'text-rose-300 bg-rose-900/30 border border-rose-800/40' : 'text-amber-200 bg-amber-900/30 border border-amber-800/40'}`}>{it.status}</span>
                      <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-black">
                        <Link href={`/admin/lecturer-requests/${it.id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-amber-300">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded bg-amber-900/30 px-3 py-1.5 text-xs text-amber-200 border border-amber-900/40 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded bg-amber-900/30 px-3 py-1.5 text-xs text-amber-200 border border-amber-900/40 disabled:opacity-50"
                    >
                      Next
                    </button>
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