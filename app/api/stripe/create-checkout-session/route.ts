import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { priceId, planName } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    // If user has an existing active subscription, redirect to Customer Portal for plan changes
    if (existingSubscription && existingSubscription.status === 'active') {
      console.log('[Checkout] User has existing subscription, redirecting to portal')

      // Create portal session instead
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: existingSubscription.stripeCustomerId,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/account`,
      })

      return NextResponse.json({
        url: portalSession.url,
        isUpgrade: true,
        message: 'Redirecting to manage your subscription...'
      })
    }

    console.log('[Checkout] Creating new subscription checkout')

    // Create Stripe checkout session for new subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      customer_email: session.user.email || undefined,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        planName: planName,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planName: planName,
        },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
