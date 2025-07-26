'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UptimeChart } from '@/components/monitors/uptime-chart';

interface Monitor {
  id: string;
  name: string;
  url: string;
  check_interval: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function MonitorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/monitors/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Monitor not found');
          }
          throw new Error('Failed to fetch monitor');
        }
        
        const data = await response.json();
        setMonitor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Link href="/dashboard/monitors">
            <Button variant="outline">Back to Monitors</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Monitor not found</p>
          <Link href="/dashboard/monitors">
            <Button variant="outline">Back to Monitors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{monitor.name}</h1>
          <p className="text-gray-600 mt-1">Monitor Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/monitors/${id}/edit`}>
            <Button>Edit Monitor</Button>
          </Link>
          <Link href="/dashboard/monitors">
            <Button variant="outline">Back to Monitors</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monitor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg">{monitor.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">URL</label>
              <p className="text-lg break-all">{monitor.url}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                <Badge variant={monitor.is_active ? 'default' : 'secondary'}>
                  {monitor.is_active ? 'Active' : 'Paused'}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Check Interval</label>
              <p className="text-lg">{monitor.check_interval} minutes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p className="text-lg">{new Date(monitor.created_at).toLocaleString()}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Last Updated</label>
              <p className="text-lg">{new Date(monitor.updated_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

       
            <UptimeChart monitorId={id} />
      </div>
    </div>
  );
}