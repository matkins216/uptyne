// lib/monitor-checker.ts
import axios from 'axios'

// Uncomment to run tests: testMonitorChecker()
// import { testMonitorChecker } from './monitor-checker'


export interface CheckResult {
    status: 'up' | 'down' | 'error'
    responseTime: number
    statusCode?: number
    errorMessage?: string
}

export async function checkWebsite(url: string): Promise<CheckResult> {
    // Support ping:// and tcp:// targets
    if (url.startsWith('ping://')) {
        const host = url.replace('ping://', '')
        return await checkPing(host, 5000)
    }
    if (url.startsWith('tcp://')) {
        const u = new URL(url)
        const host = u.hostname
        const port = parseInt(u.port) || 80
        if (!host) {
            return { status: 'error', responseTime: 0, errorMessage: 'Invalid TCP URL' }
        }
        return await checkTcp(host, port, 5000)
    }

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

async function checkTcp(host: string, port: number, timeoutMs: number): Promise<CheckResult> {
    const net = await import('node:net')
    const start = process.hrtime.bigint()
    return new Promise<CheckResult>((resolve) => {
        const socket = new net.Socket()
        let settled = false
        const finish = (status: 'up' | 'down' | 'error', errorMessage?: string) => {
            if (settled) return
            settled = true
            try { socket.destroy() } catch {}
            const end = process.hrtime.bigint()
            const responseTime = Math.max(0, Math.round(Number(end - start) / 1_000_000))
            resolve({ status, responseTime, errorMessage })
        }
        socket.setTimeout(timeoutMs)
        socket.once('connect', () => finish('up'))
        socket.once('timeout', () => finish('down', `TCP timeout after ${timeoutMs}ms`))
        socket.once('error', (e: any) => finish('down', `TCP error: ${e?.message}`))
        socket.connect(port, host)
    })
}

async function checkPing(host: string, timeoutMs: number): Promise<CheckResult> {
    const cp = await import('node:child_process')
    const isWin = process.platform === 'win32'
    const args = isWin ? ['-n', '1', '-w', String(timeoutMs), host] : ['-c', '1', host]
    const start = process.hrtime.bigint()
    return new Promise<CheckResult>((resolve) => {
        const finish = (status: 'up' | 'down' | 'error', errorMessage?: string, parsedRttMs?: number) => {
            const end = process.hrtime.bigint()
            const wallMs = Math.max(0, Math.round(Number(end - start) / 1_000_000))
            resolve({ status, responseTime: parsedRttMs ?? wallMs, errorMessage })
        }
        try {
            const child = cp.execFile(
                'ping',
                args,
                { timeout: timeoutMs, encoding: 'utf8' },
                (err, stdout) => {
                    if (err) {
                        const rtt = parseRttMs(stdout)
                        return finish('down', `Ping failed: ${err.message}`, rtt)
                    }
                    const rtt = parseRttMs(stdout)
                    return finish('up', undefined, rtt)
                }
            )
            const guard = setTimeout(() => {
                try { child.kill('SIGKILL') } catch {}
            }, timeoutMs + 500)
            child.on('exit', () => clearTimeout(guard))
        } catch (e: any) {
            return finish('error', `Failed to spawn ping: ${e?.message}`)
        }
    })
}

function parseRttMs(output?: string): number | undefined {
    if (!output) return undefined
    const m1 = output.match(/time[=<]\s*(\d+(?:\.\d+)?)\s*ms/i)
    if (m1) return Number(m1[1])
    const m2 = output.match(/=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\s*ms/)
    if (m2) return Number(m2[2])
    return undefined
}

// Test function to verify all protocols work
export async function testMonitorChecker() {
    console.log('Testing monitor checker...')
    
    const tests = [
        { url: 'https://google.com', expected: 'up' },
        { url: 'ping://8.8.8.8', expected: 'up' },
        { url: 'tcp://8.8.8.8:53', expected: 'up' },
        { url: 'tcp://invalid-host-xyz:80', expected: 'down' }
    ]
    
    for (const test of tests) {
        try {
            console.log(`Testing ${test.url}...`)
            const result = await checkWebsite(test.url)
            console.log(`Result: ${result.status} (${result.responseTime}ms)${result.errorMessage ? ` - ${result.errorMessage}` : ''}`)
        } catch (error) {
            console.error(`Test failed for ${test.url}:`, error)
        }
    }
}
