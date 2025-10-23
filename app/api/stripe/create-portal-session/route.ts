import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.error('[Portal] No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Portal] User ID:', session.user.id)

    // Get user's subscription to find their Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    console.log('[Portal] Subscription found:', !!subscription)

    if (!subscription) {
      console.error('[Portal] No subscription record found for user:', session.user.id)
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    console.log('[Portal] Stripe Customer ID:', subscription.stripeCustomerId)
    console.log('[Portal] Return URL:', `${process.env.NEXTAUTH_URL}/dashboard/account`)

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/account`,
    })

    console.log('[Portal] Portal session created successfully:', portalSession.id)

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('[Portal] Error creating portal session:', error)
    // Log the full error details
    if (error instanceof Error) {
      console.error('[Portal] Error message:', error.message)
      console.error('[Portal] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
