// components/monitors/uptime-chart.tsx
'use client'

import { useMemo, useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface UptimeChartProps {
  monitorId: string;
}

interface CheckData {
  checked_at: string;
  response_time: number;
  status: string;
}

export function UptimeChart({ monitorId }: UptimeChartProps) {
  const [checks, setChecks] = useState<CheckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const response = await fetch(`/api/${monitorId}/checks`);
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setChecks(data);
        }
      } catch (error) {
        console.error('Failed to fetch check data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (monitorId) {
      fetchChecks();
    }
  }, [monitorId]);

  const data = useMemo(() => {
    return checks
      .slice(-50)
      .map(check => ({
        time: format(new Date(check.checked_at), 'HH:mm'),
        responseTime: check.response_time,
        status: check.status
      }))
  }, [checks])

  if (loading) {
    return <div className="flex justify-center items-center h-[300px]">Loading chart data...</div>;
  }

  if (checks.length === 0) {
    return <div className="flex justify-center items-center h-[300px]">No check data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="time" />
        <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}  />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="responseTime" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}