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

