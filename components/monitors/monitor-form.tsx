// components/monitors/monitor-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const monitorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  check_interval: z.number().min(1).max(60).default(5),
  slack_webhook_url: z.string().url().optional().or(z.literal(''))
})

type MonitorFormData = z.infer<typeof monitorSchema>

interface MonitorFormProps {
  onSubmit: (data: MonitorFormData) => Promise<void>
  initialData?: Partial<MonitorFormData>
  isLoading?: boolean
}

export function MonitorForm({ onSubmit, initialData, isLoading }: MonitorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MonitorFormData>({
    resolver: zodResolver(monitorSchema),
    defaultValues: initialData || {
      check_interval: 5
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Monitor' : 'Add New Monitor'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Monitor Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Website"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">URL to Monitor</Label>
            <Input
              id="url"
              {...register('url')}
              placeholder="https://example.com"
              disabled={isLoading}
            />
            {errors.url && (
              <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="check_interval">Check Interval (minutes)</Label>
            <Input
              id="check_interval"
              type="number"
              {...register('check_interval', { valueAsNumber: true })}
              placeholder="5"
              disabled={isLoading}
            />
            {errors.check_interval && (
              <p className="text-sm text-red-600 mt-1">{errors.check_interval.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="slack_webhook_url">Slack Webhook URL (optional)</Label>
            <Input
              id="slack_webhook_url"
              {...register('slack_webhook_url')}
              placeholder="https://hooks.slack.com/services/..."
              disabled={isLoading}
            />
            {errors.slack_webhook_url && (
              <p className="text-sm text-red-600 mt-1">{errors.slack_webhook_url.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (initialData ? 'Update Monitor' : 'Create Monitor')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
