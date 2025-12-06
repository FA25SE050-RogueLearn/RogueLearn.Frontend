"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="flex min-h-screen gap-6 p-6">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 bg-[#f5c16c]/10" />
          <Skeleton className="h-10 w-32 bg-[#f5c16c]/10" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-[#f5c16c]/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuestsPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48 bg-[#f5c16c]/10" />
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-[#f5c16c]/10" />
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full bg-[#f5c16c]/10" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-[#f5c16c]/10" />
          <Skeleton className="h-4 w-32 bg-[#f5c16c]/10" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-[#f5c16c]/10" />
        ))}
      </div>
    </div>
  );
}

export function GridPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48 bg-[#f5c16c]/10" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl bg-[#f5c16c]/10" />
        ))}
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48 bg-[#f5c16c]/10" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg bg-[#f5c16c]/10" />
        ))}
      </div>
    </div>
  );
}
