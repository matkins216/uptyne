
// app/(dashboard)/dashboard/monitors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface SubscriptionStatus {
  subscription: any;
  isBasicMember: boolean;
  canAddMoreMonitors: boolean;
  maxMonitors: number;
  currentMonitorCount: number;
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddMonitor = () => {
    const maxMonitors = subscriptionStatus?.maxMonitors || 5;
    
    if (monitors.length >= maxMonitors) {
      router.push('/pricing');
    } else {
      router.push('/dashboard/monitors/new');
    }
  };

  useEffect(() => {
    fetchMonitors();
    fetchSubscriptionStatus();
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

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
        console.log('Subscription status:', data);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
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
        <Button onClick={handleAddMonitor}>
          {monitors.length >= (subscriptionStatus?.maxMonitors || 5) ? 'Upgrade to Add More' : 'Add Monitor'}
        </Button>
      </div>

      <MonitorList monitors={monitors} onDelete={handleDelete} />
    </div>
  );
}
