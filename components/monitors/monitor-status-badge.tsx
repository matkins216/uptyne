// components/monitors/monitor-status-badge.tsx
import { Badge } from "@/components/ui/badge"

interface MonitorStatusBadgeProps {
  status: 'up' | 'down' | 'error' | 'paused'
}

export function MonitorStatusBadge({ status }: MonitorStatusBadgeProps) {
  const variants = {
    up: 'success',
    down: 'destructive',
    error: 'destructive',
    paused: 'secondary'
  } as const

  const labels = {
    up: 'Operational',
    down: 'Down',
    error: 'Error',
    paused: 'Paused'
  }

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  )
}
