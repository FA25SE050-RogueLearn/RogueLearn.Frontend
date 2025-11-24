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

  // Update current time every second for accurate "X seconds ago" display
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

        // Check all services in parallel
        // Using axios.create with baseURL to make direct requests to api.roguelearn.site
        const executorClient = axios.create({ baseURL: 'https://api.roguelearn.site' });
        const eventClient = axios.create({ baseURL: 'https://api.roguelearn.site' });

        const results = await Promise.allSettled([
          executorClient.get('/executor-service/health'),
          eventClient.get('/user-service/health'),
          axiosCodeBattleClient.get('/health'),
        ]);

        setServices([
          {
            name: 'Executor Service',
            status: results[0].status === 'fulfilled' ? 'online' : 'offline',
            endpoint: 'executor-service/health'
          },
          {
            name: 'User Service',
            status: results[1].status === 'fulfilled' ? 'online' : 'offline',
            endpoint: 'user-service/health'
          },
          {
            name: 'Event Service',
            status: results[2].status === 'fulfilled' ? 'online' : 'offline',
            endpoint: 'health'
          },
        ]);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setIsPolling(false);
        setLastUpdated(new Date());
      }
    };

    fetchHealthStatus();

    // Poll every 60 seconds
    const interval = setInterval(fetchHealthStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const allOnline = services.every(s => s.status === 'online');
  const allOffline = services.every(s => s.status === 'offline');
  const onlineCount = services.filter(s => s.status === 'online').length;

  return (
    <Card className="relative overflow-hidden border-amber-900/30 bg-gradient-to-br from-[#1f1812] to-[#1a1410] shadow-xl shadow-black/20">
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-embroidery.png')] opacity-[0.02] pointer-events-none" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-amber-950/50 to-amber-900/30 p-2">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-lg font-bold text-amber-100">System Status</CardTitle>
          </div>

          {/* Current Status Indicator */}
          <div className="flex items-center gap-2">
            {allOnline ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-400">
                  All Systems Operational
                </span>
              </>
            ) : allOffline ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-semibold text-red-400">
                  All Services Down
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-400">
                  {onlineCount}/{services.length} Services Online
                </span>
              </>
            )}
          </div>
        </div>

        {/* Auto-polling indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${isPolling ? 'bg-amber-500 animate-pulse' : 'bg-amber-600/50'}`} />
            <span>Auto-updates every 60s</span>
          </div>
          <span>•</span>
          <span>
            Last updated {Math.floor((currentTime.getTime() - lastUpdated.getTime()) / 1000)}s ago
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative pt-4">
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-lg border border-amber-900/20 bg-gradient-to-r from-amber-950/20 to-transparent p-3"
            >
              <span className="text-sm font-medium text-amber-200">{service.name}</span>
              <div className="flex items-center gap-2">
                {service.status === 'online' ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-400">Online</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs text-red-400">Offline</span>
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
