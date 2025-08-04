// lib/subscription.ts

export interface SubscriptionTier {
  name: string
  level: number
  features: string[]
}

export const SUBSCRIPTION_TIERS = {
  FREE: { name: 'Free', level: 0, features: ['Basic monitoring'] },
  BASIC: { name: 'Basic', level: 1, features: ['Basic monitoring', 'SMS alerts', 'Slack alerts'] },
  PREMIUM: { name: 'Premium', level: 2, features: ['Basic monitoring', 'SMS alerts', 'Slack alerts', 'Advanced features'] }
} as const

export function hasFeatureAccess(userTier: string, requiredTier: string): boolean {
  const userLevel = SUBSCRIPTION_TIERS[userTier as keyof typeof SUBSCRIPTION_TIERS]?.level || 0
  const requiredLevel = SUBSCRIPTION_TIERS[requiredTier as keyof typeof SUBSCRIPTION_TIERS]?.level || 0
  
  return userLevel >= requiredLevel
}

export function canUseAlerts(userTier: string): boolean {
  return hasFeatureAccess(userTier, 'BASIC')
}

export function getUserTier(stripeCustomerId?: string): string {
  // For now, we'll assume users with a Stripe customer ID are at least Basic tier
  // In a real implementation, you'd check the actual Stripe subscription
  if (stripeCustomerId) {
    return 'BASIC'
  }
  return 'FREE'
} 