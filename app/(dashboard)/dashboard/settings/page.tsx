'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, MessageSquare, Bell, AlertTriangle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUserTier, canUseAlerts, SUBSCRIPTION_TIERS } from '@/lib/subscription'

interface UserProfile {
  id: string
  phone_number?: string
  slack_webhook_url?: string
  sms_alerts_enabled: boolean
  slack_alerts_enabled: boolean
  stripe_customer_id?: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userTier, setUserTier] = useState<string>('FREE')
  const [phoneNumberError, setPhoneNumberError] = useState<string>('')
  const supabase = createClient()

  // Phone number validation and formatting
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    // Remove extra + signs
    cleaned = cleaned.replace(/\+/g, '+').replace(/\+\+/g, '+')
    
    return cleaned
  }

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    if (!phoneNumber) return true // Allow empty
    
    // E.164 format: +[country code][number] (min 7 digits, max 15 digits total)
    const e164Regex = /^\+[1-9]\d{1,14}$/
    
    if (!e164Regex.test(phoneNumber)) {
      setPhoneNumberError('Please enter a valid phone number in international format (e.g., +1234567890)')
      return false
    }
    
    setPhoneNumberError('')
    return true
  }

  const handlePhoneNumberChange = (value: string) => {
    if (!profile) return
    const formatted = formatPhoneNumber(value)
    setProfile({ ...profile, phone_number: formatted })
    validatePhoneNumber(formatted)
  }

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUser(user)

        // Get or create profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              sms_alerts_enabled: false,
              slack_alerts_enabled: false
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            return
          }

          // Determine user tier for new profile
          const tier = getUserTier(newProfile?.stripe_customer_id)
          setUserTier(tier)
          setProfile(newProfile)
        } else if (error) {
          console.error('Error loading profile:', error)
          return
        } else {
          // Determine user tier for existing profile
          const tier = getUserTier(profile?.stripe_customer_id)
          setUserTier(tier)
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndProfile()
  }, [supabase])

  const handleSave = async () => {
    if (!profile || !user) {
      console.error('No profile or user found')
      toast.error('Unable to save settings')
      return
    }

    // Validate phone number if SMS alerts are enabled
    if (profile.sms_alerts_enabled && profile.phone_number) {
      if (!validatePhoneNumber(profile.phone_number)) {
        toast.error('Please fix the phone number format')
        return
      }
    }

    // Validate Slack webhook if Slack alerts are enabled
    if (profile.slack_alerts_enabled && profile.slack_webhook_url) {
      if (!profile.slack_webhook_url.startsWith('https://hooks.slack.com/')) {
        toast.error('Please enter a valid Slack webhook URL')
        return
      }
    }

    setSaving(true)
    try {
      console.log('Saving profile:', {
        id: user.id,
        phone_number: profile.phone_number,
        slack_webhook_url: profile.slack_webhook_url,
        sms_alerts_enabled: profile.sms_alerts_enabled,
        slack_alerts_enabled: profile.slack_alerts_enabled
      })

      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: profile.phone_number,
          slack_webhook_url: profile.slack_webhook_url,
          sms_alerts_enabled: profile.sms_alerts_enabled,
          slack_alerts_enabled: profile.slack_alerts_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestSMS = async () => {
    if (!profile?.phone_number) {
      toast.error('Please enter a phone number first')
      return
    }

    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: profile.phone_number })
      })

      if (!response.ok) {
        throw new Error('Failed to send test SMS')
      }

      toast.success('Test SMS sent!')
    } catch (error) {
      console.error('Error sending test SMS:', error)
      toast.error('Failed to send test SMS')
    }
  }

  const handleTestSlack = async () => {
    if (!profile?.slack_webhook_url) {
      toast.error('Please enter a Slack webhook URL first')
      return
    }

    try {
      const response = await fetch('/api/test-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: profile.slack_webhook_url })
      })

      if (!response.ok) {
        throw new Error('Failed to send test Slack message')
      }

      toast.success('Test Slack message sent!')
    } catch (error) {
      console.error('Error sending test Slack message:', error)
      toast.error('Failed to send test Slack message')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">Unable to load your profile settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your alert preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {SUBSCRIPTION_TIERS[userTier as keyof typeof SUBSCRIPTION_TIERS]?.name || 'Free'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {user?.email}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SMS Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              SMS Alerts
            </CardTitle>
            <CardDescription>
              Receive SMS notifications when your monitors go down
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-enabled">Enable SMS Alerts</Label>
              <Switch
                id="sms-enabled"
                checked={profile.sms_alerts_enabled}
                onCheckedChange={(checked) =>
                  setProfile({ ...profile, sms_alerts_enabled: checked })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="+1234567890"
                value={profile.phone_number || ''}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                disabled={!profile.sms_alerts_enabled}
              />
              <p className="text-sm text-gray-500">
                Enter your phone number in international format (e.g., +1234567890, +44123456789)
              </p>
              {phoneNumberError && <p className="text-sm text-red-500">{phoneNumberError}</p>}
            </div>

            <Button
              onClick={handleTestSMS}
              disabled={!profile.sms_alerts_enabled || !profile.phone_number}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Test SMS
            </Button>
          </CardContent>
        </Card>

        {/* Slack Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Slack Alerts
            </CardTitle>
            <CardDescription>
              Receive Slack notifications when your monitors go down
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="slack-enabled">Enable Slack Alerts</Label>
              <Switch
                id="slack-enabled"
                checked={profile.slack_alerts_enabled}
                onCheckedChange={(checked) =>
                  setProfile({ ...profile, slack_alerts_enabled: checked })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={profile.slack_webhook_url || ''}
                onChange={(e) =>
                  setProfile({ ...profile, slack_webhook_url: e.target.value })
                }
                disabled={!profile.slack_alerts_enabled}
              />
              <p className="text-sm text-gray-500">
                Create a webhook in your Slack workspace settings
              </p>
            </div>

            <Button
              onClick={handleTestSlack}
              disabled={!profile.slack_alerts_enabled || !profile.slack_webhook_url}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Test Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {false && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Lock className="h-5 w-5" />
              Upgrade Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              SMS and Slack alerts are available for Basic tier subscribers and higher.
            </p>
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>How to Set Up Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">SMS Alerts</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Enable SMS alerts using the toggle</li>
              <li>Enter your phone number in international format (e.g., +1234567890)</li>
              <li>Click "Send Test SMS" to verify your setup</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Slack Alerts</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to your Slack workspace settings</li>
              <li>Create a new webhook for the channel you want to receive alerts</li>
              <li>Copy the webhook URL and paste it in the field above</li>
              <li>Enable Slack alerts and click "Send Test Message" to verify</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 