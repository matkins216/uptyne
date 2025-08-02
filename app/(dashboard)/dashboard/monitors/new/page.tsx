// app/(dashboard)/dashboard/monitors/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubscriptionStatus {
  subscription: any;
  isBasicMember: boolean;
  canAddMoreMonitors: boolean;
  maxMonitors: number;
  currentMonitorCount: number;
}

export default function NewMonitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval: '5'
  });

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await fetch('/api/user/subscription');
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
        
        // Check if user has reached their monitor limit
        const maxMonitors = data.maxMonitors || 5;
        const currentCount = data.currentMonitorCount || 0;
        
        if (currentCount >= maxMonitors) {
          router.push('/pricing');
          return;
        }
      } else {
        console.error('Failed to fetch subscription status');
        setError('Failed to verify subscription status');
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError('Failed to verify subscription status');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    
    // Check subscription status before allowing submission
    const maxMonitors = subscriptionStatus?.maxMonitors || 5;
    const currentCount = subscriptionStatus?.currentMonitorCount || 0;
    
    if (currentCount >= maxMonitors) {
      setError(`You have reached the maximum number of monitors (${maxMonitors}). Please upgrade your subscription to add more monitors.`);
      return;
    }
    
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
      setLoading(true);
      
      const response = await fetch('/api/monitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          url: formData.url.trim(),
          interval: parseInt(formData.interval),
          status: 'active'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error creating monitor:', errorData);
        throw new Error(errorData?.error || 'Failed to create monitor');
      }

      const data = await response.json();
      
      // Redirect to the monitors list or the new monitor's page
      router.push('/dashboard/monitors');
      router.refresh();
    } catch (err) {
      console.error('Error creating monitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to create monitor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  // Show error if subscription check failed
  if (error && !subscriptionStatus?.canAddMoreMonitors) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/pricing')} variant="outline">
            View Pricing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Monitor</CardTitle>
          <CardDescription>
            Create a new monitor to track your website's uptime
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
                disabled={loading}
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
                disabled={loading}
              />
              <p className="text-sm text-gray-600">
                The full URL of the website you want to monitor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Check Interval (minutes)</Label>
              <Input
                id="interval"
                name="interval"
                type="number"
                min="1"
                max="60"
                value={formData.interval}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <p className="text-sm text-gray-600">
                How often to check your website (1-60 minutes)
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/monitors')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating...
                  </>
                ) : (
                  'Create Monitor'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
