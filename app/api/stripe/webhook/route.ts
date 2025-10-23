import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[Webhook] Checkout session completed:', session.id)
        console.log('[Webhook] Session mode:', session.mode)
        console.log('[Webhook] Session metadata:', session.metadata)

        // For subscriptions, we'll handle this in customer.subscription.created event
        // Just log here for tracking
        if (session.mode === 'subscription') {
          console.log('[Webhook] Subscription checkout completed. Waiting for customer.subscription.created event...')
        }
        break
      }

      case 'customer.subscription.created': {
        console.log('[Webhook] Customer subscription Hosh', event.data.object)
        const subscription = event.data.object as Stripe.Subscription

        console.log('[Webhook] Subscription created:', subscription.id)
        console.log('[Webhook] Subscription status:', subscription.status)

        // Get metadata from the subscription
        let metadata = subscription.metadata || {}

        console.log('[Webhook] Subscription metadata:', metadata)

        // If metadata is missing, try to find the checkout session that created this subscription
        if (!metadata.userId) {
          console.log('[Webhook] Metadata missing, searching for checkout session...')

          try {
            // List recent checkout sessions for this customer
            const sessions = await stripe.checkout.sessions.list({
              customer: subscription.customer as string,
              limit: 10,
            })

            // Find the session that created this subscription
            const matchingSession = sessions.data.find(
              (s) => s.subscription === subscription.id
            )

            if (matchingSession && matchingSession.metadata) {
              console.log('[Webhook] Found checkout session:', matchingSession.id)
              console.log('[Webhook] Checkout session metadata:', matchingSession.metadata)
              metadata = matchingSession.metadata
            } else {
              console.error('[Webhook] Could not find matching checkout session')
              break
            }
          } catch (error) {
            console.error('[Webhook] Error fetching checkout sessions:', error)
            break
          }
        }

        if (!metadata.userId) {
          console.error('[Webhook] Still missing userId after checkout session lookup')
          break
        }

        if (!metadata.planName) {
          console.error('[Webhook] Missing planName')
          break
        }

        const priceId = subscription.items?.data?.[0]?.price?.id
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
        let currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end

        // If current_period_end is missing, calculate it from billing_cycle_anchor + interval
        const billingCycleAnchor = (subscription as unknown as { billing_cycle_anchor?: number }).billing_cycle_anchor
        if (!currentPeriodEnd && billingCycleAnchor) {
          const interval = subscription.items?.data?.[0]?.price?.recurring?.interval
          const intervalCount = subscription.items?.data?.[0]?.price?.recurring?.interval_count || 1
          const anchor = billingCycleAnchor

          console.log('[Webhook] Calculating period end from interval:', interval, 'x', intervalCount)

          if (interval === 'month') {
            // Add months to the billing cycle anchor
            const anchorDate = new Date(anchor * 1000)
            anchorDate.setMonth(anchorDate.getMonth() + intervalCount)
            currentPeriodEnd = Math.floor(anchorDate.getTime() / 1000)
          } else if (interval === 'year') {
            // Add years to the billing cycle anchor
            const anchorDate = new Date(anchor * 1000)
            anchorDate.setFullYear(anchorDate.getFullYear() + intervalCount)
            currentPeriodEnd = Math.floor(anchorDate.getTime() / 1000)
          }
        }

        console.log('[Webhook] Current period end:', currentPeriodEnd)
        console.log('[Webhook] Billing cycle anchor:', billingCycleAnchor)
        console.log('[Webhook] Price ID:', priceId)
        console.log('[Webhook] Customer ID:', customerId)

        if (!currentPeriodEnd) {
          console.error('[Webhook] Missing current_period_end and could not calculate from interval')
          console.error('[Webhook] Full subscription:', JSON.stringify(subscription, null, 2))
          throw new Error('current_period_end not found')
        }

        if (!priceId) {
          throw new Error('Price ID not found')
        }

        if (!customerId) {
          throw new Error('Customer ID not found')
        }

        const subscriptionData = {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
          plan: metadata.planName.toLowerCase(),
          status: subscription.status,
        }

        console.log('[Webhook] Upserting subscription:', subscriptionData)

        await prisma.subscription.upsert({
          where: {
            userId: metadata.userId,
          },
          update: subscriptionData,
          create: {
            userId: metadata.userId,
            ...subscriptionData,
          },
        })

        console.log('[Webhook] Subscription record upserted successfully for user:', metadata.userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
            status: subscription.status,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: 'canceled',
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
