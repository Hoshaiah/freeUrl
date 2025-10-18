'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type BillingCycle = 'monthly' | 'annual'

export default function Pricing() {
  const { data: session } = useSession()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing')
      return
    }

    setLoading(priceId)

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      annualPrice: 0,
      priceId: {
        monthly: null,
        annual: null,
      },
      features: [
        '3 links',
        'Access to 10 email signups',
        '1 landing page',
        'Basic analytics',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Core',
      description: 'For growing businesses',
      monthlyPrice: 10,
      annualPrice: 120,
      priceId: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_CORE_MONTHLY_PRICE_ID || 'price_core_monthly', // Replace with actual Stripe price ID
        annual: process.env.NEXT_PUBLIC_STRIPE_CORE_ANNUAL_PRICE_ID || 'price_core_annual',   // Replace with actual Stripe price ID
      },
      features: [
        '100 links/month',
        '5 QR Codes/month',
        '5 custom landing pages',
        'Advanced analytics',
        'Email support',
      ],
      cta: 'Subscribe',
      highlighted: true,
    },
    {
      name: 'Pro',
      description: 'For power users and teams',
      monthlyPrice: 199,
      annualPrice: 2388,
      priceId: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly', // Replace with actual Stripe price ID
        annual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',   // Replace with actual Stripe price ID
      },
      features: [
        '3,000 links/month',
        '200 QR Codes/month',
        '20 custom landing pages',
        'Priority support',
        'Custom branding',
        'API access',
      ],
      cta: 'Subscribe',
      highlighted: false,
    },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that fits your needs
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  billingCycle === 'annual'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
              const priceId = plan.priceId[billingCycle]

              return (
                <div
                  key={plan.name}
                  className={`bg-white rounded-lg shadow-xl overflow-hidden ${
                    plan.highlighted ? 'ring-4 ring-indigo-600 transform scale-105' : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="bg-indigo-600 text-white text-center py-2 text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-gray-900">${price}</span>
                        <span className="text-gray-600 ml-2">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      {billingCycle === 'annual' && price > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed annually (${Math.round(price / 12)}/mo)
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (plan.name === 'Free') {
                          if (!session) {
                            router.push('/auth/signin')
                          } else {
                            router.push('/')
                          }
                        } else if (priceId) {
                          handleSubscribe(priceId, plan.name)
                        }
                      }}
                      disabled={plan.name !== 'Free' && loading === priceId}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition ${
                        plan.highlighted
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {plan.name === 'Free' ? plan.cta : (loading === priceId ? 'Loading...' : plan.cta)}
                    </button>

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              Need help choosing? <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">Contact us</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
