
// app/(dashboard)/dashboard/monitors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MonitorList } from '@/components/monitors/monitor-list';

interface Monitor {
  id: string;
  name: string;
  url: string;
  check_interval: number;
  is_active: boolean;
  last_check_at?: string;
  created_at: string;
  uptime_percentage?: number;
  last_check?: {
    status: 'up' | 'down' | 'error';
    response_time: number;
    status_code?: number;
    error_message?: string;
    checked_at: string;
  };
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonitors();
  }, []);

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitors');
      
      if (!response.ok) {
        throw new Error('Failed to fetch monitors');
      }
      
      const data = await response.json();
      setMonitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/monitors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete monitor');
      }

      // Refresh the monitors list
      fetchMonitors();
    } catch (err) {
      console.error('Error deleting monitor:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchMonitors} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitors</h1>
          {/* <p className="text-gray-600 mt-1">Manage and track your website monitors</p> */}
        </div>
        <Link href="/dashboard/monitors/new">
          <Button>
            Add Monitor
          </Button>
        </Link>
      </div>

      <MonitorList monitors={monitors} onDelete={handleDelete} />
    </div>
  );
}
