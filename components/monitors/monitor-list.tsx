// components/monitors/monitor-list.tsx
'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MonitorStatusBadge } from '@/components/monitors/monitor-status-badge'
import { Edit, Trash2, Activity } from 'lucide-react'
import { calculateUptime, formatResponseTime } from '@/lib/utils'

interface Monitor {
  id: string
  name: string
  url: string
  is_active: boolean
  created_at: string
  last_check?: {
    status: 'up' | 'down' | 'error'
    response_time: number
    checked_at: string
  }
  uptime_percentage?: number
}

interface MonitorListProps {
  monitors: Monitor[]
  onDelete?: (id: string) => void
}

export function MonitorList({ monitors, onDelete }: MonitorListProps) {
  if (monitors.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 mb-4">No monitors found</p>
          <Link href="/monitors/new">
            <Button>Add Your First Monitor</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {monitors.map((monitor) => (
        <Card key={monitor.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">{monitor.name}</CardTitle>
                {monitor.last_check && (
                  <MonitorStatusBadge status={monitor.last_check.status} />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/monitors/${monitor.id}`}>
                  <Button variant="ghost" size="icon">
                    <Activity className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/monitors/${monitor.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(monitor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">URL</p>
                <p className="font-medium truncate">{monitor.url}</p>
              </div>
              <div>
                <p className="text-gray-500">Uptime</p>
                <p className="font-medium">
                  {monitor.uptime_percentage !== undefined ? `${monitor.uptime_percentage}%` : 'No data'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Check</p>
                <p className="font-medium">
                  {monitor.last_check
                    ? formatDistanceToNow(new Date(monitor.last_check.checked_at), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
