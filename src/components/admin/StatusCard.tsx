"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from 'axios';
import axiosCodeBattleClient from '@/api/axiosCodeBattleClient';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline';
  endpoint: string;
}

export function StatusCard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Executor Service', status: 'online', endpoint: 'executor-service/health' },
    { name: 'User Service', status: 'online', endpoint: 'user-service/health' },
    { name: 'Event Service', status: 'online', endpoint: 'health' },
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        setIsPolling(true);
        const executorClient = axios.create({ baseURL: 'https://api.roguelearn.site' });
        const eventClient = axios.create({ baseURL: 'https://api.roguelearn.site' });

        const results = await Promise.allSettled([
          executorClient.get('/executor-service/health'),
          eventClient.get('/user-service/health'),
          axiosCodeBattleClient.get('/health'),
        ]);

        setServices([
          { name: 'Executor Service', status: results[0].status === 'fulfilled' ? 'online' : 'offline', endpoint: 'executor-service/health' },
          { name: 'User Service', status: results[1].status === 'fulfilled' ? 'online' : 'offline', endpoint: 'user-service/health' },
          { name: 'Event Service', status: results[2].status === 'fulfilled' ? 'online' : 'offline', endpoint: 'health' },
        ]);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setIsPolling(false);
        setLastUpdated(new Date());
      }
    };

    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const allOnline = services.every(s => s.status === 'online');
  const allOffline = services.every(s => s.status === 'offline');
  const onlineCount = services.filter(s => s.status === 'online').length;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-800">System Status</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {allOnline ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">All Systems Operational</span>
              </>
            ) : allOffline ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">All Services Down</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">{onlineCount}/{services.length} Services Online</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${isPolling ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
            <span>Auto-updates every 60s</span>
          </div>
          <span>•</span>
          <span>Last updated {Math.floor((currentTime.getTime() - lastUpdated.getTime()) / 1000)}s ago</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <span className="text-sm font-medium text-slate-700">{service.name}</span>
              <div className="flex items-center gap-2">
                {service.status === 'online' ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">Online</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
