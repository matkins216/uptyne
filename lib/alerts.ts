// lib/alerts.ts
import twilio from 'twilio'

interface AlertPayload {
    monitor: {
        name: string
        url: string
    }
    checkResult: {
        status: string
        statusCode?: number
        responseTime: number
        errorMessage?: string
    }
}

export async function sendSlackAlert(
    webhookUrl: string,
    { monitor, checkResult }: AlertPayload
) {
    const emoji = checkResult.status === 'up' ? '✅' : '🚨'
    const color = checkResult.status === 'up' ? 'good' : 'danger'
    const statusText = checkResult.status === 'up' ? 'BACK ONLINE' : 'IS DOWN'

    const message = {
        text: `${emoji} *${monitor.name}* ${statusText}`,
        attachments: [
            {
                color,
                pretext: `Monitor *${monitor.name}* ${statusText.toLowerCase()}`,
                fields: [
                    {
                        title: 'Status',
                        value: checkResult.status.toUpperCase(),
                        short: true
                    },
                    {
                        title: 'Response Time',
                        value: `${checkResult.responseTime}ms`,
                        short: true
                    },
                    {
                        title: 'URL',
                        value: `<${monitor.url}|${monitor.url}>`,
                        short: false
                    },
                    {
                        title: 'Status Code',
                        value: checkResult.statusCode?.toString() || 'N/A',
                        short: true
                    },
                    {
                        title: 'Checked At',
                        value: `<!date^${Math.floor(Date.now() / 1000)}^{date_pretty} at {time}|${new Date().toLocaleString()}>`,
                        short: true
                    }
                ],
                footer: 'Uptyne Monitor',
                footer_icon: 'https://em-content.zobj.net/source/microsoft-teams/363/bell_1f514.png',
                ts: Math.floor(Date.now() / 1000)
            }
        ]
    }

    if (checkResult.errorMessage) {
        message.attachments[0].fields.push({
            title: 'Error',
            value: checkResult.errorMessage,
            short: false
        })
    }

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
    })

    if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.statusText}`)
    }
}

export async function sendSMSAlert(
    accountSid: string,
    authToken: string,
    fromNumber: string,
    toNumber: string,
    { monitor, checkResult }: AlertPayload
) {
    const client = twilio(accountSid, authToken)
    
    const status = checkResult.status.toUpperCase()
    const emoji = checkResult.status === 'up' ? '✅' : '🚨'
    
    let message = `${emoji} Monitor Alert: ${monitor.name}\n`
    message += `Status: ${status}\n`
    message += `URL: ${monitor.url}\n`
    message += `Response Time: ${checkResult.responseTime}ms`
    
    if (checkResult.statusCode) {
        message += `\nStatus Code: ${checkResult.statusCode}`
    }
    
    if (checkResult.errorMessage) {
        message += `\nError: ${checkResult.errorMessage}`
    }
    
    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber
        })
        
        console.log(`SMS sent successfully. SID: ${result.sid}`)
        return result
    } catch (error) {
        console.error('Failed to send SMS:', error)
        throw new Error(`SMS alert failed: ${error}`)
    }
}

export async function sendUserAlerts(
  userId: string,
  supabase: any,
  alertPayload: AlertPayload
) {
  try {
    // Get user profile with alert settings
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.error('Error fetching user profile for alerts:', error)
      return
    }

    const alertPromises = []

    // Send SMS alert if enabled
    if (profile.sms_alerts_enabled && profile.phone_number) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const fromNumber = process.env.TWILIO_FROM_NUMBER

      if (accountSid && authToken && fromNumber) {
        alertPromises.push(
          sendSMSAlert(accountSid, authToken, fromNumber, profile.phone_number, alertPayload)
            .catch(error => console.error('SMS alert failed:', error))
        )
      }
    }

    // Send Slack alert if enabled
    if (profile.slack_alerts_enabled && profile.slack_webhook_url) {
      alertPromises.push(
        sendSlackAlert(profile.slack_webhook_url, alertPayload)
          .catch(error => console.error('Slack alert failed:', error))
      )
    }

    // Send all alerts concurrently
    await Promise.all(alertPromises)
  } catch (error) {
    console.error('Error sending user alerts:', error)
  }
}