import { prisma } from './prisma'

export type PlanType = 'free' | 'core' | 'pro'

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
