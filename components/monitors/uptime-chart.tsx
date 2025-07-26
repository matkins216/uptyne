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
        setLoading(true);
        const response = await fetch(`/api/monitors/${monitorId}/checks`);
        if (response.ok) {
          const data = await response.json();
          setChecks(data);
        } else {
          console.error('Failed to fetch check data:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch check data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (monitorId) {
      fetchChecks();
    } else {
      setChecks([]);
      setLoading(false);
    }
  }, [monitorId]);

  // Process the check data for the chart
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
    return <div className="flex justify-center items-center h-[200px] md:h-[300px]">Loading...</div>;
  }

  if (checks.length === 0) {
    return <div className="flex justify-center items-center h-[200px] md:h-[300px]">No data</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={300} minWidth={300}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"

          />
          <YAxis 
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="responseTime"
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}