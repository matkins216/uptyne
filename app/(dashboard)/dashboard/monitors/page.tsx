
// app/(dashboard)/dashboard/monitors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Monitor {
  id: string;
  name: string;
  url: string;
  check_interval: number;
  is_active: boolean;
  last_check_at?: string;
  created_at: string;
  uptime_percentage?: number;
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          <p className="text-gray-600 mt-1">Manage and track your website monitors</p>
        </div>
        <Link href="/dashboard/monitors/new">
          <Button>
            Add Monitor
          </Button>
        </Link>
      </div>

      {monitors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 text-center mb-4">
              No monitors added yet. Click "Add Monitor" to create one!
            </p>
            <Link href="/dashboard/monitors/new">
              <Button>
                Create Your First Monitor
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {monitors.map((monitor) => (
            <Link key={monitor.id} href={`/dashboard/monitors/${monitor.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{monitor.name}</CardTitle>
                      <CardDescription className="text-sm truncate">
                        {monitor.url}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(monitor.is_active)}>
                      {monitor.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Check Interval</span>
                    <span className="font-medium">{monitor.check_interval} min</span>
                  </div>
                  
                  {monitor.uptime_percentage !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">{monitor.uptime_percentage.toFixed(2)}%</span>
                    </div>
                  )}
                  
                  {monitor.last_check_at && (
                    <div className="text-xs text-gray-500">
                      Last checked: {formatDate(monitor.last_check_at)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
