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

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <Card className="border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Bell className="w-5 h-5" />
          Real-time Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications yet</p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  notification.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                    : notification.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                    : 'bg-card border border-border'
                }`}
              >
                <span className="text-xs text-muted-foreground">[{notification.time}]</span>{' '}
                <span>{notification.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
