"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface Notification {
  message: string;
  type: string;
  time: string;
}

interface NotificationsProps {
  notifications: Notification[];
}

const getVariantClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-[#f5c16c]/35 bg-[#f5c16c]/15 text-[#2b130f]';
    case 'error':
      return 'border-rose-400/40 bg-rose-500/15 text-rose-100';
    default:
      return 'border-[#d23187]/35 bg-[#d23187]/15 text-white';
  }
};

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <Card className="relative overflow-hidden rounded-[26px] border border-[#f5c16c]/18 bg-linear-to-br from-[#23100d]/88 via-[#130806]/94 to-[#070403]/98 p-6 shadow-[0_24px_70px_rgba(52,18,9,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,49,135,0.38),transparent_70%)] opacity-[0.35]" />
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d23187]/20 text-[#f5c16c]">
            <Bell className="h-5 w-5" />
          </span>
          Arena Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <p className="text-sm text-[#f5c16c]/80">Silence across the nexus.</p>
          ) : (
            notifications.map((notification, index) => {
              const variantClasses = getVariantClasses(notification.type);
              return (
                <div
                  key={index}
                  className={`rounded-2xl border px-4 py-3 text-sm ${variantClasses}`}
                >
                  <span className="text-[11px] uppercase tracking-[0.35em] text-[#f5c16c]/80">
                    {notification.time}
                  </span>
                  <p className="mt-1 leading-relaxed">{notification.message}</p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
