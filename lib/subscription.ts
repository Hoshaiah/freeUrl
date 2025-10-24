import { prisma } from './prisma'
import { stripe } from './stripe'

export type PlanType = 'free' | 'core' | 'pro'

// Map Stripe price IDs to plan names
export function getPlanFromPriceId(priceId: string): PlanType {
  const corePriceIds = [
    process.env.NEXT_PUBLIC_STRIPE_CORE_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_CORE_ANNUAL_PRICE_ID,
  ]

  const proPriceIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
  ]

  if (corePriceIds.includes(priceId)) {
    return 'core'
  }

  if (proPriceIds.includes(priceId)) {
    return 'pro'
  }

  // Default to free if price ID doesn't match
  console.warn('[getPlanFromPriceId] Unknown price ID:', priceId, 'defaulting to free')
  return 'free'
}

export const PLAN_LIMITS = {
  free: {
    links: 3,
    emailSignups: 10,
    landingPages: 1,
    qrCodes: 0,
  },
  core: {
    links: 100,
    emailSignups: Infinity,
    landingPages: 5,
    qrCodes: 5,
  },
  pro: {
    links: 3000,
    emailSignups: Infinity,
    landingPages: 20,
    qrCodes: 200,
  },
}

export async function getUserPlan(userId: string): Promise<PlanType> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  console.log('[getUserPlan] userId:', userId)
  console.log('[getUserPlan] subscription:', subscription)

  // No subscription = free plan
  if (!subscription) {
    console.log('[getUserPlan] No subscription found, returning free')
    return 'free'
  }

  // Check if subscription is active
  if (subscription.status !== 'active') {
    console.log('[getUserPlan] Subscription not active, status:', subscription.status)
    return 'free'
  }

  // Check if subscription period has ended
  // Note: For active subscriptions, Stripe updates current_period_end on renewal
  // If it's past the period end and still "active", the webhook hasn't fired yet
  // Give a 24-hour grace period for webhook delays
  const gracePeriod = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const periodEndWithGrace = new Date(subscription.stripeCurrentPeriodEnd.getTime() + gracePeriod)

  if (new Date() > periodEndWithGrace) {
    console.log('[getUserPlan] Subscription period ended with grace period, period end:', subscription.stripeCurrentPeriodEnd)
    return 'free'
  }

  console.log('[getUserPlan] Returning plan:', subscription.plan)
  return subscription.plan as PlanType
}

export async function checkLinkLimit(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)
  const linkCount = await prisma.link.count({
    where: { userId },
  })

  return linkCount < PLAN_LIMITS[plan].links
}

export async function checkEmailSignupLimit(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId)

  // Get links created by this user
  const userLinks = await prisma.link.findMany({
    where: { userId },
    select: { id: true },
  })

  const linkIds = userLinks.map(link => link.id)

  // Count email signups from user's links
  const signupCount = await prisma.emailSignup.count({
    where: {
      linkId: { in: linkIds },
    },
  })

  return signupCount < PLAN_LIMITS[plan].emailSignups
}

export async function syncSubscriptionFromStripe(userId: string): Promise<void> {
  try {
    // Get local subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    // No local subscription, nothing to sync
    if (!subscription || !subscription.stripeSubscriptionId) {
      return
    }

    // Fetch latest subscription data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    )

    // In newer Stripe API versions, current_period_end is in items.data[0]
    const currentPeriodEnd = (stripeSubscription.items.data[0] as unknown as { current_period_end: number })?.current_period_end

    if (!currentPeriodEnd) {
      console.error('[syncSubscriptionFromStripe] Missing current_period_end from Stripe')
      return
    }

    const priceId = stripeSubscription.items.data[0]?.price.id || subscription.stripePriceId
    const plan = getPlanFromPriceId(priceId)

    console.log('[syncSubscriptionFromStripe] Stripe data:', {
      status: stripeSubscription.status,
      currentPeriodEnd,
      cancel_at: stripeSubscription.cancel_at,
      priceId,
      plan,
    })

    // Update local subscription with latest Stripe data
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: stripeSubscription.status,
        stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
        stripePriceId: priceId,
        plan,
        cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null,
      },
    })

    console.log('[syncSubscriptionFromStripe] Successfully synced subscription for user:', userId)
  } catch (error) {
    console.error('[syncSubscriptionFromStripe] Error syncing subscription for user:', userId, error)
    // Don't throw - we don't want to block sign-in if sync fails
  }
}
