// lib/monitor-checker.ts
import axios from 'axios'

export interface CheckResult {
    status: 'up' | 'down' | 'error'
    responseTime: number
    statusCode?: number
    errorMessage?: string
}

export async function checkWebsite(url: string): Promise<CheckResult> {
    const startTime = Date.now()

    try {
        const response = await axios.get(url, {
            timeout: 30000,
            validateStatus: () => true,
            headers: {
                'User-Agent': 'UptimeMonitor/1.0'
            }
        })

        const responseTime = Date.now() - startTime

        return {
            status: response.status >= 200 && response.status < 400 ? 'up' : 'down',
            responseTime,
            statusCode: response.status
        }
    } catch (error: any) {
        return {
            status: 'error',
            responseTime: Date.now() - startTime,
            errorMessage: error.message
        }
    }
}

// lib/alerts.ts
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

    const message = {
        text: `${emoji} Monitor Alert: ${monitor.name}`,
        attachments: [
            {
                color,
                fields: [
                    {
                        title: 'Monitor',
                        value: monitor.name,
                        short: true
                    },
                    {
                        title: 'Status',
                        value: checkResult.status.toUpperCase(),
                        short: true
                    },
                    {
                        title: 'URL',
                        value: monitor.url,
                        short: false
                    },
                    {
                        title: 'Response Time',
                        value: `${checkResult.responseTime}ms`,
                        short: true
                    },
                    {
                        title: 'Status Code',
                        value: checkResult.statusCode?.toString() || 'N/A',
                        short: true
                    }
                ],
                footer: 'Uptime Monitor',
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