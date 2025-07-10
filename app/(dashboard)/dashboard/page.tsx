
// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalMonitors: number;
  activeMonitors: number;
  pausedMonitors: number;
  totalChecks: number;
  failedChecks: number;
  averageUptime: number;
}

interface RecentCheck {
  id: string;
  monitor_name: string;
  status_code: number;
  response_time: number;
  checked_at: string;
  error?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMonitors: 0,
    activeMonitors: 0,
    pausedMonitors: 0,
    totalChecks: 0,
    failedChecks: 0,
    averageUptime: 0
  });
  const [recentChecks, setRecentChecks] = useState<RecentCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch monitors for stats
      const monitorsRes = await fetch('/api/monitors');
      const monitors = await monitorsRes.json();
      
      // Fetch recent checks
      const checksRes = await fetch('/api/checks?limit=5');
      const checks = await checksRes.json();
      
      // Calculate stats
      const activeCount = monitors.filter((m: any) => m.is_active).length;
      const pausedCount = monitors.filter((m: any) => !m.is_active).length;
      
      setStats({
        totalMonitors: monitors.length,
        activeMonitors: activeCount,
        pausedMonitors: pausedCount,
        totalChecks: checks.length,
        failedChecks: checks.filter((c: any) => c.status_code >= 400).length,
        averageUptime: monitors.reduce((acc: number, m: any) => acc + (m.uptime_percentage || 0), 0) / (monitors.length || 1)
      });
      
      setRecentChecks(checks.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    } else if (statusCode >= 400) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your website uptime and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Monitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMonitors}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.activeMonitors} active, {stats.pausedMonitors} paused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Monitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeMonitors}</div>
            <p className="text-xs text-gray-600 mt-1">Currently monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageUptime.toFixed(2)}%</div>
            <p className="text-xs text-gray-600 mt-1">Across all monitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed Checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedChecks}</div>
            <p className="text-xs text-gray-600 mt-1">In recent checks</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Checks</CardTitle>
            <Link href="/dashboard/monitors">
              <Button variant="outline" size="sm">View All Monitors</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentChecks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No checks performed yet</p>
              <Link href="/dashboard/monitors/new">
                <Button>Create Your First Monitor</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{check.monitor_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(check.checked_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{check.response_time}ms</p>
                      <p className="text-xs text-gray-600">Response time</p>
                    </div>
                    {getStatusBadge(check.status_code)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/monitors/new">
              <Button>Add New Monitor</Button>
            </Link>
            <Link href="/dashboard/monitors">
              <Button variant="outline">Manage Monitors</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}