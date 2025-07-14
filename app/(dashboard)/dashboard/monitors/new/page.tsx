// app/(dashboard)/dashboard/monitors/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewMonitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval: '5'
  });

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
