// components/monitors/monitor-list.tsx
'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MonitorStatusBadge } from '@/components/monitors/monitor-status-badge'
import { Edit, Trash2, Activity, Shield, Globe, Calendar } from 'lucide-react'
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
  domain_check?: {
    ssl_valid: boolean
    ssl_expires_at?: string
    dns_resolved: boolean
    whois_expires_at?: string
  }
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
          <Link href="/dashboard/monitors/new">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-lg break-words">{monitor.name}</CardTitle>
                {monitor.last_check && (
                  <MonitorStatusBadge status={monitor.last_check.status} />
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link href={`/dashboard/monitors/${monitor.id}`}>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                  <p className="text-gray-500">URL</p>
                  <p className="font-medium break-all">{monitor.url}</p>
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
              
              {monitor.domain_check && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 ${monitor.domain_check.ssl_valid ? 'text-green-500' : 'text-red-500'}`} />
                      <div>
                        <p className="text-gray-500">SSL</p>
                        <p className="font-medium">
                          {monitor.domain_check.ssl_valid ? 'Valid' : 'Invalid'}
                          {monitor.domain_check.ssl_expires_at && (
                            <span className="text-xs text-gray-400 block">
                              Expires {formatDistanceToNow(new Date(monitor.domain_check.ssl_expires_at), { addSuffix: true })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className={`h-4 w-4 ${monitor.domain_check.dns_resolved ? 'text-green-500' : 'text-red-500'}`} />
                      <div>
                        <p className="text-gray-500">DNS</p>
                        <p className="font-medium">{monitor.domain_check.dns_resolved ? 'Resolved' : 'Failed'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-gray-500">Domain</p>
                        <p className="font-medium">
                          {monitor.domain_check.whois_expires_at
                            ? `Expires ${formatDistanceToNow(new Date(monitor.domain_check.whois_expires_at), { addSuffix: true })}`
                            : 'No data'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
