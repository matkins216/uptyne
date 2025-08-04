import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSlackAlert } from '@/lib/alerts'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { webhookUrl } = await request.json()

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
    }

    // Get user profile to check if Slack alerts are enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('slack_alerts_enabled')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.slack_alerts_enabled) {
      return NextResponse.json({ error: 'Slack alerts are not enabled' }, { status: 400 })
    }

    // Send test Slack message
    const testPayload = {
      monitor: {
        name: 'Test Monitor',
        url: 'https://example.com'
      },
      checkResult: {
        status: 'down',
        statusCode: 500,
        responseTime: 5000,
        errorMessage: 'This is a test alert to verify your Slack configuration.'
      }
    }

    await sendSlackAlert(webhookUrl, testPayload)

    return NextResponse.json({ success: true, message: 'Test Slack message sent successfully' })
  } catch (error) {
    console.error('Error sending test Slack message:', error)
    return NextResponse.json(
      { error: 'Failed to send test Slack message' },
      { status: 500 }
    )
  }
} 