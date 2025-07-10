import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function calculateUptime(checks: any[]) {
    if (!checks || checks.length === 0) return 100

    const upChecks = checks.filter(check => check.status === 'up').length
    return Math.round((upChecks / checks.length) * 100)
}

export function formatResponseTime(ms: number) {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
}

export function getStatusColor(status: string) {
    switch (status) {
        case 'up':
            return 'text-green-600 bg-green-100'
        case 'down':
            return 'text-red-600 bg-red-100'
        case 'error':
            return 'text-orange-600 bg-orange-100'
        default:
            return 'text-gray-600 bg-gray-100'
    }
}