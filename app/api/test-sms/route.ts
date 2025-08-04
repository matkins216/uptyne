import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMSAlert } from '@/lib/alerts'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Get user profile to check if SMS alerts are enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('sms_alerts_enabled')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.sms_alerts_enabled) {
      return NextResponse.json({ error: 'SMS alerts are not enabled' }, { status: 400 })
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_FROM_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
    }

    // Send test SMS
    const testPayload = {
      monitor: {
        name: 'Test Monitor',
        url: 'https://example.com'
      },
      checkResult: {
        status: 'down',
        statusCode: 500,
        responseTime: 5000,
        errorMessage: 'This is a test alert to verify your SMS configuration.'
      }
    }

    await sendSMSAlert(accountSid, authToken, fromNumber, phoneNumber, testPayload)

    return NextResponse.json({ success: true, message: 'Test SMS sent successfully' })
  } catch (error) {
    console.error('Error sending test SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send test SMS' },
      { status: 500 }
    )
  }
} 