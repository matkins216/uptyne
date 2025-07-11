'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

interface Monitor {
  id: string;
  name: string;
  url: string;
  check_interval: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    check_interval: '5',
    is_active: true
  });

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
        
        // Populate form with existing data
        setFormData({
          name: data.name,
          url: data.url,
          check_interval: data.check_interval.toString(),
          is_active: data.is_active
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Please enter a monitor name');
      return;
    }
    
    if (!formData.url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/monitors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          url: formData.url.trim(),
          check_interval: parseInt(formData.check_interval),
          is_active: formData.is_active
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update monitor');
      }

      // Redirect to the monitor details page
      router.push(`/dashboard/monitors/${id}`);
      router.refresh();
    } catch (err) {
      console.error('Error updating monitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to update monitor');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitor...</p>
        </div>
      </div>
    );
  }

  if (error && !monitor) {
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Monitor</h1>
          <p className="text-gray-600 mt-1">Update your monitor settings</p>
        </div>
        <Link href={`/dashboard/monitors/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitor Settings</CardTitle>
          <CardDescription>
            Update the configuration for {monitor.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Monitor Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="My Website"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
              <p className="text-sm text-gray-600">
                A friendly name to identify your monitor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL to Monitor</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
              <p className="text-sm text-gray-600">
                The full URL of the website you want to monitor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_interval">Check Interval (minutes)</Label>
              <Input
                id="check_interval"
                name="check_interval"
                type="number"
                min="1"
                max="60"
                value={formData.check_interval}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
              <p className="text-sm text-gray-600">
                How often to check your website (1-60 minutes)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-gray-600">
                  {formData.is_active ? 'Monitor is active and checking' : 'Monitor is paused'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleSwitchChange}
                disabled={saving}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/monitors/${id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Updating...
                  </>
                ) : (
                  'Update Monitor'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 