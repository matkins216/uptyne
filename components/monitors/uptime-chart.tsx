// components/monitors/uptime-chart.tsx
'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface UptimeChartProps {
  checks: Array<{
    checked_at: string
    response_time: number
    status: string
  }>
}

export function UptimeChart({ checks }: UptimeChartProps) {
  const data = useMemo(() => {
    return checks
      .slice(-50)
      .map(check => ({
        time: format(new Date(check.checked_at), 'HH:mm'),
        responseTime: check.response_time,
        status: check.status
      }))
  }, [checks])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="responseTime" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
